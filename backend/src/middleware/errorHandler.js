import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'The image must be 5MB or smaller.'
        : 'The image upload could not be completed.'
    return res.status(400).json({ message })
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'That value is already in use.' })
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'This item is still in use and cannot be deleted.' })
  }

  const statusCode = error.statusCode || 500
  if (statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json({
    message: statusCode >= 500 ? 'Something went wrong. Please try again.' : error.message,
    ...(error.details ? { errors: error.details } : {}),
  })
}
