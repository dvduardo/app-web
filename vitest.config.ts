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
      reportsDirectory: './coverage',
      include: [
        'frontend/auth/**/*.tsx',
        'frontend/lib/**/*.ts',
        'backend/auth/**/*.ts',
        'backend/db/**/*.ts',
        'backend/http/**/*.ts',
        'backend/security/**/*.ts',
        'app/lib/middleware.ts',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      all: true,
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },

    // Include patterns
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],

    // Test isolation
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
