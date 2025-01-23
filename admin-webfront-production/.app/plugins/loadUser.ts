export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuthStore()

  if (process.client) {
    // Check for localStorage only on the client side
    if (localStorage.getItem('userToken')) {
      await auth.fetchUser()
    } else {
      // call logout
    }
  }
})
