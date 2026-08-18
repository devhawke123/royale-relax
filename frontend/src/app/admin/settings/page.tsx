'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'

interface StoreSettings {
  storeName: string
  email: string
  phone: string
}

export default function AdminSettingsPage() {
  const { accessToken } = useAuth()
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load settings')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setSettings(data.settings)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!settings || !accessToken) return

    setSubmitting(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          storeName: settings.storeName,
          email: settings.email,
          phone: settings.phone,
          ...(password ? { password } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Could not save settings')
      }
      const data = await res.json()
      setSettings(data.settings)
      setPassword('')
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Settings</h1>

      {!settings ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex max-w-lg flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-stone-900">Store Settings</h2>

          <label className="flex flex-col gap-2 text-sm text-stone-700">
            Store Name
            <input
              type="text"
              required
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-700">
            Email
            <input
              type="email"
              required
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-700">
            Phone
            <input
              type="tel"
              required
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-700">
            Password
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Leave blank to keep current password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-stone-300 px-3 pr-11 text-sm outline-none focus:border-[#b87333]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
              </button>
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !error && <p className="text-sm text-emerald-600">Settings saved.</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg bg-[#b87333] text-sm font-medium text-white transition-colors hover:bg-[#a3662e] disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
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
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 2.5l15 15M8.35 4.2A9.3 9.3 0 0 1 10 4c5.5 0 8.5 6 8.5 6a15 15 0 0 1-2.36 3.14M11.9 11.9a2.25 2.25 0 0 1-3.18-3.18M6.2 6.16C3.53 7.86 1.5 10 1.5 10s3 6 8.5 6a8.6 8.6 0 0 0 3.66-.82"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
