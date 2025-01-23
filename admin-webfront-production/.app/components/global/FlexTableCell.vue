<script setup lang="ts">
const props = defineProps<{
  label?: string
  hideLabel?: boolean
  tabletHidden?: boolean
  sort?: boolean
  sortingBy?: string
}>()

const emits = defineEmits(['sort-column'])
</script>

<template>
  <div
    class="relative flex h-8 items-center justify-end px-6 sm:h-10 sm:justify-start sm:px-2"
    :class="props.tabletHidden && 'ptablet:hidden'"
  >
    <span
      v-if="props.label"
      class="text-muted-700 dark:text-muted-400 absolute start-8 top-1/2 mx-auto -translate-y-1/2 text-left font-sans text-xs font-medium uppercase sm:inset-x-0 sm:-top-10 sm:translate-y-0 space-x-2 px-2 cursor-pointer"
      :class="props.hideLabel ? 'sm:hidden' : ''"
      @click="emits('sort-column', props.sortingBy)"
    >
      {{ props.label }}
      <Icon
        v-if="props.sort"
        name="mdi:sort"
        class="text-primary-500 dark:text-muted-500 block size-8 mt-[-2px]"
      />
    </span>

    <slot></slot>
  </div>
</template>
