import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronRight,
  Loader2,
  LockKeyhole,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AddressForm from '../components/AddressForm.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { createAddress, fetchAddresses, placeOrder } from '../services/account.js'
import { getErrorMessage } from '../services/api.js'
import { formatBDT, shippingEstimate } from '../utils/format.js'

export default function CheckoutPage() {
  usePageTitle('Checkout')
  const { user } = useAuth()
  const { cart, refreshCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressLoading, setAddressLoading] = useState(true)
  const [savingAddress, setSavingAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAddresses()
      .then((data) => {
        setAddresses(data)
        const preferred = data.find((address) => address.is_default) || data[0]
        if (preferred) setSelectedAddressId(preferred.id)
        else setShowAddressForm(true)
      })
      .catch(() => setShowAddressForm(true))
      .finally(() => setAddressLoading(false))
  }, [])

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || null
  const shippingFee = shippingEstimate(selectedAddress?.city, cart.subtotal)
  const total = Number(cart.subtotal) + shippingFee
  const activeItems = (cart.items || []).filter((item) => item.is_active !== false)

  async function handleSaveAddress(payload) {
    setSavingAddress(true)
    try {
      const address = await createAddress(payload)
      const refreshed = await fetchAddresses()
      setAddresses(refreshed)
      setSelectedAddressId(address.id)
      setShowAddressForm(false)
      addToast('Delivery address saved.')
      return address
    } finally {
      setSavingAddress(false)
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault()
    setError('')

    const activeAddress = selectedAddressId ? selectedAddress : null

    if (!activeAddress) {
      setError('Add or select a delivery address before placing the order.')
      return
    }
    if (!activeItems.length) {
      setError('Your cart has no available items for checkout.')
      return
    }
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions to place your order.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        address_id: activeAddress.id,
        payment_method: paymentMethod,
        notes: notes || undefined,
        accepted: true,
      }
      const order = await placeOrder(payload)
      await refreshCart()
      navigate(`/order/${order.id}?success=1`, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeItems.length) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add a few products before heading to checkout."
          actionLabel="Browse products"
          actionTo="/products"
        />
      </div>
    )
  }

  if (addressLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner className="h-8 w-8 text-brand-500" />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 py-5 sm:py-7">
      <div className="container-page">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Checkout progress">
          <Link to="/cart" className="hover:text-brand-600">Cart</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-700">Checkout</span>
          <ChevronRight className="h-3 w-3" />
          <span>Confirmation</span>
        </nav>
        <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-xs text-white">1</span>
                  Delivery address
                </h2>
                {!showAddressForm && addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> New address
                  </button>
                )}
              </div>

              {addresses.length > 0 && !showAddressForm && (
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`relative flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition ${
                        selectedAddressId === address.id
                          ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-0.5 h-4 w-4 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="min-w-0 text-xs leading-5">
                        <span className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-800">
                          {address.label}
                          {address.is_default ? (
                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] uppercase text-brand-700">Default</span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-slate-600">{address.recipient_name} · {address.phone}</span>
                        <span className="block text-slate-500">
                          {address.address_line}, {address.area}, {address.city}
                          {address.postal_code ? ` - ${address.postal_code}` : ''}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4">
                  <AddressForm
                    initial={{
                      recipient_name: user?.name || '',
                      phone: user?.phone || '',
                      label: 'Home',
                      is_default: addresses.length === 0,
                    }}
                    onSubmit={handleSaveAddress}
                    onCancel={addresses.length ? () => setShowAddressForm(false) : undefined}
                    submitting={savingAddress}
                    submitLabel="Save & use this address"
                  />
                </div>
              )}

              {!showAddressForm && !selectedAddress && addresses.length > 0 && (
                <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" /> Select a delivery address to continue.
                </p>
              )}

              {selectedAddress && !showAddressForm && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <Truck className="h-3.5 w-3.5 text-brand-500" />
                  Estimated delivery to {selectedAddress.city}: 2-5 business days
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-xs text-white">2</span>
                Payment method
              </h2>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 transition ${
                    paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 h-4 w-4 text-brand-500 focus:ring-brand-500"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <Banknote className="h-4 w-4 text-emerald-600" /> Cash on Delivery
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Pay in cash when your order arrives.</span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 transition ${
                    paymentMethod === 'mock_wallet' ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="mock_wallet"
                    checked={paymentMethod === 'mock_wallet'}
                    onChange={() => setPaymentMethod('mock_wallet')}
                    className="mt-0.5 h-4 w-4 text-brand-500 focus:ring-brand-500"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <Wallet className="h-4 w-4 text-sky-600" /> BazarBondhu Wallet
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Demo payment, confirmed instantly. No real charge.</span>
                  </span>
                </label>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> This is a local demo store. Do not enter real payment details.
              </div>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-xs text-white">3</span>
                Order notes
              </h2>
              <textarea
                rows={2}
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="input mt-3 resize-none"
                placeholder="Delivery instructions or a note for the seller (optional)"
                aria-label="Order notes"
              />
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="font-medium text-brand-600 hover:underline">Terms & Conditions</Link>{' '}
                  and confirm my delivery details are correct.
                </span>
              </label>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Your order</h2>
              <ul className="mt-3 max-h-60 space-y-2.5 overflow-y-auto pr-1">
                {activeItems.map((item) => (
                  <li key={item.product_id} className="flex gap-2.5">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-50">
                      <img
                        src={item.primary_image || '/images/products/placeholder.svg'}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = '/images/products/placeholder.svg'
                        }}
                      />
                      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-slate-700 px-1 text-[9px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] leading-4 text-slate-600">{item.name}</p>
                      <p className="text-xs font-semibold text-slate-800">{formatBDT(item.line_total)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-semibold">{formatBDT(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery</dt>
                  <dd className="font-semibold">{shippingFee === 0 ? 'Free' : formatBDT(shippingFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5">
                  <dt className="font-bold text-slate-800">Total</dt>
                  <dd className="text-lg font-extrabold text-brand-600">{formatBDT(total)}</dd>
                </div>
              </dl>
              {selectedAddress?.city ? (
                <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="h-3 w-3" /> Shipping to {selectedAddress.city}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-400">Delivery charge shown for outside Dhaka until an address is selected.</p>
              )}

              {error && (
                <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] text-red-700" role="alert">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary mt-4 h-12 w-full">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                {submitting ? 'Placing order...' : `Place order · ${formatBDT(total)}`}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <Check className="h-3 w-3 text-emerald-500" /> Secure checkout · Buyer protection included
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}
