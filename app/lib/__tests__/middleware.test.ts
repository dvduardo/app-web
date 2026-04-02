import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withAuth } from '../middleware'
import { NextRequest, NextResponse } from 'next/server'

// Mock getCurrentUser
vi.mock('../auth', () => ({
  getCurrentUser: vi.fn(),
}))

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('withAuth', () => {
    it('should allow authenticated users through', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-123', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const mockHandler = vi.fn(async (req, ctx) => {
        return new NextResponse(JSON.stringify({ message: 'success' }))
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'))
      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(mockHandler).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it('should reject unauthenticated users with 401', async () => {
      const { getCurrentUser } = await import('../auth')
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

      const mockHandler = vi.fn()

      const request = new NextRequest(new URL('http://localhost:3000/api/test'))
      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(response.status).toBe(401)
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should pass userId in context to handler', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-456', email: 'another@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const mockHandler = vi.fn(async (req, ctx) => {
        expect(ctx.userId).toBe('user-456')
        return new NextResponse(JSON.stringify({ userId: ctx.userId }))
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'))
      const middleware = await withAuth(mockHandler)
      await middleware(request)

      expect(mockHandler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ userId: 'user-456' })
      )
    })

    it('should return 401 response for unauthenticated', async () => {
      const { getCurrentUser } = await import('../auth')
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

      const mockHandler = vi.fn()

      const request = new NextRequest(new URL('http://localhost:3000/api/test'))
      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('should preserve request information when authorized', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-789', email: 'user@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      let capturedRequest: NextRequest | null = null
      const mockHandler = vi.fn(async (req, ctx) => {
        capturedRequest = req
        return new NextResponse(JSON.stringify({ method: req.method }))
      })

      const requestUrl = new URL('http://localhost:3000/api/test?param=value')
      const request = new NextRequest(requestUrl, {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      })

      const middleware = await withAuth(mockHandler)
      await middleware(request)

      expect(capturedRequest?.method).toBe('POST')
      expect(capturedRequest?.url).toContain('/api/test')
    })

    it('should handle handler errors gracefully', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-123', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const handlerError = new Error('Handler failed')
      const mockHandler = vi.fn(async () => {
        throw handlerError
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'))
      const middleware = await withAuth(mockHandler)

      try {
        await middleware(request)
      } catch (error) {
        expect(error).toBe(handlerError)
      }
    })

    it('should work with GET requests', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-123', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const mockHandler = vi.fn(async (req) => {
        expect(req.method).toBe('GET')
        return new NextResponse('OK')
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'GET',
      })

      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should work with POST requests', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-123', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const mockHandler = vi.fn(async (req) => {
        expect(req.method).toBe('POST')
        return new NextResponse('Created')
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'POST',
      })

      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should work with PUT requests', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-123', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const mockHandler = vi.fn(async (req) => {
        expect(req.method).toBe('PUT')
        return new NextResponse('Updated')
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'PUT',
      })

      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should work with DELETE requests', async () => {
      const { getCurrentUser } = await import('../auth')
      const mockUser = { userId: 'user-123', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any)

      const mockHandler = vi.fn(async (req) => {
        expect(req.method).toBe('DELETE')
        return new NextResponse('Deleted')
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'DELETE',
      })

      const middleware = await withAuth(mockHandler)
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })
  })
})
