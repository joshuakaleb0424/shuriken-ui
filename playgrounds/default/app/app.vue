<script setup>
const route = useRoute()
useHead(() => ({
  title: route.meta.title,
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - @joshuakaleb/nuxt`
      : '@joshuakaleb/nuxt'
  },
  bodyAttrs: {
    class: 'bg-white dark:bg-muted-950',
  },
}))
</script>

<template>
  <BaseProviders
    :toast="{ max: 3, position: 'top-center' }"
  >
    <NuxtLoadingIndicator color="linear-gradient(to right, var(--color-primary-400), var(--color-primary-600))" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </BaseProviders>
</template>
