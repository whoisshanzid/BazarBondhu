import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, User } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import AuthSplit from '../components/AuthSplit.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { getErrorMessage, getFieldErrors } from '../services/api.js'

export default function RegisterPage() {
  usePageTitle('Create account')
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner className="h-8 w-8 text-brand-500" />
      </div>
    )
  }

  if (user) return <Navigate to={redirect} replace />

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (form.phone && form.phone.trim().length < 6) nextErrors.phone = 'Enter a valid phone number.'
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      nextErrors.password = 'Use at least 8 characters with uppercase, lowercase and a number.'
    }
    if (form.password !== form.confirm) nextErrors.confirm = 'Passwords do not match.'
    if (!form.terms) nextErrors.terms = 'Please accept the terms to continue.'

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      })
      navigate(redirect, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setFieldErrors(getFieldErrors(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthSplit
      title="Create your account"
      subtitle="Join BazarBondhu for faster checkout, saved addresses and order tracking."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Field label="Full name" htmlFor="register-name" icon={User} error={fieldErrors.name}>
          <input
            id="register-name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className="input pl-10"
            placeholder="Your full name"
            required
          />
        </Field>

        <Field label="Email address" htmlFor="register-email" icon={Mail} error={fieldErrors.email}>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className="input pl-10"
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field label="Phone number (optional)" htmlFor="register-phone" icon={Phone} error={fieldErrors.phone}>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            className="input pl-10"
            placeholder="+8801XXXXXXXXX"
          />
        </Field>

        <Field label="Password" htmlFor="register-password" icon={LockKeyhole} error={fieldErrors.password}>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            className="input pl-10 pr-10"
            placeholder="At least 8 characters"
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
        </Field>

        <Field label="Confirm password" htmlFor="register-confirm" icon={LockKeyhole} error={fieldErrors.confirm}>
          <input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => update('confirm', event.target.value)}
            className="input pl-10"
            placeholder="Repeat your password"
            required
          />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(event) => update('terms', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-brand-600 hover:underline">Terms & Conditions</Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {fieldErrors.terms && <p className="mt-1 text-xs text-red-600">{fieldErrors.terms}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary h-11 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthSplit>
  )
}

function Field({ label, htmlFor, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
