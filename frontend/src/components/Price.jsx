import { formatBDT } from '../utils/format.js'

export default function Price({ product, size = 'md' }) {
  const priceClass = size === 'lg' ? 'text-2xl sm:text-3xl' : size === 'sm' ? 'text-sm' : 'text-base sm:text-lg'
  const originalClass = size === 'lg' ? 'text-base' : 'text-xs sm:text-sm'

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-bold text-brand-600 ${priceClass}`}>
        {formatBDT(product.effective_price)}
      </span>
      {product.discount_price && (
        <>
          <span className={`text-slate-400 line-through ${originalClass}`}>
            {formatBDT(product.price)}
          </span>
          <span className="text-xs font-semibold text-emerald-600">-{product.discount_percent}%</span>
        </>
      )}
    </div>
  )
}
