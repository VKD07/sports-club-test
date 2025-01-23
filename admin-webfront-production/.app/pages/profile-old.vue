<script setup lang="ts">
definePageMeta({
  title: 'Edit Profile',
  middleware: ['auth'],
})

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <div class="grid gap-8 sm:grid-cols-12">
      <div class="col-span-12 sm:col-span-3">
        <div class="flex w-full items-center gap-2">
          <BaseAvatar v-if="auth.user?.profile?.profile_picture" :src="auth.user?.profile?.profile_picture" size="md" />

          <div
            v-else
            class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 h-12 w-12 p-6 rounded-full object-cover object-center flex items-center justify-center text-xl nui-weight-bold"
          >
            <span>{{ getInitialLetters(auth.user?.first_name ?? '', auth.user?.last_name ?? '') }}</span>
          </div>

          <div>
            <BaseHeading tag="h2" size="md" weight="medium" lead="none">
              {{ auth.user?.first_name }}
              {{ auth.user?.last_name }}
            </BaseHeading>

            <BaseParagraph size="xs" class="text-muted-400 mt-1">
              {{ auth.user?.role }}
            </BaseParagraph>
          </div>
        </div>

        <div class="mt-8 max-w-[240px]">
          <ul class="space-y-1 font-sans text-sm">
            <li>
              <NuxtLink
                to="/profile"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:user-duotone" class="h-4 w-4" />
                <span>General</span>
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/profile/settings"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:gear-six-duotone" class="h-4 w-4" />
                <span>Settings</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-span-12 sm:col-span-9">
        <RouterView v-slot="{ Component }">
          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="translate-y-20 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-20 opacity-0"
          >
            <div>
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>
