<script setup lang="ts">
const { isOpen } = useCollapse()
</script>

<template>
  <div
    class="flex h-16 w-full items-center gap-4 transition-all duration-150"
    :class="!isOpen ? 'px-2 justify-center' : 'px-6'"
  >
    <div class="w-16">
      <img src="/img/logos/logo-esports-color.png" class="max-w-full object-contain" alt="" />
    </div>
    <span
      class="text-white dark:white whitespace-nowrap font-sans text-xs"
      :class="!isOpen ? 'hidden' : 'block'"
    >
      ©2024<br />All Rights Reserved
    </span>
  </div>
</template>
