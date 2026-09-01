import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

export type TokenSubjectKind = 'customer' | 'admin'

export interface AccessTokenClaims {
  sub: string
  subject: TokenSubjectKind
  role?: string
}

const ACCESS_TOKEN_TTL = '15m'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not set')
  }
  return secret
}

/** Short-lived, stateless. Verification never touches the DB — see verifyAccessToken. */
export function signAccessToken(claims: AccessTokenClaims): string {
  const { sub, subject, role } = claims
  return jwt.sign({ subject, role }, getJwtSecret(), {
    subject: sub,
    expiresIn: ACCESS_TOKEN_TTL,
  })
}

/**
 * Signature + expiry only. No DB lookup by design — that's what makes the
 * access/refresh split worth having. If you need to know whether a session
 * has been revoked, that's what the refresh token / RefreshToken table is for.
 */
export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = jwt.verify(token, getJwtSecret())
  if (typeof decoded === 'string') {
    throw new Error('Invalid access token payload')
  }
  const { sub, subject, role } = decoded
  if (typeof sub !== 'string' || (subject !== 'customer' && subject !== 'admin')) {
    throw new Error('Invalid access token payload')
  }
  return { sub, subject, role: typeof role === 'string' ? role : undefined }
}

/**
 * 32 random bytes, base64url-encoded. The raw value handed to the client — never
 * stored. Used for refresh tokens and for admin password-reset tokens.
 */
export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/** sha256 hex digest — this, not the raw token, is what RefreshToken.tokenHash stores. */
export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}
