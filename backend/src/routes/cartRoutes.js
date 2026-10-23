import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  addItem,
  clearCart,
  getMyCart,
  mergeGuestCart,
  removeItem,
  updateItem,
} from '../controllers/cartController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

router.get('/', getMyCart)
router.delete('/', clearCart)
router.post('/merge', body('items').isArray().withMessage('Invalid cart data.'), validate, mergeGuestCart)
router.post(
  '/items',
  body('product_id').isInt({ min: 1 }).withMessage('Choose a product.').toInt(),
  body('quantity').optional().isInt({ min: 1, max: 99 }).withMessage('Choose a valid quantity.').toInt(),
  validate,
  addItem,
)
router.patch(
  '/items/:productId',
  param('productId').isInt().toInt(),
  body('quantity').isInt({ min: 0, max: 99 }).withMessage('Choose a valid quantity.').toInt(),
  validate,
  updateItem,
)
router.delete('/items/:productId', param('productId').isInt().toInt(), validate, removeItem)

export default router
