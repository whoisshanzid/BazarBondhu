import { pool, withTransaction } from '../config/db.js'
import { productSelect, shapeProduct } from '../services/productService.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, slugify } from '../utils/helpers.js'

function cleanImageUrl(url) {
  if (typeof url !== 'string') return null
  const value = url.trim()
  if (!value || value.length > 500) return null
  if (value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://')) {
    return value
  }
  return null
}

async function uniqueSlug(connection, name, excludeId = null) {
  const base = slugify(name) || `product-${Date.now()}`
  let candidate = base
  let suffix = 2

  while (true) {
    const [rows] = await connection.query(
      `SELECT id FROM products WHERE slug = ? ${excludeId ? 'AND id <> ?' : ''} LIMIT 1`,
      excludeId ? [candidate, excludeId] : [candidate],
    )
    if (!rows.length) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .map((image, index) => {
      const url = cleanImageUrl(typeof image === 'string' ? image : image.image_url)
      if (!url) return null
      return {
        image_url: url,
        alt_text: typeof image === 'object' ? String(image.alt_text || '').slice(0, 200) : '',
        is_primary: index === 0 || Boolean(image?.is_primary),
        sort_order: index,
      }
    })
    .filter(Boolean)
    .slice(0, 8)
}

async function saveImages(connection, productId, images) {
  await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId])
  const normalized = normalizeImages(images)
  const finalImages = normalized.length
    ? normalized
    : [{ image_url: '/images/products/placeholder.svg', alt_text: 'Product image', is_primary: true, sort_order: 0 }]

  let primarySet = false
  for (const image of finalImages) {
    const primary = !primarySet && image.is_primary
    if (primary) primarySet = true
    await connection.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, image.image_url, image.alt_text, primary ? 1 : 0, image.sort_order],
    )
  }
}

export async function getStats(req, res) {
  const [[revenue]] = await pool.query(
    "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status <> 'cancelled'",
  )
  const [[orderCount]] = await pool.query('SELECT COUNT(*) AS count FROM orders')
  const [[customerCount]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'")
  const [[productCount]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE is_active = 1')
  const [[lowStock]] = await pool.query(
    'SELECT COUNT(*) AS count FROM products WHERE is_active = 1 AND stock <= 10',
  )
  const [[pending]] = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'")

  const [recentOrders] = await pool.query(
    `SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name AS customer_name
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT 6`,
  )
  const [topProducts] = await pool.query(
    `SELECT id, name, slug, sold_count, stock, rating_avg,
      (SELECT image_url FROM product_images pi WHERE pi.product_id = products.id
        ORDER BY is_primary DESC, sort_order LIMIT 1) AS primary_image
     FROM products ORDER BY sold_count DESC LIMIT 5`,
  )
  const [lowStockProducts] = await pool.query(
    `SELECT id, name, stock FROM products WHERE is_active = 1 AND stock <= 10 ORDER BY stock ASC LIMIT 5`,
  )
  const [monthly] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS orders
     FROM orders
     WHERE status <> 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month ASC`,
  )
  const [statusCounts] = await pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status')

  res.json({
    stats: {
      revenue: Number(revenue.total),
      orders: Number(orderCount.count),
      customers: Number(customerCount.count),
      active_products: Number(productCount.count),
      low_stock: Number(lowStock.count),
      pending_orders: Number(pending.count),
    },
    recent_orders: recentOrders,
    top_products: topProducts,
    low_stock_products: lowStockProducts,
    monthly_sales: monthly,
    status_counts: statusCounts,
  })
}

export async function getProducts(req, res) {
  const { page, limit, offset } = parsePagination(req.query, 15, 60)
  const where = []
  const params = []

  if (req.query.q) {
    where.push('(p.name LIKE ? OR p.brand LIKE ?)')
    const term = `%${req.query.q.trim()}%`
    params.push(term, term)
  }
  if (req.query.status === 'active') where.push('p.is_active = 1')
  if (req.query.status === 'inactive') where.push('p.is_active = 0')
  if (req.query.low_stock === 'true') where.push('p.stock <= 10')
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [[count]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p ${whereSql}`,
    params,
  )
  const [rows] = await pool.query(
    `SELECT ${productSelect}
     FROM products p JOIN categories c ON c.id = p.category_id
     ${whereSql}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  res.json({
    products: rows.map(shapeProduct),
    pagination: { page, limit, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / limit) },
  })
}

export async function getProduct(req, res) {
  const [rows] = await pool.query(
    `SELECT ${productSelect} FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [req.params.id],
  )
  if (!rows.length) throw new ApiError(404, 'Product not found.')
  const [images] = await pool.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
    [req.params.id],
  )
  res.json({ product: { ...shapeProduct(rows[0]), images } })
}

