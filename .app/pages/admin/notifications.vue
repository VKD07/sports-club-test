<script setup lang="ts">
// set compile time meta information
definePageMeta({
  // static meta information can be added to vue-router, we use it
  // to generate the search index in the demo
  title: 'Notifications',
})

// meta information can also be added to the head
useHead({
  meta: [{ name: 'description', content: 'My amazing site.' }],
  bodyAttrs: {
    class: 'admin-notifications',
  },
})

// Here you can define your page logic
</script>

<template>
  <div>
    <!-- The page content goes here -->
    This page is for Notifications
  </div>
</template>
