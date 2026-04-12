import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDashboardFilters } from '@/hooks/use-dashboard-filters'

// useCategories is used inside the hook to validate effectiveCategoryId.
// We mock it here so the hook is testable without a network or QueryClient.
vi.mock('@/hooks/use-categories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { id: 'cat-1', name: 'Mangás', itemCount: 5 },
      { id: 'cat-empty', name: 'Vazia', itemCount: 0 },
    ],
    refetch: vi.fn(),
    createCategory: vi.fn(),
    isCreating: false,
    isLoading: false,
    error: null,
  })),
}))

describe('useDashboardFilters', () => {
  describe('estado inicial', () => {
    it('retorna valores padrão corretos', () => {
      const { result } = renderHook(() => useDashboardFilters())

      expect(result.current.search).toBe('')
      expect(result.current.deferredSearch).toBe('')
      expect(result.current.page).toBe(1)
      expect(result.current.viewMode).toBe('grid')
      expect(result.current.selectedCategoryId).toBe('')
      expect(result.current.selectedStatus).toBe('')
      expect(result.current.favoritesOnly).toBe(false)
      expect(result.current.effectiveCategoryId).toBe('')
      expect(result.current.activeTab).toBe('all')
    })
  })

  describe('handleSearchChange', () => {
    it('atualiza a busca e reseta a página para 1', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.setPage(3) })
      act(() => { result.current.handleSearchChange('one piece') })

      expect(result.current.search).toBe('one piece')
      expect(result.current.page).toBe(1)
    })
  })

  describe('handleCategoryChange', () => {
    it('atualiza a categoria e reseta a página para 1', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.setPage(2) })
      act(() => { result.current.handleCategoryChange('cat-1') })

      expect(result.current.selectedCategoryId).toBe('cat-1')
      expect(result.current.page).toBe(1)
    })
  })

  describe('handleStatusChange', () => {
    it('atualiza o status e reseta a página para 1', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.setPage(2) })
      act(() => { result.current.handleStatusChange('owned') })

      expect(result.current.selectedStatus).toBe('owned')
      expect(result.current.page).toBe(1)
    })
  })

  describe('toggleFavoritesOnly', () => {
    it('alterna favoritesOnly e reseta a página', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.setPage(2) })

      act(() => { result.current.toggleFavoritesOnly() })
      expect(result.current.favoritesOnly).toBe(true)
      expect(result.current.page).toBe(1)

      act(() => { result.current.setPage(3) })
      act(() => { result.current.toggleFavoritesOnly() })
      expect(result.current.favoritesOnly).toBe(false)
      expect(result.current.page).toBe(1)
    })
  })

  describe('toggleWishlist', () => {
    it('alterna selectedStatus entre "wishlist" e vazio', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.toggleWishlist() })
      expect(result.current.selectedStatus).toBe('wishlist')
      expect(result.current.page).toBe(1)

      act(() => { result.current.setPage(2) })
      act(() => { result.current.toggleWishlist() })
      expect(result.current.selectedStatus).toBe('')
      expect(result.current.page).toBe(1)
    })
  })

  describe('effectiveCategoryId', () => {
    it('retorna a categoria quando ela tem itens', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.handleCategoryChange('cat-1') })

      expect(result.current.effectiveCategoryId).toBe('cat-1')
    })

    it('retorna vazio quando a categoria não tem itens (evita filtro fantasma)', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.handleCategoryChange('cat-empty') })

      expect(result.current.effectiveCategoryId).toBe('')
    })

    it('retorna vazio quando a categoria não existe', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.handleCategoryChange('inexistente') })

      expect(result.current.effectiveCategoryId).toBe('')
    })
  })

  describe('activeTab (derivado — nunca estado separado)', () => {
    it('é "all" no estado inicial', () => {
      const { result } = renderHook(() => useDashboardFilters())
      expect(result.current.activeTab).toBe('all')
    })

    it('é "favorites" quando favoritesOnly é true', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.toggleFavoritesOnly() })

      expect(result.current.activeTab).toBe('favorites')
    })

    it('é "wishlist" quando selectedStatus é "wishlist"', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.handleStatusChange('wishlist') })

      expect(result.current.activeTab).toBe('wishlist')
    })

    it('volta para "all" ao desativar favoritesOnly', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.toggleFavoritesOnly() })
      act(() => { result.current.toggleFavoritesOnly() })

      expect(result.current.activeTab).toBe('all')
    })
  })

  describe('activateTab', () => {
    it('ativa "favorites" de forma atômica (seta ambos os estados)', () => {
      const { result } = renderHook(() => useDashboardFilters())

      // Pre-set selectedStatus to ensure it gets cleared
      act(() => { result.current.handleStatusChange('owned') })

      act(() => { result.current.activateTab('favorites') })

      expect(result.current.favoritesOnly).toBe(true)
      expect(result.current.selectedStatus).toBe('')
      expect(result.current.activeTab).toBe('favorites')
      expect(result.current.page).toBe(1)
    })

    it('ativa "wishlist" de forma atômica', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.toggleFavoritesOnly() })

      act(() => { result.current.activateTab('wishlist') })

      expect(result.current.favoritesOnly).toBe(false)
      expect(result.current.selectedStatus).toBe('wishlist')
      expect(result.current.activeTab).toBe('wishlist')
    })

    it('volta para "all" limpando ambos os estados', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.activateTab('favorites') })
      act(() => { result.current.activateTab('all') })

      expect(result.current.favoritesOnly).toBe(false)
      expect(result.current.selectedStatus).toBe('')
      expect(result.current.activeTab).toBe('all')
    })
  })

  describe('setViewMode', () => {
    it('altera o modo de visualização', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.setViewMode('list') })
      expect(result.current.viewMode).toBe('list')

      act(() => { result.current.setViewMode('grid') })
      expect(result.current.viewMode).toBe('grid')
    })

    it('não reseta a página ao mudar o modo de visualização', () => {
      const { result } = renderHook(() => useDashboardFilters())

      act(() => { result.current.setPage(3) })
      act(() => { result.current.setViewMode('list') })

      expect(result.current.page).toBe(3)
    })
  })
})
