import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  Boxes,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge.jsx'
import { PageLoader } from '../../components/Loading.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fetchAdminStats } from '../../services/admin.js'
import { formatBDT, formatDate } from '../../utils/format.js'

export default function AdminDashboard() {
  usePageTitle('Admin dashboard')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAdminStats()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setError('Dashboard data could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <PageLoader />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    )
  }

  const { stats, recent_orders: recentOrders, top_products: topProducts, low_stock_products: lowStock, monthly_sales: monthly } = data
  const maxRevenue = Math.max(...monthly.map((entry) => Number(entry.revenue)), 1)

  const cards = [
    { label: 'Total revenue', value: formatBDT(stats.revenue), icon: Banknote, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: stats.orders, icon: ShoppingBag, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Customers', value: stats.customers, icon: Users, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Live products', value: stats.active_products, icon: Package, tone: 'bg-brand-50 text-brand-600' },
    { label: 'Pending orders', value: stats.pending_orders, icon: Clock, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Low stock', value: stats.low_stock, icon: AlertTriangle, tone: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Store performance at a glance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="truncate text-lg font-extrabold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <TrendingUp className="h-4 w-4 text-brand-500" /> Monthly sales
          </h2>
          {monthly.length ? (
            <div className="mt-4 flex h-48 items-end gap-3">
              {monthly.map((entry) => (
                <div key={entry.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">{formatBDT(entry.revenue)}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-orange-400 transition"
                    style={{ height: `${Math.max((Number(entry.revenue) / maxRevenue) * 100, 6)}%` }}
                    title={`${entry.orders} orders`}
                  />
                  <span className="text-[10px] text-slate-400">{entry.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No sales recorded yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock
          </h2>
          {lowStock.length ? (
            <ul className="mt-3 space-y-2">
              {lowStock.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <Link to={`/admin/products?q=${encodeURIComponent(item.name)}`} className="truncate text-sm text-slate-700 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <span className={`badge border ${item.stock <= 3 ? 'border-red-200 bg-red-50 text-red-600' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    {item.stock} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">All products have healthy stock levels.</p>
          )}

          <h3 className="mt-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <Boxes className="h-4 w-4 text-brand-500" /> Best sellers
          </h3>
          <ul className="mt-2 space-y-2">
            {topProducts.map((product, index) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{product.name}</span>
                <span className="text-xs font-semibold text-slate-500">{product.sold_count} sold</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all</Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-semibold">Order</th>
                <th className="pb-2 font-semibold">Customer</th>
                <th className="pb-2 font-semibold">Date</th>
                <th className="pb-2 font-semibold">Total</th>
                <th className="pb-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2.5">
                    <Link to={`/admin/orders/${order.id}`} className="font-semibold text-slate-800 hover:text-brand-600">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-2.5 text-slate-600">{order.customer_name}</td>
                  <td className="py-2.5 text-slate-500">{formatDate(order.created_at)}</td>
                  <td className="py-2.5 font-semibold text-slate-800">{formatBDT(order.total)}</td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
