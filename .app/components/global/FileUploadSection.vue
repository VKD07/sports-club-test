<template>
  <div class="p-4 bg-muted-100 rounded-md flex justify-between gap-6">
    <div class="flex gap-4">
      <div class="w-64">
        <BaseListbox
          v-model="selectedFileType"
          placeholder="Select file type"
          :items="fileType"
          :disabled="uploadedFile !== null"
        />
      </div>

      <div>
        <div v-if="!uploadedFile">
          <input
            id="imgFileInput"
            type="file"
            ref="fileInput"
            accept=".png,.jpg,.jpeg,.svg,.gif"
            style="display: none"
            @change="handleFileSelection($event, 'img')"
          />

          <input
            id="docFileInput"
            type="file"
            ref="fileInput"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
            style="display: none"
            @change="handleFileSelection($event, 'doc')"
          />

          <input
            id="vidFileInput"
            type="file"
            ref="fileInput"
            accept=".mp4,.mov,.webm"
            style="display: none"
            @change="handleFileSelection($event, 'vid')"
          />

          <label
            for="fileInput"
            v-if="selectedFileType"
            color="primary"
            class="w-24 cursor-pointer"
          >
            <BaseButton v-if="selectedFileType" color="primary" class="w-60" @click="openFileInput">
              <Icon
                :name="
                  selectedFileType === 'Screen recording'
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
            class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-[5px] pr-[10px]"
          >
            <div class="flex items-center">
              <img
                v-if="fileDetail?.type.startsWith('image')"
                class="h-16 w-16 rounded-md object-cover object-center w-24"
                :src="fileDetail?.path"
                alt="Image preview"
              />
              <img
                v-else-if="fileDetail?.type === 'application/pdf'"
                class="h-16 w-16 rounded-xl object-cover object-center"
                :src="getImagePath(fileDetail?.name)"
                alt="File Icon"
              />
              <img
                v-else-if="fileDetail?.type.startsWith('video')"
                class="h-16 w-16 rounded-xl object-cover object-center"
                :src="getImagePath(fileDetail?.name)"
                alt="Video preview"
              />
            </div>
            <div class="flex flex-col">
              <span>{{ fileDetail?.name }}</span>
              <span class="text-sm">{{ fileDetail?.size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center">
      <BaseButton v-if="uploadedFilesArray.length > 1" color="error" @click="removeFileUpload">
        <Icon name="eva:close-outline" class="me-1 size-4" />
        <span>Remove</span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['fileUploaded', 'removeFile'])
const props = defineProps({
  fileUpload: Object,
  uploadedFilesArray: Array,
})

const uploadedFile = ref(props.fileUpload.type !== '' ? props.fileUpload : null)
const selectedFileType = ref('')

const openFileInput = () => {
  const imgFileInput = document.getElementById('imgFileInput')
  const docFileInput = document.getElementById('docFileInput')
  const vidFileInput = document.getElementById('vidFileInput')

  if (selectedFileType.value === 'Image / Screenshot') {
    if (imgFileInput) {
      imgFileInput.click()
    }
  } else if (selectedFileType.value === 'Document') {
    if (docFileInput) {
      docFileInput.click()
    }
  } else {
    if (vidFileInput) {
      vidFileInput.click()
    }
  }
}

const handleFileSelection = async (event) => {
  const target = event.target
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    uploadedFile.value = file
    emit('fileUploaded', uploadedFile.value)
  }
}

const fileDetail = computed(() => {
  if (!uploadedFile.value || uploadedFile.value.type === '') {
    return null
  }

  const { name, type, size } = uploadedFile.value
  const path = URL.createObjectURL(uploadedFile.value)
  let fileSize = ''

  if (size < 1024) {
    fileSize = size + ' B'
  } else if (size < 1024 * 1024) {
    fileSize = (size / 1024).toFixed(2) + ' KB'
  } else {
    fileSize = (size / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return { name, type, size: fileSize, path }
})

const removeFileUpload = () => {
  emit('removeFile', uploadedFile.value)
}

const fileType = ['Image / Screenshot', 'Document', 'Screen Recording']
</script>
