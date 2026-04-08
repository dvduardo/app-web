import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useCategories } from '@/hooks/use-categories'
import * as apiClientModule from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCategories', () => {
  const mockApiClient = apiClientModule.apiClient as {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty categories array while loading', () => {
    mockApiClient.get.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() })

    expect(result.current.categories).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('returns categories after successful fetch', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Games', itemCount: 3 },
      { id: 'cat-2', name: 'Books', itemCount: 1 },
    ]
    mockApiClient.get.mockResolvedValueOnce({ data: { categories: mockCategories } })

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toEqual(mockCategories)
    expect(result.current.error).toBeNull()
  })

  it('exposes error when fetch fails', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.categories).toEqual([])
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useCategories(false), { wrapper: makeWrapper() })

    expect(mockApiClient.get).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })

  it('creates a category and invalidates queries on success', async () => {
    const existingCategories = [{ id: 'cat-1', name: 'Games', itemCount: 3 }]
    const newCategory = { id: 'cat-2', name: 'Books', itemCount: 0 }

    mockApiClient.get.mockResolvedValue({ data: { categories: existingCategories } })
    mockApiClient.post.mockResolvedValueOnce({ data: { category: newCategory } })

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.createCategory({ name: 'Books' })
    })

    expect(mockApiClient.post).toHaveBeenCalledWith('/categories', { name: 'Books' })
  })

  it('tracks isCreating state during category creation', async () => {
    mockApiClient.get.mockResolvedValue({ data: { categories: [] } })

    let resolveCreate!: (value: unknown) => void
    const pendingCreate = new Promise((resolve) => {
      resolveCreate = resolve
    })
    mockApiClient.post.mockReturnValueOnce(pendingCreate)

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      void result.current.createCategory({ name: 'New Cat' })
    })

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true)
    })

    resolveCreate({ data: { category: { id: 'cat-new', name: 'New Cat', itemCount: 0 } } })

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false)
    })
  })
})
