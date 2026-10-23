import { AlertTriangle, ArrowLeft, Loader2, ShoppingCart, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { PageLoader } from '../components/Loading.jsx'
import QuantitySelector from '../components/QuantitySelector.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { formatBDT, shippingEstimate } from '../utils/format.js'

export default function CartPage() {
  usePageTitle('Shopping cart')
  const { user } = useAuth()
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const items = cart.items || []

  if (loading && !items.length) return <PageLoader />

  if (!items.length) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our categories and add products you love to your cart."
          actionLabel="Start shopping"
          actionTo="/products"
        />
      </div>
    )
  }

  const shipping = shippingEstimate('Dhaka', cart.subtotal)
  const inactiveItems = items.filter((item) => item.is_active === false)

  return (
    <div className="bg-slate-50 py-5 sm:py-7">
      <div className="container-page">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Shopping Cart <span className="text-sm font-medium text-slate-400">({cart.total_items} items)</span>
        </h1>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-3" aria-label="Cart items">
            {inactiveItems.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Some items are no longer available and were excluded from the total.
              </div>
            )}

            {items.map((item) => {
              const unavailable = item.is_active === false
              return (
                <article
                  key={item.product_id}
                  className={`flex gap-3 rounded-xl border bg-white p-3 shadow-sm sm:gap-4 sm:p-4 ${
                    unavailable ? 'border-amber-200 opacity-80' : 'border-slate-100'
                  }`}
                >
                  <Link to={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-50 sm:h-24 sm:w-24">
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {item.brand || item.category_name}
                        </p>
                        <Link
                          to={`/product/${item.slug}`}
                          className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-brand-600"
                        >
                          {item.name}
                        </Link>
                        {unavailable && (
                          <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-brand-600">
                          {formatBDT(item.effective_price)}
                        </span>
                        {item.discount_price && (
                          <span className="text-xs text-slate-400 line-through">{formatBDT(item.price)}</span>
                        )}
                      </div>
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(quantity) => updateQuantity(item.product_id, quantity)}
                        max={Math.min(item.stock || 1, 99)}
                        disabled={unavailable}
                      />
                      <span className="ml-auto hidden text-sm font-semibold text-slate-700 sm:inline">
                        {formatBDT(item.line_total)}
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                <ArrowLeft className="h-4 w-4" /> Continue shopping
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" /> Clear cart
              </button>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Order summary</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-semibold text-slate-800">{formatBDT(cart.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Delivery (est.)</dt>
                  <dd className="font-semibold text-slate-800">
                    {shipping === 0 ? 'Free' : formatBDT(shipping)}
                  </dd>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <dt className="font-semibold text-slate-700">Estimated total</dt>
                    <dd className="text-lg font-extrabold text-brand-600">
                      {formatBDT(cart.subtotal + shipping)}
                    </dd>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Final delivery charge is calculated at checkout.
                  </p>
                </div>
              </dl>

              <Link to={user ? '/checkout' : '/login?redirect=/checkout'} className="btn-primary mt-5 h-12 w-full">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Proceed to checkout'}
              </Link>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                Cash on Delivery available across Bangladesh.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
