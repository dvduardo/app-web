import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/server/auth/jwt', () => ({
  getCurrentUser: vi.fn(),
}))

describe('requireUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user when authenticated', async () => {
    const { getCurrentUser } = await import('@/server/auth/jwt')
    const mockUser = { userId: 'user-123', email: 'test@example.com' }
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

    const { requireUser } = await import('@/server/auth/require-user')
    const result = await requireUser()

    expect(result.user).toEqual(mockUser)
    expect(result.response).toBeNull()
  })

  it('should return 401 response when not authenticated', async () => {
    const { getCurrentUser } = await import('@/server/auth/jwt')
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

    const { requireUser } = await import('@/server/auth/require-user')
    const result = await requireUser()

    expect(result.user).toBeNull()
    expect(result.response).toBeInstanceOf(NextResponse)
    expect(result.response?.status).toBe(401)

    const body = await result.response?.json()
    expect(body.error).toBe('Unauthorized')
  })
})
