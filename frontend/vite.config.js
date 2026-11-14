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
      // Transforma al arrancar las páginas y el layout más usados, para que la primera visita a cada módulo no
      // pague la transformación (en desarrollo Vite sirve cada archivo por separado). Solo afecta al servidor de desarrollo.
      warmup: {
        clientFiles: [
          './src/principal.jsx',
          './src/app/layout/*.jsx',
          './src/features/*/pages/*.jsx',
          './src/features/*/routes.jsx'
        ]
      },
      proxy: {
        '/api': {
          target: destinoApi.origin,
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyReq', (solicitud) => solicitud.removeHeader('origin'));
          }
        },
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
      setupFiles: ['./src/test/setup.js'],
      // Varias pruebas de página escriben en muchos campos con userEvent y rozan los 5 s por defecto en equipos lentos.
      testTimeout: 15000
    }
  };
});
