import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // Never trust the original filename. A random name avoids path traversal.
    cb(null, `${crypto.randomUUID()}${extensions[file.mimetype]}`)
  },
})

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!extensions[file.mimetype]) {
      return cb(new ApiError(400, 'Only JPG, PNG and WebP images are allowed.'))
    }
    cb(null, true)
  },
})

export { uploadsDir }
