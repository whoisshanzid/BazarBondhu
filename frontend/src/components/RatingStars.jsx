import { Star } from 'lucide-react'

export default function RatingStars({ rating = 0, count = 0, size = 'sm', showCount = true }) {
  const starSize = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'

  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${Number(rating).toFixed(1)} out of 5`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(Number(rating))
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-100 text-slate-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </span>
      {showCount && (
        <span className="text-xs text-slate-500">
          {Number(rating || 0).toFixed(1)}
          {count > 0 ? ` (${count})` : ''}
        </span>
      )}
    </span>
  )
}
