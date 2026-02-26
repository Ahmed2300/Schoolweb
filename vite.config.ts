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
    cssCodeSplit: true,
    // Warn on chunks larger than 250KB
    chunkSizeWarningLimit: 250,

    // ─────────────────────────────────────────────────────────
    // PRODUCTION-GRADE CHUNK STRATEGY
    //
    // Problem: Default Rollup splitting creates 228 JS files,
    // including 109 micro-chunks (< 1KB) for individual
    // lucide-react icons — causing network fragmentation on
    // mobile 4G (per-request RTT overhead > file size).
    //
    // Strategy:
    //  1. Vendor libs → stable, long-cached named chunks
    //  2. Icon libs  → single consolidated chunk (~15KB)
    //  3. Shared UI  → grouped by feature area
    //  4. Routes     → automatic per-route splitting (untouched)
    //
    // Target: 228 files → ~30-40 files
    // ─────────────────────────────────────────────────────────
    rollupOptions: {
      output: {
        // Use hashed filenames for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        manualChunks(id: string) {
          // Skip non-node_modules — let Rollup handle app code
          // (route-level splitting via React.lazy stays automatic)
          if (!id.includes('node_modules')) return undefined;

          // ── 1. Core React runtime (changes rarely → cached forever) ──
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }

          // ── 2. Icon consolidation (kills 100+ micro-chunks) ──
          if (
            id.includes('lucide-react') ||
            id.includes('@heroicons') ||
            id.includes('feather-icons')
          ) {
            return 'vendor-icons';
          }

          // ── 3. Heavy UI framework (MUI) ──
          if (
            id.includes('@mui/') ||
            id.includes('@emotion/') ||
            id.includes('@popperjs/')
          ) {
            return 'vendor-mui';
          }

          // ── 4. Animation libraries ──
          if (id.includes('framer-motion') || id.includes('popmotion')) {
            return 'vendor-motion';
          }
          if (id.includes('gsap')) {
            return 'vendor-gsap';
          }

          // ── 5. Data layer (TanStack Query + Axios) ──
          if (
            id.includes('@tanstack/react-query') ||
            id.includes('axios')
          ) {
            return 'vendor-data';
          }

          // ── 6. Form handling ──
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/') ||
            id.includes('zod')
          ) {
            return 'vendor-forms';
          }

          // ── 7. Smooth scroll / Lenis ──
          if (id.includes('lenis')) {
            return 'vendor-lenis';
          }

          // ── 8. Notifications (OneSignal) ──
          if (id.includes('onesignal') || id.includes('react-hot-toast')) {
            return 'vendor-notifications';
          }

          // ── 9. Charting / Data viz ──
          if (
            id.includes('recharts') ||
            id.includes('d3-') ||
            id.includes('react-circular-progressbar') ||
            id.includes('victory')
          ) {
            return 'vendor-charts';
          }

          // ── 10. Date / i18n utilities ──
          if (
            id.includes('date-fns') ||
            id.includes('dayjs') ||
            id.includes('i18next') ||
            id.includes('react-i18next')
          ) {
            return 'vendor-intl';
          }

          // ── 11. Helmet / SEO ──
          if (id.includes('react-helmet')) {
            return 'vendor-seo';
          }

          // ── 12. Catch-all: remaining node_modules → single chunk ──
          // Prevents Rollup from creating dozens of 0.2KB micro-chunks
          // for tiny shared utilities (classnames, clsx, etc.)
          return 'vendor-misc';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
