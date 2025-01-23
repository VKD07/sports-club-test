export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  const isLoggedIn = computed(() => !!auth.user && !auth.twoFactor)

  if (auth.isLoggedIn) {
    return navigateTo('/', { replace: true })
  }
})
