import { pool, withTransaction } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'

export async function updateProfile(req, res) {
  const { name, phone } = req.body
  await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [
    name.trim(),
    phone?.trim() || null,
    req.user.id,
  ])
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
    [req.user.id],
  )
  res.json({ message: 'Profile updated.', user: rows[0] })
}

export async function listAddresses(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    [req.user.id],
  )
  res.json({ addresses: rows })
}

export async function createAddress(req, res) {
  const { label, recipient_name, phone, address_line, area, city, postal_code, is_default } = req.body

  const addressId = await withTransaction(async (connection) => {
    const [countRows] = await connection.query(
      'SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?',
      [req.user.id],
    )
    if (countRows[0].count >= 10) {
      throw new ApiError(400, 'You can save up to 10 delivery addresses.')
    }

    const makeDefault = Boolean(is_default) || countRows[0].count === 0
    if (makeDefault) {
      await connection.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id])
    }

    const [result] = await connection.query(
      `INSERT INTO addresses
        (user_id, label, recipient_name, phone, address_line, area, city, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        label?.trim() || 'Home',
        recipient_name.trim(),
        phone.trim(),
        address_line.trim(),
        area.trim(),
        city.trim(),
        postal_code?.trim() || null,
        makeDefault ? 1 : 0,
      ],
    )
    return result.insertId
  })

  const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [addressId])
  res.status(201).json({ message: 'Address saved.', address: rows[0] })
}

export async function updateAddress(req, res) {
  const { label, recipient_name, phone, address_line, area, city, postal_code, is_default } = req.body

  await withTransaction(async (connection) => {
    const [owned] = await connection.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE',
      [req.params.id, req.user.id],
    )
    if (!owned.length) throw new ApiError(404, 'Address not found.')

    if (is_default) {
      await connection.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id])
    }

    await connection.query(
      `UPDATE addresses SET label = ?, recipient_name = ?, phone = ?, address_line = ?,
        area = ?, city = ?, postal_code = ?, is_default = ? WHERE id = ? AND user_id = ?`,
      [
        label?.trim() || 'Home',
        recipient_name.trim(),
        phone.trim(),
        address_line.trim(),
        area.trim(),
        city.trim(),
        postal_code?.trim() || null,
        is_default ? 1 : 0,
        req.params.id,
        req.user.id,
      ],
    )
  })

  const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [req.params.id])
  res.json({ message: 'Address updated.', address: rows[0] })
}

export async function deleteAddress(req, res) {
  const [rows] = await pool.query('SELECT is_default FROM addresses WHERE id = ? AND user_id = ?', [
    req.params.id,
    req.user.id,
  ])
  if (!rows.length) throw new ApiError(404, 'Address not found.')

  await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [
    req.params.id,
    req.user.id,
  ])

  if (rows[0].is_default) {
    const [remaining] = await pool.query(
      'SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.id],
    )
    if (remaining.length) {
      await pool.query('UPDATE addresses SET is_default = 1 WHERE id = ?', [remaining[0].id])
    }
  }

  res.json({ message: 'Address removed.' })
}
