import { Link } from 'react-router-dom'

const brands = [
  { name: 'Nexora', tag: 'Smart tech', bg: 'from-orange-500 to-amber-400' },
  { name: 'AuroraTech', tag: 'Electronics', bg: 'from-blue-600 to-sky-400' },
  { name: 'Rongdhonu', tag: 'Fashion', bg: 'from-pink-600 to-rose-400' },
  { name: 'GhorBondhu', tag: 'Home & living', bg: 'from-emerald-600 to-lime-400' },
  { name: 'Meghna Fresh', tag: 'Groceries', bg: 'from-yellow-600 to-amber-400' },
  { name: 'Lotus Beauty', tag: 'Beauty', bg: 'from-purple-600 to-fuchsia-400' },
  { name: 'KhelaGhor', tag: 'Sports', bg: 'from-red-600 to-orange-400' },
  { name: 'TinyToes', tag: 'Baby & toys', bg: 'from-amber-500 to-yellow-300' },
]

export default function BrandStrip() {
  return (
    <section className="container-page mt-6 sm:mt-8" aria-labelledby="brands-heading">
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="brands-heading" className="section-title">
              Popular Brands
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Original labels, loved by local shoppers.</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700 sm:text-sm">
            Explore brands
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={`/products?q=${encodeURIComponent(brand.name)}`}
              className="group flex flex-col items-center justify-center rounded-lg border border-slate-100 px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-sm font-extrabold text-white shadow-sm ${brand.bg}`}
              >
                {brand.name.charAt(0)}
              </span>
              <span className="mt-2 text-xs font-bold text-slate-700 group-hover:text-brand-600">{brand.name}</span>
              <span className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-400">{brand.tag}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
