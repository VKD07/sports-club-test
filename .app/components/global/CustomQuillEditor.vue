<template>
  <div>
    <label :for="fieldName" class="nui-label pb-2 text-[0.825rem] w-full">{{ label }}</label>
    <client-only>
      <div class="editor-container">
        <QuillEditor
          :style="{ height: height }"
          :placeholder="placeholder"
          theme="snow"
          toolbar="minimal"
          contentType="html"
          v-model:content="editorContent"
          @update:content="handleChange"
          @blur="handleBlur"
        />

        <div class="col-span-12 sm:col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" :name="fieldName">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="hidden"
              autocomplete="off"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps<{
  fieldName: string
  label: string
  placeholder: string
  content: string
  height?: string // Optional height prop
}>()

const emit = defineEmits(['update:modelValue', 'blur'])
const editorContent = ref(props.content)

const height = computed(() => props.height || '150px') // Set default height to 150px if not provided

const handleBlur = (value: string) => {
  if (editorContent.value === '<p><br></p>') {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', editorContent.value)
  emit('blur', editorContent.value)
}

const handleChange = (value: string) => {
  if (editorContent.value === '<p><br></p>') {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', editorContent.value)
}
</script>
