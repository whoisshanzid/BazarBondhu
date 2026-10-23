import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export default function SearchBar({ mobile = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlQuery = location.pathname === '/products' ? searchParams.get('q') || '' : ''
  const [state, setState] = useState({ urlQuery, query: urlQuery })

  if (state.urlQuery !== urlQuery) {
    setState({ urlQuery, query: urlQuery })
  }

  const query = state.query

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products')
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex w-full overflow-hidden rounded-lg border-2 border-brand-500 bg-white ${mobile ? 'shadow-sm' : ''}`}
    >
      <label htmlFor={mobile ? 'mobile-search' : 'site-search'} className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id={mobile ? 'mobile-search' : 'site-search'}
            type="search"
            value={query}
            onChange={(event) => setState((current) => ({ ...current, query: event.target.value }))}
            placeholder="Search in BazarBondhu..."
            className="h-11 w-full bg-transparent pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setState((current) => ({ ...current, query: '' }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
      </div>
      <button
        type="submit"
        className="flex items-center gap-1.5 bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 sm:px-6"
      >
        <Search className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  )
}
