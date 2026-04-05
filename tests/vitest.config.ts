import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Environment
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/vitest.setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'contexts/**/*.tsx',
        'lib/**/*.ts',
        'server/auth/**/*.ts',
        'server/db/**/*.ts',
        'server/http/**/*.ts',
        'server/security/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'server/db/prisma.ts',   // singleton de infraestrutura, sem lógica testável
        'lib/api-client.ts',     // interceptors dependem de window/browser, cobertos nos e2e
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
    include: ['./tests/unit/**/*.test.ts', './tests/unit/**/*.test.tsx'],

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
      '@': path.resolve(__dirname, '../'),
    },
  },
})
