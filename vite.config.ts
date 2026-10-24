import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build serves from a project subpath on GitHub
// Pages and from the root of a Cloudflare Pages domain.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
