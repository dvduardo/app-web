import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPhotoSrc, Photo } from '@/frontend/lib/photo-helper'

describe('photo-helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getPhotoSrc', () => {
    it('should return empty string for null photo', () => {
      const result = getPhotoSrc(null)
      expect(result).toBe('')
    })

    it('should return empty string for undefined photo', () => {
      const result = getPhotoSrc(undefined)
      expect(result).toBe('')
    })

    it('should return empty string when photo has no data', () => {
      const photo: Photo = { id: '1' }
      const result = getPhotoSrc(photo)
      expect(result).toBe('')
    })

    it('should create object URL from File object', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const photo: Photo = { file: mockFile }

      // Mock URL.createObjectURL
      const mockObjectUrl = 'blob:http://localhost:3000/123'
      global.URL.createObjectURL = vi.fn(() => mockObjectUrl)

      const result = getPhotoSrc(photo)
      expect(result).toBe(mockObjectUrl)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile)
    })

    it('should prioritize File object over base64 data', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const photo: Photo = {
        file: mockFile,
        data: 'base64encodedstring',
        mimeType: 'image/jpeg',
      }

      const mockObjectUrl = 'blob:http://localhost:3000/456'
      global.URL.createObjectURL = vi.fn(() => mockObjectUrl)

      const result = getPhotoSrc(photo)
      expect(result).toBe(mockObjectUrl)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile)
    })

    it('should create data URL from base64 data with mimeType', () => {
      const photo: Photo = {
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        mimeType: 'image/png',
      }

      const result = getPhotoSrc(photo)
      expect(result).toMatch(/^data:image\/png;base64,/)
      expect(result).toContain('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk')
    })

    it('should use fallback mime type when mimeType is missing', () => {
      const photo: Photo = {
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }

      const result = getPhotoSrc(photo)
      expect(result).toMatch(/^data:image\/jpeg;base64,/)
    })

    it('should use fallback mime type when mimeType is empty string', () => {
      const photo: Photo = {
        data: 'base64data',
        mimeType: '',
      }

      const result = getPhotoSrc(photo)
      expect(result).toMatch(/^data:image\/jpeg;base64,/)
    })

    it('should trim whitespace from mimeType', () => {
      const photo: Photo = {
        data: 'base64data',
        mimeType: '  image/webp  ',
      }

      const result = getPhotoSrc(photo)
      expect(result).toMatch(/^data:image\/webp;base64,/)
    })

    it('should handle mimeType with whitespace and use fallback if only whitespace', () => {
      const photo: Photo = {
        data: 'base64data',
        mimeType: '   ',
      }

      const result = getPhotoSrc(photo)
      // When mimeType is only whitespace, trim() makes it empty, so fallback is used
      // Note: console.warn is only called if !photo.mimeType is true, which is false here since the string exists
      expect(result).toMatch(/^data:image\/jpeg;base64,/)
      expect(result).toBe('data:image/jpeg;base64,base64data')
    })

    it('should handle various MIME types', () => {
      const mimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

      mimeTypes.forEach((mimeType) => {
        const photo: Photo = {
          data: 'base64encodeddata',
          mimeType,
        }

        const result = getPhotoSrc(photo)
        expect(result).toMatch(new RegExp(`^data:${mimeType};base64,`))
      })
    })

    it('should construct proper data URL format', () => {
      const base64Data = 'ABC123DEF456'
      const photo: Photo = {
        data: base64Data,
        mimeType: 'image/jpeg',
      }

      const result = getPhotoSrc(photo)
      expect(result).toBe(`data:image/jpeg;base64,${base64Data}`)
    })
  })
})
