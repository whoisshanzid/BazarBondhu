import { useCallback, useState } from 'react'

const KEY = 'bb_recently_viewed'

function loadProducts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useRecentlyViewed(limit = 6) {
  const [products, setProducts] = useState(() => loadProducts().slice(0, limit))

  const addProduct = useCallback(
    (product) => {
      if (!product) return
      const snapshot = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        price: product.price,
        discount_price: product.discount_price,
        effective_price: product.effective_price,
        discount_percent: product.discount_percent,
        rating_avg: product.rating_avg,
        rating_count: product.rating_count,
        primary_image: product.primary_image,
        stock: product.stock,
        sold_count: product.sold_count,
      }
      const next = [snapshot, ...loadProducts().filter((item) => item.id !== product.id)].slice(0, limit)
      localStorage.setItem(KEY, JSON.stringify(next))
      setProducts(next)
    },
    [limit],
  )

  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(KEY)
    setProducts([])
  }, [])

  return { products, addProduct, clearRecentlyViewed }
}
