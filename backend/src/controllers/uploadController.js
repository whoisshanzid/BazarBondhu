import { ApiError } from '../utils/ApiError.js'

export function uploadProductImage(req, res) {
  if (!req.file) throw new ApiError(400, 'Choose an image to upload.')
  res.status(201).json({
    message: 'Image uploaded.',
    url: `/uploads/${req.file.filename}`,
  })
}
