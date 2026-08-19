import type { Metadata } from 'next'
import { ConditionalChrome } from '@/components/layout/ConditionalChrome'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { getStoreSettings } from '@/lib/store-settings'
import './globals.css'

export const metadata: Metadata = {
  title: 'Royale Relax',
  description: 'Bespoke beds, mattresses, and fabrics for a calm, elevated bedroom.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { phone, email } = await getStoreSettings()

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <CartProvider>
            <ConditionalChrome phone={phone} email={email}>{children}</ConditionalChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
