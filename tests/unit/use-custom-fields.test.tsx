import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useCustomFields } from '@/hooks/use-custom-fields'
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

describe('useCustomFields', () => {
  const mockApiClient = apiClientModule.apiClient as {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array while loading', () => {
    mockApiClient.get.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useCustomFields(), { wrapper: makeWrapper() })

    expect(result.current.customFields).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('returns custom fields after successful fetch', async () => {
    const mockFields = [
      { id: 'field-1', fieldName: 'Platform', fieldType: 'text' },
      { id: 'field-2', fieldName: 'Year', fieldType: 'text' },
    ]
    mockApiClient.get.mockResolvedValueOnce({ data: { customFields: mockFields } })

    const { result } = renderHook(() => useCustomFields(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.customFields).toEqual(mockFields)
    expect(result.current.error).toBeNull()
  })

  it('returns empty array when response has no customFields', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: {} })

    const { result } = renderHook(() => useCustomFields(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.customFields).toEqual([])
  })

  it('exposes error when fetch fails', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(() => useCustomFields(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useCustomFields(false), { wrapper: makeWrapper() })

    expect(mockApiClient.get).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })

  it('adds a custom field and invalidates queries', async () => {
    const newField = { id: 'field-3', fieldName: 'Edition', fieldType: 'text' }
    mockApiClient.get.mockResolvedValue({ data: { customFields: [] } })
    mockApiClient.post.mockResolvedValueOnce({ data: { customField: newField } })

    const { result } = renderHook(() => useCustomFields(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addCustomField({ fieldName: 'Edition', fieldType: 'text' })
    })

    expect(mockApiClient.post).toHaveBeenCalledWith('/custom-fields', {
      fieldName: 'Edition',
      fieldType: 'text',
    })
  })

  it('removes a custom field and invalidates queries', async () => {
    const existingFields = [{ id: 'field-1', fieldName: 'Platform', fieldType: 'text' }]
    mockApiClient.get.mockResolvedValue({ data: { customFields: existingFields } })
    mockApiClient.delete.mockResolvedValueOnce({ data: {} })

    const { result } = renderHook(() => useCustomFields(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removeCustomField('field-1')
    })

    expect(mockApiClient.delete).toHaveBeenCalledWith('/custom-fields', {
      data: { fieldId: 'field-1' },
    })
  })
})
