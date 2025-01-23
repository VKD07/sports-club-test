<template>
  <BaseCard class="mt-12">
    <div class="p-8">
      <Stepper />

      <!-- STEP 2 -->
      <div>
        <div class="flex gap-8 items-center justify-between py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              UPLOAD LIST OF STUDENTS DETAILS
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400 max-w-lg">
              To ensure efficient bulk student account creation, it's recommended to upload data for
              a maximum of 200 students in a single CSV file.
            </BaseText>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="bg-primary-400 text-white px-6 py-2 rounded-full"> Step-2 </span>
          </div>
        </div>

        <div class="mt-6 mx-auto max-w-3xl">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 sm:col-span-6 relative">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="school">
                <BaseAutocomplete
                  label="School"
                  :items="schoolNames"
                  placeholder="Select School"
                  autocomplete="off"
                  icon="heroicons:building-library"
                  :model-value="[field.value]"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  :class="errorMessage ? 'error-border' : ''"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>

            <div class="col-span-12 sm:col-span-6">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="location">
                <BaseListbox
                  label="Location"
                  :items="locations?.map((l) => l.name)"
                  placeholder="Select Location"
                  :model-value="field.value"
                  :error="errorMessage"
                  :disabled="values.school === ''"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>
          </div>
        </div>

        <div class="mt-8 mx-auto max-w-3xl">
          <BaseInputFileHeadless
            v-if="uploadedFile === null"
            v-slot="{ open, remove, preview, drop, files }"
            v-model="uploadedFile"
            :disabled="values.school === '' && values.location === ''"
          >
            <div
              role="button"
              tabindex="-1"
              @dragenter.stop.prevent
              @dragover.stop.prevent
              @drop="drop"
            >
              <div
                v-if="!files?.length"
                class="nui-focus bg-primary-50/50 dark:bg-muted-900 border-primary-300 dark:border-muted-700 hover:border-primary-500 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-2 transition-colors duration-300"
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

                  <h4 class="text-muted-400 font-sans text-sm">Drop CSV file for upload</h4>

                  <div>
                    <span class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase">
                      Or
                    </span>
                  </div>

                  <label
                    for="file"
                    class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                  >
                    Select a file
                  </label>
                </div>
              </div>
            </div>
          </BaseInputFileHeadless>

          <BaseCard v-else class="mt-6 p-4">
            <div class="flex gap-4">
              <div>
                <img
                  class="size-10 rounded-md object-contain object-center w-12"
                  src="/img/logos/excel.png"
                  alt="Image preview"
                />
              </div>

              <div class="flex-1">
                <div class="pe-4 relative flex justify-between align-top">
                  <div class="font-sans">
                    <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                      {{ fileName }}
                    </span>

                    <span class="text-muted-400 block text-xs"> {{ `${fileSizeInKB}KB` }} </span>
                  </div>

                  <div v-if="isUploading">
                    <div
                      class="bg-yellow-300 text-sm px-8 py-2 me-6 rounded-full mb-0 leading-none dot-loading"
                    >
                      Uploading<span>.</span><span>.</span><span>.</span><span>.</span
                      ><span>.</span>
                    </div>
                  </div>

                  <div v-if="!isUploading && uploadSuccess">
                    <div class="bg-green-300 text-sm px-8 py-2 me-6 rounded-full mb-0 leading-none">
                      Successfully Uploaded!
                    </div>
                  </div>

                  <div class="absolute -top-2 end-0">
                    <BaseButtonClose @click="abortUpload" />
                  </div>
                </div>

                <div>
                  <div class="flex gap-5 items-center">
                    <BaseProgress
                      title="Default progress bar"
                      size="sm"
                      color="primary"
                      :value="progressValue"
                    />

                    <span class="text-muted-800 dark:text-muted-100 block text-sm">
                      {{ progressText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <div>
          <div class="flex gap-8 items-center justify-between py-8 pb-4">
            <div class="flex items-center gap-4">
              <BaseButton
                class="!border-primary-500 dark:!border-primary-100 !text-primary-500 dark:!text-primary-100 !border-2"
                @click="prevStep"
              >
                Back
              </BaseButton>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-8">
              <BaseButton class="w-24" to="/students">Cancel</BaseButton>

              <BaseButton
                type="submit"
                color="primary"
                class="w-24"
                :disabled="!uploadSuccess"
                @click="nextStep"
              >
                Next
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import Stepper from './Stepper.vue'

const emit = defineEmits(['next', 'prev'])
const uploadedData = inject('uploadedData')
const selectedSchoolData = inject('selectedSchoolData')

const prevStep = () => {
  emit('prev')
}

const nextStep = () => {
  emit('next')
}

const zodSchema = z.object({
  school: z.string().min(1, 'School is required'),
  location: z.string().min(1, 'Location is required'),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  school: '',
  location: '',
}))

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  values,
  errors,
  resetForm,
  setValues,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const fileName = ref('')
const fileSizeInKB = ref('')
const progressText = ref('0%')

const locations = ref([])
const schoolsList = ref([])
const progressValue = ref(0)

const isUploading = ref(false)
const uploadSuccess = ref(false)

let abortController = null
const uploadedFile = ref(null)

const abortUpload = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }

  uploadedFile.value = null
  isUploading.value = false
  stopProgress()
}

