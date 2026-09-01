/** Absolute site origin, no trailing slash. Prefers SITE_URL, falls back to the request Origin. */
export function getSiteUrl(request: Request): string {
  const configured = process.env.SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  const origin = request.headers.get('origin')
  if (origin) return origin.replace(/\/$/, '')
  return 'http://localhost:3000'
}
