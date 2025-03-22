import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['tests/content.spec.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