function productPayload(body) {
  const price = Number(body.price)
  const discountPrice =
    body.discount_price === null || body.discount_price === undefined || body.discount_price === ''
      ? null
      : Number(body.discount_price)

  if (!Number.isFinite(price) || price <= 0) throw new ApiError(422, 'Enter a valid price.')
  if (discountPrice !== null && (discountPrice <= 0 || discountPrice >= price)) {
    throw new ApiError(422, 'Discount price must be lower than the regular price.')
  }

  const isFlashSale = Boolean(body.is_flash_sale)
  let flashEnds = body.flash_sale_ends_at || null
  if (isFlashSale && !flashEnds) {
    flashEnds = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
  }
  if (!isFlashSale) flashEnds = null

  return {
    category_id: Number(body.category_id),
    name: body.name.trim(),
    brand: body.brand?.trim() || 'BazarBondhu',
    short_description: body.short_description?.trim().slice(0, 300) || null,
    description: body.description.trim(),
    price,
    discount_price: discountPrice,
    stock: Math.max(0, Number(body.stock) || 0),
    is_active: Boolean(body.is_active),
    is_featured: Boolean(body.is_featured),
    is_flash_sale: isFlashSale,
    flash_sale_ends_at: flashEnds,
  }
}

export async function createProduct(req, res) {
  const data = productPayload(req.body)

  const productId = await withTransaction(async (connection) => {
    const [categories] = await connection.query('SELECT id FROM categories WHERE id = ?', [
      data.category_id,
    ])
    if (!categories.length) throw new ApiError(422, 'Choose a valid category.')

    const slug = await uniqueSlug(connection, data.name)
    const [result] = await connection.query(
      `INSERT INTO products
        (category_id, name, slug, brand, short_description, description, price, discount_price,
         stock, is_active, is_featured, is_flash_sale, flash_sale_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.category_id,
        data.name,
        slug,
        data.brand,
        data.short_description,
        data.description,
        data.price,
        data.discount_price,
        data.stock,
        data.is_active ? 1 : 0,
        data.is_featured ? 1 : 0,
        data.is_flash_sale ? 1 : 0,
        data.flash_sale_ends_at,
      ],
    )
    await saveImages(connection, result.insertId, req.body.images)
    return result.insertId
  })

  const [rows] = await pool.query(
    `SELECT ${productSelect} FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [productId],
  )
  res.status(201).json({ message: 'Product created.', product: shapeProduct(rows[0]) })
}

export async function updateProduct(req, res) {
  const productId = Number(req.params.id)
  const data = productPayload(req.body)

  await withTransaction(async (connection) => {
    const [existing] = await connection.query('SELECT id FROM products WHERE id = ? FOR UPDATE', [
      productId,
    ])
    if (!existing.length) throw new ApiError(404, 'Product not found.')

    const [categories] = await connection.query('SELECT id FROM categories WHERE id = ?', [
      data.category_id,
    ])
    if (!categories.length) throw new ApiError(422, 'Choose a valid category.')

    const slug = await uniqueSlug(connection, data.name, productId)
    await connection.query(
      `UPDATE products SET category_id = ?, name = ?, slug = ?, brand = ?, short_description = ?,
        description = ?, price = ?, discount_price = ?, stock = ?, is_active = ?, is_featured = ?,
        is_flash_sale = ?, flash_sale_ends_at = ? WHERE id = ?`,
      [
        data.category_id,
        data.name,
        slug,
        data.brand,
        data.short_description,
        data.description,
        data.price,
        data.discount_price,
        data.stock,
        data.is_active ? 1 : 0,
        data.is_featured ? 1 : 0,
        data.is_flash_sale ? 1 : 0,
        data.flash_sale_ends_at,
        productId,
      ],
    )
    if (Array.isArray(req.body.images)) {
      await saveImages(connection, productId, req.body.images)
    }
  })

  const [rows] = await pool.query(
    `SELECT ${productSelect} FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [productId],
  )
  res.json({ message: 'Product updated.', product: shapeProduct(rows[0]) })
}

export async function deleteProduct(req, res) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
  if (!result.affectedRows) throw new ApiError(404, 'Product not found.')
  res.json({ message: 'Product deleted.' })
}

export async function toggleProductStatus(req, res) {
  const [result] = await pool.query('UPDATE products SET is_active = ? WHERE id = ?', [
    req.body.is_active ? 1 : 0,
    req.params.id,
  ])
  if (!result.affectedRows) throw new ApiError(404, 'Product not found.')
  res.json({ message: req.body.is_active ? 'Product is now visible.' : 'Product hidden from the store.' })
}

export async function getCategories(req, res) {
  const [categories] = await pool.query(
    `SELECT c.*, COUNT(p.id) AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC`,
  )
  res.json({ categories })
}

export async function createCategory(req, res) {
  const { name, icon, sort_order, is_active, image_url } = req.body
  const slug = await uniqueCategorySlug(slugify(name))
  const [result] = await pool.query(
    'INSERT INTO categories (name, slug, icon, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [name.trim(), slug, icon?.trim() || 'Package', image_url || null, Number(sort_order) || 0, is_active ? 1 : 0],
  )
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId])
  res.status(201).json({ message: 'Category created.', category: rows[0] })
}

async function uniqueCategorySlug(base, excludeId = null) {
  const cleanBase = base || `category-${Date.now()}`
  let candidate = cleanBase
  let suffix = 2
  while (true) {
    const [rows] = await pool.query(
      `SELECT id FROM categories WHERE slug = ? ${excludeId ? 'AND id <> ?' : ''}`,
      excludeId ? [candidate, excludeId] : [candidate],
    )
    if (!rows.length) return candidate
    candidate = `${cleanBase}-${suffix}`
    suffix += 1
  }
}

export async function updateCategory(req, res) {
  const { name, icon, sort_order, is_active, image_url } = req.body
  const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [req.params.id])
  if (!existing.length) throw new ApiError(404, 'Category not found.')

  const slug = await uniqueCategorySlug(slugify(name), req.params.id)
  await pool.query(
    'UPDATE categories SET name = ?, slug = ?, icon = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?',
    [name.trim(), slug, icon?.trim() || 'Package', image_url || null, Number(sort_order) || 0, is_active ? 1 : 0, req.params.id],
  )
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id])
  res.json({ message: 'Category updated.', category: rows[0] })
}

export async function deleteCategory(req, res) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id])
  if (!result.affectedRows) throw new ApiError(404, 'Category not found.')
  res.json({ message: 'Category deleted.' })
}

export async function getCustomers(req, res) {
  const { page, limit, offset } = parsePagination(req.query, 15, 60)
  const params = []
  let searchSql = ''
  if (req.query.q) {
    searchSql = 'AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'
    const term = `%${req.query.q.trim()}%`
    params.push(term, term, term)
  }

  const [[count]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users u WHERE u.role = 'customer' ${searchSql}`,
    params,
  )
  const [customers] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at,
      COUNT(o.id) AS order_count,
      COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total ELSE 0 END), 0) AS total_spent
     FROM users u LEFT JOIN orders o ON o.user_id = u.id
     WHERE u.role = 'customer' ${searchSql}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )
  res.json({
    customers,
    pagination: { page, limit, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / limit) },
  })
}

