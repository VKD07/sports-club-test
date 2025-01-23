<script setup>
import { datePresets, masks } from '../../constants'
import { format, endOfYear } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

const { isOpen, folder } = defineProps(['isOpen', 'folder'])
const emits = defineEmits(['close', 'addImage'])

const closeModal = () => {
  emits('close')
}

const fileLocations = ref([])
fileLocations.value = await getFolderList()

const datePreset = ref('')
const fileLocation = ref(folder)

const dateStart = ref(null)
const dateEnd = ref(null)

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    datePreset.value = value
  }
}

const query = computed(() => {
  const nonEmptyProperties = {
    folder: fileLocation.value,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    nonEmptyProperties.dateRange = datePreset.value
    nonEmptyProperties.startDate = dateStart.value
      ? format(new Date(dateStart.value), 'yyyy-MM-dd')
      : undefined
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )
  return filteredProperties
})

const acceptedFileTypes = computed(() => {
  if (!fileLocation.value) return ''

  const folder = fileLocations.value.find((folder) => folder.name === fileLocation.value)
  if (!folder) return ''

  switch (folder.allow_only) {
    case 'image':
      return '.png,.jpg,.jpeg,.svg,.gif'
    case 'document':
      return '.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv'
    case 'video':
      return '.mp4,.mov,.webm'
    default:
      return ''
  }
})

const filesList = ref([])
const allFilesArray = ref([])

const constructAllFiles = async () => {
  const { data } = await useMediaService('/api/file/filter', { query })
  filesList.value = data.value.data

  allFilesArray.value = filesList.value.map((image) => {
    const folder = fileLocations.value.find((folder) => folder.name === image.category)
    return {
      name: image.file_name,
      category: image.category,
      created_at: image.created_at,
      url: image.url,
      allow_only: folder ? folder.allow_only : null,
    }
  })
}
await constructAllFiles()

watch(query, async (value) => {
  await constructAllFiles()
})

// ----------------------------
const uploadedFiles = ref(null)
const uploadedFilesArray = ref([])

const progressValue = ref(0)
const progressText = ref('0%')
let interval = null
let startTime = null
let pendingStartTime = null

const startAnimation = () => {
  startTime = Date.now()
  interval = setInterval(() => {
    // const elapsedTime = Date.now() - startTime!
    const animationDuration = pendingStartTime ? Date.now() - pendingStartTime : 2000
    const progress = Math.min((elapsedTime / animationDuration) * 100, 100)
    progressValue.value = Math.floor(progress)
    progressText.value = `${progressValue.value}%`
    if (progressValue.value >= 100) {
      // clearInterval(interval!)
    }
  }, 100)
}

const stopAnimation = () => {
  if (interval) {
    clearInterval(interval)
  }
}

const pending = ref(false)
watch(pending, (value) => {
  if (value) {
    pendingStartTime = Date.now()
    // startAnimation()
  } else {
    // stopAnimation()
    pendingStartTime = null
    progressValue.value = 0
    progressText.value = '0%'
  }
})

async function uploadFiles(files) {
  pending.value = true

  const formData = new FormData()
  formData.append('folder_name', fileLocation.value)

  files.forEach((file) => {
    formData.append('file[]', file)
  })

  try {
    const { data, error } = await useMediaService('/api/file/upload', {
      method: 'POST',
      body: formData,
    })

    if (error.value) {
      throw new Error(`Failed to upload files`)
    }

    pending.value = false
    uploadedFiles.value = null
    uploadedFilesArray.value = []
    await constructAllFiles()
  } catch (error) {
    pending.value = false
    showErrorToast('Oops!', `Error while uploading files: ${error}`)
  }
}

const displayCount = ref(24)
const displayedImages = computed(() => allFilesArray.value?.slice(0, displayCount.value))
const showLoadMore = computed(() => displayCount.value < allFilesArray.value?.length)

const loadMore = () => {
  displayCount.value += 6
}

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

const MAX_IMAGE_SIZE_MB = 5 // Maximum image size in MB
const MAX_VIDEO_SIZE_MB = 50 // Maximum video size in MB
const MAX_FILE_SIZE_MB = 15 // Maximum file size in MB
const MAX_BULK_UPLOAD = 20 // Maximum number of files for bulk upload

const filesWithErrors = ref([])

