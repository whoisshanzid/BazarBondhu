import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  cancelMyOrder,
  createOrder,
  getMyOrder,
  listMyOrders,
} from '../controllers/orderController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

router.get('/', listMyOrders)

router.post(
  '/',
  body('address_id').optional({ values: 'null' }).isInt({ min: 1 }).toInt(),
  body('payment_method').optional().isIn(['cod', 'mock_wallet']),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  validate,
  createOrder,
)

router.get('/:id', param('id').isInt().toInt(), validate, getMyOrder)
router.patch('/:id/cancel', param('id').isInt().toInt(), validate, cancelMyOrder)

export default router
