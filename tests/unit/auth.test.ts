import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock jsonwebtoken before importing anything that uses it
vi.mock('jsonwebtoken', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jsonwebtoken')>()
  return {
    ...actual,
    sign: vi.fn(),
    verify: vi.fn(),
  }
})

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      }

      const { generateToken } = await import('@/backend/auth/jwt')
      const token = generateToken(payload)

      // Token should be a string with JWT format (three parts separated by dots)
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('should sign with correct payload', async () => {
      const payload = {
        userId: 'user-456',
        email: 'another@example.com',
      }

      const { generateToken } = await import('@/backend/auth/jwt')
      const token = generateToken(payload)

      // Should return a valid JWT token string
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      }

      const { generateToken, verifyToken } = await import('@/backend/auth/jwt')
      const token = generateToken(payload)
      const result = verifyToken(token)

      // Should return the payload
      expect(result).not.toBeNull()
      expect(result?.userId).toBe('user-123')
      expect(result?.email).toBe('test@example.com')
    })

    it('should return null for invalid token', async () => {
      const jwt = await import('jsonwebtoken')
      const token = 'invalid-token'

      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('JsonWebTokenError: invalid token')
      })

      const { verifyToken } = await import('@/backend/auth/jwt')
      const result = verifyToken(token)

      expect(result).toBeNull()
    })

    it('should return null for expired token', async () => {
      const jwt = await import('jsonwebtoken')
      const token = 'expired-token'

      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('TokenExpiredError: jwt expired')
      })

      const { verifyToken } = await import('@/backend/auth/jwt')
      const result = verifyToken(token)

      expect(result).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return null if no token exists', async () => {
      const { cookies } = await import('next/headers')
      const mockCookies = {
        get: vi.fn(() => undefined),
        set: vi.fn(),
        delete: vi.fn(),
      }

      vi.mocked(cookies).mockResolvedValueOnce(mockCookies as any)

      const { getCurrentUser } = await import('@/backend/auth/jwt')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('should return null if token is invalid', async () => {
      const jwt = await import('jsonwebtoken')
      const { cookies } = await import('next/headers')

      const mockCookies = {
        get: vi.fn(() => ({ value: 'invalid-token' })),
        set: vi.fn(),
        delete: vi.fn(),
      }

      vi.mocked(cookies).mockResolvedValueOnce(mockCookies as any)
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })

      const { getCurrentUser } = await import('@/backend/auth/jwt')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })

  describe('getTokenFromCookies', () => {
    it('should get token from cookies', async () => {
      const { cookies } = await import('next/headers')
      const mockCookies = {
        get: vi.fn(() => ({ value: 'token-from-cookies' })),
        set: vi.fn(),
        delete: vi.fn(),
      }

      vi.mocked(cookies).mockResolvedValueOnce(mockCookies as any)

      const { getTokenFromCookies } = await import('@/backend/auth/jwt')
      const token = await getTokenFromCookies()

      expect(token).toBe('token-from-cookies')
      expect(mockCookies.get).toHaveBeenCalledWith('auth')
    })

    it('should return null if no auth cookie exists', async () => {
      const { cookies } = await import('next/headers')
      const mockCookies = {
        get: vi.fn(() => undefined),
        set: vi.fn(),
        delete: vi.fn(),
      }

      vi.mocked(cookies).mockResolvedValueOnce(mockCookies as any)

      const { getTokenFromCookies } = await import('@/backend/auth/jwt')
      const token = await getTokenFromCookies()

      expect(token).toBeNull()
    })
  })

  describe('setAuthCookie', () => {
    it('should set auth cookie with correct options', async () => {
      const { cookies } = await import('next/headers')
      const mockCookies = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      }

      vi.mocked(cookies).mockResolvedValueOnce(mockCookies as any)

      const { setAuthCookie } = await import('@/backend/auth/jwt')
      await setAuthCookie('new-token')

      expect(mockCookies.set).toHaveBeenCalledWith(
        'auth',
        'new-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
        })
      )
    })
  })

  describe('clearAuthCookie', () => {
    it('should delete auth cookie', async () => {
      const { cookies } = await import('next/headers')
      const mockCookies = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      }

      vi.mocked(cookies).mockResolvedValueOnce(mockCookies as any)

      const { clearAuthCookie } = await import('@/backend/auth/jwt')
      await clearAuthCookie()

      expect(mockCookies.delete).toHaveBeenCalledWith('auth')
    })
  })
})
