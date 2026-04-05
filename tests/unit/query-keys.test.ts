import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/query-keys'

describe('query-keys', () => {
  it('builds the base query keys', () => {
    expect(queryKeys.items.all()).toEqual(['items'])
    expect(queryKeys.categories.all()).toEqual(['categories'])
    expect(queryKeys.customFields.all()).toEqual(['custom-fields'])
  })

  it('builds list and detail query keys', () => {
    const params = {
      page: 2,
      limit: 12,
      search: 'gameboy',
      categoryId: 'cat-1',
      status: 'owned',
      favoritesOnly: true,
    }

    expect(queryKeys.items.list(params)).toEqual(['items', 'list', params])
    expect(queryKeys.items.detail('item-1')).toEqual(['items', 'item-1'])
  })
})
