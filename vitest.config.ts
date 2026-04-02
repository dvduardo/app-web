import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Environment
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportDir: './coverage',
      include: ['app/lib/**/*.ts', 'app/lib/**/*.tsx'],
      exclude: [
        'node_modules/',
        'app/lib/__tests__/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      all: true,
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },

    // Include patterns
    include: ['app/lib/**/*.test.ts', 'app/lib/**/*.test.tsx', 'app/lib/**/*.spec.ts', 'app/lib/**/*.spec.tsx'],

    // Test isolation
    isolate: true,
    threads: true,
    maxThreads: 4,
    minThreads: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
