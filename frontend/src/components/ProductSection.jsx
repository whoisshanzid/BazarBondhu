import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'
import { ProductGridSkeleton } from './Loading.jsx'

export default function ProductSection({ title, subtitle, products, viewAllTo, loading, className = '' }) {
  if (!loading && !products.length) return null

  return (
    <section className={`container-page mt-6 sm:mt-8 ${className}`} aria-label={title}>
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
          </div>
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 sm:text-sm"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="mt-4">
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
