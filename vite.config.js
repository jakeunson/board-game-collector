/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
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
