import { Link } from 'react-router-dom'
import CategoryIcon from './CategoryIcon.jsx'

const tones = [
  'bg-orange-50 text-orange-600',
  'bg-blue-50 text-blue-600',
  'bg-pink-50 text-pink-600',
  'bg-emerald-50 text-emerald-600',
  'bg-cyan-50 text-cyan-600',
  'bg-yellow-50 text-yellow-700',
  'bg-purple-50 text-purple-600',
  'bg-rose-50 text-rose-600',
  'bg-amber-50 text-amber-600',
  'bg-indigo-50 text-indigo-600',
]

export default function CategoryGrid({ categories, loading }) {
  return (
    <section className="container-page mt-6 sm:mt-8" aria-labelledby="category-heading">
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between">
          <h2 id="category-heading" className="text-base font-bold text-slate-900 sm:text-lg">
            Shop by Category
          </h2>
          <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="skeleton h-12 w-12 rounded-full sm:h-14 sm:w-14" />
                  <div className="skeleton h-2.5 w-12 rounded" />
                </div>
              ))
            : categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-lg px-1 py-1.5 text-center transition hover:bg-slate-50"
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full transition group-hover:-translate-y-0.5 sm:h-14 sm:w-14 ${tones[index % tones.length]}`}
                  >
                    <CategoryIcon name={category.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
                  </span>
                  <span className="line-clamp-2 text-[10px] font-medium leading-tight text-slate-600 sm:text-xs">
                    {category.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
