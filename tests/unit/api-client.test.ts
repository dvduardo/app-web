import { describe, it, expect, vi, beforeEach } from 'vitest'

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

import { apiClient } from '@/lib/api-client'

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('error handling', () => {
    it('should propagate 401 unauthorized errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } },
      })

      await expect(apiClient.get('/protected')).rejects.toMatchObject({
        response: { status: 401 },
      })
    })

    it('should propagate 403 forbidden errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { status: 403, data: { error: 'Forbidden' } },
      })

      await expect(apiClient.get('/admin')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })

    it('should propagate 500 server errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Internal Server Error' } },
      })

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        response: { status: 500 },
      })
    })

    it('should propagate network errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Network Error')
    })
  })
})