const getIdFromName = (name, objsArr, key) => {
  const obj = objsArr?.find((item) => item?.[key] === name)
  return obj ? obj?.id : null
}

const getTimeZone = (name, objsArr) => {
  const obj = objsArr?.find((item) => item?.name === name)
  return obj ? obj?.time_zone : null
}

const getLocations = async (schoolId) => {
  try {
    const { data, error } = await useAdminReadService(`/api/admin/school/${schoolId}`)

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    const locations = data.value.Location.map((l) => ({
      id: l.id,
      name: l.location_name,
      time_zone: l.time_zone,
    }))

    return locations
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}

schoolsList.value = await getSchoolList()
const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

watch(
  () => values.school,
  async (value) => {
    if (value) {
      const sid = await getIdFromName(value, schoolsList.value, 'school_name')
      locations.value = await getLocations(sid)
      setFieldValue('location', locations.value[0]?.name)
    }
  },
)

const bytesToKB = (bytes) => {
  return (bytes / 1024).toFixed(2)
}

let progressInterval = null

const startProgress = () => {
  progressValue.value = 0
  progressText.value = '0%'
  progressInterval = setInterval(() => {
    if (progressValue.value < 100) {
      progressValue.value++
      progressText.value = `${progressValue.value}%`
    } else {
      clearInterval(progressInterval)
    }
  }, 100)
}

const stopProgress = () => {
  clearInterval(progressInterval)
  progressValue.value = 100
  progressText.value = '100%'
}

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

watch(uploadedFile, async (newFile) => {
  if (newFile && newFile.length > 0) {
    const file = newFile[0]
    fileName.value = file.name
    fileSizeInKB.value = bytesToKB(file.size)

    if (values.school && values.location) {
      startProgress()
      await uploadFiles()
    }
  }
})

const uploadFiles = handleSubmit(async (values) => {
  try {
    isUploading.value = true

    const schoolId = getIdFromName(values.school, schoolsList.value, 'school_name')
    const locationId = getIdFromName(values.location, locations.value, 'name')
    const timeZone = getTimeZone(values.location, locations.value)

    selectedSchoolData.value = {
      school_id: schoolId,
      school_name: values.school,
      location_id: locationId,
      location_name: values.location,
      time_zone: timeZone,
    }

    const formData = new FormData()
    formData.append('school_name', values.school)
    formData.append('school_id', schoolId)
    formData.append('location_name', values.location)
    formData.append('location_id', locationId)
    formData.append('time_zone', timeZone)

    const file = uploadedFile.value[0]
    if (!file) {
      throw new Error('No file selected for upload.')
    }
    formData.append('file', file)

    // Initialize AbortController
    abortController = new AbortController()

    const { data, error } = await useBulkUpload('/api/admin/school-student-bulk-account-upload', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
      signal: abortController.signal,
    })

    // Handle response
    if (error?.value) {
      throw new Error(error.value?.message || 'Upload failed. Please try again.')
    }

    isUploading.value = false
    uploadSuccess.value = true
    stopProgress()

    uploadedData.value = data.value.School_Student
    showSuccessToast('Success', 'Your file has been uploaded successfully!')
  } catch (error) {
    // Specific handling for AbortError
    if (error.name === 'AbortError') {
      showErrorToast('Upload Aborted', 'The upload was aborted by the user.')
    } else {
      // Generic error handling for other errors
      showErrorToast('Oops!', `${error.message || 'An unexpected error occurred'}`)
    }
    stopProgress()
    isUploading.value = false
  } finally {
    abortController = null
  }
})
</script>
