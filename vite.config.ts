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
    cssCodeSplit: false,
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 8192,

    rollupOptions: {
      output: {
        // ─────────────────────────────────────────────────────
        // SMART CHUNK STRATEGY
        //
        // Vendors split by USAGE PATTERN — landing page only
        // downloads what it needs. Heavy dashboard-only libs
        // (xyflow, d3, firebase) are left to Rollup, so they
        // lazy-load with the pages that actually import them.
        //
        // App pages grouped by ROLE — one chunk per role.
        // ─────────────────────────────────────────────────────
        manualChunks(id: string) {
          const n = id.replace(/\\/g, '/');

          // ── App pages by role ──
          if (!n.includes('node_modules')) {
            if (n.includes('/pages/admin/')) return 'app-admin';
            if (n.includes('/pages/teacher/')) return 'app-teacher';
            if (
              n.includes('/pages/dashboard/Student') ||
              n.includes('/pages/student/')
            ) return 'app-student';
            if (n.includes('/pages/dashboard/Parent')) return 'app-parent';
            if (n.includes('/pages/auth/')) return 'app-auth';
            if (n.includes('/pages/landing/')) return 'app-landing';
            return undefined;
          }

          // ── Vendor: React core — needed on EVERY page ──
          if (
            n.includes('/react/') ||
            n.includes('/react-dom/') ||
            n.includes('/react-router') ||
            n.includes('/@remix-run/') ||
            n.includes('/scheduler/')
          ) return 'vendor-react';

          // ── Icons (lucide-react) — large but tree-shakeable ──
          if (n.includes('/lucide-react/')) return 'vendor-icons';

          // ── Animation / motion — landing + dashboards ──
          if (
            n.includes('/framer-motion/') ||
            n.includes('/gsap/') ||
            n.includes('/lenis/')
          ) return 'vendor-ui';

          // ── Heavy dashboard-only libs ──
          // DON'T group these — let Rollup attach them to the
          // lazy chunks that actually import them. They will NOT
          // load on the landing page.
          if (
            n.includes('/@xyflow/') ||
            n.includes('/d3') ||
            n.includes('/firebase/') ||
            n.includes('/react-circular-progressbar') ||
            n.includes('/onesignal/')
          ) return undefined; // Rollup auto-splits

          // ── Common utilities ──
          return 'vendor-lib';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
