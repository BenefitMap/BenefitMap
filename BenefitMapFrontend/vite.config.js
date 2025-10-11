import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true  // 포트가 사용 중이면 실패하도록 설정
  },
  resolve: {
    alias: {
      'react-router-dom': 'react-router-dom'
    }
  },
  optimizeDeps: {
    include: ['react-router-dom']
  }
})
