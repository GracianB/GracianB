import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          i18n: ['src/scripts/i18n-manager.js'],
          theme: ['src/scripts/theme-manager.js'],
          ui: ['src/scripts/ui-manager.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173
  }
});
