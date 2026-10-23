import { useMemo, useState } from 'react'
import { AlertCircle, Loader2, Search, Users } from 'lucide-react'
import { PageLoader } from '../../components/Loading.jsx'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { useDebounce } from '../../hooks/useDebounce.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fetchAdminCustomers } from '../../services/admin.js'
import { formatBDT, formatDate } from '../../utils/format.js'

export default function AdminCustomers() {
  usePageTitle('Admin customers')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 350)
  const request = useMemo(() => ({ q: debouncedSearch, page }), [debouncedSearch, page])
  const { data, error, loading } = useAsyncData(
    () => fetchAdminCustomers({ q: debouncedSearch || undefined, page, limit: 15 }),
    request,
  )
  const customers = data?.customers || []
  const pagination = data?.pagination || { page: 1, total_pages: 1, total: 0 }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">{pagination.total} registered shoppers.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="input pl-9"
            placeholder="Search by name, email or phone"
            aria-label="Search customers"
          />
        </div>
      </div>

      {error && !loading ? (
        <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Customers could not be loaded. Please try again.
        </p>
      ) : null}

      {loading ? (
        <PageLoader />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Total spent</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </span>
                        <span className="font-semibold text-slate-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-600">{customer.email}</p>
                      <p className="text-[11px] text-slate-400">{customer.phone || 'No phone saved'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{customer.order_count}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatBDT(customer.total_spent)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(customer.created_at)}</td>
                  </tr>
                ))}
                {!customers.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Users className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No customers match this search.</p>
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
              disabled={page <= 1 || loading}
              className="btn-secondary py-1.5 text-xs"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pagination.total_pages, current + 1))}
              disabled={page >= pagination.total_pages || loading}
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
