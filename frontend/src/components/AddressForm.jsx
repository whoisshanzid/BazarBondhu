import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { getFieldErrors } from '../services/api.js'

const labels = ['Home', 'Office', 'Other']

export default function AddressForm({ initial, onSubmit, onCancel, submitting = false, submitLabel = 'Save address' }) {
  const [form, setForm] = useState({
    label: initial?.label || 'Home',
    recipient_name: initial?.recipient_name || '',
    phone: initial?.phone || '',
    address_line: initial?.address_line || '',
    area: initial?.area || '',
    city: initial?.city || '',
    postal_code: initial?.postal_code || '',
    is_default: Boolean(initial?.is_default),
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const nextErrors = {}
    if (!form.recipient_name.trim()) nextErrors.recipient_name = 'Recipient name is required.'
    if (!form.phone.trim() || form.phone.trim().length < 6) nextErrors.phone = 'Enter a valid phone number.'
    if (!form.address_line.trim()) nextErrors.address_line = 'Street address is required.'
    if (!form.area.trim()) nextErrors.area = 'Area is required.'
    if (!form.city.trim()) nextErrors.city = 'City or district is required.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    try {
      await onSubmit(form)
    } catch (error) {
      setFormError(error?.response?.data?.message || 'The address could not be saved.')
      setErrors(getFieldErrors(error))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {formError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {formError}
        </div>
      )}

      <div>
        <span className="label">Address label</span>
        <div className="flex gap-2">
          {labels.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => update('label', label)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                form.label === label
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="address-recipient" className="label">Recipient name</label>
          <input
            id="address-recipient"
            value={form.recipient_name}
            onChange={(event) => update('recipient_name', event.target.value)}
            className="input"
            placeholder="Full name"
            autoComplete="name"
            required
          />
          {errors.recipient_name && <p className="mt-1 text-[11px] text-red-600">{errors.recipient_name}</p>}
        </div>
        <div>
          <label htmlFor="address-phone" className="label">Phone number</label>
          <input
            id="address-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            className="input"
            placeholder="+8801XXXXXXXXX"
            autoComplete="tel"
            required
          />
          {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="address-line" className="label">Street address</label>
        <textarea
          id="address-line"
          rows={2}
          value={form.address_line}
          onChange={(event) => update('address_line', event.target.value)}
          className="input resize-none"
          placeholder="House, road, block, landmark"
          autoComplete="street-address"
          required
        />
        {errors.address_line && <p className="mt-1 text-[11px] text-red-600">{errors.address_line}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="address-area" className="label">Area</label>
          <input
            id="address-area"
            value={form.area}
            onChange={(event) => update('area', event.target.value)}
            className="input"
            placeholder="Area / thana"
            autoComplete="address-level3"
            required
          />
          {errors.area && <p className="mt-1 text-[11px] text-red-600">{errors.area}</p>}
        </div>
        <div>
          <label htmlFor="address-city" className="label">City / district</label>
          <input
            id="address-city"
            value={form.city}
            onChange={(event) => update('city', event.target.value)}
            className="input"
            placeholder="e.g. Dhaka"
            autoComplete="address-level2"
            required
          />
          {errors.city && <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="address-postal" className="label">Postal code</label>
          <input
            id="address-postal"
            value={form.postal_code}
            onChange={(event) => update('postal_code', event.target.value)}
            className="input"
            placeholder="Optional"
            autoComplete="postal-code"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(event) => update('is_default', event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
        />
        Set as my default delivery address
      </label>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
