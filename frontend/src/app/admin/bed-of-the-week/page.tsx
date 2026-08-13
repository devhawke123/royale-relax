'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface ProductSummary {
  id: string
  slug: string
  name: string
  sku: string | null
  image: string | null
  basePrice: number
}

interface BedOfTheWeekEntry {
  id: string
  discountPercentage: number
  validFrom: string
  validUntil: string
  product: ProductSummary
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

function formatDateRange(fromIso: string, untilIso: string): string {
  const from = new Date(fromIso)
  const until = new Date(untilIso)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const year = until.getFullYear()
  return `${fmt(from)} – ${fmt(until)}, ${year}`
}

function defaultValidUntil(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

export default function BedOfTheWeekPage() {
  const { accessToken } = useAuth()

  const [current, setCurrent] = useState<BedOfTheWeekEntry | null>(null)
  const [history, setHistory] = useState<BedOfTheWeekEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Product search
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<ProductSummary[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  // New Bed of the Week form
  const [discountPercent, setDiscountPercent] = useState('15')
  const [validUntil, setValidUntil] = useState(defaultValidUntil())
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Inline "Update Discount" editor for the current entry
  const [editingDiscount, setEditingDiscount] = useState(false)
  const [discountDraft, setDiscountDraft] = useState('')
  const [discountSaving, setDiscountSaving] = useState(false)
  const [discountError, setDiscountError] = useState('')

  async function loadData() {
    if (!accessToken) return
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/admin/bed-of-the-week', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Failed to load Bed of the Week data')
      const data = await res.json()
      setCurrent(data.current)
      setHistory(data.history)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !query.trim()) {
      setSuggestions([])
      return
    }

    const handle = setTimeout(async () => {
      searchAbortRef.current?.abort()
      const controller = new AbortController()
      searchAbortRef.current = controller
      try {
        const res = await fetch(`/api/admin/bed-of-the-week/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.results)
        setShowSuggestions(true)
      } catch {
        // ignore aborted/failed searches — the next keystroke supersedes it
      }
    }, 250)

    return () => clearTimeout(handle)
  }, [query, accessToken])

  function handlePickSuggestion(product: ProductSummary) {
    setSelectedProduct(product)
    setQuery(product.name)
    setShowSuggestions(false)
  }

  function handleSelectClick() {
    if (suggestions.length === 1) {
      handlePickSuggestion(suggestions[0])
      return
    }
    if (!selectedProduct) {
      setSubmitError('Search and choose a product from the suggestions first.')
    }
  }

  async function handleSubmit() {
    if (!accessToken) return
    setSubmitError('')

    if (!selectedProduct) {
      setSubmitError('Search and choose a product first.')
      return
    }
    const discount = Number(discountPercent)
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      setSubmitError('Discount must be a number between 0 and 100.')
      return
    }
    if (!validUntil || new Date(validUntil).getTime() <= Date.now()) {
      setSubmitError('Valid Until must be a future date.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/bed-of-the-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          productId: selectedProduct.id,
          discountPercentage: discount,
          validUntil: new Date(validUntil).toISOString(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Could not update Bed of the Week')
      }
      const data = await res.json()
      setCurrent(data.current)
      setHistory(data.history)
      setSelectedProduct(null)
      setQuery('')
      setSuggestions([])
      setDiscountPercent('15')
      setValidUntil(defaultValidUntil())
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  function openDiscountEditor() {
    if (!current) return
    setDiscountDraft(String(current.discountPercentage))
    setDiscountError('')
    setEditingDiscount(true)
  }

  async function saveDiscount() {
    if (!accessToken) return
    const discount = Number(discountDraft)
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      setDiscountError('Enter a number between 0 and 100.')
      return
    }
    setDiscountSaving(true)
    setDiscountError('')
    try {
      const res = await fetch('/api/admin/bed-of-the-week/discount', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ discountPercentage: discount }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Could not update discount')
      }
      const data = await res.json()
      setCurrent(data.current)
      setEditingDiscount(false)
    } catch (err) {
      setDiscountError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setDiscountSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Bed of the Week</h1>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-stone-900">Current Bed of the Week</h2>

              {!current ? (
                <p className="text-sm text-stone-500">No Bed of the Week has been set yet.</p>
              ) : (
                <>
                  <div className="flex items-start gap-4 rounded-xl bg-amber-50 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
                      {current.product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={current.product.image} alt={current.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <BedThumbnailIcon className="h-7 w-7 text-[#b87333]" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{current.product.name}</p>
                        <p className="text-sm text-stone-500">SKU: {current.product.sku ?? '—'}</p>
                      </div>

                      {editingDiscount ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            autoFocus
                            value={discountDraft}
                            onChange={(e) => setDiscountDraft(e.target.value)}
                            className="h-8 w-20 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-[#b87333]"
                          />
                          <span className="text-sm text-stone-500">%</span>
                          <button
                            type="button"
                            onClick={saveDiscount}
                            disabled={discountSaving}
                            className="rounded-md bg-[#b87333] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#a3662e] disabled:opacity-60"
                          >
                            {discountSaving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDiscount(false)}
                            className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="w-fit rounded-md bg-[#b87333] px-2.5 py-1 text-xs font-semibold text-white">
                          {current.discountPercentage}% OFF
                        </span>
                      )}
                      {discountError && <p className="text-xs text-red-600">{discountError}</p>}

                      <p className="text-xs text-stone-400">Valid Until: {formatDate(current.validUntil)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      disabled
                      title="No admin product editor exists yet"
                      className="h-11 flex-1 cursor-not-allowed rounded-lg border border-stone-200 text-sm font-medium text-stone-400"
                    >
                      Edit Product
                    </button>
                    <button
                      type="button"
                      onClick={openDiscountEditor}
                      className="h-11 flex-1 rounded-lg bg-[#b87333] text-sm font-medium text-white transition-colors hover:bg-[#a3662e]"
                    >
                      Update Discount
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-stone-900">Select New Bed of the Week</h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 text-sm text-stone-700">
                  Search Product
                  <div className="relative flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value)
                          setSelectedProduct(null)
                        }}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
                          {suggestions.map((product) => (
                            <li key={product.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handlePickSuggestion(product)}
                                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-stone-50"
                              >
                                <span className="font-medium text-stone-900">{product.name}</span>
                                {product.sku && <span className="text-stone-400">SKU: {product.sku}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectClick}
                      className="h-11 shrink-0 rounded-lg bg-[#b87333] px-5 text-sm font-medium text-white transition-colors hover:bg-[#a3662e]"
                    >
                      Select
                    </button>
                  </div>
                </div>

                {selectedProduct && (
                  <div className="flex items-center gap-3 rounded-lg bg-stone-50 px-3 py-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-amber-100">
                      {selectedProduct.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                      ) : (
                        <BedThumbnailIcon className="h-4 w-4 text-[#b87333]" />
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-stone-900">{selectedProduct.name}</p>
                      <p className="text-stone-500">SKU: {selectedProduct.sku ?? '—'}</p>
                    </div>
                  </div>
                )}

                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  Discount Percentage (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  Valid Until
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                  />
                </label>

                <p className="rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-500">
                  The selected product will be displayed as the Bed of the Week on the website homepage.
                </p>

                {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="h-12 rounded-lg bg-[#b87333] text-sm font-medium text-white transition-colors hover:bg-[#a3662e] disabled:opacity-60"
                >
                  {submitting ? 'Updating…' : 'Update Bed of the Week'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-stone-900">Previous Beds of the Week</h2>

            {history.length === 0 ? (
              <p className="text-sm text-stone-500">No previous Beds of the Week yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-4 rounded-lg bg-stone-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
                        {entry.product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={entry.product.image} alt={entry.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <BedThumbnailIcon className="h-5 w-5 text-[#b87333]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900">{entry.product.name}</p>
                        <p className="text-sm text-stone-500">{formatDateRange(entry.validFrom, entry.validUntil)}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {entry.discountPercentage}% OFF
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function BedThumbnailIcon({ className }: { className?: string }) {
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
