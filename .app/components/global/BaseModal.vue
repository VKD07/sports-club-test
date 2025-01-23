<template>
  <TairoModal :open="isOpen" size="md" footer-align="center" @close="closeModal">
    <template #header>
      <div class="relative">
        <div class="flex w-full items-center justify-center p-4 md:p-6">
          <h3 class="font-heading text-primary-500 text-lg font-bold leading-6 dark:text-white">
            {{ title }}
          </h3>
        </div>

        <BaseButtonClose
          @click="closeModal"
          class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
        />
      </div>
    </template>

    <div class="p-4 !pt-0 md:p-6">
      <div class="mx-auto w-full max-w-xs text-center">
        <div class="mb-3">
          <Icon :name="icon" :class="iconColor" class="block h-12 w-12" />
        </div>

        <p class="font-alt text-muted-700 dark:text-muted-400 text-base leading-5">
          <slot></slot>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="p-4 md:p-6">
        <div class="flex gap-x-2">
          <BaseButton v-if="showCancelButton" @click="closeModal">{{ cancelButtonText }}</BaseButton>

          <BaseButton v-if="showPrimaryButton" :color="primaryButtonColor" @click="primaryButtonAction">
            {{ primaryButtonText }}
          </BaseButton>
        </div>
      </div>
    </template>
  </TairoModal>
</template>

<script setup>
const {
  icon,
  title,
  isOpen,
  iconColor,
  showCancelButton,
  cancelButtonText,
  showPrimaryButton,
  primaryButtonText,
  primaryButtonColor,
  primaryButtonAction,
} = defineProps([
  'icon',
  'title',
  'isOpen',
  'iconColor',
  'showCancelButton',
  'cancelButtonText',
  'showPrimaryButton',
  'primaryButtonText',
  'primaryButtonColor',
  'primaryButtonAction',
])

const emits = defineEmits(['close'])

const closeModal = () => {
  emits('close')
}
</script>

<style scoped>
.warning {
  --tw-text-opacity: 1;
  color: rgb(245 158 11 / var(--tw-text-opacity));
}

.success {
  --tw-text-opacity: 1;
  color: rgb(34 197 94 / var(--tw-text-opacity));
}

.error {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}
</style>
