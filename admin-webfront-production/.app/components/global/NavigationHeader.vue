<script setup lang="ts">
const { isOpen, isMobileOpen } = useCollapse()

const isSearchOpen = useState('search-open', () => false)
</script>

<template>
  <div class="flex w-full items-center justify-between lg:justify-center px-6">
    <div
      class="w-full rounded-md mt-4 flex items-center"
      :class="!isOpen ? '' : 'bg-primary-600 dark:bg-muted-900'"
    >
      <div class="flex h-20 w-24 items-center justify-center">
        <slot name="logo">
          <NuxtLink to="/dashboard" class="flex items-center justify-center">
            <div
              class="relative mx-auto flex items-center justify-center rounded-full"
              :class="!isOpen ? 'h-8 w-8' : 'h-16 w-16'"
            >
              <img
                src="/img/logos/logo.png"
                class="w-full rounded-full object-cover shadow-sm dark:border-transparent border border-white"
                alt=""
              />
            </div>
          </NuxtLink>
        </slot>
      </div>
      <div :class="!isOpen ? 'hidden' : 'block'">
        <h4 class="text-white text-base font-medium">EStars</h4>
        <p class="text-white text-xs font-light">Yas Island</p>
      </div>
    </div>

    <!--Mobile button-->
    <button
      type="button"
      class="nui-mask nui-mask-blob hover:bg-muted-200 dark:hover:bg-muted-800 text-muted-100 hover:text-muted-800 dark:text-muted-100 flex h-10 w-10 cursor-pointer items-center justify-center transition-colors duration-300 lg:hidden"
      @click="isMobileOpen = false"
    >
      <Icon name="lucide:arrow-left" class="h-5 w-5" />
    </button>
  </div>
</template>