export async function getOrders(req, res) {
  const { page, limit, offset } = parsePagination(req.query, 15, 60)
  const where = []
  const params = []

  if (req.query.status) {
    where.push('o.status = ?')
    params.push(req.query.status)
  }
  if (req.query.q) {
    where.push('(o.order_number LIKE ? OR u.name LIKE ? OR o.phone LIKE ?)')
    const term = `%${req.query.q.trim()}%`
    params.push(term, term, term)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [[count]] = await pool.query(
    `SELECT COUNT(*) AS total FROM orders o JOIN users u ON u.id = o.user_id ${whereSql}`,
    params,
  )
  const [orders] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
     FROM orders o JOIN users u ON u.id = o.user_id
     ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )
  res.json({
    orders,
    pagination: { page, limit, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / limit) },
  })
}

export async function getOrder(req, res) {
  const [orders] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`,
    [req.params.id],
  )
  if (!orders.length) throw new ApiError(404, 'Order not found.')
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id])
  res.json({ order: { ...orders[0], items } })
}

const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export async function updateOrder(req, res) {
  const orderId = Number(req.params.id)
  const { status, admin_note } = req.body
  if (status && !validStatuses.includes(status)) throw new ApiError(422, 'Invalid order status.')

  await withTransaction(async (connection) => {
    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId])
    if (!orders.length) throw new ApiError(404, 'Order not found.')
    const order = orders[0]
    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId],
    )

    if (status && status !== order.status) {
      const wasCancelled = order.status === 'cancelled'
      const willCancel = status === 'cancelled'

      if (willCancel && !wasCancelled) {
        for (const item of items) {
          if (!item.product_id) continue
          await connection.query(
            'UPDATE products SET stock = stock + ?, sold_count = GREATEST(0, sold_count - ?) WHERE id = ?',
            [item.quantity, item.quantity, item.product_id],
          )
        }
      }

      if (!willCancel && wasCancelled) {
        for (const item of items) {
          if (!item.product_id) continue
          const [products] = await connection.query(
            'SELECT stock FROM products WHERE id = ? FOR UPDATE',
            [item.product_id],
          )
          if (products.length && products[0].stock < item.quantity) {
            throw new ApiError(400, 'Not enough stock to reopen this cancelled order.')
          }
          if (products.length) {
            await connection.query(
              'UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?',
              [item.quantity, item.quantity, item.product_id],
            )
          }
        }
      }

      let paymentStatus = order.payment_status
      if (willCancel && order.payment_status === 'paid') paymentStatus = 'refunded'
      if (status === 'delivered' && order.payment_method === 'cod') paymentStatus = 'paid'

      await connection.query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [
        status,
        paymentStatus,
        orderId,
      ])
    }

    if (admin_note !== undefined) {
      await connection.query('UPDATE orders SET admin_note = ? WHERE id = ?', [
        String(admin_note).trim().slice(0, 500) || null,
        orderId,
      ])
    }
  })

  const [orders] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`,
    [orderId],
  )
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId])
  res.json({ message: 'Order updated.', order: { ...orders[0], items } })
}
