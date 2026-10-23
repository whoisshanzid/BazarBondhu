import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Filter, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import CategoryIcon from '../components/CategoryIcon.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { ProductGridSkeleton, LoadingSpinner } from '../components/Loading.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { fetchCategories, fetchProducts } from '../services/catalog.js'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const sortOptions = [
  { value: 'popular', label: 'Popularity' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'discount', label: 'Best discount' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [mobileFilters, setMobileFilters] = useState(false)

  const q = searchParams.get('q') || ''
  const categorySlug = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'popular'
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const flashSale = searchParams.get('flash_sale') === 'true'
  const featured = searchParams.get('featured') === 'true'
  const inStock = searchParams.get('in_stock') === 'true'

  const [priceState, setPriceState] = useState({ min: minPrice, max: maxPrice })
  if (priceState.min !== minPrice || priceState.max !== maxPrice) {
    setPriceState({ min: minPrice, max: maxPrice })
  }
  const priceDraft = priceState
  const setPriceDraft = setPriceState

  const activeCategory = categories.find((category) => category.slug === categorySlug)
  const filterKey = searchParams.toString()
  const request = useMemo(() => ({ filterKey, reloadKey }), [filterKey, reloadKey])

  const pageTitle = useMemo(() => {
    if (q) return `Search results for "${q}"`
    if (flashSale) return 'Flash Sale Deals'
    if (featured) return 'Featured Products'
    if (activeCategory) return activeCategory.name
    return 'All Products'
  }, [q, flashSale, featured, activeCategory])

  usePageTitle(pageTitle)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const { error: loadError, loading } = useAsyncData(() => {
    const params = Object.fromEntries(searchParams.entries())
    const extras = { ...params, limit: 12, page: 1 }
    if (extras.flash_sale !== undefined) extras.flash_sale = true
    if (extras.featured !== undefined) extras.featured = true
    if (extras.in_stock !== undefined) extras.in_stock = true

    return fetchProducts(extras).then((data) => {
      setProducts(data.products)
      setPagination(data.pagination)
      setMoreError('')
    })
  }, request)

  const error = loadError ? 'Products could not be loaded. Please try again.' : moreError

  useEffect(() => {
    if (mobileFilters) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileFilters])

  function updateParams(updates) {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === false) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })
    setSearchParams(next)
  }

  async function loadMore() {
    if (loadingMore || pagination.page >= pagination.total_pages) return
    setLoadingMore(true)
    setMoreError('')
    try {
      const params = Object.fromEntries(searchParams.entries())
      const extras = { ...params, limit: 12, page: pagination.page + 1 }
      if (extras.flash_sale !== undefined) extras.flash_sale = true
      if (extras.featured !== undefined) extras.featured = true
      if (extras.in_stock !== undefined) extras.in_stock = true
      const data = await fetchProducts(extras)
      setProducts((current) => [...current, ...data.products])
      setPagination(data.pagination)
    } catch {
      setMoreError('Could not load more products.')
    } finally {
      setLoadingMore(false)
    }
  }

  function applyPrice(event) {
    event.preventDefault()
    updateParams({
      min_price: priceDraft.min ? Number(priceDraft.min) : null,
      max_price: priceDraft.max ? Number(priceDraft.max) : null,
    })
    setMobileFilters(false)
  }

  function resetFilters() {
    setSearchParams({})
  }

  const hasFilters = Boolean(
    q || categorySlug || minPrice || maxPrice || flashSale || featured || inStock || sort !== 'popular',
  )

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="container-page py-4">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-600">{pageTitle}</span>
          </nav>
          <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{pageTitle}</h1>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {loading ? 'Finding the best matches...' : `${pagination.total} product${pagination.total === 1 ? '' : 's'} found`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFilters(true)}
                className="btn-secondary lg:hidden"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <span className="hidden sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => updateParams({ sort: event.target.value })}
                  className="input h-10 w-auto py-2 text-xs sm:text-sm"
                  aria-label="Sort products"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-5 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="hidden h-fit rounded-xl border border-slate-100 bg-white p-4 shadow-sm lg:block">
            <FilterPanel
              categories={categories}
              categorySlug={categorySlug}
              updateParams={updateParams}
              priceDraft={priceDraft}
              setPriceDraft={setPriceDraft}
              applyPrice={applyPrice}
              flashSale={flashSale}
              inStock={inStock}
              hasFilters={hasFilters}
              resetFilters={resetFilters}
            />
          </aside>

          <div>
            {hasFilters && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {q && <FilterChip label={`Search: ${q}`} onRemove={() => updateParams({ q: null })} />}
                {activeCategory && (
                  <FilterChip label={activeCategory.name} onRemove={() => updateParams({ category: null })} />
                )}
                {flashSale && <FilterChip label="Flash sale" onRemove={() => updateParams({ flash_sale: null })} />}
                {featured && <FilterChip label="Featured" onRemove={() => updateParams({ featured: null })} />}
                {inStock && <FilterChip label="In stock" onRemove={() => updateParams({ in_stock: null })} />}
                {(minPrice || maxPrice) && (
                  <FilterChip
                    label={`৳${minPrice || 0} - ${maxPrice ? `৳${maxPrice}` : 'Any'}`}
                    onRemove={() => updateParams({ min_price: null, max_price: null })}
                  />
                )}
                <button type="button" onClick={resetFilters} className="text-xs font-semibold text-brand-600 hover:underline">
                  Clear all
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span>{error}</span>
                <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="flex items-center gap-1 font-semibold">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pagination.page < pagination.total_pages && (
                  <div className="mt-7 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-secondary min-w-40"
                    >
                      {loadingMore ? <LoadingSpinner className="h-4 w-4" /> : null}
                      {loadingMore ? 'Loading...' : 'Load more products'}
                    </button>
                    <p className="mt-2 text-xs text-slate-400">
                      Showing {products.length} of {pagination.total}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={SlidersHorizontal}
                title="No products matched these filters"
                description="Try a different search, category or price range."
                actionLabel="Clear filters"
                onAction={resetFilters}
              />
            )}
          </div>
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileFilters(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="pt-4">
              <FilterPanel
                categories={categories}
                categorySlug={categorySlug}
                updateParams={(updates) => {
                  updateParams(updates)
                  setMobileFilters(false)
                }}
                priceDraft={priceDraft}
                setPriceDraft={setPriceDraft}
                applyPrice={applyPrice}
                flashSale={flashSale}
                inStock={inStock}
                hasFilters={hasFilters}
                resetFilters={() => {
                  resetFilters()
                  setMobileFilters(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function FilterPanel({
  categories,
  categorySlug,
  updateParams,
  priceDraft,
  setPriceDraft,
  applyPrice,
  flashSale,
  inStock,
  hasFilters,
  resetFilters,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Categories</h3>
        <div className="mt-2 space-y-0.5">
          <button
            type="button"
            onClick={() => updateParams({ category: null })}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
              !categorySlug ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParams({ category: category.slug })}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                categorySlug === category.slug
                  ? 'bg-brand-50 font-semibold text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CategoryIcon name={category.icon} className="h-4 w-4" />
              <span className="flex-1">{category.name}</span>
              <span className="text-[10px] text-slate-400">{category.product_count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">Price range</h3>
        <form onSubmit={applyPrice} className="mt-2 flex items-center gap-2">
          <label className="sr-only" htmlFor="min-price">Minimum price</label>
          <input
            id="min-price"
            type="number"
            min="0"
            value={priceDraft.min}
            onChange={(event) => setPriceDraft((current) => ({ ...current, min: event.target.value }))}
            placeholder="Min"
            className="input h-9 px-2 text-xs"
          />
          <span className="text-slate-400">-</span>
          <label className="sr-only" htmlFor="max-price">Maximum price</label>
          <input
            id="max-price"
            type="number"
            min="0"
            value={priceDraft.max}
            onChange={(event) => setPriceDraft((current) => ({ ...current, max: event.target.value }))}
            placeholder="Max"
            className="input h-9 px-2 text-xs"
          />
          <button type="submit" className="btn-primary h-9 shrink-0 px-3 py-1 text-xs">
            Go
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">Quick filters</h3>
        <div className="mt-2 space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={flashSale}
              onChange={(event) => updateParams({ flash_sale: event.target.checked ? 'true' : null })}
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            Flash sale only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => updateParams({ in_stock: event.target.checked ? 'true' : null })}
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            In stock only
          </label>
        </div>
      </div>

      {hasFilters && (
        <button type="button" onClick={resetFilters} className="btn-secondary w-full">
          Reset all filters
        </button>
      )}
    </div>
  )
}
