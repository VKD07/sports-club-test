<script setup lang="ts">
definePageMeta({
  name: 'add-user',
  title: 'Add User',
  middleware: ['auth'],
})

const route = useRoute()
const isAdmin = computed(() => (route.query.type as string) === 'admin')

const adminUserBreadcrumb = [
  {
    label: 'Admin Users',
    hideLabel: false,
    to: '/users',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const schoolUserBreadcrumb = [
  {
    label: 'School Users',
    hideLabel: false,
    to: { name: 'users', query: { fromSchool: 'true' } },
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
      <BaseBreadcrumb :items="isAdmin ? adminUserBreadcrumb : schoolUserBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <template v-if="isAdmin">
      <UsersAddAdmin />
    </template>

    <template v-else>
      <UsersAddSchool />
    </template>
  </div>
</template>
