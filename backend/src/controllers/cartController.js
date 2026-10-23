import { pool, withTransaction } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { addCartItem, ensureCart, getCart } from '../services/cartService.js'

export async function getMyCart(req, res) {
  res.json({ cart: await getCart(req.user.id) })
}

export async function addItem(req, res) {
  const cart = await addCartItem(req.user.id, req.body.product_id, req.body.quantity || 1)
  res.status(201).json({ message: 'Added to cart.', cart })
}

export async function updateItem(req, res) {
  const productId = Number(req.params.productId)
  const quantity = Number(req.body.quantity)
  const cartId = await ensureCart(req.user.id)

  const [items] = await pool.query(
    `SELECT ci.id, p.stock, p.is_active FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ? AND ci.product_id = ?`,
    [cartId, productId],
  )
  if (!items.length) throw new ApiError(404, 'This item is not in your cart.')

  if (quantity === 0) {
    await pool.query('DELETE FROM cart_items WHERE id = ?', [items[0].id])
  } else {
    if (!items[0].is_active) throw new ApiError(400, 'This product is no longer available.')
    if (quantity > items[0].stock) {
      throw new ApiError(400, `Only ${items[0].stock} item(s) are available in stock.`)
    }
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, items[0].id])
  }

  res.json({ message: quantity === 0 ? 'Item removed.' : 'Cart updated.', cart: await getCart(req.user.id) })
}

export async function removeItem(req, res) {
  const cartId = await ensureCart(req.user.id)
  await pool.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [
    cartId,
    req.params.productId,
  ])
  res.json({ message: 'Item removed.', cart: await getCart(req.user.id) })
}

export async function clearCart(req, res) {
  const cartId = await ensureCart(req.user.id)
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId])
  res.json({ message: 'Cart cleared.', cart: await getCart(req.user.id) })
}

export async function mergeGuestCart(req, res) {
  const guestItems = req.body.items || []
  if (!Array.isArray(guestItems) || guestItems.length > 50) {
    throw new ApiError(400, 'Invalid cart data.')
  }

  await withTransaction(async (connection) => {
    const cartId = await ensureCart(req.user.id, connection)

    for (const item of guestItems) {
      const productId = Number(item.product_id)
      const requested = Math.max(1, Number(item.quantity) || 1)
      if (!Number.isInteger(productId)) continue

      const [products] = await connection.query(
        'SELECT stock, is_active FROM products WHERE id = ? LIMIT 1',
        [productId],
      )
      if (!products.length || !products[0].is_active || products[0].stock < 1) continue

      const [existing] = await connection.query(
        'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId],
      )
      const quantity = Math.min(products[0].stock, (existing[0]?.quantity || 0) + requested)

      await connection.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = ?`,
        [cartId, productId, quantity, quantity],
      )
    }
  })

  res.json({ message: 'Your guest cart was merged.', cart: await getCart(req.user.id) })
}
