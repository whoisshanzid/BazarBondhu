import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  updateProfile,
} from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

const addressRules = [
  body('recipient_name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a recipient name.'),
  body('phone').trim().isLength({ min: 6, max: 20 }).withMessage('Enter a valid phone number.'),
  body('address_line').trim().isLength({ min: 5, max: 255 }).withMessage('Enter a full address.'),
  body('area').trim().isLength({ min: 2, max: 100 }).withMessage('Enter an area.'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a city or district.'),
  body('postal_code').optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
]

router.put(
  '/profile',
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Enter a valid phone number.'),
  validate,
  updateProfile,
)

router.get('/addresses', listAddresses)
router.post('/addresses', addressRules, validate, createAddress)
router.put('/addresses/:id', param('id').isInt(), addressRules, validate, updateAddress)
router.delete('/addresses/:id', param('id').isInt(), validate, deleteAddress)

export default router
