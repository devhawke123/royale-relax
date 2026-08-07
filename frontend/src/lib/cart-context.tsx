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
  wishlistCount: number
  addToCart: (item: CartLineInput, quantity?: number) => void
  removeFromCart: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartLine[]>([])
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())

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

  const toggleWishlist = (productId: string) => {
    setWishlistItems((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const cartCount = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.quantity, 0),
    [cartItems],
  )
  const subtotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cartItems],
  )
  const wishlistCount = wishlistItems.size

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      subtotal,
      wishlistCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted: (productId: string) => wishlistItems.has(productId),
    }),
    [cartItems, cartCount, subtotal, wishlistCount, wishlistItems],
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
