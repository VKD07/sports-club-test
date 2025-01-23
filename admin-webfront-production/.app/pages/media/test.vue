<script setup lang="ts">
import { setDateValues, setMaxDate, showErrorToast } from '../../utils'
import { datePresets, masks } from '../../constants'
import { refDebounced } from '@vueuse/core'
import { endOfYear } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

definePageMeta({
  title: 'Media',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

const filter = ref('')
const debounced = refDebounced(filter, 500)
const datePreset = ref('')
const imgFolder = ref('')

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    imgFolder.value = value
  } else if (dropdownId === 2) {
    datePreset.value = value
  }
}

const dateStart = ref<Date | null>(null)
const dateEnd = ref<Date | null>(null)

const perPage = ref(2)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    search: debounced.value,
    folder: imgFolder.value,
    startDate: dateStart.value,
    endDate: dateEnd.value,
    perPage: perPage.value,
    page: page.value,
  }

  const filteredProperties = Object.fromEntries(Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''))
  return filteredProperties
})

const { data: imagesArray, pending, error, refresh } = await useMediaService<any>('/api/file/folder-files', { query })
if (error.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const uploadedFiles = ref<FileList | null>(null)
const uploadedFilesArray = ref<File[]>([])

async function uploadFilesWithDelay(files: File[]) {
  for (const file of files) {
    await new Promise<void>((resolve) => {
      // Specify void for the Promise type
      setTimeout(() => {
        resolve() // Resolve without passing any value
      }, 3000)
    })

    await uploadFile(file)
  }
}

watch(uploadedFiles, async (newFiles) => {
  if (newFiles) {
    uploadedFilesArray.value = [...newFiles]
    console.log('🚀 ~ watch ~ uploadedFilesArray:', uploadedFilesArray)

    await uploadFilesWithDelay([...newFiles])

    uploadedFiles.value = null
  }
})

const removeFileByNameAndSize = (name: string, size: number): void => {
  const index = uploadedFilesArray.value.findIndex((file) => file.name === name && file.size === size)
  if (index !== -1) {
    uploadedFilesArray.value.splice(index, 1)
  }
}

async function uploadFile(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('folder_name', 'Common1')
  formData.append('file[]', file)

  try {
    const { error } = await useMediaService('/api/file/upload', {
      method: 'POST',
      body: formData, // No need to set headers, FormData will set them automatically
    })

    if (error.value) {
      throw new Error(`Failed to upload file: ${file.name}`)
    }

    // Handle successful upload logic
    // removeFileByNameAndSize(file.name, file.size)
    refresh()
  } catch (error) {
    showErrorToast('Oops!', `Error while uploading file: ${error}`)
  }
}

const displayCount = ref(6)
const displayedImages = computed(() => imagesArray.value?.folder_data.slice(0, displayCount.value))
const showLoadMore = computed(() => displayCount.value < imagesArray.value?.folder_data.length)

const loadMore = () => {
  displayCount.value += 6
}

// const deleteImage = (index: number) => {
//   imagesArray.value.splice(index, 1)
// }

const progressValue = ref(0)
const progressText = ref('0%')

const increaseProgress = () => {
  const interval = setInterval(() => {
    if (progressValue.value < 100) {
      progressValue.value++
      progressText.value = `${progressValue.value}%`
    } else {
      clearInterval(interval)
    }
  }, 100)
}

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const folders = ref(['Folder 1', 'Folder 2', 'Folder 3', 'Folder 4', 'Folder 5'])
</script>

<template>
  <div>
    <div>
      <BaseInputFileHeadless multiple v-model="uploadedFiles" v-slot="{ open, remove, preview, drop, files }">
        <div role="button" tabindex="-1" @dragenter.stop.prevent @dragover.stop.prevent @drop="drop">
          <div
            v-if="!files?.length"
            class="nui-focus bg-primary-50/50 border-primary-300 dark:border-muted-700 hover:border-primary-500 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-2 transition-colors duration-300"
            tabindex="0"
            role="button"
            @click="open"
            @keydown.enter.prevent="open"
          >
            <div class="p-5 text-center">
              <Icon
                name="mdi-light:cloud-upload"
                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 w-10 h-10 transition-colors duration-300"
              />

              <h4 class="text-muted-400 font-sans text-sm">Drop files to upload</h4>
              <div><span class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"> Or </span></div>

              <label
                for="file"
                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
              >
                Select files
              </label>
            </div>
          </div>

          <ul v-else class="mt-6 flex flex-wrap gap-2">
            <li v-for="file in uploadedFiles" :key="file.name">
              <div class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative rounded-xl border bg-white p-3 min-w-[150px]">
                <div class="flex items-center justify-between">
                  <div class="shrink-0">
                    <img
                      v-if="file.type.startsWith('image')"
                      :src="preview(file).value"
                      alt="Image preview"
                      class="h-14 w-14 rounded-xl object-cover object-center"
                    />

                    <img v-else class="h-14 w-14 rounded-xl object-cover object-center" src="/img/avatars/placeholder-file.png" alt="Image preview" />
                  </div>

                  <div class="font-sans">
                    <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">{{ file.name }}</span>
                    <span class="text-muted-400 block text-xs">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </BaseInputFileHeadless>
    </div>

    <div class="relative mt-10">
      <BaseCard class="ptablet:py-2 ptablet:px-4 mb-4 py-2 px-4">
        <div class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0">
          <div class="ptablet:ps-2 ptablet:col-span-6 basis-1/5 w-full py-2 px-2 sm:w-auto">
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Search"
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-full',
              }"
            />
          </div>

          <div class="ptablet:col-span-6 w-full basis-1/5 px-2 py-2 sm:w-auto relative">
            <CustomDropdown :options="folders" placeholder="Choose folder" @selected-value="handleSelectedValue(1, $event)" />
          </div>

          <div class="ptablet:col-span-6 w-full basis-1/5 px-2 py-2 sm:w-auto relative">
            <CustomDropdown :options="datePresets" placeholder="Choose date preset" @selected-value="handleSelectedValue(2, $event)" />
          </div>

          <div class="ptablet:col-span-6 w-full basis-1/5 px-2 py-2 sm:w-auto">
            <DatePicker v-model="dateStart" :masks="masks" :max-date="setMaxDate()" mode="date" hide-time-header trim-weeks>
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

          <div class="ptablet:col-span-6 w-full basis-1/5 px-2 py-2 sm:w-auto">
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
        <div v-for="(image, index) in uploadedFiles" :key="index">
          <div v-if="image">
            <div class="w-full h-32 block relative">
              <BasePlaceload class="w-full h-32 block rounded-lg" />

              <div class="absolute inset-0 w-full h-32 flex items-center justify-center">
                <BaseProgressCircle title="Primary circle progress bar" :size="45" :value="progressValue" class="text-primary-500" />
              </div>
            </div>

            <div class="max-w-sm space-y-2 mt-2">
              <BasePlaceload class="h-3 w-full rounded" />
              <BasePlaceload class="h-3 w-[85%] rounded" />
            </div>
          </div>
        </div>

        <TransitionGroup name="fade-slide">
          <div v-for="(image, index) in displayedImages" :key="index">
            <div class="relative">
              <img class="h-32 w-full object-cover max-w-full rounded-lg" :src="image.url" alt="" />
              <BaseText size="sm" class="text-muted-600 dark:text-muted-400 mt-2 break-words">{{ image.name }}</BaseText>

              <!-- <div class="absolute end-3 top-3">
              <button
                type="button"
                class="text-white bg-danger-400 hover:bg-danger-600 focus:ring-1 focus:outline-none focus:ring-danger-300 font-medium rounded-md text-sm p-1 text-center inline-flex items-center dark:bg-danger-600 dark:hover:bg-danger-700 dark:focus:ring-danger-800"
                @click="deleteImage(index)"
              >
                <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
              </button>
            </div> -->
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
