import { vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Setup global
beforeEach(() => {
  // Limpar todos os mocks
  vi.clearAllMocks()
})

afterEach(() => {
  // Cleanup pós-teste
  vi.resetAllMocks()
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
