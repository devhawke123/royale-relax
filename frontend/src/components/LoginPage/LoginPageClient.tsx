'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'

type Mode = 'signin' | 'register'

export function LoginPageClient() {
  const router = useRouter()
  const { status, subject, login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(subject === 'admin' ? '/admin' : '/')
    }
  }, [status, subject, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    setSubmitting(true)
    setError('')

    try {
      if (mode === 'signin') {
        const subject = await login(email, password)
        router.push(subject === 'admin' ? '/admin' : '/')
      } else {
        const firstName = formData.get('firstName')?.toString().trim() ?? ''
        const lastName = formData.get('lastName')?.toString().trim() ?? ''
        await register(email, password, firstName, lastName)
        router.push('/')
      }
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
          <h1 className="text-[32px] font-medium text-black">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-[15px] text-[#6a6d70]">
            {mode === 'signin'
              ? "Welcome back — sign in to your Royale Relax account."
              : 'Create an account to track orders and check out faster.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === 'register' && (
            <div className="flex gap-4">
              <label className="flex flex-1 flex-col gap-2 text-sm text-[#0a0a0a]">
                First name:
                <input
                  type="text"
                  name="firstName"
                  required
                  className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
                />
              </label>
              <label className="flex flex-1 flex-col gap-2 text-sm text-[#0a0a0a]">
                Last name:
                <input
                  type="text"
                  name="lastName"
                  required
                  className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
                />
              </label>
            </div>
          )}

          <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
            Email:
            <input
              type="email"
              name="email"
              required
              className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
            Password:
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={mode === 'register' ? 8 : undefined}
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            className="h-12 w-full rounded-full text-base disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#6a6d70]">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'register' : 'signin')
              setError('')
            }}
            className="font-medium text-[#b87333] hover:underline"
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 2.5l15 15M8.3 8.4a2.5 2.5 0 0 0 3.4 3.4M6.2 5.3C3.8 6.6 1.5 10 1.5 10s3 6 8.5 6c1.5 0 2.8-.4 3.9-1M15.9 14.1C17.6 12.7 18.5 10 18.5 10s-3-6-8.5-6c-.6 0-1.2.06-1.7.17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
