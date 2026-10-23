import { Router } from 'express'
import { body, param, query } from 'express-validator'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getCustomers,
  getOrder,
  getOrders,
  getProduct,
  getProducts,
  getStats,
  toggleProductStatus,
  updateCategory,
  updateOrder,
  updateProduct,
} from '../controllers/adminController.js'
import { uploadProductImage } from '../controllers/uploadController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth, requireAdmin)

const productRules = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Enter a product name.'),
  body('category_id').isInt({ min: 1 }).withMessage('Choose a category.').toInt(),
  body('brand').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
  body('short_description').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Add a description.'),
  body('price').isFloat({ min: 1 }).withMessage('Enter a valid price.').toFloat(),
  body('discount_price')
    .optional({ values: 'falsy', nullable: true })
    .isFloat({ min: 1 })
    .withMessage('Enter a valid discount price.')
    .toFloat(),
  body('stock').isInt({ min: 0 }).withMessage('Enter a valid stock quantity.').toInt(),
  body('is_active').optional().isBoolean().toBoolean(),
  body('is_featured').optional().isBoolean().toBoolean(),
  body('is_flash_sale').optional().isBoolean().toBoolean(),
  body('flash_sale_ends_at').optional({ values: 'falsy', nullable: true }).isISO8601(),
  body('images').optional().isArray(),
  validate,
]

const categoryRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a category name.'),
  body('icon').optional({ values: 'falsy' }).trim().isLength({ max: 50 }),
  body('image_url').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('sort_order').optional().isInt().toInt(),
  body('is_active').optional().isBoolean().toBoolean(),
  validate,
]

router.get('/stats', getStats)

router.get('/products', getProducts)
router.get('/products/:id', param('id').isInt().toInt(), validate, getProduct)
router.post('/products', productRules, createProduct)
router.put('/products/:id', param('id').isInt().toInt(), productRules, updateProduct)
router.patch(
  '/products/:id/status',
  param('id').isInt().toInt(),
  body('is_active').isBoolean().toBoolean(),
  validate,
  toggleProductStatus,
)
router.delete('/products/:id', param('id').isInt().toInt(), validate, deleteProduct)
router.post('/uploads', uploadImage.single('image'), uploadProductImage)

router.get('/categories', getCategories)
router.post('/categories', categoryRules, createCategory)
router.put('/categories/:id', param('id').isInt().toInt(), categoryRules, updateCategory)
router.delete('/categories/:id', param('id').isInt().toInt(), validate, deleteCategory)

router.get('/customers', getCustomers)
router.get('/orders', getOrders)
router.get('/orders/:id', param('id').isInt().toInt(), validate, getOrder)
router.patch(
  '/orders/:id',
  param('id').isInt().toInt(),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('admin_note').optional({ values: 'null' }).trim().isLength({ max: 500 }),
  validate,
  updateOrder,
)

export default router
