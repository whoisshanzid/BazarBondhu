import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'

function readToken(req) {
  return req.cookies?.token || null
}

export async function requireAuth(req, res, next) {
  const token = readToken(req)
  if (!token) {
    throw new ApiError(401, 'Please log in to continue.')
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.')
  }

  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = ? LIMIT 1',
    [payload.sub],
  )

  if (!rows.length || !rows[0].is_active) {
    throw new ApiError(401, 'This account is no longer available.')
  }

  req.user = rows[0]
  next()
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Administrator access is required.')
  }
  next()
}
