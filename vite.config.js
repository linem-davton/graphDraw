import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/submit': {
        target: 'http://127.0.0.1:8000', // Your FastAPI server
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
