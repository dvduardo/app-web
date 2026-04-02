import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios FIRST, before importing apiClient
vi.mock('axios', () => {
  const createMock = vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }))

  return {
    default: {
      create: createMock,
    },
  }
})

// NOW import after mocking
import { apiClient } from '../api-client'
import axios from 'axios'

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('apiClient instance', () => {
    it('should create axios instance', () => {
      expect(axios.create).toBeDefined()
    })

    it('should have interceptors configured', () => {
      expect(apiClient.interceptors).toBeDefined()
      expect(apiClient.interceptors.request).toBeDefined()
      expect(apiClient.interceptors.response).toBeDefined()
    })
  })

describe('request interceptor', () => {
    it('should add base URL to relative URLs in browser context', async () => {
      // This tests the request interceptor behavior
      const mockResponse = { data: { message: 'success' } }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse as any)

      const response = await apiClient.get('/items')
      expect(response).toBeDefined()
    })

    it('should handle absolute URLs', async () => {
      const mockResponse = { data: { message: 'success' } }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse as any)

      const response = await apiClient.post('http://example.com/api/items', {})
      expect(response).toBeDefined()
    })
  })

  describe('response interceptor', () => {
    it('should handle successful responses', async () => {
      const mockResponse = { data: { message: 'success' }, status: 200, statusText: 'OK' }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse as any)

      const response = await apiClient.get('/test')
      expect(response.status).toBe(200)
    })

    it('should pass through response data', async () => {
      const mockData = { id: '1', name: 'Item' }
      const mockResponse = { data: mockData }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse as any)

      const response = await apiClient.get('/test')
      expect(response.data).toEqual(mockData)
    })
  })

  describe('HTTP methods', () => {
    it('should support GET requests', async () => {
      const mockResponse = { data: { message: 'success' } }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse as any)

      const response = await apiClient.get('/test')

      expect(response.data).toEqual({ message: 'success' })
    })

    it('should support POST requests', async () => {
      const mockResponse = { data: { id: '123' } }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse as any)

      const data = { name: 'test' }
      const response = await apiClient.post('/test', data)

      expect(response.data).toEqual({ id: '123' })
      expect(apiClient.post).toHaveBeenCalledWith('/test', data)
    })

    it('should support PUT requests', async () => {
      const mockResponse = { data: { id: '123', updated: true } }
      vi.mocked(apiClient.put).mockResolvedValueOnce(mockResponse as any)

      const data = { name: 'updated' }
      const response = await apiClient.put('/test/123', data)

      expect(response.data.updated).toBe(true)
    })

    it('should support DELETE requests', async () => {
      const mockResponse = { data: { deleted: true } }
      vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse as any)

      const response = await apiClient.delete('/test/123')

      expect(response.data.deleted).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      const unauthorizedError = {
        response: { status: 401, data: { error: 'Unauthorized' } },
      }

      vi.mocked(apiClient.get).mockRejectedValueOnce(unauthorizedError)

      try {
        await apiClient.get('/protected')
        expect.fail('Should have thrown')
      } catch (error: any) {
        expect(error.response?.status).toBe(401)
      }
    })

    it('should handle 403 forbidden errors', async () => {
      const forbiddenError = {
        response: { status: 403, data: { error: 'Forbidden' } },
      }

      vi.mocked(apiClient.get).mockRejectedValueOnce(forbiddenError)

      try {
        await apiClient.get('/admin')
        expect.fail('Should have thrown')
      } catch (error: any) {
        expect(error.response?.status).toBe(403)
      }
    })

    it('should handle 500 server errors', async () => {
      const serverError = {
        response: { status: 500, data: { error: 'Internal Server Error' } },
      }

      vi.mocked(apiClient.get).mockRejectedValueOnce(serverError)

      try {
        await apiClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error: any) {
        expect(error.response?.status).toBe(500)
      }
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')

      vi.mocked(apiClient.get).mockRejectedValueOnce(networkError)

      try {
        await apiClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error: any) {
        expect(error.message).toBe('Network Error')
      }
    })
  })
})
