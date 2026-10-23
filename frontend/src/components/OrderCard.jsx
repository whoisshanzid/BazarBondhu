import { ChevronRight, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBDT, formatDateTime } from '../utils/format.js'
import StatusBadge from './StatusBadge.jsx'

export default function OrderCard({ order }) {
  return (
    <Link
      to={`/order/${order.id}`}
      className="block rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Package className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800">{order.order_number}</p>
            <p className="text-[11px] text-slate-400">{formatDateTime(order.created_at)}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          {order.item_count} item{Number(order.item_count) === 1 ? '' : 's'}
          {order.unit_count ? ` · ${order.unit_count} units` : ''}
        </span>
        <span className="flex items-center gap-1 font-bold text-slate-800">
          {formatBDT(order.total)}
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </span>
      </div>
    </Link>
  )
}
