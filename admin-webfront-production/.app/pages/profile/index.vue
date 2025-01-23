<script setup>
definePageMeta({
  title: 'Edit Profile',
  middleware: ['auth'],
})

const route = useRoute()

const toSettings = route.query.toSettings
const isToSettings = ref(false)

onMounted(() => {
  isToSettings.value = toSettings !== null && toSettings === 'true'
  if (isToSettings.value) {
    window.history.replaceState({}, document.title, '/profile')
  }
})
</script>

<template>
  <TairoContentWrapper>
    <!-- <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Edit My Account
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Edit your account's information
        </BaseText>
      </div>
    </div> -->

    <div class="sm:px-8 pt-6 pb-4">
      <BaseTabSlider
        v-slot="{ activeValue }"
        :model-value="isToSettings ? 'settings' : 'profile'"
        :tabs="[
          { label: 'General', value: 'profile' },
          { label: 'Settings', value: 'settings' },
        ]"
      >
        <div v-if="activeValue === 'profile'" class="">
          <ProfileAccount />
        </div>

        <div v-else-if="activeValue === 'settings'" class="">
          <ProfileSettings />
        </div>
      </BaseTabSlider>
    </div>
  </TairoContentWrapper>
</template>
