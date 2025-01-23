<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { endOfYear, format } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks } from '../../constants'

definePageMeta({
  title: 'Media Library',
  middleware: ['auth'],
})

const router = useRouter()
const auth = useAuthStore()

// const segmentName = 'Media'
// const pageName = 'All Media'
// const { _delete, _export, create, update, view, approve } = await usePermissionChecker(
//   segmentName,
//   pageName,
// )

// watchEffect(() => {
//   if (!view && auth.isLoggedIn) {
//     showErrorToast('Oops!', "Sorry, You don't have View permission for this page!")
//     setTimeout(() => {
//       router.push('/dashboard')
//     }, 1500)
//   }
// })

const fileLocations = ref<Folder[]>([])
fileLocations.value = await getFolderList()
const folders = fileLocations.value.map((f) => f.name)

const filter = ref('')
const debounced = refDebounced(filter, 500)
const datePreset = ref('')
const fileLocation = ref('')
const filterFileLocation = ref('')

const dateStart = ref<Date | null>(null)
const dateEnd = ref<Date | null>(null)

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    datePreset.value = value
  }
}

const removeFilterFolder = () => {
  fileLocation.value = ''
  filterFileLocation.value = ''
}

const query = computed(() => {
  const nonEmptyProperties = {
    name: debounced.value,
    folder: filterFileLocation.value,
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

// const acceptedFileTypes = computed(() => {
//   if (!fileLocation.value) return ''

//   const folder = fileLocations.value.find((folder) => folder.name === fileLocation.value)
//   if (!folder) return ''

//   switch (folder.allow_only) {
//     case 'image':
//       return '.png,.jpg,.jpeg'
//     case 'document':
//       return '.pdf,.doc,.docx,.txt,.xls,.xlsx'
//     case 'video':
//       return '.mp4'
//     default:
//       return ''
//   }
// })

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
  const { data } = await useMediaService<any>('/api/file/filter', { query })
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

const uploadedFilesArray = ref<File[]>([])
const openFileInput = () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  if (fileInput) {
    fileInput.click()
  }
}

const progressValue = ref(0)
const progressText = ref('0%')
let interval: NodeJS.Timeout | null = null
let startTime: number | null = null
let pendingStartTime: number | null = null

const startAnimation = () => {
  startTime = Date.now()
  interval = setInterval(() => {
    const elapsedTime = Date.now() - startTime!
    const animationDuration = pendingStartTime ? Date.now() - pendingStartTime : 2000
    const progress = Math.min((elapsedTime / animationDuration) * 100, 100)
    progressValue.value = Math.floor(progress)
    progressText.value = `${progressValue.value}%`
    if (progressValue.value >= 100) {
      clearInterval(interval!)
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
    startAnimation()
  } else {
    stopAnimation()
    pendingStartTime = null
    progressValue.value = 0
    progressText.value = '0%'
  }
})

const MAX_IMAGE_SIZE_MB = 5 // Maximum image size in MB
const MAX_VIDEO_SIZE_MB = 50 // Maximum video size in MB
const MAX_FILE_SIZE_MB = 15 // Maximum file size in MB
const MAX_BULK_UPLOAD = 20 // Maximum number of files for bulk upload

const filesWithErrors: { file: File; error: string }[] = ref([])

const handleFileSelection = async (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target.files) {
    const filesToUpload: File[] = []
    // const filesWithErrors: { file: File; error: string }[] = []
    console.log('No of files: ', target.files.length)

    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i]

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
      uploadedFilesArray.value.push(...filesToUpload)
      await uploadFiles(filesToUpload)
    }

    // Show error messages for files with errors
    // if (filesWithErrors.value.length > 0) {
    //   filesWithErrors.value.forEach(({ error }) => showErrorToast('Error', error))
    // }
  }
}

const success = ref(false)

