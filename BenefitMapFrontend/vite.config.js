// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_TARGET = 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/user': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
