<script setup lang="ts">
definePageMeta({
  title: 'Profile Settings',
  middleware: ['auth'],
})
</script>

<template>
  <div>
    <ProfilePasswordReset class="mb-6" />
    <ProfileNotificationSettings />
  </div>
</template>
