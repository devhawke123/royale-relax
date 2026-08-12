import type { Metadata } from 'next'
import { ConditionalChrome } from '@/components/layout/ConditionalChrome'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Royale Relax',
  description: 'Bespoke beds, mattresses, and fabrics for a calm, elevated bedroom.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <CartProvider>
            <ConditionalChrome>{children}</ConditionalChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
