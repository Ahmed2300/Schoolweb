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
    cssCodeSplit: false, // ← Single CSS file instead of per-chunk CSS
    chunkSizeWarningLimit: 600,

    // Inline images/SVGs under 8 KB as data-URIs → fewer HTTP requests
    assetsInlineLimit: 8192,

    // ─────────────────────────────────────────────────────────
    // CHUNK STRATEGY — Aggressive consolidation
    //
    // Goal: ~8 JS files on initial landing page instead of 133.
    //
    // How it works:
    //  • ALL vendor node_modules → single `vendor` chunk
    //  • App pages grouped by ROLE → one chunk per role
    //  • Landing & Auth pages → their own small chunks
    //  • Everything else → stays in the main entry bundle
    //
    // Trade-off: slightly larger individual chunks, but
    // dramatically fewer HTTP requests. On HTTP/2, one 200KB
    // file is faster than twenty 10KB files due to per-request
    // overhead (headers, TLS records, multiplexing contention).
    // ─────────────────────────────────────────────────────────
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Normalize Windows backslashes
          const n = id.replace(/\\/g, '/');

          // ── Vendor: ALL node_modules in ONE chunk ──
          if (n.includes('node_modules')) {
            return 'vendor';
          }

          // ── App PAGES only: group by role ──
          // Components, hooks, stores, and services are left to
          // Rollup to avoid circular initialization errors.

          // Admin pages
          if (n.includes('/pages/admin/')) {
            return 'app-admin';
          }

          // Teacher pages
          if (n.includes('/pages/teacher/')) {
            return 'app-teacher';
          }

          // Student pages
          if (
            n.includes('/pages/dashboard/Student') ||
            n.includes('/pages/student/')
          ) {
            return 'app-student';
          }

          // Parent pages
          if (n.includes('/pages/dashboard/Parent')) {
            return 'app-parent';
          }

          // Auth pages (login, signup, forgot password, etc.)
          if (n.includes('/pages/auth/')) {
            return 'app-auth';
          }

          // Landing / marketing pages
          if (n.includes('/pages/landing/')) {
            return 'app-landing';
          }

          // Everything else → Rollup handles safely
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
