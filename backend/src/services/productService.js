import { pool } from '../config/db.js'

export const productSelect = `
  p.id, p.category_id, p.name, p.slug, p.brand, p.short_description, p.description,
  p.price, p.discount_price, p.stock, p.is_active, p.is_featured, p.is_flash_sale,
  p.flash_sale_ends_at, p.sold_count, p.rating_avg, p.rating_count, p.created_at, p.updated_at,
  c.name AS category_name, c.slug AS category_slug,
  (SELECT pi.image_url FROM product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS primary_image
`

export function shapeProduct(row) {
  if (!row) return null
  const price = Number(row.price)
  const discountPrice = row.discount_price === null ? null : Number(row.discount_price)
  const effectivePrice = discountPrice ?? price
  return {
    ...row,
    price,
    discount_price: discountPrice,
    effective_price: effectivePrice,
    discount_percent:
      discountPrice && price > 0 ? Math.round(((price - effectivePrice) / price) * 100) : 0,
    rating_avg: Number(row.rating_avg),
    rating_count: Number(row.rating_count),
    sold_count: Number(row.sold_count),
    stock: Number(row.stock),
    is_active: Boolean(row.is_active),
    is_featured: Boolean(row.is_featured),
    is_flash_sale: Boolean(row.is_flash_sale),
  }
}

export async function getProductBySlug(slug, includeInactive = false) {
  const [rows] = await pool.query(
    `SELECT ${productSelect}
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? ${includeInactive ? '' : 'AND p.is_active = 1'}
     LIMIT 1`,
    [slug],
  )
  if (!rows.length) return null

  const product = shapeProduct(rows[0])
  const [images] = await pool.query(
    'SELECT id, image_url, alt_text, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC',
    [product.id],
  )
  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 20`,
    [product.id],
  )
  const [breakdown] = await pool.query(
    `SELECT rating, COUNT(*) AS count FROM reviews WHERE product_id = ? GROUP BY rating`,
    [product.id],
  )
  const [related] = await pool.query(
    `SELECT ${productSelect}
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.category_id = ? AND p.id <> ? AND p.is_active = 1
     ORDER BY p.sold_count DESC LIMIT 4`,
    [product.category_id, product.id],
  )

  return {
    ...product,
    images: images.length
      ? images
      : [{ id: 0, image_url: '/images/products/placeholder.svg', alt_text: product.name, is_primary: 1 }],
    reviews,
    rating_breakdown: breakdown.reduce((acc, item) => {
      acc[item.rating] = Number(item.count)
      return acc
    }, {}),
    related: related.map(shapeProduct),
  }
}

export async function listProducts(filters) {
  const {
    q,
    category,
    min_price,
    max_price,
    sort = 'popular',
    page = 1,
    limit = 12,
    flash_sale,
    featured,
    in_stock,
  } = filters

  const where = ['p.is_active = 1']
  const params = []

  if (q) {
    where.push('(p.name LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)')
    const term = `%${q.trim()}%`
    params.push(term, term, term)
  }
  if (category) {
    where.push('c.slug = ?')
    params.push(category)
  }
  if (min_price !== undefined && min_price !== '') {
    where.push('COALESCE(p.discount_price, p.price) >= ?')
    params.push(Number(min_price))
  }
  if (max_price !== undefined && max_price !== '') {
    where.push('COALESCE(p.discount_price, p.price) <= ?')
    params.push(Number(max_price))
  }
  if (flash_sale === 'true' || flash_sale === true) {
    where.push('p.is_flash_sale = 1 AND p.flash_sale_ends_at > NOW()')
  }
  if (featured === 'true' || featured === true) {
    where.push('p.is_featured = 1')
  }
  if (in_stock === 'true' || in_stock === true) {
    where.push('p.stock > 0')
  }

  const orderBy = {
    popular: 'p.sold_count DESC, p.rating_count DESC',
    newest: 'p.created_at DESC',
    price_low: 'COALESCE(p.discount_price, p.price) ASC',
    price_high: 'COALESCE(p.discount_price, p.price) DESC',
    rating: 'p.rating_avg DESC, p.rating_count DESC',
    discount: 'discount_percent DESC',
  }[sort] || 'p.sold_count DESC'

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`,
    params,
  )

  // MySQL cannot reference a select alias in ORDER BY when it is computed here,
  // so the discount sort is handled with the same expression.
  const resolvedOrder =
    sort === 'discount' ? '(1 - COALESCE(p.discount_price, p.price) / p.price) DESC' : orderBy

  const [rows] = await pool.query(
    `SELECT ${productSelect}
     FROM products p JOIN categories c ON c.id = p.category_id
     ${whereSql}
     ORDER BY ${resolvedOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  return {
    products: rows.map(shapeProduct),
    pagination: {
      page,
      limit,
      total: Number(countRows[0].total),
      total_pages: Math.ceil(Number(countRows[0].total) / limit),
    },
  }
}
