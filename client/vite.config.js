import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// El proxy manda /api a PocketBase: el cliente usa rutas relativas ("/api/...")
// y no hay que escribir la direccion del servidor en el codigo.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8090',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://127.0.0.1:8090',
    },
  },
})
