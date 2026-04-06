import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ALLOWED_ITEM_PHOTO_TYPES,
  MAX_ITEM_PHOTO_BYTES,
  buildPhotoPreview,
  optimizeImageFile,
  validatePhotoFile,
} from '@/lib/photo-upload'

describe('photo-upload', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap
  const originalToBlob = HTMLCanvasElement.prototype.toBlob
  const originalGetContext = HTMLCanvasElement.prototype.getContext

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.createImageBitmap = originalCreateImageBitmap
    HTMLCanvasElement.prototype.toBlob = originalToBlob
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('validates supported file types and max size', () => {
    const validFile = new File(['ok'], 'item.png', { type: ALLOWED_ITEM_PHOTO_TYPES[1] })
    const invalidTypeFile = new File(['ok'], 'item.txt', { type: 'text/plain' })
    const largeFile = new File([new Uint8Array(MAX_ITEM_PHOTO_BYTES + 1)], 'large.png', {
      type: 'image/png',
    })

    expect(validatePhotoFile(validFile)).toBeNull()
    expect(validatePhotoFile(invalidTypeFile)).toContain('Formato inválido')
    expect(validatePhotoFile(largeFile)).toContain('Arquivo muito grande')
  })

  it('returns the original file on the server or for gif files', async () => {
    const gifFile = new File(['gif'], 'item.gif', { type: 'image/gif' })
    expect(await optimizeImageFile(gifFile)).toBe(gifFile)
  })

  it('returns the original file when optimizeImageFile cannot generate a blob', async () => {
    const file = new File([new Uint8Array(4000)], 'item.jpeg', { type: 'image/jpeg' })
    const bitmap = { width: 2000, height: 1000, close: vi.fn() }

    globalThis.createImageBitmap = vi.fn().mockResolvedValue(bitmap) as typeof createImageBitmap
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({ drawImage: vi.fn() })
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (callback: BlobCallback) {
      callback(null)
    })

    await expect(optimizeImageFile(file)).resolves.toBe(file)
    expect(bitmap.close).toHaveBeenCalled()
  })

  it('returns the original file when window is unavailable', async () => {
    const file = new File(['content'], 'item.jpg', { type: 'image/jpeg' })
    const originalWindow = globalThis.window

    // @ts-expect-error test-only override
    delete globalThis.window

    await expect(optimizeImageFile(file)).resolves.toBe(file)

    globalThis.window = originalWindow
  })

  it('returns the original file when canvas context is unavailable', async () => {
    const file = new File(['content'], 'item.jpg', { type: 'image/jpeg' })
    const bitmap = { width: 1000, height: 500, close: vi.fn() }

    globalThis.createImageBitmap = vi.fn().mockResolvedValue(bitmap) as typeof createImageBitmap
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)

    await expect(optimizeImageFile(file)).resolves.toBe(file)
    expect(bitmap.close).toHaveBeenCalled()
  })

  it('returns an optimized file when the generated blob is smaller', async () => {
    const file = new File([new Uint8Array(4000)], 'item.jpeg', { type: 'image/jpeg' })
    const bitmap = { width: 2000, height: 1000, close: vi.fn() }
    const drawImage = vi.fn()

    globalThis.createImageBitmap = vi.fn().mockResolvedValue(bitmap) as typeof createImageBitmap
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({ drawImage })
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (callback: BlobCallback) {
      callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }))
    })

    const optimized = await optimizeImageFile(file)

    expect(drawImage).toHaveBeenCalled()
    expect(bitmap.close).toHaveBeenCalled()
    expect(optimized).not.toBe(file)
    expect(optimized.type).toBe('image/jpeg')
    expect(optimized.name).toBe('item.jpg')
  })

  it('keeps the original file when the optimized blob is not smaller', async () => {
    const file = new File([new Uint8Array(1000)], 'item.png', { type: 'image/png' })
    const bitmap = { width: 1000, height: 1000, close: vi.fn() }

    globalThis.createImageBitmap = vi.fn().mockResolvedValue(bitmap) as typeof createImageBitmap
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({ drawImage: vi.fn() })
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (callback: BlobCallback) {
      callback(new Blob([new Uint8Array(2000)], { type: 'image/png' }))
    })

    await expect(optimizeImageFile(file)).resolves.toBe(file)
  })

  it('builds a data URL preview', async () => {
    const file = new File(['hello'], 'preview.png', { type: 'image/png' })
    const preview = await buildPhotoPreview(file)

    expect(preview).toMatch(/^data:image\/png;base64,/)
  })
})
