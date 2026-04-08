import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useItems, type ItemsPage } from '@/hooks/use-items'
import * as apiClientModule from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

const emptyPage: ItemsPage = {
  items: [],
  totalCount: 0,
  totalPages: 1,
  page: 1,
  limit: 12,
  search: '',
  categoryId: '',
  status: '',
  favoritesOnly: false,
  stats: {
    totalItems: 0,
    favoriteItems: 0,
    wishlistItems: 0,
    ownedItems: 0,
    loanedItems: 0,
  },
}

describe('useItems', () => {
  const mockApiClient = apiClientModule.apiClient as {
    get: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns default values while loading', () => {
    mockApiClient.get.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    expect(result.current.items).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.totalCount).toBe(0)
    expect(result.current.totalPages).toBe(1)
  })

  it('returns items after successful fetch', async () => {
    const mockItem = {
      id: 'item-1',
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Games' },
      title: 'Gameboy',
      description: null,
      status: 'owned',
      isFavorite: false,
      customData: '{}',
      photos: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    const mockPage: ItemsPage = {
      ...emptyPage,
      items: [mockItem],
      totalCount: 1,
      totalPages: 1,
      stats: { totalItems: 1, favoriteItems: 0, wishlistItems: 0, ownedItems: 1, loanedItems: 0 },
    }
    mockApiClient.get.mockResolvedValueOnce({ data: mockPage })

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].title).toBe('Gameboy')
    expect(result.current.totalCount).toBe(1)
    expect(result.current.stats.totalItems).toBe(1)
  })

  it('exposes error when fetch fails', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Fetch failed'))

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.items).toEqual([])
  })

  it('uses provided pagination and filter parameters', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: emptyPage })

    const { result } = renderHook(
      () => useItems(2, 24, 'game', 'cat-1', 'owned', true),
      { wrapper: makeWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockApiClient.get).toHaveBeenCalledWith('/items', {
      params: {
        page: 2,
        limit: 24,
        search: 'game',
        categoryId: 'cat-1',
        status: 'owned',
        favoritesOnly: true,
      },
    })
  })

  it('deletes an item and invalidates queries', async () => {
    mockApiClient.get.mockResolvedValue({ data: emptyPage })
    mockApiClient.delete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteItem('item-1')
    })

    expect(mockApiClient.delete).toHaveBeenCalledWith('/items/item-1')
  })

  it('tracks isDeleting state during deletion', async () => {
    mockApiClient.get.mockResolvedValue({ data: emptyPage })

    let resolveDelete!: (value: unknown) => void
    const pendingDelete = new Promise((resolve) => {
      resolveDelete = resolve
    })
    mockApiClient.delete.mockReturnValueOnce(pendingDelete)

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      void result.current.deleteItem('item-1')
    })

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(true)
    })

    resolveDelete({})

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false)
    })
  })

  it('updates an item and invalidates queries', async () => {
    mockApiClient.get.mockResolvedValue({ data: emptyPage })
    mockApiClient.put.mockResolvedValueOnce({})

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateItem({ itemId: 'item-1', data: { isFavorite: true } })
    })

    expect(mockApiClient.put).toHaveBeenCalledWith('/items/item-1', { isFavorite: true })
  })

  it('tracks isUpdating state during update', async () => {
    mockApiClient.get.mockResolvedValue({ data: emptyPage })

    let resolveUpdate!: (value: unknown) => void
    const pendingUpdate = new Promise((resolve) => {
      resolveUpdate = resolve
    })
    mockApiClient.put.mockReturnValueOnce(pendingUpdate)

    const { result } = renderHook(() => useItems(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      void result.current.updateItem({ itemId: 'item-1', data: { status: 'wishlist' } })
    })

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(true)
    })

    resolveUpdate({})

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false)
    })
  })
})
