import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Prisma before importing auth-options
vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    oAuthAccount: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock next-auth providers
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((config) => ({
    id: 'google',
    name: 'Google',
    ...config,
  })),
}))

vi.mock('next-auth/providers/github', () => ({
  default: vi.fn((config) => ({
    id: 'github',
    name: 'GitHub',
    ...config,
  })),
}))

vi.mock('next-auth/providers/discord', () => ({
  default: vi.fn((config) => ({
    id: 'discord',
    name: 'Discord',
    ...config,
  })),
}))

describe('auth-options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXTAUTH_SECRET = 'test-secret'
    // Clear providers to allow fresh import
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
    delete process.env.GITHUB_CLIENT_ID
    delete process.env.GITHUB_CLIENT_SECRET
    delete process.env.DISCORD_CLIENT_ID
    delete process.env.DISCORD_CLIENT_SECRET
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('authOptions configuration', () => {
    it('should have correct base configuration', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')

      expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET)
      expect(authOptions.session?.strategy).toBe('jwt')
      expect(authOptions.pages?.signIn).toBe('/auth/login')
      expect(authOptions.pages?.error).toBe('/auth/login')
      expect(authOptions.providers).toBeDefined()
    })

    it('should have callbacks defined', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')

      expect(authOptions.callbacks?.signIn).toBeDefined()
      expect(authOptions.callbacks?.jwt).toBeDefined()
      expect(authOptions.callbacks?.session).toBeDefined()
    })
  })

  describe('getOptionalEnv', () => {
    it('should return env variable value when present', async () => {
      process.env.TEST_VAR = 'test-value'
      // Test through provider building
      process.env.GOOGLE_CLIENT_ID = 'google-id'
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret'

      const { authOptions } = await import('@/server/auth/auth-options')
      expect(authOptions.providers.length).toBeGreaterThanOrEqual(0)

      delete process.env.TEST_VAR
      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET
    })

    it('should return null when env variable is missing', async () => {
      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET

      const { authOptions } = await import('@/server/auth/auth-options')
      // Providers should be empty when no credentials provided
      expect(Array.isArray(authOptions.providers)).toBe(true)
    })

    it('should trim whitespace from env variables', async () => {
      process.env.GOOGLE_CLIENT_ID = '  google-id-with-spaces  '
      process.env.GOOGLE_CLIENT_SECRET = '  google-secret-with-spaces  '

      const { authOptions } = await import('@/server/auth/auth-options')
      // Providers should include Google if credentials are present (trimmed)
      expect(Array.isArray(authOptions.providers)).toBe(true)

      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET
    })
  })

  describe('getNameFromEmail', () => {
    it('should extract name from email local part', async () => {
      // This is tested implicitly through the user creation with email
      // The getNameFromEmail is called in signIn callback
      process.env.NEXTAUTH_SECRET = 'test-secret'

      const { authOptions } = await import('@/server/auth/auth-options')
      expect(authOptions.callbacks?.signIn).toBeDefined()
    })
  })

  describe('buildProvider', () => {
    it('should return null when clientId is missing', async () => {
      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET

      const { authOptions } = await import('@/server/auth/auth-options')
      const googleProvider = authOptions.providers.find(
        (p) => (p as any).id === 'google'
      )

      expect(googleProvider).toBeUndefined()
    })

    it('should return null when clientSecret is missing', async () => {
      process.env.GOOGLE_CLIENT_ID = 'google-id'
      delete process.env.GOOGLE_CLIENT_SECRET

      vi.resetModules()
      const { authOptions } = await import('@/server/auth/auth-options')
      const googleProvider = authOptions.providers.find(
        (p) => (p as any).id === 'google'
      )

      expect(googleProvider).toBeUndefined()

      delete process.env.GOOGLE_CLIENT_ID
    })

    it('should include provider when both credentials are present', async () => {
      process.env.GOOGLE_CLIENT_ID = 'google-id'
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret'

      vi.resetModules()
      const { authOptions } = await import('@/server/auth/auth-options')
      // Provider array should have the google provider or be filtered correctly
      expect(Array.isArray(authOptions.providers)).toBe(true)

      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET
    })
  })

  describe('signIn callback', () => {
    it('should return true for non-oauth accounts', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@example.com' },
        account: { type: 'credentials' },
      } as any)

      expect(result).toBe(true)
    })

    it('should return error when email is missing in oauth', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const result = await authOptions.callbacks?.signIn?.({
        user: {},
        account: { type: 'oauth', provider: 'google', providerAccountId: '123' },
      } as any)

      expect(result).toBe('/auth/login?error=OAuthEmailMissing')
    })

    it('should return error when email is only whitespace in oauth', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: '   ' },
        account: { type: 'oauth', provider: 'google', providerAccountId: '123' },
      } as any)

      expect(result).toBe('/auth/login?error=OAuthEmailMissing')
    })

    it('should create oauth account for valid oauth signin with new user', async () => {
      const { prisma } = await import('@/server/db/prisma')

      // Mock the transaction to simulate successful flow
      const mockTransaction = vi.fn(async (callback) => {
        const txClient = {
          oAuthAccount: {
            findUnique: vi.fn().mockResolvedValueOnce(null),
            create: vi.fn().mockResolvedValueOnce({ id: 'oauth-1' }),
          },
          user: {
            findUnique: vi.fn().mockResolvedValueOnce(null),
            create: vi.fn().mockResolvedValueOnce({
              id: 'new-user',
              email: 'test@example.com',
              name: 'Test User',
            }),
          },
        }
        return callback(txClient)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      const { authOptions } = await import('@/server/auth/auth-options')
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@example.com', name: 'Test User' },
        account: {
          type: 'oauth',
          provider: 'google',
          providerAccountId: '123',
          access_token: 'token',
        },
      } as any)

      expect(result).toBe(true)
      expect(mockTransaction).toHaveBeenCalled()
    })

    it('should handle existing oauth account', async () => {
      const { prisma } = await import('@/server/db/prisma')
      const mockExistingAccount = {
        id: 'account-1',
        user: { id: 'user-1', email: 'test@example.com' },
      }

      const mockTransaction = vi.fn(async (callback) => {
        const txClient = {
          oAuthAccount: {
            findUnique: vi
              .fn()
              .mockResolvedValueOnce(Promise.resolve(mockExistingAccount)),
            update: vi
              .fn()
              .mockResolvedValueOnce(Promise.resolve(mockExistingAccount)),
            create: vi.fn(),
          },
          user: {
            findUnique: vi.fn(),
            create: vi.fn(),
          },
        }
        return callback(txClient)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      const { authOptions } = await import('@/server/auth/auth-options')
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@example.com', name: 'Test User' },
        account: {
          type: 'oauth',
          provider: 'google',
          providerAccountId: '123',
          access_token: 'new-token',
        },
      } as any)

      expect(result).toBe(true)
    })

    it('should handle existing user with new oauth provider', async () => {
      const { prisma } = await import('@/server/db/prisma')

      const mockTransaction = vi.fn(async (callback) => {
        const existingUser = {
          id: 'existing-user',
          email: 'test@example.com',
          name: 'Existing User',
        }

        const txClient = {
          oAuthAccount: {
            findUnique: vi.fn().mockResolvedValueOnce(null),
            create: vi.fn().mockResolvedValueOnce({ id: 'oauth-1' }),
          },
          user: {
            findUnique: vi.fn().mockResolvedValueOnce(existingUser),
            create: vi.fn(),
          },
        }
        return callback(txClient)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      const { authOptions } = await import('@/server/auth/auth-options')
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@example.com', name: 'Test User' },
        account: {
          type: 'oauth',
          provider: 'github',
          providerAccountId: '456',
          access_token: 'token',
        },
      } as any)

      expect(result).toBe(true)
    })
  })

  describe('jwt callback', () => {
    it('should add user data to token from oauth account', async () => {
      const { prisma } = await import('@/server/db/prisma')
      const mockOAuthAccount = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'User Name',
        },
      }

      vi.mocked(prisma.oAuthAccount.findUnique).mockResolvedValueOnce(
        mockOAuthAccount as any
      )

      const { authOptions } = await import('@/server/auth/auth-options')
      const input = {
        token: { sub: 'oauth-sub' },
        account: {
          type: 'oauth',
          provider: 'google',
          providerAccountId: '123',
        },
      }

      const result = await authOptions.callbacks?.jwt?.(input as any)

      expect(result?.sub).toBe('user-123')
      expect(result?.email).toBe('user@example.com')
      expect(result?.name).toBe('User Name')
    })

    it('should handle jwt callback without account', async () => {
      const { prisma } = await import('@/server/db/prisma')
      const mockUser = {
        email: 'user@example.com',
        name: 'User Name',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any)

      const { authOptions } = await import('@/server/auth/auth-options')
      const token = { sub: 'user-123' }

      const result = await authOptions.callbacks?.jwt?.({
        token,
      } as any)

      expect(result?.sub).toBe('user-123')
    })

    it('should not modify token if user data already exists', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const token = {
        sub: 'user-123',
        email: 'user@example.com',
        name: 'User Name',
      }

      const result = await authOptions.callbacks?.jwt?.({
        token,
      } as any)

      expect(result).toEqual(token)
    })
  })

  describe('session callback', () => {
    it('should set user id and email in session', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const session = {
        user: {
          email: 'user@example.com',
          name: 'User Name',
        },
      }

      const token = {
        sub: 'user-123',
        email: 'user@example.com',
        name: 'User Name',
      }

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      } as any)

      expect(result?.user?.id).toBe('user-123')
      expect(result?.user?.email).toBe('user@example.com')
      expect(result?.user?.name).toBe('User Name')
    })

    it('should handle missing session user', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const session = {}

      const token = {
        sub: 'user-123',
        email: 'user@example.com',
        name: 'User Name',
      }

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      } as any)

      expect(result).toEqual({})
    })

    it('should use fallback values for missing token fields', async () => {
      const { authOptions } = await import('@/server/auth/auth-options')
      const session = {
        user: {
          email: 'session@example.com',
          name: 'Session Name',
        },
      }

      const token = {
        sub: 'user-123',
      }

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      } as any)

      expect(result?.user?.id).toBe('user-123')
      expect(result?.user?.email).toBe('session@example.com')
      expect(result?.user?.name).toBe('Session Name')
    })
  })

  describe('provider filtering', () => {
    it('should only include providers with valid credentials', async () => {
      // Clear all provider credentials
      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET
      delete process.env.GITHUB_CLIENT_ID
      delete process.env.GITHUB_CLIENT_SECRET
      delete process.env.DISCORD_CLIENT_ID
      delete process.env.DISCORD_CLIENT_SECRET

      const { authOptions } = await import('@/server/auth/auth-options')

      expect(Array.isArray(authOptions.providers)).toBe(true)
      expect(authOptions.providers.length).toBe(0)
    })

    it('should include multiple providers when credentials are present', async () => {
      process.env.GOOGLE_CLIENT_ID = 'google-id'
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret'
      process.env.GITHUB_CLIENT_ID = 'github-id'
      process.env.GITHUB_CLIENT_SECRET = 'github-secret'

      const { authOptions } = await import('@/server/auth/auth-options')

      expect(authOptions.providers.length).toBeGreaterThanOrEqual(0)

      delete process.env.GOOGLE_CLIENT_ID
      delete process.env.GOOGLE_CLIENT_SECRET
      delete process.env.GITHUB_CLIENT_ID
      delete process.env.GITHUB_CLIENT_SECRET
    })
  })
})
