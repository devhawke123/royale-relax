import type { NextResponse } from 'next/server'

export const REFRESH_COOKIE_NAME = 'rr_refresh_token'

/**
 * Secure is forced off outside production so refresh works over plain
 * http on localhost; SameSite=Lax and httpOnly stay on unconditionally.
 */
const isProduction = process.env.NODE_ENV === 'production'

export function setRefreshCookie(response: NextResponse, rawToken: string, expiresAt: Date): void {
  response.cookies.set(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getRefreshCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === REFRESH_COOKIE_NAME) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}
