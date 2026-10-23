import { useState } from 'react'
import { AlertCircle, Loader2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'
import CategoryIcon from '../../components/CategoryIcon.jsx'
import { PageLoader } from '../../components/Loading.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { createCategory, deleteCategory, fetchAdminCategories, updateCategory } from '../../services/admin.js'
import { getErrorMessage } from '../../services/api.js'

const iconOptions = [
  'Smartphone',
  'Laptop',
  'Shirt',
  'Sofa',
  'WashingMachine',
  'ShoppingBasket',
  'Sparkles',
  'Dumbbell',
  'Baby',
  'BookOpen',
  'Package',
]

const emptyForm = { name: '', icon: 'Package', sort_order: 0, is_active: true, image_url: '' }

export default function AdminCategories() {
  usePageTitle('Admin categories')
  const { addToast } = useToast()
  const { data, loading, reload } = useAsyncData(() => fetchAdminCategories(), 'admin-categories')
  const categories = data || []
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(category) {
    setEditing(category)
    setForm({
      name: category.name || '',
      icon: category.icon || 'Package',
      sort_order: category.sort_order ?? 0,
      is_active: Boolean(category.is_active),
      image_url: category.image_url || '',
    })
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Category name is required.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateCategory(editing.id, { ...form, sort_order: Number(form.sort_order) || 0 })
        addToast('Category updated.')
      } else {
        await createCategory({ ...form, sort_order: Number(form.sort_order) || 0 })
        addToast('Category created.')
      }
      setShowForm(false)
      reload()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete the "${category.name}" category? Products in it must be moved first.`)) return
    setDeletingId(category.id)
    try {
      await deleteCategory(category.id)
      addToast('Category deleted.', 'info')
      reload()
    } catch (requestError) {
      addToast(getErrorMessage(requestError), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organise the storefront navigation and catalog.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> New category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">{editing ? 'Edit category' : 'New category'}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="category-name" className="label">Name</label>
              <input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="input"
                placeholder="e.g. Home & Living"
                required
              />
            </div>
            <div>
              <label htmlFor="category-icon" className="label">Icon</label>
              <select
                id="category-icon"
                value={form.icon}
                onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
                className="input"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category-sort" className="label">Sort order</label>
              <input
                id="category-sort"
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="category-image" className="label">Banner image URL (optional)</label>
              <input
                id="category-image"
                value={form.image_url}
                onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                className="input"
                placeholder="/images/categories/example.svg"
              />
            </div>
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            Visible in the storefront
          </label>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : editing ? 'Update category' : 'Create category'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <PageLoader />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                          <CategoryIcon name={category.icon} className="h-4.5 w-4.5" />
                        </span>
                        <span className="font-semibold text-slate-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{category.slug}</td>
                    <td className="px-4 py-3 text-slate-600">{category.product_count}</td>
                    <td className="px-4 py-3 text-slate-600">{category.sort_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge border ${
                          category.is_active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${category.name}`}
                        >
                          {deletingId === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!categories.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Tag className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No categories yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
