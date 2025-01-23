<template>
  <div>
    <label :for="fieldName" class="nui-label pb-2 text-[0.825rem] w-full">{{ label }}</label>
    <Editor
      api-key="exnv8i4jbrn7btt6wajmalr7y6ggr0wbrkob9gn57im50q0x"
      :init="{
        height: 800,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'link',
          'image',
          'lists',
          'charmap',
          'preview',
          'anchor',
          'pagebreak',
          'searchreplace',
          'wordcount',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'emoticons',
        ],
        toolbar:
          'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
          'forecolor backcolor emoticons',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
      }"
      :placeholder="placeholder"
      v-model="editorContent"
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
</template>

<script setup>
import { Field } from 'vee-validate'

const props = defineProps({
  fieldName: String,
  label: String,
  placeholder: String,
  content: String,
})

const emit = defineEmits(['update:modelValue', 'blur'])
const editorContent = ref(props.content)

const handleBlur = () => {
  if (editorContent.value === '<p><br></p>') {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', editorContent.value)
  emit('blur', editorContent.value)
}

const handleChange = () => {
  if (editorContent.value === '<p><br></p>') {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', editorContent.value)
}
</script>

<style scoped>
.editor-container {
  border: 1px solid #ddd;
  padding: 10px;
  min-height: 550px;
}
</style>
