import { describe, it, expect, vi } from 'vitest'
import { addCorsHeaders, handleCorsPreFlight } from '@/server/http/cors'
import { NextResponse } from 'next/server'

describe('cors', () => {
  describe('addCorsHeaders', () => {
    it('should add base CORS headers to response', () => {
      const response = new NextResponse(null)
      const result = addCorsHeaders(response)

      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull()
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      expect(result.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization'
      )
      expect(result.headers.get('Access-Control-Max-Age')).toBe('86400')
    })

    it('should preserve existing headers on the response', () => {
      const response = new NextResponse('test body')
      response.headers.set('X-Custom-Header', 'custom-value')

      const result = addCorsHeaders(response)

      expect(result.headers.get('X-Custom-Header')).toBe('custom-value')
    })

    it('should allow configured origin and set credentials headers', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://frontend.example.com'

      const response = new NextResponse(null)
      const result = addCorsHeaders(response, 'https://frontend.example.com')

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://frontend.example.com')
      expect(result.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(result.headers.get('Vary')).toBe('Origin')

      delete process.env.CORS_ALLOWED_ORIGINS
    })

    it('should allow localhost origin when CORS_ALLOWED_ORIGINS is not set', () => {
      vi.stubEnv('CORS_ALLOWED_ORIGINS', '')
      vi.stubEnv('NODE_ENV', 'development')

      const response = new NextResponse(null)
      const result = addCorsHeaders(response, 'http://localhost:3000')

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')

      vi.unstubAllEnvs()
    })

    it('should block origin in production when CORS_ALLOWED_ORIGINS is not set', () => {
      vi.stubEnv('CORS_ALLOWED_ORIGINS', '')
      vi.stubEnv('NODE_ENV', 'production')

      const response = new NextResponse(null)
      const result = addCorsHeaders(response, 'http://localhost:3000')

      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull()

      vi.unstubAllEnvs()
    })
  })

  describe('handleCorsPreFlight', () => {
    it('should return 200 with standard CORS headers', () => {
      const result = handleCorsPreFlight()

      expect(result.status).toBe(200)
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      expect(result.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization'
      )
    })

    it('should return empty body', async () => {
      const result = handleCorsPreFlight()
      const text = await result.text()
      expect(text).toBe('')
    })
  })
})
