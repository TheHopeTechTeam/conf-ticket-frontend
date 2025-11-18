import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const thirtySecondsInMs = 30 * 1_000;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/int/**/*.spec.ts', 'tests/unit/**/*.spec.ts'],
    testTimeout: thirtySecondsInMs,
    hookTimeout: thirtySecondsInMs,
    env: {
      NODE_ENV: 'test',
    },
  },
});
