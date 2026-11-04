import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Ensure this matches Express server port
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    // Prevents infinite watch loops from generated files
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    // Cleans up React DOM and mock histories automatically between tests
    clearMocks: true,
    // Silences unhandled warnings during watch reruns
    css: false,
  },
});