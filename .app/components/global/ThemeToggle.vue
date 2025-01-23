<!-- <script setup>
const baseThemeToggle = document.getElementById('base-theme-toggle')

baseThemeToggle.addEventListener('click', function (e) {
  const checkbox = e.target.previousElementSibling.querySelector('input')
  const html = document.documentElement

  if (checkbox && checkbox.type === 'checkbox') {
    checkbox.checked = !checkbox.checked
  }

  html.classList.toggle('dark')
  html.classList.toggle('light')
})
</script> -->

<template>
  <div class="inline-flex h-9 items-center justify-center">
    <!-- <BaseThemeToggle /> -->
    <BaseThemeSwitch />
    <div id="base-theme-toggle" class="mr-2 text-sm hidden lg:block">Mode</div>
  </div>
</template>
