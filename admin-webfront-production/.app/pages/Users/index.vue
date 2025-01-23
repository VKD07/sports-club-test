<script setup lang="ts">
definePageMeta({
  name: 'users',
  title: 'All Users',
  middleware: ['auth'],
})

const route = useRoute()
const fromSchool = route.query.fromSchool as string
const selectedSchool = route.query.school as string
const isFromSchool = ref(false)

onMounted(() => {
  isFromSchool.value = fromSchool !== null && fromSchool === 'true'
  if (isFromSchool.value) {
    window.history.replaceState({}, document.title, '/users')
  }
})
</script>

<template>
  <div>
    <BaseTabSlider
      v-slot="{ activeValue }"
      :model-value="isFromSchool ? 'school' : 'admin'"
      :tabs="[
        { label: 'Admin', value: 'admin' },
        { label: 'School', value: 'school' },
      ]"
    >
      <div v-if="activeValue === 'admin'">
        <UsersAdmin />
      </div>

      <div v-else-if="activeValue === 'school'">
        <UsersSchool :school="selectedSchool" />
      </div>
    </BaseTabSlider>
  </div>
</template>
