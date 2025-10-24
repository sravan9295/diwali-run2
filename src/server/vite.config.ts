import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../../dist/server',
    emptyOutDir: true,
    lib: {
      entry: './index.ts',
      formats: ['cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['@devvit/web']
    },
    ssr: true
  }
});