import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  }
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function setAuthCookie(res, token) {
  const production = process.env.NODE_ENV === 'production'
  res.cookie('token', token, {
    httpOnly: true,
    secure: production,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  if (existing.length) {
    throw new ApiError(409, 'An account already exists with this email address.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, passwordHash, 'customer'],
  )

  await pool.query('INSERT INTO carts (user_id) VALUES (?)', [result.insertId])

  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
    [result.insertId],
  )
  const user = rows[0]
  setAuthCookie(res, signToken(user))
  res.status(201).json({ message: 'Welcome to BazarBondhu!', user: publicUser(user) })
}

export async function login(req, res) {
  const { email, password } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [
    email.trim().toLowerCase(),
  ])
  const user = rows[0]

  const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false
  if (!user || !passwordMatches || !user.is_active) {
    throw new ApiError(401, 'The email or password is incorrect.')
  }

  setAuthCookie(res, signToken(user))
  res.json({ message: `Welcome back, ${user.name.split(' ')[0]}!`, user: publicUser(user) })
}

export function logout(req, res) {
  const production = process.env.NODE_ENV === 'production'
  res.clearCookie('token', {
    httpOnly: true,
    secure: production,
    sameSite: 'lax',
    path: '/',
  })
  res.json({ message: 'You have been logged out.' })
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) })
}

export async function changePassword(req, res) {
  const { current_password, new_password } = req.body
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id])
  const matches = await bcrypt.compare(current_password, rows[0].password_hash)
  if (!matches) {
    throw new ApiError(400, 'Your current password is incorrect.')
  }

  const hash = await bcrypt.hash(new_password, 12)
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id])
  res.json({ message: 'Password updated successfully.' })
}