const handleFileSelection = async (newFiles) => {
  if (newFiles) {
    uploadedFilesArray.value = Array.from(newFiles)
    const filesToUpload = []

    console.log('No of files: ', uploadedFilesArray.value.length)

    for (let i = 0; i < uploadedFilesArray.value.length; i++) {
      const file = uploadedFilesArray.value[i]

      // Validate file type and size
      let maxFileSizeMb
      switch (file.type) {
        case 'image/jpeg':
        case 'image/png':
          maxFileSizeMb = MAX_IMAGE_SIZE_MB
          break
        case 'video/mp4':
          maxFileSizeMb = MAX_VIDEO_SIZE_MB
          break
        default:
          maxFileSizeMb = MAX_FILE_SIZE_MB
          break
      }

      if (file.size > maxFileSizeMb * 1024 * 1024) {
        filesWithErrors.value.push({
          file,
          error: `File ${file.name} exceeds the maximum size limit (${maxFileSizeMb}MB).`,
        })
      } else {
        filesToUpload.push(file)
      }
    }

    console.log('filesToUpload', filesToUpload)
    console.log('filesWithErrors', filesWithErrors.value)

    // Validate maximum number of files
    if (filesToUpload && filesToUpload.length > MAX_BULK_UPLOAD) {
      showErrorToast('Oops!', `You can upload a maximum of ${MAX_BULK_UPLOAD} files in total.`)
      return
    }

    // Upload valid files
    if (filesToUpload.length > 0) {
      // uploadedFilesArray.value.push(...filesToUpload)
      await uploadFiles(filesToUpload)
    }

    // Show error messages for files with errors
    // if (filesWithErrors.value.length > 0) {
    //   filesWithErrors.value.forEach(({ error }) => showErrorToast('Error', error))
    // }
  }
}

watch(uploadedFiles, async (newFiles) => {
  if (newFiles) {
    await handleFileSelection(newFiles)
  }
})

const selectedImageUrls = ref([])
function toggleImageSelection(imageUrl) {
  const index = selectedImageUrls.value.indexOf(imageUrl)

  if (index !== -1) {
    selectedImageUrls.value.splice(index, 1)
  } else {
    selectedImageUrls.value = []
    selectedImageUrls.value.push(imageUrl)
  }
}

const addImage = () => {
  emits('addImage', selectedImageUrls.value[0], folder)
  closeModal()
}
</script>

