// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 백엔드 서버 주소 (너네 스프링 포트로 맞춰)
const BACKEND_TARGET = 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      // 유저 정보 관련
      '/user': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      // 추천 API 등 서비스 관련
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
