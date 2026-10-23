import api from './api.js'

export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function fetchAdminProducts(params = {}) {
  const { data } = await api.get('/admin/products', { params })
  return data
}

export async function fetchAdminProduct(id) {
  const { data } = await api.get(`/admin/products/${id}`)
  return data.product
}

export async function createProduct(payload) {
  const { data } = await api.post('/admin/products', payload)
  return data.product
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/admin/products/${id}`, payload)
  return data.product
}

export async function deleteProduct(id) {
  await api.delete(`/admin/products/${id}`)
}

export async function toggleProductStatus(id, isActive) {
  await api.patch(`/admin/products/${id}/status`, { is_active: isActive })
}

export async function uploadProductImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post('/admin/uploads', formData)
  return data.url
}

export async function fetchAdminCategories() {
  const { data } = await api.get('/admin/categories')
  return data.categories
}

export async function createCategory(payload) {
  const { data } = await api.post('/admin/categories', payload)
  return data.category
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/admin/categories/${id}`, payload)
  return data.category
}

export async function deleteCategory(id) {
  await api.delete(`/admin/categories/${id}`)
}

export async function fetchAdminCustomers(params = {}) {
  const { data } = await api.get('/admin/customers', { params })
  return data
}

export async function fetchAdminOrders(params = {}) {
  const { data } = await api.get('/admin/orders', { params })
  return data
}

export async function fetchAdminOrder(id) {
  const { data } = await api.get(`/admin/orders/${id}`)
  return data.order
}

export async function updateOrder(id, payload) {
  const { data } = await api.patch(`/admin/orders/${id}`, payload)
  return data.order
}
