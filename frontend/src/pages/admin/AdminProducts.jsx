import { useMemo, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageLoader } from '../../components/Loading.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { useDebounce } from '../../hooks/useDebounce.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { deleteProduct, fetchAdminProducts, toggleProductStatus } from '../../services/admin.js'
import { getErrorMessage } from '../../services/api.js'
import { formatBDT } from '../../utils/format.js'

export default function AdminProducts() {
  usePageTitle('Admin products')
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState(null)
  const debouncedSearch = useDebounce(search, 350)
  const request = useMemo(
    () => ({ q: debouncedSearch, status, page }),
    [debouncedSearch, status, page],
  )
  const { data, error, loading, reload } = useAsyncData(
    () =>
      fetchAdminProducts({
        q: debouncedSearch || undefined,
        status: status || undefined,
        page,
        limit: 15,
      }),
    request,
  )
  const products = data?.products || []
  const pagination = data?.pagination || { page: 1, total_pages: 1, total: 0 }

  async function handleToggle(product) {
    setBusyId(product.id)
    try {
      await toggleProductStatus(product.id, !product.is_active)
      addToast(product.is_active ? 'Product hidden from the store.' : 'Product is now visible.')
      reload()
    } catch (error) {
      addToast(getErrorMessage(error), 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setBusyId(product.id)
    try {
      await deleteProduct(product.id)
      addToast('Product deleted.', 'info')
      reload()
    } catch (error) {
      addToast(getErrorMessage(error), 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Products</h1>
          <p className="mt-1 text-sm text-slate-500">{pagination.total} products in the catalog.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="input pl-9"
            placeholder="Search by name or brand"
            aria-label="Search products"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="input w-auto"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>
      </div>

      {error && !loading ? (
        <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Products could not be loaded. Please try again.
        </p>
      ) : null}

      {loading ? (
        <PageLoader />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.primary_image || '/images/products/placeholder.svg'}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg bg-slate-100 object-cover"
                          onError={(event) => {
                            event.currentTarget.src = '/images/products/placeholder.svg'
                          }}
                        />
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-semibold text-slate-800">{product.name}</p>
                          <p className="text-[11px] text-slate-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category_name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatBDT(product.effective_price)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stock <= 10 ? 'font-semibold text-amber-600' : 'text-slate-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge border ${
                          product.is_active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggle(product)}
                          disabled={busyId === product.id}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                          aria-label={product.is_active ? `Hide ${product.name}` : `Show ${product.name}`}
                        >
                          {busyId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={busyId === product.id}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Package className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No products match this filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="btn-secondary py-1.5 text-xs"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pagination.total_pages, current + 1))}
              disabled={page >= pagination.total_pages}
              className="btn-secondary py-1.5 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
