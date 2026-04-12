import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock estável de localStorage (vi.resetAllMocks quebrava a implementação do jsdom)
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value },
  removeItem: (key: string) => { delete localStorageStore[key] },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]) },
  get length() { return Object.keys(localStorageStore).length },
  key: (index: number) => Object.keys(localStorageStore)[index] ?? null,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: false,
  configurable: true,
})

// Setup global
beforeEach(() => {
  // Limpar todos os mocks e o localStorage entre testes
  vi.clearAllMocks()
  localStorageMock.clear()
})

afterEach(() => {
  // Limpar chamadas sem resetar implementações nativas (resetAllMocks quebra o localStorage do jsdom)
  vi.clearAllMocks()
})

/**
 * Mock do objeto window.matchMedia
 * Necessário para componentes que usam media queries
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Suppress console errors em testes (opcional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}
