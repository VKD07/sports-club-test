<script setup>
const router = useRouter()

const page = ref('')
const pages = ref([
  {
    id: 1,
    name: 'Dashboard',
    text: 'Manage your dashboard',
    to: '/dashboard',
  },
  {
    id: 2,
    name: 'Task Management',
    text: 'Manage tasks',
    to: '/tasks',
  },
  {
    id: 3,
    name: 'Schools',
    text: 'Manage schools and locations',
    to: '/schools',
  },
  {
    id: 4,
    name: 'Students',
    text: 'Manage student data',
    to: '/students',
  },
  {
    id: 5,
    name: 'Leaderboard',
    text: 'View the leaderboard',
    to: '/leaderboard',
  },
  {
    id: 6,
    name: 'Student Performance',
    text: 'View student performance metrics',
    to: '/performance/student',
  },
  {
    id: 7,
    name: 'Task Performance',
    text: 'View task performance metrics',
    to: '/performance/task',
  },
  {
    id: 8,
    name: 'Users',
    text: 'Manage users',
    to: '/users',
  },
  {
    id: 9,
    name: 'Support',
    text: 'Support and help desk',
    to: '/support-ticket',
  },
  {
    id: 10,
    name: 'Media',
    text: 'Manage media files',
    to: '/media',
  },
  {
    id: 11,
    name: 'Information Hub',
    text: 'Access the information hub',
    to: '/information-hub',
  },
  {
    id: 12,
    name: 'Categories',
    text: 'Manage categories',
    to: '/tasks/categories',
  },
  {
    id: 13,
    name: 'Calendars',
    text: 'Manage calendars',
    to: '/tasks/calendars',
  },
  {
    id: 14,
    name: 'Organizations',
    text: 'Manage organizations',
    to: '/schools',
  },
  {
    id: 15,
    name: 'Locations',
    text: 'Manage locations',
    to: '/schools/locations',
  },
  {
    id: 16,
    name: 'My Account',
    text: 'Manage my account',
    to: '/profile',
  },
  {
    id: 17,
    name: 'Settings',
    text: 'Manage settings',
    to: '/profile?toSettings=true',
  },
])

watch(page, (newValue) => {
  setTimeout(() => {
    page.value = ''
  }, 1000)

  if (newValue?.to) {
    router.push(newValue.to)
  }
})

function filterItems(query, items) {
  if (!query || !items) {
    return items ?? []
  }

  return items.filter((item) => {
    const nameMatches = item?.name?.toLowerCase().includes(query.toLowerCase())
    const textMatches = item?.text?.toLowerCase().includes(query.toLowerCase())
    return nameMatches || textMatches
  })
}
</script>

<template>
  <div class="w-96 mr-auto relative">
    <BaseButtonClose
      v-if="page"
      size="sm"
      rounded="sm"
      color="muted"
      class="close-btn-auto"
      @click="page = ''"
    />
    <BaseAutocomplete
      v-model="page"
      :items="pages"
      :display-value="(item) => item.name"
      :filter-items="filterItems"
      placeholder="Search..."
      size="md"
      :properties="{
        value: 'id',
        label: 'name',
        sublabel: 'text',
      }"
    />
  </div>
</template>

<style scoped>
.close-btn-auto {
  position: absolute;
  right: 6px;
  z-index: 9;
  top: 8px;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
