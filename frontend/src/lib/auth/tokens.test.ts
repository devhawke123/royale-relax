import { beforeAll, describe, expect, it } from 'vitest'
import jwt from 'jsonwebtoken'
import { generateRefreshToken, hashToken, signAccessToken, verifyAccessToken } from './tokens'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod'
})

describe('signAccessToken / verifyAccessToken', () => {
  it('round-trips subject, sub, and role', () => {
    const token = signAccessToken({ sub: 'customer-1', subject: 'customer' })
    const claims = verifyAccessToken(token)
    expect(claims).toEqual({ sub: 'customer-1', subject: 'customer', role: undefined })
  })

  it('carries an optional role claim for admins', () => {
    const token = signAccessToken({ sub: 'admin-1', subject: 'admin', role: 'ADMIN' })
    const claims = verifyAccessToken(token)
    expect(claims).toEqual({ sub: 'admin-1', subject: 'admin', role: 'ADMIN' })
  })

  it('rejects a tampered token', () => {
    const token = signAccessToken({ sub: 'customer-1', subject: 'customer' })
    const tampered = token.slice(0, -1) + (token.at(-1) === 'a' ? 'b' : 'a')
    expect(() => verifyAccessToken(tampered)).toThrow()
  })

  it('rejects a token signed with a different secret', () => {
    const token = signAccessToken({ sub: 'customer-1', subject: 'customer' })
    process.env.JWT_SECRET = 'a-different-secret'
    try {
      expect(() => verifyAccessToken(token)).toThrow()
    } finally {
      process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod'
    }
  })

  it('rejects an expired token', () => {
    // Sign with a token that's already past its exp claim.
    const expired = jwt.sign({ subject: 'customer' }, process.env.JWT_SECRET as string, {
      subject: 'customer-1',
      expiresIn: -10,
    })
    expect(() => verifyAccessToken(expired)).toThrow()
  })
})

describe('generateRefreshToken', () => {
  it('generates a base64url string with no padding/slashes/plus', () => {
    const token = generateRefreshToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('generates a different value each call', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken())
  })
})

describe('hashToken', () => {
  it('is deterministic', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'))
  })

  it('produces a 64-char hex sha256 digest', () => {
    expect(hashToken('abc')).toMatch(/^[a-f0-9]{64}$/)
  })

  it('differs for different inputs', () => {
    expect(hashToken('abc')).not.toBe(hashToken('abd'))
  })
})
