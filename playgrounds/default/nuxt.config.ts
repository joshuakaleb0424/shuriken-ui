export default defineNuxtConfig({
  compatibilityDate: '2025-01-18',
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    '@joshuakaleb/shuriken-ui-nuxt',
    '@nuxt/fonts',
  ],
  css: ['~/assets/css/main.css'],

  vite: {
    build: {
      cssMinify: false,
    },
  },
})