async function uploadFiles(files: File[]): Promise<void> {
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
    success.value = true
    uploadedFilesArray.value = []
    await constructAllFiles()
  } catch (error) {
    pending.value = false
    success.value = false
    showErrorToast('Oops!', `Error while uploading files: ${error}`)
  } finally {
    setTimeout(() => {
      success.value = false
    }, 2000)
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const displayCount = ref(24)
const displayedImages = computed(() => allFilesArray.value?.slice(0, displayCount.value))
const showLoadMore = computed(() => displayCount.value < allFilesArray.value?.length)

const loadMore = () => {
  displayCount.value += 6
}

watch(fileLocation, () => {
  filterFileLocation.value = fileLocation.value
  console.log('acceptedFileTypes', acceptedFileTypes.value)
})

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))
</script>

<template>
  <div>
    <div class="flex items-center justify-between px-4 mt-2 gap-16">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Manage Media Files
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Access and manage all media files, including images, videos, and documents used across the
          platform.
        </BaseText>
      </div>

      <div class="hidden sm:flex items-center gap-2 relative">
        <BaseButtonClose
          v-if="fileLocation"
          size="sm"
          rounded="sm"
          color="muted"
          class="absolute z-[9] w-[25px] h-[25px] p-[6px] right-[150px] top-[8px]"
          @click="fileLocation = ''"
        />
        <BaseListbox
          v-model="fileLocation"
          :items="folders"
          placeholder="Choose folder"
          class="w-80"
        />

        <input
          id="fileInput"
          type="file"
          ref="fileInput"
          multiple
          :accept="acceptedFileTypes"
          style="display: none"
          @change="handleFileSelection"
        />
        <label for="fileInput" class="w-24 cursor-pointer">
          <BaseButton
            color="primary"
            class="w-full"
            :disabled="fileLocation === ''"
            @click="openFileInput"
          >
            Upload
          </BaseButton>
        </label>
      </div>
    </div>

    <div class="mx-auto w-full space-y-12 py-3">
      <BaseMessage v-if="success" @close="success = false"> Your files are uploaded! </BaseMessage>
      <div v-if="filesWithErrors">
        <BaseMessage
          v-for="(error, index) in filesWithErrors"
          :key="index"
          type="danger"
          class="mt-2"
        >
          {{ error }}
        </BaseMessage>
      </div>
    </div>

    <!-- Filter -->
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-6 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div
            class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:grow sm:ps-2 flex-2"
          >
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Filter users..."
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
            />
          </div>

          <div
            class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-28 relative"
          >
            <BaseButtonClose
              v-if="filterFileLocation"
              size="sm"
              rounded="sm"
              color="muted"
              class="absolute z-[9] w-[25px] h-[25px] p-[6px] right-[55px] top-[15px]"
              @click="removeFilterFolder"
            />
            <BaseListbox
              v-model="filterFileLocation"
              :items="folders"
              placeholder="Choose folder"
            />
          </div>
        </div>

        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
            <CustomDropdown
              :options="datePresets"
              placeholder="Choose date preset"
              @selected-value="handleSelectedValue(1, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
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

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2">
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

    <BaseCard class="mt-0 p-6">
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            <a :href="getImageUrl(image.url)" target="_blank" rel="noopener noreferrer">
              <div v-if="image.allow_only === 'image'" class="relative">
                <img
                  class="h-32 w-full object-cover max-w-full rounded-lg lazy-load"
                  :src="getImageUrl(image.url)"
                  alt=""
                />
              </div>

              <div v-if="image.allow_only === 'document'" class="relative">
                <img
                  class="h-32 w-full object-cover max-w-full rounded-lg lazy-load"
                  :src="getImagePath(image.url)"
                  alt="File Icon"
                />
                <span class="w-full text-primary-400 mt-2 flex text-center text-xs">{{
                  image.name
                }}</span>
              </div>

              <div v-if="image.allow_only === 'video'" class="relative">
                <img
                  class="h-32 w-full object-cover max-w-full rounded-lg lazy-load"
                  :src="getImagePath(image.url)"
                  alt="Video preview"
                />
                <span class="w-full text-primary-400 mt-2 flex text-center text-xs">{{
                  image.name
                }}</span>
              </div>
            </a>
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
</style>
