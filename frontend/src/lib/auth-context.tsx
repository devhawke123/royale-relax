'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const ACCESS_TOKEN_KEY = 'rr_access_token'
const CUSTOMER_EMAIL_KEY = 'rr_customer_email'
const SUBJECT_KEY = 'rr_subject'

type Subject = 'customer' | 'admin'

interface AuthContextValue {
  accessToken: string | null
  customerEmail: string | null
  subject: Subject | null
  status: 'loading' | 'authenticated' | 'guest'
  login: (email: string, password: string) => Promise<Subject>
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
  const [subject, setSubject] = useState<Subject | null>(null)
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
          localStorage.removeItem(SUBJECT_KEY)
          setStatus('guest')
          return
        }
        const data = await res.json()
        setAccessToken(data.accessToken)
        setSubject(data.subject)
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
        localStorage.setItem(SUBJECT_KEY, data.subject)
        setCustomerEmail(data.subject === 'customer' ? localStorage.getItem(CUSTOMER_EMAIL_KEY) : null)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) setStatus('guest')
      })

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * No `subject` is sent — the server resolves customer vs. admin by
   * looking the email up in both tables. This is what lets the shared
   * storefront login form also sign admins into /admin without a
   * separate admin login screen.
   */
  async function login(email: string, password: string): Promise<Subject> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      throw new Error(await parseError(res, 'Invalid email or password.'))
    }
    const data = await res.json()
    const resolvedSubject: Subject = data.subject
    setAccessToken(data.accessToken)
    setSubject(resolvedSubject)
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(SUBJECT_KEY, resolvedSubject)
    if (resolvedSubject === 'customer') {
      setCustomerEmail(email)
      localStorage.setItem(CUSTOMER_EMAIL_KEY, email)
    } else {
      setCustomerEmail(null)
      localStorage.removeItem(CUSTOMER_EMAIL_KEY)
    }
    setStatus('authenticated')
    return resolvedSubject
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
    setSubject(null)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(CUSTOMER_EMAIL_KEY)
    localStorage.removeItem(SUBJECT_KEY)
    setStatus('guest')
  }

  const value = useMemo(
    () => ({ accessToken, customerEmail, subject, status, login, register, logout }),
    [accessToken, customerEmail, subject, status],
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
