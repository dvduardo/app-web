import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/server/auth/jwt', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/server/auth/auth-options', () => ({
  authOptions: {},
}))

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user from session when available', async () => {
    const { getServerSession } = await import('next-auth/next')
    const mockSession = {
      user: {
        id: 'session-user-123',
        email: 'session@example.com',
        name: 'Session User',
      },
    }

    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession as any)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toEqual({
      userId: 'session-user-123',
      email: 'session@example.com',
      name: 'Session User',
    })
  })

  it('should handle session with missing name', async () => {
    const { getServerSession } = await import('next-auth/next')
    const mockSession = {
      user: {
        id: 'session-user-123',
        email: 'session@example.com',
      },
    }

    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession as any)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toEqual({
      userId: 'session-user-123',
      email: 'session@example.com',
      name: undefined,
    })
  })

  it('should return null when session has no user id', async () => {
    const { getServerSession } = await import('next-auth/next')
    const mockSession = {
      user: {
        email: 'session@example.com',
      },
    }

    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession as any)

    const { getCurrentUser } = await import('@/server/auth/jwt')
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toBeNull()
  })

  it('should return null when session has no email', async () => {
    const { getServerSession } = await import('next-auth/next')
    const mockSession = {
      user: {
        id: 'session-user-123',
      },
    }

    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession as any)

    const { getCurrentUser } = await import('@/server/auth/jwt')
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toBeNull()
  })

  it('should fall back to legacy JWT auth when session fails with outside request scope error', async () => {
    const { getServerSession } = await import('next-auth/next')
    const mockError = new Error(
      'some error about outside a request scope context'
    )

    vi.mocked(getServerSession).mockRejectedValueOnce(mockError)

    const { getCurrentUser } = await import('@/server/auth/jwt')
    const mockLegacyUser = {
      userId: 'legacy-user-123',
      email: 'legacy@example.com',
      name: 'Legacy User',
    }

    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockLegacyUser)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toEqual(mockLegacyUser)
  })

  it('should throw error when getServerSession fails with non-scope error', async () => {
    const { getServerSession } = await import('next-auth/next')
    const mockError = new Error('Some other database error')

    vi.mocked(getServerSession).mockRejectedValueOnce(mockError)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )

    await expect(getAuthenticatedUser()).rejects.toThrow(
      'Some other database error'
    )
  })

  it('should throw error when non-Error object is thrown', async () => {
    const { getServerSession } = await import('next-auth/next')

    vi.mocked(getServerSession).mockRejectedValueOnce('string error')

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )

    await expect(getAuthenticatedUser()).rejects.toThrow('string error')
  })

  it('should return legacy user when session is null', async () => {
    const { getServerSession } = await import('next-auth/next')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const { getCurrentUser } = await import('@/server/auth/jwt')
    const mockLegacyUser = {
      userId: 'legacy-user-123',
      email: 'legacy@example.com',
    }

    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockLegacyUser)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toEqual(mockLegacyUser)
  })

  it('should return null when both session and legacy auth fail', async () => {
    const { getServerSession } = await import('next-auth/next')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const { getCurrentUser } = await import('@/server/auth/jwt')
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

    const { getAuthenticatedUser } = await import(
      '@/server/auth/get-authenticated-user'
    )
    const user = await getAuthenticatedUser()

    expect(user).toBeNull()
  })
})
