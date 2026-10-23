import { useEffect, useState } from 'react'
import {
  ChevronRight,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import CategoryIcon from './CategoryIcon.jsx'
import Logo from './Logo.jsx'

export default function MobileMenu({ open, onClose, categories }) {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      onClose()
    } finally {
      setLoggingOut(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <Logo compact />
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-xl bg-slate-50 p-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={onClose} className="btn-primary flex-1">
                  Login
                </Link>
                <Link to="/register" onClick={onClose} className="btn-secondary flex-1">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <nav className="mt-5 space-y-1" aria-label="Mobile account">
            <MenuLink to="/account" onClick={onClose} icon={User} label="My account" />
            <MenuLink to="/account?tab=orders" onClick={onClose} icon={Package} label="My orders" />
            <MenuLink to="/wishlist" onClick={onClose} icon={Heart} label="Wishlist" />
            <MenuLink to="/cart" onClick={onClose} icon={ShoppingBag} label="My cart" />
            <MenuLink to="/sell" onClick={onClose} icon={Store} label="Sell on BazarBondhu" />
            <MenuLink to="/help" onClick={onClose} icon={HelpCircle} label="Help center" />
          </nav>

          <div className="mt-6">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Shop by category
            </p>
            <div className="mt-2 space-y-0.5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  <CategoryIcon name={category.icon} className="h-4 w-4 text-brand-500" />
                  <span className="flex-1">{category.name}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {user && (
          <div className="border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary w-full text-red-600 hover:border-red-200 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" /> {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        )}

        {!user && (
          <div className="border-t border-slate-100 p-4">
            <Link to="/login" onClick={onClose} className="btn-secondary w-full">
              <LogIn className="h-4 w-4" /> Login to your account
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}

function MenuLink({ to, onClick, icon: Icon, label }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  )
}
