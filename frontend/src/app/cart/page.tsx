import { CartPageClient } from '@/components/CartPage/CartPageClient'

export const metadata = {
  title: 'My Cart | Royale Relax',
  description: 'Review the items in your Royale Relax cart before checkout.',
}

export default function CartPage() {
  return <CartPageClient />
}
