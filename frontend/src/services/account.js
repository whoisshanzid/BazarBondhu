import api from './api.js'

export async function updateProfile(payload) {
  const { data } = await api.put('/users/profile', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await api.put('/auth/password', payload)
  return data
}

export async function fetchAddresses() {
  const { data } = await api.get('/users/addresses')
  return data.addresses
}

export async function createAddress(payload) {
  const { data } = await api.post('/users/addresses', payload)
  return data.address
}

export async function updateAddress(id, payload) {
  const { data } = await api.put(`/users/addresses/${id}`, payload)
  return data.address
}

export async function deleteAddress(id) {
  await api.delete(`/users/addresses/${id}`)
}

export async function fetchOrders() {
  const { data } = await api.get('/orders')
  return data.orders
}

export async function fetchOrder(id) {
  const { data } = await api.get(`/orders/${id}`)
  return data.order
}

export async function placeOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data.order
}

export async function cancelOrder(id) {
  const { data } = await api.patch(`/orders/${id}/cancel`)
  return data.order
}
