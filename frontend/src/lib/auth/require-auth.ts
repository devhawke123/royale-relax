import { verifyAccessToken, type AccessTokenClaims, type TokenSubjectKind } from './tokens'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

/** Reads + verifies the Bearer access token on a request. Throws AuthError(401) on failure. */
export function getAccessTokenClaims(request: Request): AccessTokenClaims {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('Missing bearer token')
  }
  const token = header.slice('Bearer '.length).trim()
  try {
    return verifyAccessToken(token)
  } catch {
    throw new AuthError('Invalid or expired access token')
  }
}

/**
 * Verifies the request's access token and optionally constrains who may pass:
 * a specific subject ('customer' | 'admin'), and/or (for admins) a role.
 * Throws AuthError — callers should catch it and respond with `.status`.
 */
export function requireAuth(
  request: Request,
  options?: { subject?: TokenSubjectKind; role?: string },
): AccessTokenClaims {
  const claims = getAccessTokenClaims(request)
  if (options?.subject && claims.subject !== options.subject) {
    throw new AuthError('Forbidden', 403)
  }
  if (options?.role && claims.role !== options.role) {
    throw new AuthError('Forbidden', 403)
  }
  return claims
}
