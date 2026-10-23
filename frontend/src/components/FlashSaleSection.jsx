import { ChevronRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown.js'
import ProductCard from './ProductCard.jsx'

function CountdownBox({ value, label }) {
  return (
    <div className="text-center">
      <span className="grid h-8 min-w-8 place-items-center rounded bg-slate-900/90 px-1 text-sm font-bold text-white sm:h-9 sm:min-w-9">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-0.5 block text-[9px] font-medium uppercase text-white/75">{label}</span>
    </div>
  )
}

export default function FlashSaleSection({ products, target, loading }) {
  const time = useCountdown(target)

  if (!loading && !products.length) return null

  return (
    <section className="container-page mt-6" aria-labelledby="flash-sale-heading">
      <div className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-brand-600 via-brand-500 to-orange-400 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-white">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <div>
              <h2 id="flash-sale-heading" className="text-lg font-extrabold text-white sm:text-xl">
                Flash Sale
              </h2>
              <p className="text-[11px] text-white/80">Limited stock. Grab the deal before time runs out.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!time.expired && (
              <div className="flex items-end gap-1.5" aria-label="Flash sale time remaining">
                {time.days > 0 && <CountdownBox value={time.days} label="days" />}
                <CountdownBox value={time.hours} label="hrs" />
                <CountdownBox value={time.minutes} label="min" />
                <CountdownBox value={time.seconds} label="sec" />
              </div>
            )}
            <Link
              to="/products?flash_sale=true"
              className="hidden items-center gap-1 text-sm font-semibold text-white hover:text-white/85 sm:flex"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border p-3">
                  <div className="skeleton aspect-square rounded-lg" />
                  <div className="mt-2 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))
            : products.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
        </div>

        <div className="border-t border-slate-100 px-4 py-2.5 sm:hidden">
          <Link to="/products?flash_sale=true" className="flex items-center justify-center gap-1 text-sm font-semibold text-brand-600">
            View all flash deals <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
