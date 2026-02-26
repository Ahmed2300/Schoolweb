import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@data': path.resolve(__dirname, './src/data'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    // ⛔ Disable sourcemaps in production — saves ~30% bundle size
    sourcemap: false,
    // Target modern browsers for smaller JS output
    target: 'es2020',
    // Split CSS per route chunk — avoids one monolithic render-blocking bundle.
    // Each lazy-loaded route gets only the CSS it needs.
    cssCodeSplit: true,
    // Warn on chunks larger than 250KB
    chunkSizeWarningLimit: 250,
    // Split vendor code into stable, cacheable chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — changes rarely, highly cacheable
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data layer
          'vendor-query': ['@tanstack/react-query'],
          // UI framework (heaviest vendor dependency)
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          // Animation libraries
          'vendor-motion': ['framer-motion'],
          'vendor-gsap': ['gsap'],
          // Form handling
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
