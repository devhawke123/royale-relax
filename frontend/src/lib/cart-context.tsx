'use client'

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export interface CartLineOption {
  label: string
  value: string
}

/** Mirrors lib/checkout.ts's CartAddonSelection shape — kept independent so this client module never imports the server-only checkout file. */
export interface CartAddonSelection {
  addonId: string
  selectedOptionId?: string
  textValue?: string
  /** TOGGLE addons only: which branch (Yes/No) the customer picked — both can carry a price now. */
  toggleOn?: boolean
}

export interface CartLineInput {
  productId: string
  name: string
  image?: string
  price: number
  href?: string
  sku?: string
  options?: CartLineOption[]
  /** Real ProductSize.id — required at checkout to re-derive the price server-side. */
  sizeId?: string
  /** Real FabricColor.id — the upholstery/colourway chosen, if any. */
  fabricColorId?: string
  /** Real ProductAddon selections — checkout re-derives their price server-side, never trusting `price` above. */
  selectedAddons?: CartAddonSelection[]
}

export interface CartLine extends CartLineInput {
  id: string
  quantity: number
}

export interface CartToast {
  id: number
  name: string
  image?: string
}

function lineSignature(item: CartLineInput) {
  const options = (item.options ?? []).map((o) => `${o.label}:${o.value}`).join('|')
  return `${item.productId}::${options}`
}

interface CartContextValue {
  cartItems: CartLine[]
  cartCount: number
  subtotal: number
  toast: CartToast | null
  addToCart: (item: CartLineInput, quantity?: number) => void
  removeFromCart: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
  dismissToast: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const TOAST_DURATION_MS = 3000

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartLine[]>([])
  const [toast, setToast] = useState<CartToast | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast(null)
  }

  const addToCart = (item: CartLineInput, quantity = 1) => {
    setCartItems((prev) => {
      const signature = lineSignature(item)
      const existing = prev.find((line) => lineSignature(line) === signature)
      if (existing) {
        return prev.map((line) =>
          line.id === existing.id ? { ...line, quantity: line.quantity + quantity } : line,
        )
      }
      const id = `${signature}::${Date.now()}::${Math.random().toString(36).slice(2)}`
      return [...prev, { ...item, id, quantity }]
    })

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ id: Date.now(), name: item.name, image: item.image })
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }

  const removeFromCart = (lineId: string) => {
    setCartItems((prev) => prev.filter((line) => line.id !== lineId))
  }

  const updateQuantity = (lineId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, quantity: Math.max(1, quantity) } : line)),
    )
  }

  const clearCart = () => setCartItems([])

  const cartCount = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.quantity, 0),
    [cartItems],
  )
  const subtotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cartItems],
  )

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      subtotal,
      toast,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      dismissToast,
    }),
    [cartItems, cartCount, subtotal, toast],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
