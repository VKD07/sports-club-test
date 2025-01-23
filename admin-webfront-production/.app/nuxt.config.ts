export default defineNuxtConfig({
  nitro: {
     routeRules: {
      '/admin_service/**': {
       proxy: 'http://172.16.68.4:8081/**',
      },

      '/admin_read_service/**': {
        proxy: 'http://172.16.68.6:8086/**',
      },

      '/school_read_service/**': {
        proxy: 'http://172.16.68.6:8087/**',
      },

      '/school-write-backend/**': {
        proxy: 'http://172.16.68.6:8082/**',
      },

      '/media_service/**': {
        proxy: 'http://172.16.68.10:8088/**',
      },

      '/support_ticket_service/**': {
        proxy: 'http://172.16.68.10:8089/**',
      },

      '/notification_service/**': {
        proxy: 'http://172.16.68.10:8085/**',
      },
    },
  },
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],

  plugins: ['~/plugins/date-fns-tz-plugin.ts', '~/plugins/tinymce.client.js'],

  extends: ['../layers/tairo', '../layers/tairo-layout-collapse'],

  css: [
    '~/assets/css/custom.css',
    '@fontsource-variable/inter/index.css',
    '@fontsource-variable/karla/index.css',
  ],

  ssr: false,

  spaLoadingTemplate: 'spa-loading-template.html',
})
