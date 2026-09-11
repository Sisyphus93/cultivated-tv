import { defineConfig } from 'vitest/config';

/**
 * Test runner config, kept out of vite.config.ts so the production build path
 * stays free of test-only dependencies.
 *
 * No React plugin here on purpose: esbuild already compiles the `react-jsx`
 * transform declared in tsconfig, and @vitejs/plugin-react is typed against the
 * project's Vite 4 while Vitest bundles Vite 5 — mixing them fails typecheck.
 */
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
});
