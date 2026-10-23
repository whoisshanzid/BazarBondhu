import api from './api.js'

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function fetchProduct(slug) {
  const { data } = await api.get(`/products/${slug}`)
  return data.product
}

export async function fetchCategories() {
  const { data } = await api.get('/categories')
  return data.categories
}

export async function submitReview(productId, payload) {
  const { data } = await api.post(`/products/${productId}/reviews`, payload)
  return data
}