<template>
  <TairoModal :open="isOpen" size="3xl" @close="closeModal">
    <template #header>
      <div class="relative h-20">
        <div class="p-6 pe-16 flex justify-between gap-4">
          <div class="gap-4 lg:items-center flex-col">
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              {{ folder }}
            </BaseHeading>
          </div>

          <div class="flex justify-end">
            <BaseButton
              color="primary"
              class="w-full sm:w-32"
              :disabled="selectedImageUrls.length === 0"
              @click="addImage"
            >
              <span>Add Image</span>
            </BaseButton>
          </div>
        </div>

        <BaseButtonClose
          @click="closeModal"
          class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
        />
      </div>
    </template>

    <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-10rem)]">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-6">
          <div>
            <BaseInputFileHeadless
              :accept="acceptedFileTypes"
              multiple
              v-model="uploadedFiles"
              v-slot="{ open, remove, preview, drop, files }"
            >
              <div
                role="button"
                tabindex="-1"
                @dragenter.stop.prevent
                @dragover.stop.prevent
                @drop="drop"
              >
                <div
                  v-if="!uploadedFilesArray?.length"
                  class="nui-focus bg-primary-50/50 border-primary-300 dark:border-muted-700 hover:border-primary-500 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-2 transition-colors duration-300"
                  tabindex="0"
                  role="button"
                  @click="open"
                  @keydown.enter.prevent="open"
                >
                  <div class="p-1 text-center">
                    <Icon
                      name="mdi-light:cloud-upload"
                      class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 w-10 h-10 transition-colors duration-300"
                    />

                    <h4 class="text-muted-400 font-sans text-sm">Drop files to upload</h4>
                    <div>
                      <span class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase">
                        Or
                      </span>
                    </div>

                    <label
                      for="file"
                      class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                    >
                      Select files
                    </label>
                  </div>
                </div>

                <ul v-else class="mt-6 flex flex-wrap gap-2">
                  <li v-for="file in uploadedFilesArray" :key="file.name">
                    <div
                      class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative rounded-xl border bg-white p-3"
                    >
                      <div class="flex items-center justify-between">
                        <div class="shrink-0">
                          <img
                            v-if="file.type.startsWith('image')"
                            :src="preview(file).value"
                            alt="Image preview"
                            class="h-14 w-14 rounded-xl object-cover object-center"
                          />

                          <img
                            v-else
                            class="h-14 w-14 rounded-xl object-cover object-center"
                            src="/img/avatars/placeholder-file.png"
                            alt="Image preview"
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </BaseInputFileHeadless>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6">
          <BaseCard class="ptablet:py-2 ptablet:px-2 mb-4 py-4 px-2">
            <div
              class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
            >
              <div class="ptablet:col-span-3 flex-grow-0 flex-basis-0 w-full px-2 py-2 relative">
                <!-- Content for column 3 -->
                <CustomDropdown
                  :options="datePresets"
                  placeholder="Date preset"
                  @selected-value="handleSelectedValue(1, $event)"
                />
              </div>
            </div>

            <div
              class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
            >
              <div class="ptablet:col-span-3 flex-grow-0 flex-basis-0 w-full px-2 py-2">
                <!-- Content for column 4 -->
                <DatePicker
                  v-model="dateStart"
                  :masks="masks"
                  :max-date="setMaxDate()"
                  mode="date"
                  hide-time-header
                  trim-weeks
                >
                  <template #default="{ togglePopover, inputValue }">
                    <div class="flex w-full flex-col gap-4 sm:flex-row">
                      <div class="relative grow">
                        <BaseInput
                          placeholder="Start date"
                          autocomplete="off"
                          icon="ph:calendar-blank-duotone"
                          :value="inputValue"
                          type="text"
                          :disabled="datePreset !== 'Custom day' && datePreset !== 'Custom range'"
                          @click="togglePopover"
                        />
                      </div>
                    </div>
                  </template>
                </DatePicker>
              </div>

              <div class="ptablet:col-span-3 flex-grow-0 flex-basis-0 w-full px-2 py-2">
                <!-- Content for column 5 -->
                <DatePicker
                  v-model="dateEnd"
                  :masks="masks"
                  :max-date="datePreset !== 'This Year' ? setMaxDate() : endOfYear(new Date())"
                  mode="date"
                  hide-time-header
                  trim-weeks
                >
                  <template #default="{ togglePopover, inputValue }">
                    <div class="flex w-full flex-col gap-4 sm:flex-row">
                      <div class="relative grow">
                        <BaseInput
                          placeholder="End date"
                          autocomplete="off"
                          icon="ph:calendar-blank-duotone"
                          :value="inputValue"
                          type="text"
                          :disabled="datePreset !== 'Custom range'"
                          @click="togglePopover"
                        />
                      </div>
                    </div>
                  </template>
                </DatePicker>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <BaseCard class="mt-4 p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="(image, index) in uploadedFilesArray" :key="index">
            <div v-if="image">
              <div class="w-full h-32 block relative">
                <BasePlaceload class="w-full h-32 block rounded-lg" />

                <div class="absolute inset-0 w-full h-32 flex items-center justify-center">
                  <!-- <BaseProgressCircle
                    title="Primary circle progress bar"
                    :size="45"
                    :value="progressValue"
                    class="text-primary-500"
                  /> -->
                </div>
              </div>
            </div>
          </div>

          <TransitionGroup name="fade-slide">
            <div v-for="(image, index) in displayedImages" :key="index">
              <div v-if="image.allow_only === 'image'" class="relative">
                <img
                  class="h-32 w-full object-cover max-w-full rounded-lg"
                  :src="getImageUrl(image.url)"
                  alt=""
                />
                <div class="selected absolute start-3 top-3 flex items-center justify-center">
                  <BaseCheckbox
                    rounded="sm"
                    :checked="selectedImageUrls.includes(image.url)"
                    @change="toggleImageSelection(image.url)"
                  />
                </div>
              </div>

              <div v-if="image.allow_only === 'document'" class="relative">
                <img
                  class="h-32 w-full object-cover max-w-full rounded-lg"
                  :src="getImagePath(image.url)"
                  alt="File Icon"
                />
                <div class="selected absolute start-3 top-3 flex items-center justify-center">
                  <BaseCheckbox
                    rounded="sm"
                    :checked="selectedImageUrls.includes(image.url)"
                    @change="toggleImageSelection(image.url)"
                  />
                </div>
                <span class="w-full text-primary-400 mt-2 flex text-center text-xs">{{
                  image.name
                }}</span>
              </div>

              <div v-if="image.allow_only === 'video'" class="relative">
                <img
                  class="h-32 w-full object-cover max-w-full rounded-lg"
                  :src="getImagePath(image.url)"
                  alt="Video preview"
                />
                <div class="selected absolute start-3 top-3 flex items-center justify-center">
                  <BaseCheckbox
                    rounded="sm"
                    :checked="selectedImageUrls.includes(image.url)"
                    @change="toggleImageSelection(image.url)"
                  />
                </div>
                <span class="w-full text-primary-400 mt-2 flex text-center text-xs">{{
                  image.name
                }}</span>
              </div>
            </div>
          </TransitionGroup>
        </div>
        <div class="mt-12 flex justify-center">
          <BaseButton v-if="showLoadMore" color="primary" class="w-full sm:w-32" @click="loadMore">
            <span>Load More</span>
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </TairoModal>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.5s,
    transform 0.5s;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #ddd;
}
</style>
