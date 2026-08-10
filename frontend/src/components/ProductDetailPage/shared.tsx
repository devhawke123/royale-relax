'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getDeliveryEstimate } from '@/lib/delivery-estimate'

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)
}

export function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 shrink-0 text-stone-500 transition-transform ${className}`}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill={filled ? '#b87333' : 'none'} className="h-[18px] w-[18px] shrink-0">
      <path
        d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8L10 1.5Z"
        stroke="#b87333"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] text-black">{rating.toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < Math.round(rating)} />
        ))}
      </div>
      <span className="text-[14px] text-black/50">({reviewCount} Reviews)</span>
    </div>
  )
}

interface ListboxOption {
  value: string
  label: string
}

/**
 * A polished, custom-styled dropdown used for every "Choose ..." field on
 * product detail pages. Built as a listbox rather than a native <select> so
 * the open menu can carry the site's own styling (brand-colour selected
 * state, rounded panel) instead of the browser's default popup.
 */
export function Listbox({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  options: ListboxOption[]
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col gap-2 border border-[#71717a] px-4 py-3 lg:gap-1 lg:px-3 lg:py-2"
    >
      <span className="text-[12.6px] text-black/70 lg:text-[11px]">
        {label} {required && <span className="text-[#de3618]">*</span>}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 bg-transparent text-left text-[16px] text-[#353535] focus:outline-none lg:text-[14px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownIcon className={open ? 'rotate-180' : ''} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-[6px] border border-stone-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`block w-full px-4 py-2.5 text-left text-[15px] transition-colors ${
                  option.value === value ? 'bg-[#b87333] text-white' : 'text-[#353535] hover:bg-stone-100'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Wraps Listbox with its own uncontrolled selection state, for "Choose ..."
 * add-on fields that don't have a backing data model yet.
 */
export function OrderOptionSelect({
  label,
  required,
  options,
  defaultValue,
}: {
  label: string
  required?: boolean
  options: string[]
  defaultValue?: string
}) {
  const [selected, setSelected] = useState(defaultValue ?? options[0])
  return (
    <Listbox
      label={label}
      required={required}
      value={selected}
      onChange={setSelected}
      options={options.map((option) => ({ value: option, label: option }))}
    />
  )
}

export function VisaBadge() {
  return (
    <span className="flex h-8 w-12 items-center justify-center rounded-[4px] border border-stone-200 bg-white">
      <svg viewBox="0 0 48 16" className="h-3.5 w-9" aria-label="Visa">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="15" fill="#1a1f71">
          VISA
        </text>
      </svg>
    </span>
  )
}

export function MastercardBadge() {
  return (
    <span className="flex h-8 w-12 items-center justify-center rounded-[4px] border border-stone-200 bg-white">
      <svg viewBox="0 0 40 24" className="h-5 w-8" aria-label="Mastercard">
        <circle cx="16" cy="12" r="9" fill="#eb001b" />
        <circle cx="24" cy="12" r="9" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    </span>
  )
}

function OrderPlacedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
      <path
        d="M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DispatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
      <path
        d="M3 7h11v9H3V7Z M14 10h4l3 3v3h-7v-6Z M6.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M16.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeliveredIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z M3 8.5V16l9 4.5 9-4.5V8.5 M12 13v7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DeliveryTimeline() {
  const estimate = useMemo(() => getDeliveryEstimate(), [])

  return (
    <div className="w-full">
      <div className="flex items-end gap-2">
        <span className="text-[28px] leading-none text-black">{estimate.estimatedArrivalLabel}</span>
        <span className="pb-0.5 text-[16px] text-black">Estimated arrival</span>
      </div>
      <div className="mt-8 flex items-center">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black">
          <OrderPlacedIcon />
        </span>
        <span className="h-px flex-1 bg-black" />
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black">
          <DispatchIcon />
        </span>
        <span className="h-px flex-1 bg-black" />
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black">
          <DeliveredIcon />
        </span>
      </div>
      <div className="mt-2 flex items-start justify-between text-[13px] text-black">
        <div className="flex flex-col">
          <span>{estimate.orderPlacedLabel}</span>
          <span>Order placed</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span>{estimate.dispatchRangeLabel}</span>
          <span>Order dispatches</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span>{estimate.estimatedArrivalLabel}</span>
          <span>Delivered!</span>
        </div>
      </div>
    </div>
  )
}

export function QuantityStepper({
  quantity,
  onChange,
  className = '',
}: {
  quantity: number
  onChange: (next: number) => void
  className?: string
}) {
  return (
    <div className={`flex w-fit items-center gap-4 border border-stone-300 px-4 py-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="Decrease quantity"
        className="flex h-6 w-6 items-center justify-center text-lg text-stone-600 hover:text-[#b87333]"
      >
        −
      </button>
      <span className="min-w-[1.5ch] text-center text-[16px] text-black">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className="flex h-6 w-6 items-center justify-center text-lg text-stone-600 hover:text-[#b87333]"
      >
        +
      </button>
    </div>
  )
}
