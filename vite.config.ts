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
    chunkSizeWarningLimit: 800,
    assetsInlineLimit: 8192,

    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const n = id.replace(/\\/g, '/');

          // ── App pages by role (pages only) ──
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

          // ── Heavy dashboard-only libs ──
          // These are safe to separate: they don't call React.memo
          // at top level, and only load when admin/teacher pages need them.
          // Saves ~300KB of unused JS from loading on the landing page.
          if (
            n.includes('/@xyflow/') ||
            n.includes('/d3-') ||
            n.includes('/d3/')
          ) return 'vendor-heavy';

          // ── Everything else: ONE vendor chunk ──
          // React + all React-dependent libs must stay together to
          // avoid initialization order errors (React.memo not defined).
          return 'vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
