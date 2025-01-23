<template>
  <div v-if="showSpinner" class="spinner-container">
    <div class="spinner"></div>
    <p class="spinner-label tracking-wider text-primary-500 dark:text-muted-100">{{ label }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  showSpinner: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    default: 'Processing...',
  },
})
</script>

<style scoped>
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #333;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-label {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 500;
}
</style>
