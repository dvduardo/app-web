import { describe, expect, it } from 'vitest'
import {
  categorySchema,
  customFieldSchema,
  deleteCustomFieldSchema,
  itemSchema,
  itemUpdateSchema,
} from '@/lib/schemas/item'

describe('item schemas', () => {
  it('normalizes and validates item creation payloads', () => {
    const result = itemSchema.parse({
      categoryId: '  cat-1  ',
      title: '  Gameboy  ',
      description: '   ',
      status: ' wishlist ',
      isFavorite: 'true',
      customData: '{"edition":"limited"}',
    })

    expect(result).toEqual({
      categoryId: 'cat-1',
      title: 'Gameboy',
      description: null,
      status: 'wishlist',
      isFavorite: true,
      customData: { edition: 'limited' },
    })
  })

  it('uses defaults when optional item fields are omitted', () => {
    const result = itemSchema.parse({
      categoryId: 'cat-1',
      title: 'Gameboy',
    })

    expect(result.status).toBe('owned')
    expect(result.isFavorite).toBe(false)
    expect(result.customData).toEqual({})
    expect(result.description).toBeNull()
  })

  it('handles nullable and invalid custom payload branches', () => {
    const withNullDescription = itemSchema.parse({
      categoryId: 'cat-1',
      title: 'Gameboy',
      description: null,
      isFavorite: false,
      customData: { platform: 'gba' },
    })

    const invalidCustomData = itemSchema.safeParse({
      categoryId: 'cat-1',
      title: 'Gameboy',
      customData: 'not-json',
    })

    expect(withNullDescription.description).toBeNull()
    expect(withNullDescription.isFavorite).toBe(false)
    expect(withNullDescription.customData).toEqual({ platform: 'gba' })
    expect(invalidCustomData.success).toBe(false)
  })

  it('keeps raw invalid string customData on update preprocessing and lets schema reject it', () => {
    const result = itemUpdateSchema.safeParse({
      customData: 'not-json',
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid item creation payloads', () => {
    const result = itemSchema.safeParse({
      categoryId: '',
      title: '',
      status: 'missing',
    })

    expect(result.success).toBe(false)
  })

  it('normalizes partial update payloads', () => {
    const result = itemUpdateSchema.parse({
      description: '   ',
      isFavorite: 'false',
      customData: '{"platform":"gba"}',
    })

    expect(result).toEqual({
      description: null,
      isFavorite: false,
      customData: { platform: 'gba' },
    })
  })

  it('keeps nullable and passthrough branches on updates', () => {
    const result = itemUpdateSchema.parse({
      description: null,
      isFavorite: true,
      customData: { platform: 'gba' },
    })

    expect(result).toEqual({
      description: null,
      isFavorite: true,
      customData: { platform: 'gba' },
    })
  })

  it('rejects empty update payloads', () => {
    const result = itemUpdateSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('validates custom field, delete field and category payloads', () => {
    expect(customFieldSchema.parse({ fieldName: '  Plataforma ', fieldType: '  text ' })).toEqual({
      fieldName: 'Plataforma',
      fieldType: 'text',
    })

    expect(deleteCustomFieldSchema.parse({ fieldId: '  field-1  ' })).toEqual({
      fieldId: 'field-1',
    })

    expect(categorySchema.parse({ name: '  Games  ' })).toEqual({
      name: 'Games',
    })
  })
})
