'use client'

import Link from 'next/link'
import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  ProductConfigurationsTab,
  PRESET_ADDON_GROUPS,
  presetToAddonRow,
  type SizeRow,
  type AddonRow,
} from '@/components/admin/ProductConfigurationsTab'

type Tab = 'general' | 'pricing' | 'images' | 'colors' | 'configurations'

/** Marks an error message as written for the admin to read, vs. an unexpected JS error. */
class ProductSaveError extends Error {}

const CATEGORY_OPTIONS = ['BEDS', 'MATTRESSES', 'FABRICS'] as const
const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const
const FABRIC_COLOR_STATUS_OPTIONS = ['ACTIVE', 'DISCONTINUED'] as const

interface NewImageRow {
  path: string
  isMain: boolean
  sortOrder: number
}

interface NewFabricColorRow {
  code: string
  colorName: string
  imagePath: string
  description: string
  status: (typeof FABRIC_COLOR_STATUS_OPTIONS)[number]
  sortOrder: number
}

export default function NewProductPage() {
  const router = useRouter()
  const { accessToken } = useAuth()

  const [tab, setTab] = useState<Tab>('general')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('BEDS')
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('DRAFT')
  const [basePrice, setBasePrice] = useState('')
  const [onSale, setOnSale] = useState(false)
  const [salePrice, setSalePrice] = useState('')
  const [saleStartsAt, setSaleStartsAt] = useState('')
  const [saleEndsAt, setSaleEndsAt] = useState('')
  const [images, setImages] = useState<NewImageRow[]>([])
  const [fabricColors, setFabricColors] = useState<NewFabricColorRow[]>([])
  const [sizes, setSizes] = useState<SizeRow[]>([])
  const [addons, setAddons] = useState<AddonRow[]>(() =>
    PRESET_ADDON_GROUPS.map((preset, i) => presetToAddonRow(preset, i)),
  )
  const [uploading, setUploading] = useState(false)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const TABS: { id: Tab; label: string }[] =
    category === 'FABRICS'
      ? [
          { id: 'general', label: 'General' },
          { id: 'colors', label: 'Colors' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'images', label: 'Images' },
        ]
      : category === 'BEDS'
        ? [
            { id: 'general', label: 'General' },
            { id: 'configurations', label: 'Configurations' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'images', label: 'Images' },
          ]
        : [
            { id: 'general', label: 'General' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'images', label: 'Images' },
          ]

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async function handleMainImageFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setImages((prev) => {
        const rest = prev.filter((img) => !img.isMain)
        return [{ path: dataUrl, isMain: true, sortOrder: 0 }, ...rest].map((img, i) => ({ ...img, sortOrder: i }))
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleGalleryFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setUploading(true)
    try {
      const dataUrls = await Promise.all(files.map(readFileAsDataUrl))
      setImages((prev) => {
        const next = [...prev, ...dataUrls.map((path) => ({ path, isMain: false, sortOrder: 0 }))]
        if (!next.some((img) => img.isMain) && next.length > 0) next[0].isMain = true
        return next.map((img, i) => ({ ...img, sortOrder: i }))
      })
    } finally {
      setUploading(false)
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length > 0 && !next.some((img) => img.isMain)) next[0].isMain = true
      return next.map((img, i) => ({ ...img, sortOrder: i }))
    })
  }

  function setMainImage(index: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isMain: i === index })))
  }

  async function handleAddColorFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setFabricColors((prev) => [
        ...prev,
        { code: '', colorName: '', imagePath: dataUrl, description: '', status: 'ACTIVE', sortOrder: prev.length },
      ])
    } finally {
      setUploading(false)
    }
  }

  async function handleReplaceColorImage(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      updateColor(index, { imagePath: dataUrl })
    } finally {
      setUploading(false)
    }
  }

  function updateColor(index: number, patch: Partial<NewFabricColorRow>) {
    setFabricColors((prev) => prev.map((color, i) => (i === index ? { ...color, ...patch } : color)))
  }

  function removeColor(index: number) {
    setFabricColors((prev) => prev.filter((_, i) => i !== index).map((color, i) => ({ ...color, sortOrder: i })))
  }

  async function handleSubmit() {
    if (!accessToken) return
    setSaveError('')

    if (!name.trim()) {
      setSaveError('Product name is required.')
      return
    }
    const parsedBasePrice = Number(basePrice)
    if (Number.isNaN(parsedBasePrice) || parsedBasePrice < 0) {
      setSaveError('Base price must be a non-negative number.')
      return
    }
    const parsedSalePrice = salePrice.trim() ? Number(salePrice) : null
    if (parsedSalePrice !== null && (Number.isNaN(parsedSalePrice) || parsedSalePrice < 0)) {
      setSaveError('Sale price must be a non-negative number.')
      return
    }
    if (category === 'FABRICS') {
      const incomplete = fabricColors.some((c) => !c.code.trim() || !c.colorName.trim())
      if (incomplete) {
        setSaveError('Each color needs a code and a name.')
        return
      }
      const codes = fabricColors.map((c) => c.code.trim())
      if (new Set(codes).size !== codes.length) {
        setSaveError('Color codes must be unique.')
        return
      }
    }
    const enabledAddons = addons.filter((a) => a.enabled)
    if (category === 'BEDS') {
      if (sizes.some((s) => !s.label.trim())) {
        setSaveError('Each size needs a label.')
        return
      }
      if (enabledAddons.some((a) => !a.name.trim())) {
        setSaveError('Each configuration group needs a name.')
        return
      }
      if (enabledAddons.some((a) => a.type === 'SELECT' && a.options.length === 0)) {
        setSaveError('Every dropdown-choices group needs at least one choice.')
        return
      }
      if (enabledAddons.some((a) => a.type === 'SELECT' && a.options.some((o) => !o.label.trim()))) {
        setSaveError('Each choice needs a label.')
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name,
          sku: sku.trim() || undefined,
          description,
          category,
          status,
          basePrice: parsedBasePrice,
          onSale,
          salePrice: parsedSalePrice,
          saleStartsAt: saleStartsAt || null,
          saleEndsAt: saleEndsAt || null,
          images,
          ...(category === 'FABRICS' ? { fabricColors } : {}),
          ...(category === 'BEDS' ? { sizes, addons: enabledAddons } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new ProductSaveError(data?.error ?? 'Could not create product')
      }
      router.push('/admin/products')
    } catch (err) {
      // Only a ProductSaveError carries a message meant for the admin to read — anything
      // else (a bug in this form) should surface as a generic message, not a raw stack trace.
      setSaveError(err instanceof ProductSaveError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const mainImage = images.find((img) => img.isMain)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          aria-label="Back to products"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Add Product</h1>
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr]">
        <nav className="flex flex-row gap-1 lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-[#b87333] text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'general' && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                Product Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-stone-700">
                SKU
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. RR-BED-006"
                  className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-stone-700">
                Description
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#b87333]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-stone-700">
                Category
                <select
                  value={category}
                  onChange={(e) => {
                    const next = e.target.value as (typeof CATEGORY_OPTIONS)[number]
                    setCategory(next)
                    if (next !== 'FABRICS' && (tab as Tab) === 'colors') setTab('general')
                    if (next !== 'BEDS' && (tab as Tab) === 'configurations') setTab('general')
                  }}
                  className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-stone-700">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
                  className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6">
              <h2 className="text-sm font-medium text-stone-700">Product Image</h2>
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-amber-50">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage.path} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <ProductThumbnailIcon className="h-16 w-16 text-[#b87333]" />
                )}
              </div>
              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleMainImageFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => mainImageInputRef.current?.click()}
                disabled={uploading}
                className="h-11 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Upload Image'}
              </button>
              <p className="text-center text-xs text-stone-400">Recommended size: 1200×900px</p>
            </div>
          </div>
        )}

        {tab === 'colors' && (
          <div className="flex flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6">
            <div>
              <input
                id="add-color-file"
                type="file"
                accept="image/*"
                onChange={handleAddColorFile}
                className="hidden"
              />
              <label
                htmlFor="add-color-file"
                className={`inline-flex h-11 w-fit cursor-pointer items-center rounded-lg bg-[#b87333] px-5 text-sm font-medium text-white transition-colors hover:bg-[#a3662e] ${
                  uploading ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {uploading ? 'Uploading…' : 'Add Color'}
              </label>
            </div>

            {fabricColors.length === 0 ? (
              <p className="text-sm text-stone-500">No color variants yet. Add one to get started.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {fabricColors.map((color, index) => (
                  <div key={`${color.imagePath}-${index}`} className="flex flex-col gap-3 rounded-lg border border-stone-200 p-3">
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-amber-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={color.imagePath} alt={color.colorName} className="h-full w-full object-cover" />
                    </div>

                    <input
                      id={`color-file-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReplaceColorImage(index, e)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`color-file-${index}`}
                      className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      Replace Photo
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-stone-500">
                      Color Name
                      <input
                        type="text"
                        value={color.colorName}
                        onChange={(e) => updateColor(index, { colorName: e.target.value })}
                        placeholder="e.g. Chenille Cream"
                        className="h-9 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-[#b87333]"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-stone-500">
                      Code
                      <input
                        type="text"
                        value={color.code}
                        onChange={(e) => updateColor(index, { code: e.target.value })}
                        placeholder="e.g. CH01"
                        className="h-9 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-[#b87333]"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-stone-500">
                      Description
                      <input
                        type="text"
                        value={color.description}
                        onChange={(e) => updateColor(index, { description: e.target.value })}
                        className="h-9 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-[#b87333]"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-stone-500">
                      Status
                      <select
                        value={color.status}
                        onChange={(e) =>
                          updateColor(index, { status: e.target.value as (typeof FABRIC_COLOR_STATUS_OPTIONS)[number] })
                        }
                        className="h-9 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-[#b87333]"
                      >
                        {FABRIC_COLOR_STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {formatEnumLabel(option)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="rounded-md border border-stone-300 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove Color
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'configurations' && (
          <ProductConfigurationsTab sizes={sizes} onSizesChange={setSizes} addons={addons} onAddonsChange={setAddons} />
        )}

        {tab === 'pricing' && (
          <div className="flex max-w-xl flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              Base Price
              <input
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => setOnSale(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-[#b87333]"
              />
              On Sale
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-700">
              Sale Price
              <input
                type="number"
                min={0}
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                disabled={!onSale}
                className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333] disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                Sale Starts
                <input
                  type="date"
                  value={saleStartsAt}
                  onChange={(e) => setSaleStartsAt(e.target.value)}
                  disabled={!onSale}
                  className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333] disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                Sale Ends
                <input
                  type="date"
                  value={saleEndsAt}
                  onChange={(e) => setSaleEndsAt(e.target.value)}
                  disabled={!onSale}
                  className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333] disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
                />
              </label>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="flex flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6">
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryFiles}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
              className="h-11 w-fit shrink-0 rounded-lg bg-[#b87333] px-5 text-sm font-medium text-white transition-colors hover:bg-[#a3662e] disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : 'Upload Image'}
            </button>

            {images.length === 0 ? (
              <p className="text-sm text-stone-500">No images yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div key={image.path + index} className="flex flex-col gap-2 rounded-lg border border-stone-200 p-2">
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-amber-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.path} alt="" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMainImage(index)}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        image.isMain ? 'bg-[#b87333] text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {image.isMain ? 'Main Image' : 'Set as Main'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-md border border-stone-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/products"
          className="flex h-11 items-center rounded-lg border border-stone-300 px-6 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="h-11 rounded-lg bg-[#b87333] px-6 text-sm font-medium text-white transition-colors hover:bg-[#a3662e] disabled:opacity-60"
        >
          {saving ? 'Creating…' : 'Create Product'}
        </button>
      </div>
    </div>
  )
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M12.5 4.5 6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProductThumbnailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 15.5V6a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v9.5M2.5 15.5v-2.75h15v2.75M2.5 12.75V9.75a1 1 0 0 1 1-1H9v3M17.5 12.75V9.75a1 1 0 0 0-1-1H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
