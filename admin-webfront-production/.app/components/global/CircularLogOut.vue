<template>
  <div
    class="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:cursor-pointer"
    @click="logout"
  >
    <span class="bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full">
      <Icon name="material-symbols:logout" class="h-5 w-5 text-white" />
    </span>
  </div>
</template>

<script setup>
const auth = useAuthStore()

const logout = () => {
  auth.logout()
}
</script>
