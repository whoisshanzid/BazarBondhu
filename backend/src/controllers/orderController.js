import crypto from 'node:crypto'
import { pool, withTransaction } from '../config/db.js'
import { ensureCart } from '../services/cartService.js'
import { ApiError } from '../utils/ApiError.js'
import { toMoney } from '../utils/helpers.js'

function calculateShippingFee(city, subtotal) {
  if (subtotal >= 5000) return 0
  return city.toLowerCase().includes('dhaka') ? 60 : 120
}

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `BB-${date}-${crypto.randomInt(100000, 1000000)}`
}

function requireText(value, label, max = 255) {
  if (typeof value !== 'string' || value.trim().length < 2) {
    throw new ApiError(422, `${label} is required.`)
  }
  if (value.trim().length > max) {
    throw new ApiError(422, `${label} is too long.`)
  }
  return value.trim()
}

async function resolveShipping(body, userId) {
  if (body.address_id) {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
      body.address_id,
      userId,
    ])
    if (!rows.length) throw new ApiError(404, 'The selected delivery address was not found.')
    return {
      recipient_name: rows[0].recipient_name,
      phone: rows[0].phone,
      address_line: rows[0].address_line,
      area: rows[0].area,
      city: rows[0].city,
      postal_code: rows[0].postal_code,
    }
  }

  const shipping = body.shipping || {}
  return {
    recipient_name: requireText(shipping.recipient_name, 'Recipient name', 100),
    phone: requireText(shipping.phone, 'Phone number', 20),
    address_line: requireText(shipping.address_line, 'Delivery address', 255),
    area: requireText(shipping.area, 'Area', 100),
    city: requireText(shipping.city, 'City', 100),
    postal_code: shipping.postal_code?.trim().slice(0, 20) || null,
  }
}

export async function createOrder(req, res) {
  const shipping = await resolveShipping(req.body, req.user.id)
  const paymentMethod = req.body.payment_method === 'mock_wallet' ? 'mock_wallet' : 'cod'

  const orderId = await withTransaction(async (connection) => {
    const cartId = await ensureCart(req.user.id, connection)
    const [items] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.stock, p.is_active, p.price, p.discount_price,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS product_image
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ? FOR UPDATE`,
      [cartId],
    )

    if (!items.length) throw new ApiError(400, 'Your cart is empty.')

    let subtotal = 0
    const preparedItems = items.map((item) => {
      if (!item.is_active) {
        throw new ApiError(400, `${item.name} is no longer available.`)
      }
      if (item.quantity > item.stock) {
        throw new ApiError(400, `Only ${item.stock} left of ${item.name}.`)
      }
      const unitPrice = Number(item.discount_price ?? item.price)
      const lineTotal = toMoney(unitPrice * item.quantity)
      subtotal += lineTotal
      return { ...item, unit_price: unitPrice, line_total: lineTotal }
    })

    subtotal = toMoney(subtotal)
    const shippingFee = calculateShippingFee(shipping.city, subtotal)
    const total = toMoney(subtotal + shippingFee)
    const paid = paymentMethod === 'mock_wallet'
    const orderNumber = generateOrderNumber()

    const [orderResult] = await connection.query(
      `INSERT INTO orders
        (order_number, user_id, status, payment_method, payment_status, subtotal, shipping_fee, total,
         recipient_name, phone, shipping_address, area, city, postal_code, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        req.user.id,
        paid ? 'confirmed' : 'pending',
        paymentMethod,
        paid ? 'paid' : 'unpaid',
        subtotal,
        shippingFee,
        total,
        shipping.recipient_name,
        shipping.phone,
        shipping.address_line,
        shipping.area,
        shipping.city,
        shipping.postal_code,
        req.body.notes?.trim().slice(0, 500) || null,
      ],
    )

    for (const item of preparedItems) {
      await connection.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, product_image, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.product_id,
          item.name,
          item.product_image,
          item.unit_price,
          item.quantity,
          item.line_total,
        ],
      )
      await connection.query(
        'UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id],
      )
    }

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId])

    if (req.body.save_address && !req.body.address_id) {
      await connection.query(
        `INSERT INTO addresses
          (user_id, label, recipient_name, phone, address_line, area, city, postal_code, is_default)
         VALUES (?, 'Delivery', ?, ?, ?, ?, ?, ?, 0)`,
        [
          req.user.id,
          shipping.recipient_name,
          shipping.phone,
          shipping.address_line,
          shipping.area,
          shipping.city,
          shipping.postal_code,
        ],
      )
    }

    return orderResult.insertId
  })

  const order = await getOrderForUser(orderId, req.user.id)
  res.status(201).json({ message: 'Your order has been placed.', order })
}

export async function getOrderForUser(orderId, userId) {
  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
    [orderId, userId],
  )
  if (!orders.length) return null

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId])
  return { ...orders[0], items }
}

export async function listMyOrders(req, res) {
  const [orders] = await pool.query(
    `SELECT o.*, COUNT(oi.id) AS item_count, COALESCE(SUM(oi.quantity), 0) AS unit_count
     FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [req.user.id],
  )
  res.json({ orders })
}

export async function getMyOrder(req, res) {
  const order = await getOrderForUser(req.params.id, req.user.id)
  if (!order) throw new ApiError(404, 'Order not found.')
  res.json({ order })
}

export async function cancelMyOrder(req, res) {
  const orderId = Number(req.params.id)

  await withTransaction(async (connection) => {
    const [orders] = await connection.query(
      'SELECT id, status, payment_status FROM orders WHERE id = ? AND user_id = ? FOR UPDATE',
      [orderId, req.user.id],
    )
    if (!orders.length) throw new ApiError(404, 'Order not found.')
    if (!['pending', 'confirmed'].includes(orders[0].status)) {
      throw new ApiError(400, 'This order can no longer be cancelled. Please contact support.')
    }

    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId],
    )
    for (const item of items) {
      if (item.product_id) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sold_count = GREATEST(0, sold_count - ?) WHERE id = ?',
          [item.quantity, item.quantity, item.product_id],
        )
      }
    }

    await connection.query(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      ['cancelled', orders[0].payment_status === 'paid' ? 'refunded' : 'unpaid', orderId],
    )
  })

  const order = await getOrderForUser(orderId, req.user.id)
  res.json({ message: 'Order cancelled.', order })
}
