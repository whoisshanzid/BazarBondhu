import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  changePassword,
  login,
  logout,
  me,
  register,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
})

const passwordRule = (field) =>
  body(field)
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters.')
    .matches(/[a-z]/)
    .withMessage('Password must include a lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must include a number.')

router.post(
  '/register',
  authLimiter,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Enter a valid phone number.'),
  passwordRule('password'),
  validate,
  register,
)

router.post(
  '/login',
  authLimiter,
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'),
  validate,
  login,
)

router.post('/logout', logout)
router.get('/me', requireAuth, me)

router.put(
  '/password',
  requireAuth,
  body('current_password').notEmpty().withMessage('Enter your current password.'),
  passwordRule('new_password'),
  validate,
  changePassword,
)

export default router
