<script setup lang="ts">
const { isOpen } = defineProps(['isOpen'])

const emits = defineEmits(['close', 'handleAvatarClick'])

const closeModal = () => {
  emits('close')
}

interface Avatar {
  src: string
}

let avatars = reactive<Avatar[]>([])

const openAvatarModal = () => {
  avatars = []
  for (let i = 1; i < 27; i++) {
    avatars.push({ src: `/img/avatars/${i}.svg` })
  }
}
openAvatarModal()

const selectAvatar = (e: MouseEvent) => {
  const target = e.target as HTMLImageElement

  if (target.tagName === 'IMG' && target.src) {
    const srcAttribute = target.src
    emits('handleAvatarClick', srcAttribute)
  }
}
</script>

<template>
  <TairoModal :open="isOpen" size="lg" @close="closeModal">
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">Avatar List</h3>
        <BaseButtonClose @click="closeModal" />
      </div>
    </template>

    <div class="p-4 md:p-6">
      <div class="mx-auto w-full text-center">
        <div class="relative mx-auto mb-4 flex gap-4 flex-wrap justify-center items-center size-24">
          <template v-for="(avatar, index) in avatars" :key="index">
            <img
              :src="avatar.src"
              class="w-14 rounded-full object-cover shadow-sm dark:border-transparent cursor-pointer"
              alt="avatar"
              @click="selectAvatar"
            />
          </template>
        </div>
      </div>
    </div>
  </TairoModal>
</template>
