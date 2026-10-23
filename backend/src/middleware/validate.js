import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export function validate(req, res, next) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    const details = result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }))
    return next(new ApiError(422, 'Please check the highlighted fields.', details))
  }
  next()
}
