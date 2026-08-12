'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status, subject } = useAuth()

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login')
    } else if (status === 'authenticated' && subject !== 'admin') {
      router.replace('/')
    }
  }, [status, subject, router])

  if (status !== 'authenticated' || subject !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f4] text-sm text-stone-500">Loading…</div>
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f4]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  )
}
