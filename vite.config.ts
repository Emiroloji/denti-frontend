// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      'antd',
      'antd/locale/tr_TR',
      '@ant-design/icons',
      'dayjs',
      'dayjs/locale/tr',
      'axios',
      '@tanstack/react-query',
      '@tanstack/react-query-devtools',
      'react-router-dom'
    ],
    exclude: []
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd'],
          icons: ['@ant-design/icons'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query']
        }
      }
    }
  }
})