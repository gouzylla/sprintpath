import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'SprintPath — Apprentissage quotidien',
        short_name: 'SprintPath',
        description: 'Révisions SQL, Python et anglais professionnel, à votre rythme.',
        theme_color: '#16261e',
        background_color: '#f4f0e5',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'sprintpath-api', networkTimeoutSeconds: 3 }
          }
        ]
      }
    })
  ]
})
