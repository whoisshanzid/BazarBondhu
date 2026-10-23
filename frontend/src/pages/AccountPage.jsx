import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleUserRound,
  CreditCard,
  Heart,
  Loader2,
  LockKeyhole,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AddressForm from '../components/AddressForm.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import OrderCard from '../components/OrderCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import {
  changePassword,
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchOrders,
  updateAddress,
  updateProfile,
} from '../services/account.js'
import { getErrorMessage } from '../services/api.js'

const tabs = [
  { id: 'profile', label: 'My profile', icon: User },
  { id: 'orders', label: 'My orders', icon: Package },
  { id: 'addresses', label: 'Saved addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: LockKeyhole },
]

export default function AccountPage() {
  usePageTitle('My account')
  const { user, setUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab') || 'profile'
  const activeTab = tabs.some((tab) => tab.id === requestedTab) ? requestedTab : 'profile'

  function selectTab(tabId) {
    if (tabId === 'profile') setSearchParams({})
    else setSearchParams({ tab: tabId })
  }

  return (
    <div className="bg-slate-50 py-5 sm:py-7">
      <div className="container-page">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {user?.name?.charAt(0)?.toUpperCase()}
          </span>
          <div>
            <p className="text-xs text-slate-400">Welcome back</p>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{user?.name}</h1>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:h-fit">
            <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm no-scrollbar lg:flex-col" aria-label="Account sections">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectTab(id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition lg:w-full ${
                    activeTab === id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-current={activeTab === id ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
              <Link
                to="/wishlist"
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 lg:w-full"
              >
                <Heart className="h-4 w-4" /> My wishlist
              </Link>
            </nav>

            <div className="mt-3 hidden rounded-xl border border-slate-100 bg-white p-4 text-xs text-slate-500 shadow-sm lg:block">
              <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Account protected
              </p>
              <p className="mt-1.5 leading-5">Your password is securely hashed and never stored as plain text.</p>
            </div>
          </aside>

          <div className="min-w-0">
            {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'security' && <SecurityTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, setUser }) {
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    setSaving(true)
    try {
      const data = await updateProfile(form)
      setUser(data.user)
      addToast('Profile updated.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Personal information</h2>
      <p className="mt-1 text-sm text-slate-500">Keep your contact details up to date for smoother deliveries.</p>

      <form onSubmit={handleSubmit} className="mt-5 max-w-xl space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <div>
          <label htmlFor="profile-name" className="label">Full name</label>
          <input
            id="profile-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="input"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="label">Email address</label>
          <input id="profile-email" value={user?.email || ''} readOnly disabled className="input bg-slate-50 text-slate-500" />
          <p className="mt-1 text-[11px] text-slate-400">Email changes are not available in this demo.</p>
        </div>
        <div>
          <label htmlFor="profile-phone" className="label">Phone number</label>
          <input
            id="profile-phone"
            type="tel"
            value={form.phone || ''}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="input"
            autoComplete="tel"
            placeholder="+8801XXXXXXXXX"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <div className="mt-8 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
        <QuickLink to="/account?tab=orders" icon={Package} label="My orders" />
        <QuickLink to="/wishlist" icon={Heart} label="My wishlist" />
        <QuickLink to="/cart" icon={CreditCard} label="Shopping cart" />
      </div>
    </section>
  )
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600">
      <Icon className="h-4 w-4" /> {label} <ArrowRight className="ml-auto h-3.5 w-3.5" />
    </Link>
  )
}

function OrdersTab() {
  const { data, error: loadError, loading } = useAsyncData(() => fetchOrders(), 'my-orders')
  const orders = data || []
  const error = loadError ? 'Your orders could not be loaded.' : ''

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">My orders</h2>
        <span className="text-xs text-slate-400">{orders.length} total</span>
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-white py-16 text-center">
          <LoadingSpinner className="mx-auto h-7 w-7 text-brand-500" />
        </div>
      ) : error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : !orders.length ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400">
            <Package className="h-7 w-7" />
          </span>
          <p className="mt-4 font-semibold text-slate-800">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Your placed orders will appear here.</p>
          <Link to="/products" className="btn-primary mt-4">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  )
}

function AddressesTab() {
  const { addToast } = useToast()
  const { data, loading, reload } = useAsyncData(() => fetchAddresses(), 'my-addresses')
  const addresses = data || []
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function handleSubmit(payload) {
    setSaving(true)
    try {
      if (editing) {
        await updateAddress(editing.id, payload)
        addToast('Address updated.')
      } else {
        await createAddress(payload)
        addToast('Address added.')
      }
      reload()
      setShowForm(false)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(address) {
    if (!window.confirm(`Remove the "${address.label}" address?`)) return
    setDeletingId(address.id)
    try {
      await deleteAddress(address.id)
      reload()
      addToast('Address removed.', 'info')
    } catch (requestError) {
      addToast(getErrorMessage(requestError), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function makeDefault(address) {
    try {
      await updateAddress(address.id, { ...address, is_default: true })
      reload()
      addToast('Default address updated.')
    } catch (requestError) {
      addToast(getErrorMessage(requestError), 'error')
    }
  }

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Saved addresses</h2>
          <p className="mt-1 text-sm text-slate-500">Manage where your orders are delivered.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="btn-primary py-2 text-xs"
          >
            <Plus className="h-4 w-4" /> Add address
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-800">{editing ? 'Edit address' : 'New address'}</h3>
          <AddressForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
            submitting={saving}
            submitLabel={editing ? 'Update address' : 'Save address'}
          />
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center">
          <LoadingSpinner className="mx-auto h-7 w-7 text-brand-500" />
        </div>
      ) : !addresses.length ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 py-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="relative rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <p className="text-sm font-bold text-slate-800">{address.label}</p>
                {address.is_default ? (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Default</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">{address.recipient_name}</p>
              <p className="text-xs text-slate-500">{address.phone}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {address.address_line}, {address.area}, {address.city}
                {address.postal_code ? ` - ${address.postal_code}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(address)
                    setShowForm(true)
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => makeDefault(address)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(address)}
                  disabled={deletingId === address.id}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600"
                >
                  {deletingId === address.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function SecurityTab() {
  const { addToast } = useToast()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.new_password.length < 8 || !/[A-Z]/.test(form.new_password) || !/[a-z]/.test(form.new_password) || !/[0-9]/.test(form.new_password)) {
      setError('Use at least 8 characters with uppercase, lowercase and a number.')
      return
    }
    if (form.new_password !== form.confirm) {
      setError('New passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setForm({ current_password: '', new_password: '', confirm: '' })
      addToast('Password updated.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <CircleUserRound className="h-5 w-5 text-brand-500" /> Password & security
      </h2>
      <p className="mt-1 text-sm text-slate-500">Use a strong, unique password to protect your account.</p>

      <form onSubmit={handleSubmit} className="mt-5 max-w-xl space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <div>
          <label htmlFor="current-password" className="label">Current password</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={form.current_password}
            onChange={(event) => setForm((current) => ({ ...current, current_password: event.target.value }))}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="new-password" className="label">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={form.new_password}
            onChange={(event) => setForm((current) => ({ ...current, new_password: event.target.value }))}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="label">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))}
            className="input"
            required
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </section>
  )
}
