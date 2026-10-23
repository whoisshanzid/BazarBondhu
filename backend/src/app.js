import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { pool } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { uploadsDir } from './middleware/upload.js'
import routes from './routes/index.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist')
const clientIndex = path.join(clientDist, 'index.html')
const serveClient = isProduction && fs.existsSync(clientIndex)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.set('trust proxy', 1)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(isProduction ? 'combined' : 'dev'))
app.use('/uploads', express.static(uploadsDir, { maxAge: '1d' }))

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok', service: 'BazarBondhu API' })
})

app.use('/api', routes)

if (serveClient) {
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), {
      immutable: true,
      maxAge: '1y',
    }),
  )
  app.use(express.static(clientDist, { maxAge: '1h' }))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next()
    }
    res.sendFile(clientIndex, { headers: { 'Cache-Control': 'no-cache' } })
  })
}

app.use(notFound)
app.use(errorHandler)

export default app
