import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@zod-schemas': path.resolve(__dirname, 'packages/zod-schemas/generated/schemas'),
      '@shared-types': path.resolve(__dirname, 'packages/shared-types/src'),
    },
  },
  test: {
    globals: true,
    setupFiles: ['apps/api/__tests__/setup.ts'],
  },
});
