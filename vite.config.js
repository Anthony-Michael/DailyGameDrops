import { defineConfig } from 'vite';

export default defineConfig({
  // Only expose public environment variables
  envPrefix: 'PUBLIC_',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
}); 