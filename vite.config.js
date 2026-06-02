import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Mọi request bắt đầu bằng /api từ FE
      // sẽ được Vite chuyển tiếp đến backend HTTPS
      // secure: false → bỏ qua lỗi self-signed certificate
      '/api': {
        target: 'https://localhost:7173',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

