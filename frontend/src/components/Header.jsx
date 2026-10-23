import { useEffect, useState } from 'react'
import {
  ChevronDown,
  Globe2,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { fetchCategories } from '../services/catalog.js'
import CategoryIcon from './CategoryIcon.jsx'
import Logo from './Logo.jsx'
import MobileMenu from './MobileMenu.jsx'
import SearchBar from './SearchBar.jsx'

export default function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [language, setLanguage] = useState(() => localStorage.getItem('bb_language') || 'en')

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  function changeLanguage(event) {
    const next = event.target.value
    setLanguage(next)
    localStorage.setItem('bb_language', next)
    document.documentElement.lang = next
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white">
        <div className="hidden bg-slate-900 text-slate-300 lg:block">
          <div className="container-page flex h-9 items-center justify-between text-xs">
            <div className="flex items-center gap-5">
              <Link to="/app" className="hover:text-white">
                Save More on App
              </Link>
              <Link to="/sell" className="hover:text-white">
                Sell on BazarBondhu
              </Link>
              <Link to="/help" className="hover:text-white">
                Help Center
              </Link>
              <Link to={user ? '/account?tab=orders' : '/login?redirect=/account?tab=orders'} className="hover:text-white">
                Track Order
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to={user ? '/wishlist' : '/login?redirect=/wishlist'} className="hover:text-white">
                Wishlist
              </Link>
              {user ? (
                <div className="group relative">
                  <button type="button" className="flex items-center gap-1.5 hover:text-white">
                    <User className="h-3.5 w-3.5" />
                    <span className="max-w-[150px] truncate">{user.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 w-48 rounded-lg border border-slate-100 bg-white py-1.5 text-slate-700 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <Link to="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                      <User className="h-4 w-4 text-slate-400" /> My profile
                    </Link>
                    <Link to="/account?tab=orders" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                      <Package className="h-4 w-4 text-slate-400" /> My orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 font-semibold text-brand-600 hover:bg-brand-50">
                        <Store className="h-4 w-4" /> Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="hover:text-white">
                    Login
                  </Link>
                  <span className="h-3 w-px bg-slate-700" />
                  <Link to="/register" className="hover:text-white">
                    Sign Up
                  </Link>
                </div>
              )}
              <label className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                <Globe2 className="h-3.5 w-3.5" />
                <span className="sr-only">Language</span>
                <select
                  value={language}
                  onChange={changeLanguage}
                  className="cursor-pointer appearance-none bg-transparent pr-4 text-xs text-slate-300 hover:text-white focus:text-white"
                  aria-label="Select language"
                >
                  <option value="en" className="text-slate-800">English</option>
                  <option value="bn" className="text-slate-800">বাংলা</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100">
          <div className="container-page flex h-[68px] items-center gap-3 lg:gap-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Logo compact className="shrink-0" />

            <div className="hidden flex-1 lg:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                to={user ? '/wishlist' : '/login?redirect=/wishlist'}
                className="relative hidden h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 sm:grid"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to={user ? '/account' : '/login'}
                className="hidden h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 sm:grid"
                aria-label={user ? 'My account' : 'Login'}
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                to="/cart"
                className="relative flex h-10 items-center gap-2 rounded-lg px-2.5 text-slate-700 hover:bg-slate-100 sm:px-3"
                aria-label={`Shopping cart with ${cart.total_items} items`}
              >
                <span className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {cart.total_items}
                  </span>
                </span>
                <span className="hidden text-sm font-semibold xl:inline">Cart</span>
              </Link>
            </div>
          </div>

          <div className="container-page pb-3 lg:hidden">
            <SearchBar mobile />
          </div>
        </div>

        <nav className="hidden border-b border-slate-100 bg-white lg:block" aria-label="Categories">
          <div className="container-page flex h-10 items-center gap-1 overflow-hidden">
            <Link
              to="/products"
              className="mr-1 flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 text-sm font-semibold text-slate-700 hover:text-brand-600"
            >
              All Categories
            </Link>
            <span className="mx-1 h-4 w-px bg-slate-200" />
            {categories.slice(0, 9).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1 text-[13px] text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                {category.name}
              </Link>
            ))}
            <Link
              to="/products"
              className="ml-auto flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Need help?
            </Link>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} />

      {!user && (
        <div className="border-b border-brand-100 bg-brand-50 lg:hidden">
          <div className="container-page flex items-center justify-between py-2 text-xs">
            <span className="text-brand-800">Login for faster checkout and order tracking.</span>
            <Link to="/login" className="flex items-center gap-1 font-semibold text-brand-700">
              <LogIn className="h-3.5 w-3.5" /> Login
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
