import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 3000,
    // Listen on all network interfaces so phones on the same WiFi can connect
    host: true,
    proxy: {
      // Forward /api/* to the Express proxy — this way the phone never calls
      // localhost:3001 directly (which would resolve to the phone itself)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
