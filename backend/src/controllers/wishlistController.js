import { pool } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { productSelect, shapeProduct } from '../services/productService.js'

async function loadWishlist(userId) {
  const [rows] = await pool.query(
    `SELECT ${productSelect}
     FROM wishlists w
     JOIN products p ON p.id = w.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    [userId],
  )
  return rows.map(shapeProduct)
}

export async function getWishlist(req, res) {
  res.json({ wishlist: await loadWishlist(req.user.id) })
}

export async function addToWishlist(req, res) {
  const productId = Number(req.params.productId)
  const [products] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [
    productId,
  ])
  if (!products.length) throw new ApiError(404, 'Product not found.')

  await pool.query(
    'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE product_id = product_id',
    [req.user.id, productId],
  )
  res.status(201).json({ message: 'Saved to your wishlist.', wishlist: await loadWishlist(req.user.id) })
}

export async function removeFromWishlist(req, res) {
  await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [
    req.user.id,
    req.params.productId,
  ])
  res.json({ message: 'Removed from wishlist.', wishlist: await loadWishlist(req.user.id) })
}

export async function mergeWishlist(req, res) {
  const productIds = Array.isArray(req.body.product_ids) ? req.body.product_ids.slice(0, 100) : []
  for (const rawId of productIds) {
    const productId = Number(rawId)
    if (!Number.isInteger(productId)) continue
    await pool.query(
      'INSERT INTO wishlists (user_id, product_id) SELECT ?, id FROM products WHERE id = ? AND is_active = 1 ON DUPLICATE KEY UPDATE product_id = product_id',
      [req.user.id, productId],
    )
  }
  res.json({ message: 'Wishlist merged.', wishlist: await loadWishlist(req.user.id) })
}
