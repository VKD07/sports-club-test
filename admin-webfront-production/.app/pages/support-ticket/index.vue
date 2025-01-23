<script setup>
definePageMeta({
  name: 'support_tickets',
  title: 'All Support Requests',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('my_support')

const { data, error, refresh } = await useSupportTicketService('/api/admin-support-ticket/count')

const tabs = [
  { label: 'My Support', value: 'my_support', icon: data.value?.st_count.my.toString() },
  { label: 'Admin', value: 'admin', icon: data.value?.st_count.admin.toString() },
  { label: 'Schools', value: 'schools', icon: data.value?.st_count.school.toString() },
  { label: 'Students', value: 'students', icon: data.value?.st_count.student.toString() },
]

const tabMapping = {
  'My Support': 'my_support',
  Admin: 'admin',
  Schools: 'schools',
  Students: 'students',
}

onMounted(() => {
  if (tabMapping[route.query.tab]) {
    activeTab.value = tabMapping[route.query.tab]
  }

  window.history.replaceState({}, document.title, '/support-ticket')
})
</script>

<template>
  <BaseTabs
    class="tab-number"
    :model-value="activeTab"
    :tabs="tabs"
    @update:model-value="(value) => (activeTab = value)"
  >
    <template #tab="{ activeValue }">
      <div v-if="activeValue === 'my_support'">
        <supportTicketMySupport />
      </div>

      <div v-if="activeValue === 'admin'">
        <supportTicketAdmin />
      </div>

      <div v-else-if="activeValue === 'schools'">
        <supportTicketSchool />
      </div>

      <div v-else-if="activeValue === 'students'">
        <supportTicketStudent />
      </div>
    </template>
  </BaseTabs>
</template>
