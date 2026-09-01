'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { EyeIcon, EyeOffIcon } from '@/components/ui/PasswordToggleIcons'

const MIN_PASSWORD_LENGTH = 8

export function ResetPasswordClient() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = form.get('password')?.toString() ?? ''
    const confirm = form.get('confirm')?.toString() ?? ''

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Something went wrong.')
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
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
          <h1 className="text-[32px] font-medium text-black">Set a new password</h1>
          <p className="text-[15px] text-[#6a6d70]">
            Choose a new password for your Royale Relax admin account.
          </p>
        </div>

        {!token ? (
          <p className="text-sm text-red-600">
            This link is missing its reset token. Request a new one from the{' '}
            <Link href="/forgot-password" className="font-medium text-[#b87333] hover:underline">
              reset page
            </Link>
            .
          </p>
        ) : done ? (
          <p className="rounded-lg bg-[#f5f5f4] p-4 text-sm text-[#0a0a0a]">
            Password updated. Redirecting you to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
              New password:
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 pr-12 text-sm outline-none focus:border-[#b87333]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-[#6a6d70] hover:text-[#0a0a0a]"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
              Confirm password:
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
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
              {submitting ? 'Please wait...' : 'Update password'}
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
