export default defineNuxtConfig({
  compatibilityDate: '2025-01-18',
  modules: ['@joshuakaleb/nuxt', 'nuxt-component-meta'],
  typescript: {
    includeWorkspace: true,
  },
  componentMeta: {
    globalsOnly: false,
    debug: 2,
    exclude: [
      (component: any) => !component.pascalName.startsWith('Base'),
    ],
    checkerOptions: {
      schema: {
        ignore: ['KeyboardEvent'],
      },
    },
  },
})
