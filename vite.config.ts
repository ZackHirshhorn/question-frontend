import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env['VITE_API_BASE_URL'];

  const backendUrl = apiBaseUrl || 'https://question-api-75d6.onrender.com';

  return {
    base: '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: 'https://question-api-75d6.onrender.com',
          changeOrigin: true,
        },
      },
    },
  };
});
