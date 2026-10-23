import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  addToWishlist,
  getWishlist,
  mergeWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

router.get('/', getWishlist)
router.post('/merge', body('product_ids').isArray().withMessage('Invalid wishlist data.'), validate, mergeWishlist)
router.post('/:productId', param('productId').isInt().toInt(), validate, addToWishlist)
router.delete('/:productId', param('productId').isInt().toInt(), validate, removeFromWishlist)

export default router
