// Inside your vite.config.js

plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
    manifest: {
      name: 'LocalConnect',
      short_name: 'LocalConnect',
      description: 'Discover and support local businesses near you.',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png', // The '/' is important, it means the root of the domain
          sizes: '192x192',
          type: 'image/png' // Explicitly define the type
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })
]