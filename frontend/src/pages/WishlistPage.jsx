import { Heart, Loader2, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { PageLoader } from '../components/Loading.jsx'
import Price from '../components/Price.jsx'
import RatingStars from '../components/RatingStars.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useState } from 'react'

export default function WishlistPage() {
  usePageTitle('My wishlist')
  const { user } = useAuth()
  const { wishlist, loading, removeWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [busyId, setBusyId] = useState(null)

  if (loading && !wishlist.length) return <PageLoader />

  if (!wishlist.length) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          actionLabel="Discover products"
          actionTo="/products"
        />
      </div>
    )
  }

  async function moveToCart(item) {
    setBusyId(item.id)
    const ok = await addToCart(item, 1)
    if (ok) await removeWishlist(item.id)
    setBusyId(null)
  }

  return (
    <div className="bg-slate-50 py-5 sm:py-7">
      <div className="container-page">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            My Wishlist <span className="text-sm font-medium text-slate-400">({wishlist.length})</span>
          </h1>
          <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Add more items
          </Link>
        </div>

        {!user && (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <Link to="/login?redirect=/wishlist" className="font-semibold underline">
              Log in
            </Link>{' '}
            to keep your wishlist synced across devices.
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => {
            const outOfStock = item.stock < 1
            return (
              <article key={item.id} className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <Link to={`/product/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                  <img
                    src={item.primary_image || '/images/products/placeholder.svg'}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/images/products/placeholder.svg'
                    }}
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {item.brand || item.category_name}
                  </p>
                  <Link
                    to={`/product/${item.slug}`}
                    className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-brand-600"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-1">
                    <RatingStars rating={item.rating_avg} count={item.rating_count} showCount={false} />
                  </div>
                  <div className="mt-1.5">
                    <Price product={item} size="sm" />
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => moveToCart(item)}
                      disabled={outOfStock || busyId === item.id}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      {busyId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {outOfStock ? 'Out of stock' : 'Move to cart'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWishlist(item.id)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
