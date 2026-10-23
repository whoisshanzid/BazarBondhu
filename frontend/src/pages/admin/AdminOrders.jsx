import { useMemo, useState } from 'react'
import { AlertCircle, Loader2, Search, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge.jsx'
import { PageLoader } from '../../components/Loading.jsx'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { useDebounce } from '../../hooks/useDebounce.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fetchAdminOrders } from '../../services/admin.js'
import { formatBDT, formatDateTime } from '../../utils/format.js'

const statusOptions = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  usePageTitle('Admin orders')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 350)
  const request = useMemo(
    () => ({ q: debouncedSearch, status, page }),
    [debouncedSearch, status, page],
  )
  const { data, error, loading } = useAsyncData(
    () =>
      fetchAdminOrders({
        q: debouncedSearch || undefined,
        status: status || undefined,
        page,
        limit: 15,
      }),
    request,
  )
  const orders = data?.orders || []
  const pagination = data?.pagination || { page: 1, total_pages: 1, total: 0 }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">{pagination.total} orders placed across the store.</p>
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
            placeholder="Search by order number, customer or phone"
            aria-label="Search orders"
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
          {statusOptions.map((option) => (
            <option key={option || 'all'} value={option}>
              {option ? option.charAt(0).toUpperCase() + option.slice(1) : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {error && !loading ? (
        <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Orders could not be loaded. Please try again.
        </p>
      ) : null}

      {loading ? (
        <PageLoader />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order.id}`} className="font-semibold text-slate-800 hover:text-brand-600">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{order.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{order.item_count}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatBDT(order.total)}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{order.payment_method.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No orders match this filter.</p>
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
          <span className="text-slate-500">Page {pagination.page} of {pagination.total_pages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="btn-secondary py-1.5 text-xs"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Previous
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
