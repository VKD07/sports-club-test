<template>
  <div class="p-4 bg-muted-100 rounded-md flex justify-between gap-6">
    <div class="flex gap-4">
      <div class="w-64">
        <BaseListbox
          v-model="selectedFileType"
          placeholder="Select file type"
          :items="fileType"
          :disabled="selectedFile !== ''"
        />
      </div>

      <div>
        <div v-if="!selectedFile">
          <label v-if="selectedFileType" color="primary" class="w-24 cursor-pointer">
            <BaseButton color="primary" class="w-60" @click="addFile">
              <Icon
                :name="
                  selectedFileType === 'Video'
                    ? 'icon-park-outline:record'
                    : 'icon-park-outline:upload-picture'
                "
                class="me-1 size-4"
              />

              <span>Add {{ selectedFileType }}</span>
            </BaseButton>
          </label>
        </div>

        <div v-else>
          <div
            class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-[5px]"
          >
            <div class="flex items-center">
              <div class="shrink-0">
                <img
                  v-if="selectedFileType === 'Image'"
                  class="h-16 w-16 rounded-md object-cover object-center"
                  :src="getImageUrl(selectedFile)"
                  alt="Image preview"
                />

                <img
                  v-if="selectedFileType === 'Document'"
                  class="h-16 w-16 rounded-xl object-cover object-center"
                  :src="getImagePath(selectedFile)"
                  alt="File Icon"
                />

                <img
                  v-if="selectedFileType === 'Video'"
                  class="h-16 w-16 rounded-xl object-cover object-center"
                  :src="getImagePath(selectedFile)"
                  alt="Video preview"
                />
              </div>

              <div class="font-sans">
                <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm px-2">
                  {{ file?.name ? file?.name : '' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center">
      <BaseButton
        v-if="file.name === '' && uploadedFilesArray.length > 1"
        color="error"
        @click="emitRemoveFile"
      >
        <Icon name="eva:close-outline" class="me-1 size-4" />
        <span>Remove</span>
      </BaseButton>

      <BaseButton
        v-if="file.name !== '' && uploadedFilesArray.length > 0"
        color="error"
        @click="emitRemoveFile"
      >
        <Icon name="eva:close-outline" class="me-1 size-4" />
        <span>Remove</span>
      </BaseButton>
    </div>

    <InformationHubMediaPopup
      v-if="isMediaModalOpen"
      :isOpen="isMediaModalOpen"
      :folder="fileFolder"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />
  </div>
</template>

<script setup>
const emit = defineEmits(['fileUploaded', 'removeFile'])
const props = defineProps({
  file: Object,
  uploadedFilesArray: Array,
  index: Number,
})

const selectedFile = ref(props.file ? props.file?.url : '')
const selectedFileType = ref(props.file ? props.file?.type : '')

const emitRemoveFile = () => {
  emit('removeFile', props.index)
}

const fileFolder = ref('')
const isMediaModalOpen = ref(false)

const addFile = () => {
  if (selectedFileType.value === 'Image') {
    fileFolder.value = 'admin_post_images'
  } else if (selectedFileType.value === 'Document') {
    fileFolder.value = 'admin_documents'
  } else {
    fileFolder.value = 'admin_video'
  }
  isMediaModalOpen.value = true
}

const addImage = (image) => {
  isMediaModalOpen.value = false
  selectedFile.value = image.url
  fileFolder.value = ''
  emit('fileUploaded', selectedFile.value, selectedFileType.value, image.name)
}

const fileType = ['Image', 'Document', 'Video']
</script>
