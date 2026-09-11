import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Allow sandbox/preview hosts (e.g. *.e2b.app) in addition to localhost
    allowedHosts: true,
  },
});
