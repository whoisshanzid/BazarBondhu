import { Router } from 'express'
import { body, param, query } from 'express-validator'
import {
  createReview,
  getCategories,
  getProduct,
  getProducts,
} from '../controllers/productController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.get(
  '/products',
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 48 }).toInt(),
  validate,
  getProducts,
)

router.get('/categories', getCategories)
router.get('/products/:slug', getProduct)

router.post(
  '/products/:id/reviews',
  requireAuth,
  param('id').isInt().toInt(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Choose a rating from 1 to 5.').toInt(),
  body('comment').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).withMessage('Review is too long.'),
  validate,
  createReview,
)

export default router
