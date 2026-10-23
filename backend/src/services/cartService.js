import { pool } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'

export async function ensureCart(userId, connection = pool) {
  const [existing] = await connection.query('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [userId])
  if (existing.length) return existing[0].id

  const [result] = await connection.query('INSERT INTO carts (user_id) VALUES (?)', [userId])
  return result.insertId
}

export async function getCart(userId) {
  const cartId = await ensureCart(userId)
  const [rows] = await pool.query(
    `SELECT ci.product_id, ci.quantity, p.name, p.slug, p.brand, p.price, p.discount_price,
      p.stock, p.is_active, c.name AS category_name,
      (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
        ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS primary_image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at ASC`,
    [cartId],
  )

  let subtotal = 0
  let totalItems = 0
  const items = rows.map((row) => {
    const price = Number(row.price)
    const effectivePrice = row.discount_price === null ? price : Number(row.discount_price)
    const lineTotal = Number((effectivePrice * row.quantity).toFixed(2))
    subtotal += lineTotal
    totalItems += row.quantity
    return {
      ...row,
      price,
      discount_price: row.discount_price === null ? null : Number(row.discount_price),
      effective_price: effectivePrice,
      stock: Number(row.stock),
      is_active: Boolean(row.is_active),
      line_total: lineTotal,
    }
  })

  return {
    id: cartId,
    items,
    total_items: totalItems,
    subtotal: Number(subtotal.toFixed(2)),
  }
}

export async function addCartItem(userId, productId, quantity) {
  const [products] = await pool.query(
    'SELECT id, stock, is_active FROM products WHERE id = ? LIMIT 1',
    [productId],
  )
  if (!products.length || !products[0].is_active) {
    throw new ApiError(404, 'Product is not available.')
  }

  const cartId = await ensureCart(userId)
  const [existing] = await pool.query(
    'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId],
  )
  const newQuantity = (existing[0]?.quantity || 0) + quantity
  if (newQuantity > products[0].stock) {
    throw new ApiError(400, `Only ${products[0].stock} item(s) are available in stock.`)
  }

  if (existing.length) {
    await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [
      newQuantity,
      cartId,
      productId,
    ])
  } else {
    await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cartId, productId, quantity],
    )
  }
  return getCart(userId)
}
