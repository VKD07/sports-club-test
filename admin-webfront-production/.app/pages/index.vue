<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  title: 'Login',
  middleware: ['guest'],
})

const login = ref(true)

onMounted(() => {
  localStorage.clear()
  sessionStorage.clear()
})
</script>

<template>
  <div class="dark:bg-muted-800 flex min-h-screen bg-white">
    <div class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-5/12 lg:flex-none">
      <div class="dark:bg-muted-800 relative mx-auto w-full max-w-sm bg-white">
        <div class="flex w-full items-center justify-between">
          <div class="w-36">
            <NuxtLink to="/">
              <img
                src="/img/logos/logo-esports-color.png"
                class="max-w-full object-contain"
                alt=""
              />
            </NuxtLink>
          </div>

          <BaseThemeToggle />
        </div>

        <!-- User login -->
        <div v-if="login">
          <AuthLogin @forgotPasswordClicked="login = !login" />
        </div>

        <!-- Recover password -->
        <div v-else>
          <AuthReset @signInClicked="login = !login" />
        </div>
      </div>

      <ul class="flex gap-4 md:gap-6 justify-center mt-auto absolute bottom-6 w-full left-0">
        <li>
          <AuthAbout />
        </li>
        <li>
          <AuthHelp />
        </li>
        <li>
          <AuthSafety />
        </li>
        <li>
          <AuthTerms />
        </li>
      </ul>
    </div>

    <div
      class="bg-muted-100 dark:bg-muted-900 relative hidden w-0 flex-1 items-center justify-center lg:flex lg:w-7/12"
    >
      <AuthBanner />
    </div>
  </div>
</template>
