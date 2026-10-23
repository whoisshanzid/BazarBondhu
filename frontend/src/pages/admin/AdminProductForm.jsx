import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingSpinner } from '../../components/Loading.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import {
  createProduct,
  fetchAdminCategories,
  fetchAdminProduct,
  updateProduct,
  uploadProductImage,
} from '../../services/admin.js'
import { getErrorMessage } from '../../services/api.js'

const emptyForm = {
  name: '',
  brand: '',
  category_id: '',
  short_description: '',
  description: '',
  price: '',
  discount_price: '',
  stock: '',
  is_active: true,
  is_featured: false,
  is_flash_sale: false,
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  usePageTitle(isEdit ? 'Edit product' : 'New product')

  useEffect(() => {
    fetchAdminCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    fetchAdminProduct(id)
      .then((product) => {
        if (cancelled) return
        setForm({
          name: product.name || '',
          brand: product.brand || '',
          category_id: product.category_id || '',
          short_description: product.short_description || '',
          description: product.description || '',
          price: product.price ?? '',
          discount_price: product.discount_price ?? '',
          stock: product.stock ?? '',
          is_active: Boolean(product.is_active),
          is_featured: Boolean(product.is_featured),
          is_flash_sale: Boolean(product.is_flash_sale),
        })
        setImages(product.images || [])
      })
      .catch(() => setError('This product could not be loaded.'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function addImageUrl() {
    const value = imageUrl.trim()
    if (!value) return
    if (!/^\/|https?:\/\//.test(value)) {
      setError('Image URLs must start with / or http(s)://')
      return
    }
    setImages((current) => [...current, { image_url: value, alt_text: form.name, is_primary: current.length === 0, sort_order: current.length }])
    setImageUrl('')
    setError('')
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadProductImage(file)
      setImages((current) => [...current, { image_url: url, alt_text: form.name, is_primary: current.length === 0, sort_order: current.length }])
    } catch (uploadError) {
      setError(getErrorMessage(uploadError))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function removeImage(index) {
    setImages((current) => {
      const next = current.filter((_, position) => position !== index)
      return next.map((image, position) => ({ ...image, sort_order: position, is_primary: position === 0 }))
    })
  }

  function makePrimary(index) {
    setImages((current) =>
      current.map((image, position) => ({ ...image, is_primary: position === index, sort_order: position })),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }
    if (!form.category_id) {
      setError('Choose a category.')
      return
    }
    if (!Number(form.price) || Number(form.price) <= 0) {
      setError('Enter a valid price.')
      return
    }
    if (form.discount_price !== '' && Number(form.discount_price) >= Number(form.price)) {
      setError('Discount price must be lower than the regular price.')
      return
    }

    const payload = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      discount_price: form.discount_price === '' ? null : Number(form.discount_price),
      stock: Number(form.stock) || 0,
      images: images.map((image, index) => ({
        image_url: image.image_url,
        alt_text: image.alt_text || form.name,
        is_primary: index === 0,
        sort_order: index,
      })),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateProduct(id, payload)
        addToast('Product updated.')
      } else {
        await createProduct(payload)
        addToast('Product created.')
      }
      navigate('/admin/products')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner className="h-8 w-8 text-brand-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/products" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to products
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {isEdit ? 'Edit product' : 'New product'}
          </h1>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Basics</h2>
            <div className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="product-name" className="label">Product name</label>
                <input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  className="input"
                  placeholder="e.g. Wireless Bluetooth Earbuds"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-brand" className="label">Brand</label>
                  <input
                    id="product-brand"
                    value={form.brand}
                    onChange={(event) => update('brand', event.target.value)}
                    className="input"
                    placeholder="BazarBondhu"
                  />
                </div>
                <div>
                  <label htmlFor="product-category" className="label">Category</label>
                  <select
                    id="product-category"
                    value={form.category_id}
                    onChange={(event) => update('category_id', event.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="product-short" className="label">Short description</label>
                <input
                  id="product-short"
                  value={form.short_description}
                  onChange={(event) => update('short_description', event.target.value)}
                  className="input"
                  maxLength={300}
                  placeholder="One line summary shown on product cards"
                />
              </div>
              <div>
                <label htmlFor="product-description" className="label">Full description</label>
                <textarea
                  id="product-description"
                  rows={6}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  className="input resize-y"
                  placeholder="Describe features, materials and what is included in the box"
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Images</h2>
            <p className="mt-1 text-xs text-slate-500">The first image is used as the cover on product cards.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <label className="btn-secondary cursor-pointer text-xs">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload image'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addImageUrl()
                  }
                }}
                className="input"
                placeholder="/images/products/example.svg"
                aria-label="Image URL"
              />
              <button type="button" onClick={addImageUrl} className="btn-secondary shrink-0">
                Add
              </button>
            </div>

            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <li key={`${image.image_url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || ''}
                      className="aspect-square w-full bg-slate-50 object-cover"
                      onError={(event) => {
                        event.currentTarget.src = '/images/products/placeholder.svg'
                      }}
                    />
                    {index === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                        Cover
                      </span>
                    )}
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => makePrimary(index)}
                        disabled={index === 0}
                        className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-amber-50 hover:text-amber-500 disabled:opacity-40"
                        aria-label="Set as cover image"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Pricing & stock</h2>
            <div className="mt-4 space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-price" className="label">Price (৳)</label>
                  <input
                    id="product-price"
                    type="number"
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={(event) => update('price', event.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="product-discount" className="label">Discount price (৳)</label>
                  <input
                    id="product-discount"
                    type="number"
                    min="1"
                    step="1"
                    value={form.discount_price}
                    onChange={(event) => update('discount_price', event.target.value)}
                    className="input"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="product-stock" className="label">Stock quantity</label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) => update('stock', event.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Visibility</h2>
            <div className="mt-4 space-y-2.5">
              <Toggle
                label="Active"
                description="Visible to shoppers in the storefront"
                checked={form.is_active}
                onChange={(value) => update('is_active', value)}
              />
              <Toggle
                label="Featured"
                description="Show in recommended and homepage sections"
                checked={form.is_featured}
                onChange={(value) => update('is_featured', value)}
                icon={Star}
              />
              <Toggle
                label="Flash sale"
                description="Include in the flash sale countdown strip"
                checked={form.is_flash_sale}
                onChange={(value) => update('is_flash_sale', value)}
                icon={Zap}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Preview</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
              <div className="aspect-square bg-slate-50">
                <img
                  src={images[0]?.image_url || '/images/products/placeholder.svg'}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-400">{form.brand || 'Brand'}</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">{form.name || 'Product name'}</p>
                <p className="mt-1.5 text-sm font-bold text-brand-600">
                  ৳{Number(form.price || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

function Toggle({ label, description, checked, onChange, icon: Icon = X }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          {label}
          {Icon !== X && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        </span>
        <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{description}</span>
      </span>
    </label>
  )
}
