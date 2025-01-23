<template>
  <div class="custom-select" :class="{ 'is-disabled': disabled }">
    <div
      class="select-box"
      @click="toggleDropdown"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
    >
      <div class="select-icon">
        <Icon :name="icon" />
      </div>

      <input
        type="text"
        v-model="searchQuery"
        class="select-input"
        :placeholder="placeholder"
        @click.stop
        @input="onInput"
        :disabled="disabled"
      />

      <BaseButtonClose
        v-if="searchQuery"
        size="sm"
        rounded="sm"
        color="muted"
        class="close-btn-auto"
        @click.stop="clearInput"
      />
    </div>

    <div v-if="isOpen && !disabled" class="dropdown">
      <ul class="options-list">
        <li
          v-if="filteredOptions.length > 0"
          v-for="option in filteredOptions"
          :key="option.id"
          @click="selectOption(option)"
          :class="{ 'is-selected': option.id === selectedOption?.id }"
        >
          <span>
            {{ option.name }}
          </span>
        </li>
        <li v-else>
          <span>No data available</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  icon: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:name'])

const isOpen = ref(false)
const searchQuery = ref(props.name ? props.name : '')

const selectedOption = computed(() =>
  props.options.find((option) => option.id === props.modelValue),
)

const filteredOptions = computed(() =>
  props.options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const onInput = () => {
  if (!isOpen.value) {
    isOpen.value = true
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.id)
  isOpen.value = false
  searchQuery.value = option.name
}

const clearInput = () => {
  searchQuery.value = ''
  emit('update:name', null)
  emit('update:modelValue', null)
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.custom-select')) {
    isOpen.value = false
  }
}

document.addEventListener('click', handleClickOutside)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-family: Arial, sans-serif;
}
.select-box {
  display: flex;
  align-items: center;
  height: 2.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-inline-end: 1rem;
  padding-inline-start: 2.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border: 1px solid #ccc;
  cursor: pointer;
  background-color: #fff;
  transition: background-color 0.3s;
  border-radius: 5px;
  position: relative;
}
.select-box.is-open {
}
.select-box.is-disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
  color: #999;
}
.select-box.is-disabled .select-input {
  background-color: #f9f9f9;
  cursor: not-allowed;
  color: #999;
}

.custom-select .close-btn-auto {
  top: 8px;
  right: 8px;
}

.select-icon {
  position: absolute;
  inset-inline-start: 0px;
  top: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  --tw-text-opacity: 1;
  color: rgb(163 163 163 / 1);
  color: rgb(163 163 163 / var(--tw-text-opacity));
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  height: 2.5rem;
  width: 2.5rem;
}

.select-input {
  border: none;
  outline: none;
  width: 100%;
}

.icon {
  height: 1.15rem;
  width: 1.15rem;
}
.clear-icon {
  margin-left: auto;
  cursor: pointer;
}
.dropdown {
  max-height: 265px;
  outline: 2px solid #0000;
  outline-offset: 2px;
  overflow: auto;
  padding-bottom: 0.25rem;
  padding-top: 0.25rem;
  width: 100%;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
    var(--tw-shadow);
  --tw-shadow-color: rgb(var(--color-muted-300) / 0.3);
  --tw-shadow: var(--tw-shadow-colored);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
  font-size: 1rem;
  line-height: 1.5rem;
  margin-top: 0.25rem;
  position: absolute;
  border-radius: 0.5rem;
  border-width: 1px;
  --tw-border-opacity: 1;
  z-index: 20;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
.options-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.options-list li {
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-family:
    Inter Variable,
    sans-serif;
}

.options-list li span {
  padding: 0.5rem;
  width: 100%;
}
.options-list li.is-selected {
  font-weight: bold;
}
.options-list li:hover:not(.is-selected) span {
  --tw-bg-opacity: 1;
  background-color: rgb(82 15 147 / 0.1);
  border-radius: 0.5rem;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
