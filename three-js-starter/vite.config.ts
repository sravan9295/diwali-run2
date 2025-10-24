import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    hmr: true,
    host: true
  },

  // Build optimization
  build: {
    target: 'es2020',
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        vanilla: resolve(__dirname, 'vanilla.html'),
        react: resolve(__dirname, 'react.html')
      },
      output: {
        manualChunks: {
          'three': ['three']
        }
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/vanilla': resolve(__dirname, 'src/vanilla'),
      '@/react': resolve(__dirname, 'src/react'),
      '@/shared': resolve(__dirname, 'src/shared')
    }
  },

  // Asset handling
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'],

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})