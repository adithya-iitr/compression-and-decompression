import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: '../backend/dist/frontend',  // ✅ Output directly into backend/dist
    assetsDir: 'assets'
  },
  base: './'
});
