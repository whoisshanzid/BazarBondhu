import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  ChevronRight,
  Heart,
  Loader2,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { PageLoader } from '../components/Loading.jsx'
import Price from '../components/Price.jsx'
import ProductCard from '../components/ProductCard.jsx'
import QuantitySelector from '../components/QuantitySelector.jsx'
import RatingStars from '../components/RatingStars.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js'
import { fetchProduct, submitReview } from '../services/catalog.js'
import { formatDate } from '../utils/format.js'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addToast } = useToast()
  const { addProduct: addRecentlyViewed } = useRecentlyViewed()
  const { data: product, error: loadError, loading, reload } = useAsyncData(
    () => fetchProduct(slug),
    slug,
  )
  const [imageState, setImageState] = useState({ productId: null, image: '' })
  const [quantityState, setQuantityState] = useState({ productId: null, value: 1 })
  const [adding, setAdding] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    if (product) addRecentlyViewed(product)
  }, [product, addRecentlyViewed])

  usePageTitle(product?.name || 'Product details')

  const selectedImage =
    imageState.productId === product?.id
      ? imageState.image
      : product?.images?.[0]?.image_url || product?.primary_image || ''
  const quantity = quantityState.productId === product?.id ? quantityState.value : 1
  const setQuantity = (value) => setQuantityState({ productId: product?.id ?? null, value })
  const error = loadError ? 'This product could not be found or is no longer available.' : ''

  const reviews = product?.reviews || []
  const ratingBreakdown = product?.rating_breakdown || {}
  const saved = product ? isWishlisted(product.id) : false

  const savings = useMemo(() => {
    if (!product?.discount_price) return 0
    return Number(product.price) - Number(product.discount_price)
  }, [product])

  async function handleAddToCart() {
    if (!product) return
    setAdding(true)
    await addToCart(product, quantity)
    setAdding(false)
  }

  async function handleBuyNow() {
    if (!product) return
    setAdding(true)
    const added = await addToCart(product, quantity)
    setAdding(false)
    if (added) navigate('/checkout')
  }

  async function handleReview(event) {
    event.preventDefault()
    if (!user) return
    setReviewLoading(true)
    setReviewError('')
    try {
      await submitReview(product.id, reviewForm)
      addToast('Thank you for sharing your review.')
      setReviewForm({ rating: 5, comment: '' })
      reload()
    } catch (requestError) {
      setReviewError(
        requestError?.response?.data?.message || 'Your review could not be submitted.',
      )
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) return <PageLoader />

  if (error || !product) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={PackageCheck}
          title="Product not available"
          description={error}
          actionLabel="Try again"
          onAction={reload}
        />
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="container-page flex items-center gap-1.5 overflow-hidden py-3 text-xs text-slate-400">
          <Link to="/" className="shrink-0 hover:text-brand-600">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to={`/products?category=${product.category_slug}`} className="shrink-0 hover:text-brand-600">
            {product.category_name}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate text-slate-600">{product.name}</span>
        </div>
      </div>

      <div className="container-page py-5 sm:py-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-10">
          <section aria-label="Product images">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-50">
                <img
                  src={selectedImage || '/images/products/placeholder.svg'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = '/images/products/placeholder.svg'
                  }}
                />
                {product.discount_percent > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1.5 text-sm font-bold text-white shadow">
                    Save {product.discount_percent}%
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {product.images.map((image) => (
                <button
                  key={image.id || image.image_url}
                  type="button"
                  onClick={() => setImageState({ productId: product.id, image: image.image_url })}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition sm:h-20 sm:w-20 ${
                    selectedImage === image.image_url ? 'border-brand-500' : 'border-transparent hover:border-slate-300'
                  }`}
                  aria-label={`Show image: ${image.alt_text || product.name}`}
                  aria-pressed={selectedImage === image.image_url}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Product information">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  to={`/products?q=${encodeURIComponent(product.brand)}`}
                  className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700"
                >
                  {product.brand}
                </Link>
                <h1 className="mt-1.5 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                  {product.name}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border shadow-sm transition ${
                  saved
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-500'
                }`}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={saved}
              >
                <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <a href="#reviews" className="flex items-center gap-1.5 hover:text-brand-600">
                <RatingStars rating={product.rating_avg} count={product.rating_count} />
              </a>
              <span className="h-3 w-px bg-slate-200" />
              <span>{Number(product.sold_count).toLocaleString()} sold</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className={product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-orange-50/70 p-4 sm:p-5">
              <Price product={product} size="lg" />
              {savings > 0 && (
                <p className="mt-1.5 text-xs font-medium text-emerald-700">
                  You save ৳{savings.toLocaleString()} on this item
                </p>
              )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-semibold text-slate-700">Quantity</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={Math.min(product.stock || 1, 99)}
                  disabled={product.stock < 1}
                />
                <span className="text-xs text-slate-400">
                  {product.stock > 0 ? `Maximum ${Math.min(product.stock, 99)} per order` : 'Currently unavailable'}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || product.stock < 1}
                className="btn-secondary h-12 border-brand-500 text-brand-600 hover:bg-brand-50"
              >
                {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={adding || product.stock < 1}
                className="btn-primary h-12"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <InfoTile icon={Banknote} title="Cash on Delivery" text="Pay on arrival" />
              <InfoTile icon={Truck} title="Fast delivery" text="2-5 business days" />
              <InfoTile icon={RefreshCcw} title="Easy returns" text="7-day return window" />
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{product.brand} Official Store</p>
                  <p className="text-xs text-slate-500">Fulfilled by BazarBondhu</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Product details</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{product.description}</p>
            <dl className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Brand</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{product.brand}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Category</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{product.category_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Availability</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{product.stock > 0 ? 'In stock' : 'Out of stock'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Sold by</dt>
                <dd className="mt-0.5 font-medium text-slate-700">BazarBondhu verified seller</dd>
              </div>
            </dl>
          </section>

          <section id="reviews" className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Ratings & Reviews</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-slate-900">{Number(product.rating_avg).toFixed(1)}</p>
                <RatingStars rating={product.rating_avg} showCount={false} />
                <p className="mt-1 text-[11px] text-slate-400">{product.rating_count} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = Number(ratingBreakdown[rating] || 0)
                  const percent = product.rating_count ? (count / product.rating_count) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="w-3">{rating}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {user ? (
              <form onSubmit={handleReview} className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-800">Share your experience</p>
                <div className="mt-2 flex items-center gap-1" aria-label="Choose a rating">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                      className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                        rating <= reviewForm.rating
                          ? 'bg-amber-50 text-amber-500'
                          : 'bg-slate-50 text-slate-300 hover:text-amber-400'
                      }`}
                      aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
                      aria-pressed={rating === reviewForm.rating}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="m12 17.3-6.2 3.7 1.7-7.1L2 9.2l7.2-.6L12 2l2.8 6.6 7.2.6-5.5 4.7 1.7 7.1L12 17.3Z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <label htmlFor="review-comment" className="mt-3 block text-xs font-medium text-slate-600">
                  Your review (optional)
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  maxLength={1000}
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  className="input mt-1 resize-none"
                  placeholder="What did you like or dislike?"
                />
                {reviewError && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {reviewError}
                  </p>
                )}
                <button type="submit" disabled={reviewLoading} className="btn-primary mt-3 w-full">
                  {reviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {reviewLoading ? 'Submitting...' : 'Submit review'}
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-600">Log in to share your experience.</p>
                <Link to={`/login?redirect=/product/${product.slug}`} className="btn-primary mt-3 w-full">
                  Login to review
                </Link>
              </div>
            )}

            <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
              {reviews.length ? (
                reviews.slice(0, 4).map((review) => (
                  <article key={review.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {review.user_name?.charAt(0) || 'U'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{review.user_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="mt-1.5">
                      <RatingStars rating={review.rating} showCount={false} />
                    </div>
                    {review.comment && <p className="mt-1.5 text-xs leading-5 text-slate-600">{review.comment}</p>}
                  </article>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-slate-500">
                  No reviews yet. Be the first to share your thoughts.
                </div>
              )}
            </div>
          </section>
        </div>

        {product.related?.length > 0 && (
          <section className="mt-8" aria-labelledby="related-heading">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <h2 id="related-heading" className="text-lg font-bold text-slate-900">You may also like</h2>
                <Link to={`/products?category=${product.category_slug}`} className="text-xs font-semibold text-brand-600">
                  More in {product.category_name}
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {product.related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function InfoTile({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-white p-3">
      <Icon className="h-5 w-5 shrink-0 text-brand-500" />
      <div>
        <p className="text-xs font-semibold text-slate-700">{title}</p>
        <p className="text-[10px] text-slate-400">{text}</p>
      </div>
    </div>
  )
}
