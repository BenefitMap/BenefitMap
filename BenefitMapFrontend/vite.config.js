import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 백엔드 서버 주소: 필요하면 8080 말고 너희 실제 포트로 맞춰
const BACKEND_TARGET = 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true, // 포트 고정
    proxy: {
      // /user 로 시작하는 모든 요청은 백엔드로 프록시
      '/user': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      // 만약 나중에 /auth 같은 것도 있으면 여기도 추가 가능
      // '/auth': {
      //   target: BACKEND_TARGET,
      //   changeOrigin: true,
      //   secure: false,
      // },
    },
  },
  resolve: {
    alias: {
      'react-router-dom': 'react-router-dom',
    },
  },
  optimizeDeps: {
    include: ['react-router-dom'],
  },
})
