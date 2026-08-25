/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Board Game Collector',
          short_name: 'BoardGames',
          description: '보드게임 컬렉션 및 대여 관리 스마트 웹앱',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cf\.geekdo-images\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'bgg-images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      proxy: {
        '/xmlapi2': {
          target: 'https://boardgamegeek.com',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VITE_BGG_TOKEN) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_BGG_TOKEN}`);
              }
              proxyReq.setHeader('User-Agent', 'BoardGameCollectorApp/2.0');
            });
          },
        },
        '/bgg-api': {
          target: 'https://api.geekdo.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/bgg-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VITE_BGG_TOKEN) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_BGG_TOKEN}`);
              }
            });
          },
        },
        '/boardlife': {
          target: 'https://boardlife.co.kr',
          changeOrigin: true,
          secure: false,
          autoRewrite: true,
          rewrite: (path) => path.replace(/^\/boardlife/, ''),
        },
        '/translate-api': {
          target: 'https://translate.googleapis.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/translate-api/, ''),
        }
      }
    }
  }
})
