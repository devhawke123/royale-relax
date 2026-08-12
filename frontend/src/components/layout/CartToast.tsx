'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path
        d="M6 10.5L8.5 13L14 7"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CartToast() {
  const { toast, dismissToast } = useCart()
  const [visibleId, setVisibleId] = useState<number | null>(null)

  // Delays the enter transition by a tick so the initial mount starts from
  // the translated/opacity-0 state instead of snapping straight to visible.
  useEffect(() => {
    if (!toast) return
    setVisibleId(null)
    const id = requestAnimationFrame(() => setVisibleId(toast.id))
    return () => cancelAnimationFrame(id)
  }, [toast])

  if (!toast) return null

  const isVisible = visibleId === toast.id

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-24 right-6 z-[70] w-[calc(100vw-3rem)] max-w-sm transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
        <CheckIcon />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-900">Added to cart</p>
          <p className="truncate text-sm text-stone-500">{toast.name}</p>
        </div>
        {toast.image && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            <Image src={toast.image} alt="" fill className="object-cover" />
          </div>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismissToast}
          className="shrink-0 text-stone-400 hover:text-stone-700"
        >
          ✕
        </button>
      </div>
      <Link
        href="/cart"
        onClick={dismissToast}
        className="mt-2 flex justify-end text-sm font-medium text-[#b87333] hover:underline"
      >
        View Cart →
      </Link>
    </div>
  )
}
