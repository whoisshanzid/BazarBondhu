import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
  User,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { PageLoader } from '../components/Loading.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { cancelOrder, fetchOrder } from '../services/account.js'
import { getErrorMessage } from '../services/api.js'
import { formatBDT, formatDateTime } from '../utils/format.js'

export default function OrderPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const justPlaced = searchParams.get('success') === '1'
  const { addToast } = useToast()
  const { data: order, error: loadError, loading, reload } = useAsyncData(() => fetchOrder(id), id)
  const [cancelling, setCancelling] = useState(false)
  const error = loadError ? 'We could not find this order.' : ''
  usePageTitle(order ? `Order ${order.order_number}` : 'Order details')

  async function handleCancel() {
    if (!window.confirm('Cancel this order? Stock will be returned to the seller.')) return
    setCancelling(true)
    try {
      await cancelOrder(order.id)
      addToast('Order cancelled.', 'info')
      reload()
    } catch (requestError) {
      addToast(getErrorMessage(requestError), 'error')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <PageLoader />

  if (error || !order) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={Package}
          title="Order not found"
          description={error}
          actionLabel="View my orders"
          actionTo="/account?tab=orders"
        />
      </div>
    )
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status)

  return (
    <div className="bg-slate-50 py-5 sm:py-7">
      <div className="container-page max-w-5xl">
        {justPlaced && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">Thank you! Your order has been placed.</p>
              <p className="mt-0.5 text-sm text-emerald-700">
                We have emailed your confirmation and will notify you as it progresses.
              </p>
            </div>
          </div>
        )}

        <Link to="/account?tab=orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to my orders
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{order.order_number}</h1>
              <StatusBadge status={order.status} />
              <span className={`badge border capitalize ${
                order.payment_status === 'paid'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : order.payment_status === 'refunded'
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                {order.payment_status}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" /> Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Order total</p>
            <p className="text-xl font-extrabold text-brand-600">{formatBDT(order.total)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <ClipboardList className="h-4 w-4 text-brand-500" /> Items
              </h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                      <img
                        src={item.product_image || '/images/products/placeholder.svg'}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = '/images/products/placeholder.svg'
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-slate-800">{item.product_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatBDT(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="self-center text-sm font-semibold text-slate-800">{formatBDT(item.line_total)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <MapPin className="h-4 w-4 text-brand-500" /> Delivery details
              </h2>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Recipient</p>
                    <p className="font-medium text-slate-700">{order.recipient_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-medium text-slate-700">{order.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Address</p>
                    <p className="font-medium text-slate-700">
                      {order.shipping_address}, {order.area}, {order.city}
                      {order.postal_code ? ` - ${order.postal_code}` : ''}
                    </p>
                  </div>
                </div>
              </div>
              {order.notes && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-semibold">Note:</span> {order.notes}
                </p>
              )}
              {order.admin_note && (
                <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
                  <span className="font-semibold">From BazarBondhu:</span> {order.admin_note}
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <Receipt className="h-4 w-4 text-brand-500" /> Payment summary
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-semibold">{formatBDT(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery</dt>
                  <dd className="font-semibold">{Number(order.shipping_fee) === 0 ? 'Free' : formatBDT(order.shipping_fee)}</dd>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
                  <dt className="font-bold text-slate-800">Total</dt>
                  <dd className="font-extrabold text-brand-600">{formatBDT(order.total)}</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {order.payment_method === 'cod' ? (
                  <>
                    <Banknote className="h-4 w-4 text-emerald-600" /> Cash on Delivery
                  </>
                ) : (
                  <>
                    <Banknote className="h-4 w-4 text-sky-600" /> BazarBondhu Wallet (demo)
                  </>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <Truck className="h-4 w-4 text-brand-500" /> Need help?
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Orders can be cancelled while pending or confirmed. For anything else, our support team is happy to help.
              </p>
              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="btn-secondary mt-3 w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                  {cancelling ? 'Cancelling...' : 'Cancel order'}
                </button>
              )}
              <Link to="/help" className="btn-secondary mt-2 w-full">Contact support</Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
