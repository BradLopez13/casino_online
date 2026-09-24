import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['firestore-tests/**/*.test.ts'],
    // Every test talks to the emulator; the first request also loads the rules.
    testTimeout: 15_000,
    fileParallelism: false,
  },
});
