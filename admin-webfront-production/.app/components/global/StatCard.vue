<template>
  <BaseCard class="py-2 px-4" :class="cardClass">
    <div class="mb-1 flex items-center justify-between">
      <BaseHeading as="h5" size="sm" weight="medium" lead="tight" class="text-muted-500 dark:text-muted-400">
        <span>{{ title }}</span>
      </BaseHeading>

      <BaseIconBox size="xs" class="dark:bg-transparent dark:text-muted-100 dark:border-2" :class="iconBoxClass" shape="full">
        <Icon :name="icon" class="h-5 w-5" />
      </BaseIconBox>
    </div>

    <div class="mb-2">
      <BaseHeading as="h4" size="xl" weight="bold" lead="tight" class="text-muted-800 dark:text-white">
        <span>{{ number }}</span>
      </BaseHeading>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const props = defineProps({
  title: String,
  number: String,
  icon: String,
  cardClass: {
    type: String,
    default: '',
  },
  iconBoxClass: {
    type: String,
    default: '',
  },
})
</script>
