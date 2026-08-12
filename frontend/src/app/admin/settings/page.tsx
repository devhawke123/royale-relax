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
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
            />
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
