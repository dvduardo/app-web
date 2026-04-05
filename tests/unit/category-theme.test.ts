import { describe, expect, it } from 'vitest'
import { getCategoryTheme } from '@/lib/category-theme'

describe('category-theme', () => {
  it('returns gray fallback when category is missing', () => {
    expect(getCategoryTheme(undefined)).toEqual({
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      chip: 'data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:border-gray-900',
    })
  })

  it('returns a stable theme for the same category name', () => {
    expect(getCategoryTheme('Games')).toEqual(getCategoryTheme('Games'))
  })

  it('returns one of the supported theme variants for a category name', () => {
    const theme = getCategoryTheme('Livros')

    expect(theme.badge).toMatch(/bg-(amber|emerald|sky|rose|indigo)-100/)
    expect(theme.chip).toContain('data-[active=true]')
  })
})
