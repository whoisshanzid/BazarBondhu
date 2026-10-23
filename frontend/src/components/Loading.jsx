export function LoadingSpinner({ className = 'h-6 w-6' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="grid min-h-[45vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <LoadingSpinner className="h-9 w-9" />
        <p className="text-sm font-medium text-slate-500">Loading BazarBondhu...</p>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card overflow-hidden p-3">
          <div className="skeleton aspect-square rounded-lg" />
          <div className="mt-3 space-y-2">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
