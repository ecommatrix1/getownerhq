import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['og-image.svg', 'robots.txt'],
      manifest: {
        name: 'getOwnerHQ — Gym Management Software',
        short_name: 'getOwnerHQ',
        description: 'Easiest management software for gyms, fitness studios, MMA clubs & academies. QR check-in, WhatsApp reminders, billing.',
        theme_color: '#7C3AED',
        background_color: '#FAFAF8',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/og-image.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'productivity', 'sports'],
        screenshots: [],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View your gym dashboard',
            url: '/dashboard',
            icons: [{ src: '/og-image.svg', sizes: '192x192' }]
          },
          {
            name: 'Billing',
            short_name: 'Billing',
            description: 'Manage subscription',
            url: '/dashboard/billing',
            icons: [{ src: '/og-image.svg', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/sdk\.cashfree\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cashfree-sdk',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/ydmrupmxtyyecykpxitb\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10
            }
          }
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  build: {
    minify: 'esbuild', // or 'terser' for better compression
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
        },
        // Add content hashes for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generate source maps for debugging (disable in production if needed)
    sourcemap: true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable module preloading
    modulePreload: {
      polyfill: true,
    },
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', '@supabase/supabase-js'],
  },
  // Server config for development
  server: {
    port: 5173,
    host: true,
  },
});