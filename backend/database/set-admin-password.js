import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { buildSslConfig } from '../src/config/ssl.js'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!email) fail('Set ADMIN_EMAIL to the admin account email address.')
if (!password) fail('Set ADMIN_PASSWORD to the new password.')
if (
  password.length < 8 ||
  password.length > 72 ||
  !/[a-z]/.test(password) ||
  !/[A-Z]/.test(password) ||
  !/[0-9]/.test(password)
) {
  fail('ADMIN_PASSWORD must be 8-72 characters and include upper case, lower case and a number.')
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: buildSslConfig(),
    charset: 'utf8mb4',
  })

  try {
    const [rows] = await connection.query(
      'SELECT id, role FROM users WHERE email = ? LIMIT 1',
      [email],
    )
    if (!rows.length) {
      throw new Error(`No account exists for ${email}.`)
    }
    if (rows[0].role !== 'admin') {
      throw new Error(`${email} is not an admin account.`)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      rows[0].id,
    ])
    console.log(`Admin password updated for ${email}.`)
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('Could not update the admin password:', error.message)
  process.exit(1)
})
