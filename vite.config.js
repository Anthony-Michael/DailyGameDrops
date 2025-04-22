import { defineConfig } from 'vite';

export default defineConfig({
  // Expose newsletter API URL for client-side use
  envPrefix: 'NEWSLETTER_',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
}); 