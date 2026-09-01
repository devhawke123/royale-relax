import { Suspense } from 'react'
import { ResetPasswordClient } from '@/components/auth/ResetPasswordClient'

export const metadata = {
  title: 'Set New Admin Password | Royale Relax',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
