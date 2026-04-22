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
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (env.VITE_BGG_TOKEN) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_BGG_TOKEN}`);
              }
            });
          },
        }
      }
    }
  }
})
