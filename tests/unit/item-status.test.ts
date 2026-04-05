import { describe, expect, it } from 'vitest'
import { getItemStatusMeta, itemStatusOptions } from '@/lib/item-status'

describe('item-status', () => {
  it('exposes the expected status options', () => {
    expect(itemStatusOptions.map((option) => option.value)).toEqual([
      'owned',
      'wishlist',
      'loaned',
    ])
  })

  it('returns matching metadata for a known status', () => {
    expect(getItemStatusMeta('wishlist')).toEqual(itemStatusOptions[1])
  })

  it('falls back to owned when status is unknown', () => {
    expect(getItemStatusMeta('missing')).toEqual(itemStatusOptions[0])
    expect(getItemStatusMeta(undefined)).toEqual(itemStatusOptions[0])
  })
})
