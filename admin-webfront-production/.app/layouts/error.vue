<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <nuxt-link to="/">Go back to homepage</nuxt-link>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.error-page h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-page p {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.error-page a {
  color: #007bff;
  text-decoration: none;
  font-size: 1.25rem;
}

.error-page a:hover {
  text-decoration: underline;
}
</style>
