<script setup>
const route = useRoute()
const app = useAppConfig()
const auth = useAuthStore()

useHead({
  title: () => route.meta?.title ?? '',
  htmlAttrs: {
    lang: 'en',
    dir: 'ltr',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/img/favicon.png',
    },
  ],

  meta: [
    {
      name: 'description',
      content: () =>
        route.meta.description ?? 'The most advanced Nuxt and Tailwind CSS dashboard template',
    },
  ],
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
