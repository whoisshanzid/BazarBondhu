import { pool, withTransaction } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination } from '../utils/helpers.js'
import { getProductBySlug, listProducts } from '../services/productService.js'

export async function getProducts(req, res) {
  const { page, limit } = parsePagination(req.query)
  const result = await listProducts({
    q: req.query.q,
    category: req.query.category,
    min_price: req.query.min_price,
    max_price: req.query.max_price,
    sort: req.query.sort,
    flash_sale: req.query.flash_sale,
    featured: req.query.featured,
    in_stock: req.query.in_stock,
    page,
    limit,
  })
  res.json(result)
}

export async function getProduct(req, res) {
  const product = await getProductBySlug(req.params.slug)
  if (!product) throw new ApiError(404, 'Product not found.')
  res.json({ product })
}

export async function getCategories(req, res) {
  const [categories] = await pool.query(
    `SELECT c.*, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
     WHERE c.is_active = 1
     GROUP BY c.id
     ORDER BY c.sort_order ASC, c.name ASC`,
  )
  res.json({ categories })
}

export async function createReview(req, res) {
  const productId = Number(req.params.id)
  const { rating, comment } = req.body

  const [productRows] = await pool.query(
    'SELECT id FROM products WHERE id = ? AND is_active = 1',
    [productId],
  )
  if (!productRows.length) throw new ApiError(404, 'Product not found.')

  let reviewId
  try {
    reviewId = await withTransaction(async (connection) => {
      const [inserted] = await connection.query(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [productId, req.user.id, rating, comment?.trim() || null],
      )

      const [stats] = await connection.query(
        'SELECT AVG(rating) AS average, COUNT(*) AS count FROM reviews WHERE product_id = ?',
        [productId],
      )
      await connection.query(
        'UPDATE products SET rating_avg = ?, rating_count = ? WHERE id = ?',
        [Number(stats[0].average).toFixed(2), stats[0].count, productId],
      )
      return inserted.insertId
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'You have already reviewed this product.')
    }
    throw error
  }

  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.id = ?`,
    [reviewId],
  )
  res.status(201).json({ message: 'Thank you for your review.', review: reviews[0] })
}
