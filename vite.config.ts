import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite plugin: makes the production CSS <link> non-render-blocking.
 *
 * How it works:
 * 1. Vite emits `<link rel="stylesheet" href="/assets/style-xxx.css">`
 * 2. This plugin rewrites it to `<link rel="preload" as="style" onload="this.rel='stylesheet'">`
 * 3. The browser downloads CSS in the background without blocking render
 * 4. Combined with the inline critical CSS in index.html, the page
 *    paints immediately and applies full styles when the file arrives.
 */
function asyncCssPlugin(): Plugin {
  return {
    name: 'async-css',
    enforce: 'post',
    transformIndexHtml(html: string) {
      // Only transform stylesheet links pointing to our built CSS
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        [
          // Preload: browser fetches CSS with high priority but doesn't block render
          '<link rel="preload" href="$1" as="style" onload="this.rel=\'stylesheet\'" />',
          // Fallback for no-JS browsers
          '<noscript><link rel="stylesheet" href="$1" /></noscript>',
        ].join('\n    ')
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), asyncCssPlugin()],
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
          if (
            n.includes('/@xyflow/') ||
            n.includes('/d3-') ||
            n.includes('/d3/')
          ) return 'vendor-heavy';

          // ── Everything else: ONE vendor chunk ──
          return 'vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-circular-progressbar']
  }
})
