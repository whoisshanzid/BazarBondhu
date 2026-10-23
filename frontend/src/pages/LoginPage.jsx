import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import AuthSplit from '../components/AuthSplit.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { getErrorMessage } from '../services/api.js'

export default function LoginPage() {
  usePageTitle('Login')
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner className="h-8 w-8 text-brand-500" />
      </div>
    )
  }

  if (user) return <Navigate to={redirect} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Enter your email address and password.')
      return
    }
    setSubmitting(true)
    try {
      await login({ email: form.email, password: form.password })
      navigate(redirect, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo(email, password) {
    setForm({ email, password })
    setError('')
  }

  return (
    <AuthSplit
      title="Welcome back"
      subtitle="Log in to track orders, save favourites and check out faster."
      footer={
        <>
          New to BazarBondhu?{' '}
          <Link
            to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="input pl-10"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="label">Password</label>
            <Link to="/help" className="mb-1.5 text-xs font-medium text-brand-600 hover:text-brand-700">
              Need help?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="input pl-10 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary h-11 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {import.meta.env.DEV ? 'Local demo accounts' : 'Demo account'}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo('customer@bazarbondhu.test', 'Customer@12345')}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600"
          >
            Use customer demo
          </button>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => fillDemo('admin@bazarbondhu.test', 'Admin@12345')}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600"
            >
              Use admin demo
            </button>
          )}
        </div>
      </div>
    </AuthSplit>
  )
}
