'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface CartLineOption {
  label: string
  value: string
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
}

export interface CartLine extends CartLineInput {
  id: string
  quantity: number
}

function lineSignature(item: CartLineInput) {
  const options = (item.options ?? []).map((o) => `${o.label}:${o.value}`).join('|')
  return `${item.productId}::${options}`
}

interface CartContextValue {
  cartItems: CartLine[]
  cartCount: number
  subtotal: number
  addToCart: (item: CartLineInput, quantity?: number) => void
  removeFromCart: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartLine[]>([])

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
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cartItems, cartCount, subtotal],
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
