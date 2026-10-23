import { Router } from 'express'
import adminRoutes from './adminRoutes.js'
import authRoutes from './authRoutes.js'
import cartRoutes from './cartRoutes.js'
import orderRoutes from './orderRoutes.js'
import productRoutes from './productRoutes.js'
import userRoutes from './userRoutes.js'
import wishlistRoutes from './wishlistRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/cart', cartRoutes)
router.use('/wishlist', wishlistRoutes)
router.use('/orders', orderRoutes)
router.use('/admin', adminRoutes)
router.use('/', productRoutes)

export default router
