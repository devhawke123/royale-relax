'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartToast } from './CartToast'

/**
 * The admin dashboard has its own full-page shell (sidebar, no storefront
 * nav) but still needs to sit under the root layout for AuthProvider/
 * CartProvider — so the storefront Header/Footer are opted out here by
 * path rather than by splitting into a second root layout.
 */
export function ConditionalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <CartToast />
    </>
  )
}
