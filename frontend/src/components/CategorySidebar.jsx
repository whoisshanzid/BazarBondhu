import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryIcon from './CategoryIcon.jsx'

export default function CategorySidebar({ categories, loading }) {
  return (
    <aside className="hidden overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm lg:block">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900">All Categories</h2>
        <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
          See all
        </Link>
      </div>
      <nav className="py-1.5" aria-label="Shop by category">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2.5">
                <div className="skeleton h-5 w-5 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            ))
          : categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group flex items-center gap-2.5 px-4 py-[7.5px] text-[13px] text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <CategoryIcon name={category.icon} className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
                <span className="flex-1 truncate">{category.name}</span>
                <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-brand-400" />
              </Link>
            ))}
      </nav>
    </aside>
  )
}
