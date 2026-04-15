import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // Limpiar la URL de la API para obtener el dominio base del proxy
  // Si VITE_API_URL es 'http://localhost:3001/api', el target será 'http://localhost:3001'
  const apiBaseUrl = env.VITE_API_URL
    ? env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:3001';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})
