import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Loader2, Mail, MapPin, Phone, Save, User } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge.jsx'
import { PageLoader } from '../../components/Loading.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fetchAdminOrder, updateOrder } from '../../services/admin.js'
import { getErrorMessage } from '../../services/api.js'
import { formatBDT, formatDateTime } from '../../utils/format.js'

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const { addToast } = useToast()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  usePageTitle(order ? `Order ${order.order_number}` : 'Order details')

  useEffect(() => {
    let cancelled = false
    fetchAdminOrder(id)
      .then((data) => {
        if (cancelled) return
        setOrder(data)
        setStatus(data.status)
        setNote(data.admin_note || '')
      })
      .catch(() => {
        if (!cancelled) setError('This order could not be found.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = await updateOrder(id, { status, admin_note: note })
      setOrder(data.order)
      addToast('Order updated.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Order total</p>
          <p className="text-xl font-extrabold text-brand-600">{formatBDT(order.total)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.product_image || '/images/products/placeholder.svg'}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/images/products/placeholder.svg'
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{item.product_name}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatBDT(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{formatBDT(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-semibold">{formatBDT(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-semibold">
                  {Number(order.shipping_fee) === 0 ? 'Free' : formatBDT(order.shipping_fee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5">
                <dt className="font-bold text-slate-800">Total</dt>
                <dd className="font-extrabold text-brand-600">{formatBDT(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Customer & delivery</h2>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-medium text-slate-700">{order.customer_name}</p>
                  <p className="text-xs text-slate-500">{order.customer_email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Recipient phone</p>
                  <p className="font-medium text-slate-700">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Shipping address</p>
                  <p className="font-medium text-slate-700">
                    {order.recipient_name}, {order.shipping_address}, {order.area}, {order.city}
                    {order.postal_code ? ` - ${order.postal_code}` : ''}
                  </p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Customer note</p>
                    <p className="font-medium text-slate-700">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:h-fit">
          <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Manage order</h2>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="order-status" className="label">Order status</label>
              <select
                id="order-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="input"
              >
                {statuses.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
                Cancelling returns stock to the seller. Re-opening a cancelled order checks stock first.
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="order-note" className="label">Note to customer</label>
              <textarea
                id="order-note"
                rows={3}
                maxLength={500}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="input resize-none"
                placeholder="Visible to the customer on the order page"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary mt-4 w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}
