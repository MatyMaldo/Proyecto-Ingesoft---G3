/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const urlBaseApi = env.VITE_URL_BASE_API ?? 'http://localhost:8080/api/v1';
  const destinoApi = new URL(urlBaseApi, 'http://localhost:8080');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api/v1': {
          target: destinoApi.origin,
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyReq', (solicitud) => solicitud.removeHeader('origin'));
          }
        }
      }
    },
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./src/test/setup.js']
    }
  };
});
