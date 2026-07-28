'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface CartContextValue {
  cartCount: number
  wishlistCount: number
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Record<string, number>>({})
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())

  const addToCart = (productId: string) => {
    setCartItems((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }))
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

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
    () => Object.values(cartItems).reduce((sum, qty) => sum + qty, 0),
    [cartItems],
  )
  const wishlistCount = wishlistItems.size

  const value = useMemo(
    () => ({
      cartCount,
      wishlistCount,
      addToCart,
      removeFromCart,
      toggleWishlist,
      isWishlisted: (productId: string) => wishlistItems.has(productId),
    }),
    [cartCount, wishlistCount, wishlistItems],
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
