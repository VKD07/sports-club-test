<template>
  <div class="relative">
    <BaseButtonClose
      v-if="selectedValue"
      size="sm"
      rounded="sm"
      color="muted"
      class="close-btn"
      @click="clearSelectedValue"
    />
    <BaseListbox
      v-model="selectedValue"
      :items="options"
      :placeholder="placeholder"
      :properties="properties"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
const { options, placeholder, disabled, properties } = defineProps([
  'options',
  'placeholder',
  'disabled',
  'properties',
])
const emits = defineEmits(['selected-value'])

const selectedValue = ref('')

const clearSelectedValue = () => {
  selectedValue.value = ''
}

defineExpose({
  clearSelectedValue,
})

watchEffect(() => {
  emits('selected-value', selectedValue.value)
})
</script>
