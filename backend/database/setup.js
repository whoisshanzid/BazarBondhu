import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { buildSslConfig } from '../src/config/ssl.js'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const databaseDir = path.dirname(fileURLToPath(import.meta.url))

async function runSqlFile(connection, filename) {
  const sql = await fs.readFile(path.join(databaseDir, filename), 'utf8')
  await connection.query(sql)
  console.log(`Applied ${filename}`)
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: buildSslConfig(),
    multipleStatements: true,
    charset: 'utf8mb4',
  })

  try {
    await runSqlFile(connection, 'schema.sql')
    await runSqlFile(connection, 'seed.sql')
    console.log('Database setup complete.')
    console.log('Admin login: admin@bazarbondhu.test / Admin@12345')
    console.log('Customer login: customer@bazarbondhu.test / Customer@12345')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('Database setup failed:', error.message)
  process.exit(1)
})
