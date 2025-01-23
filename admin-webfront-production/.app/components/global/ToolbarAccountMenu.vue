<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'

const auth = useAuthStore()

const userId = computed(() => {
  return `${auth.user?.user_id}`
})

const firstName = computed(() => {
  return `${auth.user?.first_name}`
})

const isAvatar = computed(() => {
  return auth.user?.profile?.profile_picture
})

const avatarWithInitials = computed(() =>
  getInitialLetters(auth.user?.first_name, auth.user?.last_name),
)

const closeMenu = () => {
  auth.logout()
  close()
}
</script>

<template>
  <div class="group inline-flex items-center justify-center text-right">
    <Menu as="div" class="relative h-9 text-left" v-slot="{ close }">
      <MenuButton as="template">
        <button type="button" class="inline-flex h-9 items-center justify-center rounded-full">
          <div
            v-if="isAvatar"
            class="relative inline-flex h-9 w-9 items-center justify-center rounded-full group-hover:ring-primary-500 dark:ring-offset-muted-900 ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4"
          >
            <img
              :src="isAvatar"
              class="max-w-full rounded-full object-cover shadow-sm dark:border-transparent"
              alt=""
            />
          </div>

          <div
            v-else
            class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 inline-flex h-9 w-9 items-center justify-center rounded-full group-hover:ring-primary-500 dark:ring-offset-muted-900 ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4"
          >
            <span>{{ avatarWithInitials }}</span>
          </div>

          <span class="ml-2 text-sm hidden lg:block">My Account</span>
        </button>
      </MenuButton>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="divide-muted-100 border-muted-200 dark:divide-muted-700 dark:border-muted-700 dark:bg-muted-800 absolute end-0 mt-2 w-64 origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none"
        >
          <div class="p-6 text-center">
            <div
              v-if="isAvatar"
              class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            >
              <img
                :src="isAvatar"
                class="max-w-full rounded-full object-cover shadow-sm dark:border-transparent"
                alt=""
              />
            </div>

            <div
              v-else
              class="relative bg-primary-500 text-muted-100 text-xl dark:bg-muted-700/60 mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            >
              <span>{{ avatarWithInitials }}</span>
            </div>

            <div class="mt-3">
              <h6 class="font-heading text-muted-800 text-sm font-medium dark:text-white">
                {{ userId }}
              </h6>
              <p class="text-muted-400 mb-4 font-sans text-xs">{{ firstName }}</p>

              <NuxtLink
                to="/profile"
                class="group flex w-full items-center rounded-md p-3 text-sm transition-colors duration-300 text-left hover:bg-muted-100"
                @click.passive="close"
              >
                <Icon name="ph:user-circle" class="h-5 w-5" />

                <div class="ms-3">
                  <h6
                    class="font-heading text-muted-800 text-xs font-medium leading-none dark:text-white"
                  >
                    Profile
                  </h6>
                  <p class="text-muted-400 font-sans text-xs">View your profile</p>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/profile?toSettings=true"
                class="group flex w-full items-center rounded-md p-3 text-sm transition-colors duration-300 text-left hover:bg-muted-100"
                @click.passive="close"
              >
                <Icon name="ph:gear-six" class="h-5 w-5" />

                <div class="ms-3">
                  <h6
                    class="font-heading text-muted-800 text-xs font-medium leading-none dark:text-white"
                  >
                    Settings
                  </h6>
                  <p class="text-muted-400 font-sans text-xs">Account settings</p>
                </div>
              </NuxtLink>
            </div>

            <div class="mt-3">
              <BaseButton @click.passive="closeMenu" shape="curved" class="w-full">
                Logout
              </BaseButton>
            </div>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>
