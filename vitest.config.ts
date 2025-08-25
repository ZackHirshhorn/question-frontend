import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
    coverage: {
      provider: 'v8',
      reports: ['text', 'html', 'lcov'],
      all: true,
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        // tooling/config/non-runtime
        'cypress/**',
        'cypress.config.ts',
        'eslint.config.js',
        'vite.config.ts',
        'vitest.config.ts',
        // type-only and env declarations
        'src/types/**',
        'src/vite-env.d.ts',
        '**/*.test.{ts,tsx}',
        'src/testSetup.ts',
      ],
    },
  },
});
