import { BadgeCheck, Banknote, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PromoBanners() {
  return (
    <section className="container-page mt-6 sm:mt-8" aria-label="Shopping benefits">
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/products?sort=discount"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white shadow-sm sm:p-6"
        >
          <Truck className="absolute -bottom-4 -right-3 h-28 w-28 text-white/10 transition group-hover:scale-110" />
          <span className="badge bg-white/15 text-white">Nationwide delivery</span>
          <h2 className="mt-3 text-lg font-bold">Free delivery over ৳5,000</h2>
          <p className="mt-1 max-w-[230px] text-xs text-white/70">
            Shop more and save on delivery, from Dhaka to Chattogram and beyond.
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-brand-300">Start shopping</span>
        </Link>

        <Link
          to="/help"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-orange-400 p-5 text-white shadow-sm sm:p-6"
        >
          <Banknote className="absolute -bottom-4 -right-3 h-28 w-28 text-white/10 transition group-hover:scale-110" />
          <span className="badge bg-white/15 text-white">Pay your way</span>
          <h2 className="mt-3 text-lg font-bold">Cash on Delivery</h2>
          <p className="mt-1 max-w-[230px] text-xs text-white/80">
            Pay when your parcel arrives. Simple, familiar and available across Bangladesh.
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-white">Learn more</span>
        </Link>

        <Link
          to="/about"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 p-5 text-white shadow-sm sm:p-6"
        >
          <BadgeCheck className="absolute -bottom-4 -right-3 h-28 w-28 text-white/10 transition group-hover:scale-110" />
          <span className="badge bg-white/15 text-white">Shop confidently</span>
          <h2 className="mt-3 text-lg font-bold">Buyer protection</h2>
          <p className="mt-1 max-w-[230px] text-xs text-white/80">
            Genuine products, transparent prices and support when you need it.
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-white">Our promise</span>
        </Link>
      </div>
    </section>
  )
}
