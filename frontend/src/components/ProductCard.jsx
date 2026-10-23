import { useState } from 'react'
import { Heart, Loader2, ShoppingCart, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import Price from './Price.jsx'
import RatingStars from './RatingStars.jsx'

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [adding, setAdding] = useState(false)
  const saved = isWishlisted(product.id)
  const outOfStock = product.stock < 1

  async function handleAdd(event) {
    event.preventDefault()
    setAdding(true)
    await addToCart(product, 1)
    setAdding(false)
  }

  async function handleWishlist(event) {
    event.preventDefault()
    await toggleWishlist(product)
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img
            src={product.primary_image || '/images/products/placeholder.svg'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={(event) => {
              event.currentTarget.src = '/images/products/placeholder.svg'
            }}
          />
        </Link>

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.discount_percent > 0 && (
            <span className="rounded-md bg-brand-500 px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">
              -{product.discount_percent}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold leading-none text-white shadow-sm">
              <Zap className="h-3 w-3 fill-current" /> Flash
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 ${
            saved ? 'border-red-200 text-red-500' : 'border-slate-100 text-slate-400 hover:text-red-500'
          }`}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-white/65 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${compact ? 'p-2.5' : 'p-3 sm:p-3.5'}`}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {product.brand || product.category_name}
        </p>
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-slate-800 transition hover:text-brand-600"
        >
          {product.name}
        </Link>

        <div className="mt-1.5">
          <RatingStars rating={product.rating_avg} count={product.rating_count} showCount={!compact} />
        </div>

        <div className="mt-2">
          <Price product={product} size="sm" />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-[11px] text-slate-400">
            {Number(product.sold_count || 0).toLocaleString()} sold
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || outOfStock}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${product.name} to cart`}
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  )
}
