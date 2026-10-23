import { useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandStrip from '../components/BrandStrip.jsx'
import CategoryGrid from '../components/CategoryGrid.jsx'
import CategorySidebar from '../components/CategorySidebar.jsx'
import FlashSaleSection from '../components/FlashSaleSection.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import ProductSection from '../components/ProductSection.jsx'
import PromoBanners from '../components/PromoBanners.jsx'
import CategoryIcon from '../components/CategoryIcon.jsx'
import { fetchCategories, fetchProducts } from '../services/catalog.js'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js'

export default function HomePage() {
  usePageTitle('')
  const [reloadKey, setReloadKey] = useState(0)
  const request = useMemo(() => ({ reloadKey }), [reloadKey])
  const { products: recentlyViewed } = useRecentlyViewed(4)
  const { data, error: loadError, loading } = useAsyncData(
    () =>
      Promise.all([
        fetchCategories(),
        fetchProducts({ flash_sale: true, limit: 10, sort: 'popular' }),
        fetchProducts({ featured: true, limit: 8, sort: 'popular' }),
        fetchProducts({ sort: 'newest', limit: 4 }),
      ]),
    request,
  )

  const categories = data?.[0] || []
  const flashProducts = useMemo(() => data?.[1]?.products || [], [data])
  const featuredProducts = data?.[2]?.products || []
  const newProducts = data?.[3]?.products || []
  const error = loadError ? 'We could not load the homepage right now.' : ''

  const flashTarget = useMemo(() => {
    const dates = flashProducts
      .map((product) => product.flash_sale_ends_at)
      .filter(Boolean)
      .map((date) => new Date(date).getTime())
    return dates.length ? new Date(Math.min(...dates)).toISOString() : null
  }, [flashProducts])

  return (
    <>
      <div className="bg-slate-50 pb-2 pt-4 sm:pt-5">
        <div className="container-page">
          {error && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </span>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="inline-flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[250px_1fr]">
            <CategorySidebar categories={categories} loading={loading} />
            <HeroCarousel />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm"
              >
                <CategoryIcon name={category.icon} className="h-4 w-4 text-brand-500" />
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 pb-10">
        <CategoryGrid categories={categories} loading={loading} />

        <FlashSaleSection products={flashProducts} target={flashTarget} loading={loading} />

        <ProductSection
          title="Recommended for You"
          subtitle="Popular picks from across the BazarBondhu marketplace."
          products={featuredProducts}
          viewAllTo="/products?featured=true"
          loading={loading}
        />

        <PromoBanners />

        <ProductSection
          title="Fresh Arrivals"
          subtitle="The newest products added by our sellers."
          products={newProducts}
          viewAllTo="/products?sort=newest"
          loading={loading}
        />

        <BrandStrip />

        {recentlyViewed.length > 0 && (
          <ProductSection
            title="Recently Viewed"
            subtitle="Pick up where you left off."
            products={recentlyViewed}
            viewAllTo="/products"
          />
        )}

        <section className="container-page mt-8">
          <div className="flex flex-col items-center justify-between gap-5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-orange-400 px-6 py-8 text-white shadow-lg sm:flex-row sm:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">BazarBondhu app</p>
              <h2 className="mt-2 text-2xl font-extrabold">Save more on every order</h2>
              <p className="mt-1 max-w-xl text-sm text-white/80">
                Discover app-only deals, order updates and a faster checkout experience.
              </p>
            </div>
            <Link to="/app" className="btn bg-white text-brand-600 hover:bg-brand-50">
              Explore app benefits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
