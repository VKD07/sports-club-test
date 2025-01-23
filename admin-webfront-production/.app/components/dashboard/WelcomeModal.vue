<template>
  <div>
    <TairoModal :open="isOpen" size="md" @close="closeModal">
      <template #header>
        <div class="flex w-full items-center justify-end p-4 md:p-6">
          <BaseButtonClose @click="closeModal" />
        </div>
      </template>

      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs flex flex-col items-center justify-center text-center">
          <img src="img/login/Welcome Icon.png" class="w-40" />

          <h3 class="font-heading text-primary-500 text-3xl font-medium leading-6 dark:text-white">
            Welcome Back!
          </h3>

          <h3 class="font-alt text-muted-500 dark:text-muted-400 my-6 leading-5">
            Hello {{ userName }}!, We're glad to see you today. Let’s achieve great things together!
          </h3>
        </div>
      </div>
    </TairoModal>
  </div>
</template>

<script setup>
const { isOpen, userName } = defineProps(['isOpen', 'userName'])

const emits = defineEmits(['close'])

const closeModal = () => {
  emits('close')
}
</script>
