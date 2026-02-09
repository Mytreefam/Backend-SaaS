import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/services/**/*.ts', 'src/services/**/*.tsx'],
      exclude: ['src/**/*.d.ts'],
    },
  },
});

