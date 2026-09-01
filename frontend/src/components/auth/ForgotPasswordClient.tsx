'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordClient() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')?.toString().trim() ?? ''

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Something went wrong.')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-medium text-black">Reset admin password</h1>
          <p className="text-[15px] text-[#6a6d70]">
            Enter your admin email and we&apos;ll send you a link to set a new password.
          </p>
        </div>

        {sent ? (
          <p className="rounded-lg bg-[#f5f5f4] p-4 text-sm text-[#0a0a0a]">
            If that email belongs to an admin account, a reset link is on its way. The link
            expires in 1 hour.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
              Email:
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              className="h-12 w-full rounded-full text-base disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Please wait...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-[#6a6d70]">
          <Link href="/login" className="font-medium text-[#b87333] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
