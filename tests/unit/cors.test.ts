import { describe, it, expect } from 'vitest'
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

    it('should return the modified response', () => {
      const response = new NextResponse(null)
      const result = addCorsHeaders(response)

      expect(result).toBeInstanceOf(NextResponse)
    })

    it('should handle response with existing headers', () => {
      const response = new NextResponse('test body')
      response.headers.set('X-Custom-Header', 'custom-value')

      const result = addCorsHeaders(response)

      expect(result.headers.get('X-Custom-Header')).toBe('custom-value')
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('should set correct Max-Age value in seconds', () => {
      const response = new NextResponse(null)
      const result = addCorsHeaders(response)

      const maxAge = result.headers.get('Access-Control-Max-Age')
      expect(maxAge).toBe('86400') // 24 hours in seconds
      expect(Number(maxAge)).toBe(86400)
    })

    it('should include all required HTTP methods', () => {
      const response = new NextResponse(null)
      const result = addCorsHeaders(response)

      const methods = result.headers.get('Access-Control-Allow-Methods')
      expect(methods).toContain('GET')
      expect(methods).toContain('POST')
      expect(methods).toContain('PUT')
      expect(methods).toContain('DELETE')
      expect(methods).toContain('OPTIONS')
    })

    it('should allow Authorization header', () => {
      const response = new NextResponse(null)
      const result = addCorsHeaders(response)

      const headers = result.headers.get('Access-Control-Allow-Headers')
      expect(headers).toContain('Authorization')
    })

    it('should allow Content-Type header', () => {
      const response = new NextResponse(null)
      const result = addCorsHeaders(response)

      const headers = result.headers.get('Access-Control-Allow-Headers')
      expect(headers).toContain('Content-Type')
    })
    it('should allow configured origin and credentials', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://frontend.example.com'

      const response = new NextResponse(null)
      const result = addCorsHeaders(response, 'https://frontend.example.com')

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://frontend.example.com')
      expect(result.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(result.headers.get('Vary')).toBe('Origin')
      delete process.env.CORS_ALLOWED_ORIGINS
    })
  })

  describe('handleCorsPreFlight', () => {
    it('should return a 200 OK response for preflight requests', () => {
      const result = handleCorsPreFlight()

      expect(result.status).toBe(200)
    })

    it('should include standard CORS headers in preflight response', () => {
      const result = handleCorsPreFlight()

      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull()
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      expect(result.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization'
      )
    })

    it('should return NextResponse instance', () => {
      const result = handleCorsPreFlight()

      expect(result).toBeInstanceOf(NextResponse)
    })

    it('should have empty body for preflight response', async () => {
      const result = handleCorsPreFlight()

      const text = await result.text()
      expect(text).toBe('')
    })

    it('should return 200 status for OPTIONS method', () => {
      const result = handleCorsPreFlight()

      expect(result.status).toBe(200)
      expect(result.statusText).not.toBe('404')
      expect(result.statusText).not.toBe('400')
    })
  })
})
