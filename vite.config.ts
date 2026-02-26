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
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 250,

    // ─────────────────────────────────────────────────────────
    // CHUNK STRATEGY (conservative — avoids circular deps)
    //
    // ONLY groups libraries that are self-contained and have
    // NO circular dependency risk with React. Everything else
    // is left for Rollup to split safely.
    //
    // Key insight: catch-all `vendor-misc` causes circular
    // initialization (vendor-react ↔ vendor-misc). Never use it.
    // ─────────────────────────────────────────────────────────
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;

          // ── Icons: kills 100+ micro-chunks (biggest win) ──
          // lucide-react exports each icon as a separate ESM module.
          // Without this, Rollup creates a 0.2KB file per icon.
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // ── GSAP: self-contained, no React dependency ──
          if (id.includes('gsap')) {
            return 'vendor-gsap';
          }

          // ── d3: pure math/data utils, no React dependency ──
          if (id.includes('d3-')) {
            return 'vendor-d3';
          }

          // ── Zod: pure validation, no React dependency ──
          if (id.includes('zod')) {
            return 'vendor-zod';
          }

          // ── i18next core: no React dependency ──
          // (react-i18next is NOT included — it depends on React)
          if (id.includes('i18next') && !id.includes('react-i18next')) {
            return 'vendor-i18n';
          }

          // ── Axios: standalone HTTP client ──
          if (id.includes('axios')) {
            return 'vendor-axios';
          }

          // ── Lenis: standalone smooth scroll ──
          if (id.includes('lenis')) {
            return 'vendor-lenis';
          }

          // ── Heavy UI & Core Libraries ──
          if (id.includes('framer-motion')) {
            return 'vendor-framer-motion';
          }
          if (id.includes('@xyflow')) {
            return 'vendor-xyflow';
          }
          // ── Firebase & Realtime DB ──
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'vendor-firebase';
          }

          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }

          // ── Core React & Router ──
          // These are safe to group together and reduce the main bundle size significantly.
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@remix-run/')) {
             return 'vendor-react-core';
          }

          // Everything else (react-hook-form, etc.) 
          // → Rollup handles automatically.
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
