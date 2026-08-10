'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'

type Mode = 'signin' | 'register'

export function LoginPageClient() {
  const router = useRouter()
  const { status, login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    setSubmitting(true)
    setError('')

    try {
      if (mode === 'signin') {
        await login(email, password)
      } else {
        const firstName = formData.get('firstName')?.toString().trim() ?? ''
        const lastName = formData.get('lastName')?.toString().trim() ?? ''
        await register(email, password, firstName, lastName)
      }
      router.push('/')
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
            <input
              type="password"
              name="password"
              required
              minLength={mode === 'register' ? 8 : undefined}
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
