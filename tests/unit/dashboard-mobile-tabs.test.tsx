import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardMobileTabs } from '@/app/components/items/dashboard-mobile-tabs'
import type { DashboardTab } from '@/hooks/use-dashboard-filters'

function renderTabs(activeTab: DashboardTab, onTabChange = vi.fn()) {
  return render(
    <DashboardMobileTabs activeTab={activeTab} onTabChange={onTabChange} />,
  )
}

describe('DashboardMobileTabs', () => {
  describe('renderização', () => {
    it('renderiza as 3 abas', () => {
      renderTabs('all')

      expect(screen.getByRole('tab', { name: /Coleção/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Favoritos/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Desejos/i })).toBeInTheDocument()
    })

    it('renderiza o tablist com aria-label correto', () => {
      renderTabs('all')

      expect(
        screen.getByRole('tablist', { name: /Contexto do dashboard/i }),
      ).toBeInTheDocument()
    })
  })

  describe('aba ativa via aria-selected', () => {
    it('marca "Coleção" como ativa quando activeTab é "all"', () => {
      renderTabs('all')

      expect(screen.getByRole('tab', { name: /Coleção/i })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('tab', { name: /Favoritos/i })).toHaveAttribute(
        'aria-selected',
        'false',
      )
      expect(screen.getByRole('tab', { name: /Desejos/i })).toHaveAttribute(
        'aria-selected',
        'false',
      )
    })

    it('marca "Favoritos" como ativa quando activeTab é "favorites"', () => {
      renderTabs('favorites')

      expect(screen.getByRole('tab', { name: /Favoritos/i })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('tab', { name: /Coleção/i })).toHaveAttribute(
        'aria-selected',
        'false',
      )
      expect(screen.getByRole('tab', { name: /Desejos/i })).toHaveAttribute(
        'aria-selected',
        'false',
      )
    })

    it('marca "Desejos" como ativa quando activeTab é "wishlist"', () => {
      renderTabs('wishlist')

      expect(screen.getByRole('tab', { name: /Desejos/i })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('tab', { name: /Coleção/i })).toHaveAttribute(
        'aria-selected',
        'false',
      )
      expect(screen.getByRole('tab', { name: /Favoritos/i })).toHaveAttribute(
        'aria-selected',
        'false',
      )
    })
  })

  describe('interação', () => {
    it('chama onTabChange com "favorites" ao clicar em Favoritos', async () => {
      const onTabChange = vi.fn()
      renderTabs('all', onTabChange)

      await userEvent.click(screen.getByRole('tab', { name: /Favoritos/i }))

      expect(onTabChange).toHaveBeenCalledOnce()
      expect(onTabChange).toHaveBeenCalledWith('favorites')
    })

    it('chama onTabChange com "wishlist" ao clicar em Desejos', async () => {
      const onTabChange = vi.fn()
      renderTabs('all', onTabChange)

      await userEvent.click(screen.getByRole('tab', { name: /Desejos/i }))

      expect(onTabChange).toHaveBeenCalledWith('wishlist')
    })

    it('chama onTabChange com "all" ao clicar em Coleção', async () => {
      const onTabChange = vi.fn()
      renderTabs('favorites', onTabChange)

      await userEvent.click(screen.getByRole('tab', { name: /Coleção/i }))

      expect(onTabChange).toHaveBeenCalledWith('all')
    })

    it('não chama onTabChange mais de uma vez por clique', async () => {
      const onTabChange = vi.fn()
      renderTabs('all', onTabChange)

      await userEvent.click(screen.getByRole('tab', { name: /Favoritos/i }))

      expect(onTabChange).toHaveBeenCalledOnce()
    })
  })
})
