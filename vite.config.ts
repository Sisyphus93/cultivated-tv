import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
// The guide is published as a single artefact: JS and CSS are inlined into
// index.html at build time. Key art stays external in public/images/ and is
// referenced relatively, so the whole folder can be served from any origin.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100_000,
    cssCodeSplit: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow sandbox/preview hosts (e.g. *.e2b.app) in addition to localhost
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
