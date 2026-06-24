import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'vite.svg'],
      manifest: {
        short_name: 'FamilyCare',
        name: 'FamilyCare - Supervisor de Tareas Familiares',
        icons: [
          {
            src: '/icon-192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: '/icon-512.png',
            type: 'image/png',
            sizes: '512x512'
          }
        ],
        start_url: '/',
        background_color: '#f7f9fb',
        theme_color: '#004ac6',
        display: 'standalone',
        orientation: 'portrait'
      }
    })
  ],
})
