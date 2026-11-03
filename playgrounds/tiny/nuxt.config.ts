export default defineNuxtConfig({
  compatibilityDate: '2025-01-18',
  modules: ['@joshuakaleb/shuriken-ui-nuxt'],
  css: ['~/assets/css/main.css'],

  vite: {
    build: {
      minify: false,
    },
  },
})
