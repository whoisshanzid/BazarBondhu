import { Compass, Home, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-brand-500 sm:text-8xl">404</p>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900">This page went shopping</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        The page you are looking for does not exist, may have moved, or the link is no longer valid.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <Home className="h-4 w-4" /> Back home
        </Link>
        <Link to="/products" className="btn-secondary">
          <Compass className="h-4 w-4" /> Browse products
        </Link>
        <Link to="/help" className="btn-secondary">
          <Search className="h-4 w-4" /> Get help
        </Link>
      </div>
    </div>
  )
}
