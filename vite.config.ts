import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ResearchForge — Research Design Academy & Concierge',
        short_name: 'ResearchForge',
        description: 'Learn educational research design in five weeks, or design your own study with the free Concierge.',
        theme_color: '#FFF9F3',
        background_color: '#FFF9F3',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}', '**/inter-latin-*.woff2'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // app-skins art and fonts load only when a Look is chosen: keep them out of the precache, cache on first use
        globIgnores: ['**/*-wide-*', '**/*-tall-*', '**/elegant-*', '**/editorial-*', '**/playful-*', '**/pop-*', '**/cormorant-*', '**/playfair-*', '**/fredoka-*', '**/anton-*'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/') && /\.(webp|woff2)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'skin-assets', expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], docx: ['docx'], md: ['react-markdown', 'remark-gfm'] } } }
  }
});
