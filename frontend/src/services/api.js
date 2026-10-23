import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
})

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors
  if (!Array.isArray(errors)) return {}
  return errors.reduce((acc, item) => {
    if (!acc[item.field]) acc[item.field] = item.message
    return acc
  }, {})
}

export default api
