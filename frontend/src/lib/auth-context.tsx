'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const ACCESS_TOKEN_KEY = 'rr_access_token'
const CUSTOMER_EMAIL_KEY = 'rr_customer_email'

interface AuthContextValue {
  accessToken: string | null
  customerEmail: string | null
  status: 'loading' | 'authenticated' | 'guest'
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function parseError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null)
  return data?.error ?? fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading')

  // On mount, try to silently restore a session from the httpOnly refresh
  // cookie — the access token itself is never persisted server-side, so this
  // is the only way to know if a logged-in session still exists.
  useEffect(() => {
    let cancelled = false

    fetch('/api/auth/refresh', { method: 'POST' })
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) {
          localStorage.removeItem(ACCESS_TOKEN_KEY)
          localStorage.removeItem(CUSTOMER_EMAIL_KEY)
          setStatus('guest')
          return
        }
        const data = await res.json()
        setAccessToken(data.accessToken)
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
        setCustomerEmail(localStorage.getItem(CUSTOMER_EMAIL_KEY))
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) setStatus('guest')
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, subject: 'customer' }),
    })
    if (!res.ok) {
      throw new Error(await parseError(res, 'Invalid email or password.'))
    }
    const data = await res.json()
    setAccessToken(data.accessToken)
    setCustomerEmail(email)
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(CUSTOMER_EMAIL_KEY, email)
    setStatus('authenticated')
  }

  async function register(email: string, password: string, firstName: string, lastName: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
    if (!res.ok) {
      throw new Error(await parseError(res, 'Could not create account.'))
    }
    await login(email, password)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setAccessToken(null)
    setCustomerEmail(null)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(CUSTOMER_EMAIL_KEY)
    setStatus('guest')
  }

  const value = useMemo(
    () => ({ accessToken, customerEmail, status, login, register, logout }),
    [accessToken, customerEmail, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
