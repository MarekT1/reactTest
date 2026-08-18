import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: process.env.DDEV_PRIMARY_URL_WITHOUT_PORT
      ? `${process.env.DDEV_PRIMARY_URL_WITHOUT_PORT}:5173`
      : undefined,
    cors: {
      origin: /https?:\/\/([A-Za-z0-9\-\.]+)?(\.ddev\.site)(?::\d+)?$/,
    },
  },
})
