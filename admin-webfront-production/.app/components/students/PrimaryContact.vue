<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import countriesData from '../../countries.json'

const student = inject('student')
const emits = defineEmits(['reset'])

const locations = ref([])
const schoolsList = ref([])

const selectedSchool = ref(null)
const selectedLocation = ref(null)

const zodSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  school: z.string().min(1, 'School name is required'),
  location: z.string().min(1, 'Location name is required'),
  level: z.string().min(1, 'Academic level is required'),
  grade: z.string().min(1, 'Grade is required'),
  currentYear: z.string().min(1, 'Joining year is required'),
  currentTerm: z.string().min(1, 'Academic term is required'),
})

const getSchoolLocation = async () => {
  try {
    const { data, error } = await useAdminReadService(
      `/api/admin/location-data/${student.school_id}/${student.location_id}`,
    )

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    selectedSchool.value = data.value?.School
    selectedLocation.value = data.value?.Location[0]
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getSchoolLocation()

let level = selectedLocation.value?.location_level
if (level) {
  level = level.charAt(0).toUpperCase() + level.slice(1)
}

watch(
  () => selectedLocation.value,
  () => {
    let level = selectedLocation.value?.location_level
    if (level) {
      level = level.charAt(0).toUpperCase() + level.slice(1)
    }
  },
)

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  region: selectedLocation.value?.region || '',
  country: selectedLocation.value?.country || '',
  city: selectedLocation.value?.city || '',
  timeZone: selectedLocation.value?.time_zone || '',
  school: selectedSchool.value?.school_name || '',
  location: selectedLocation.value?.location_name || '',
  level: level || '',
  grade: student?.grade || '',
  currentYear:
    `${selectedLocation.value?.academic_year}${getSuffix(
      selectedLocation.value?.academic_year,
    )} Year` || '',
  currentTerm:
    `${selectedLocation.value?.academic_term}${getSuffix(
      selectedLocation.value?.academic_term,
    )} Term` || '',
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

const getIdFromName = (name, objsArr, key) => {
  const obj = objsArr?.find((item) => item?.[key] === name)
  return obj ? obj?.id : null
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const schoolId = getIdFromName(values.school, schoolsList.value, 'school_name')
    const locationId = getIdFromName(values.location, locations.value, 'name')

    const formData = new FormData()
    formData.append('id', student.id)
    formData.append('first_name', student.first_name)
    formData.append('last_name', student.last_name)
    formData.append('phone_number', student.phone_number)
    formData.append('school', values.school)
    formData.append('location', values.location)
    formData.append('grade', values.grade)
    formData.append('level', values.level.toLowerCase())
    formData.append('school_id', schoolId)
    formData.append('location_id', locationId)

    const { error } = await useApiFetch('/api/admin/edit-school-student-account', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      const errorData = error.value?.data

      if (errorData?.error?.errors) {
        console.log(errorData?.error?.errors)

        const errors = errorData.error.errors
        const errorMessages = Object.keys(errors)
          .map((key) => errors[key].join(' '))
          .join(' | ')

        throw new Error(errorMessages)
      } else {
        throw new Error(errorData.message || 'An error occurred')
      }
    }

    await getSchoolLocation()
    emits('reset')

    showSuccessToast(
      'Success',
      `${student?.first_name} ${student?.last_name}'s school details have been updated successfully!`,
    )
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
})

const getLocations = async (schoolId) => {
  try {
    const { data, error } = await useAdminReadService(`/api/admin/school/${schoolId}`)

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    const locations = data.value.Location.map((l) => ({
      id: l.id,
      name: l.location_name,
    }))

    return locations
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}

schoolsList.value = await getSchoolList()
locations.value = await getLocations(student?.school_id)

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

const statusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'suspended':
      return 'danger'
    case 'draft':
      return 'warning'
    case 'on hold':
      return 'info'
    default:
      break
  }
}

// Countries and Time zones
const countries = countriesData?.countries
const timeZones = ['Asia/Dubai', 'Africa/Lagos', 'Europe/London']

// Group countries by region
const groupedByRegion = countries.reduce((acc, country) => {
  const region = country.region
  if (!acc[region]) {
    acc[region] = []
  }
  acc[region].push(country)
  return acc
}, {})

const regions = Object.keys(groupedByRegion)

watch(
  () => values.region,
  () => {
    setFieldValue('country', groupedByRegion[values.region][0]?.name)
  },
)

const years = computed(() => {
  const year = selectedLocation.value?.academic_year
  return Array.from({ length: 4 }, (_, i) => `${year + i}${getSuffix(year + i)} Year`)
})

const levels = ref(['Primary', 'Secondary'])
const terms = ref(['1st Term', '2nd Term', '3rd Term'])
const grades = ref(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
</script>

<template>
  <BaseCard class="p-6 pb-10">
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          School Details
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          View and manage school of the student at ease.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton class="lg:w-full w-24" :disabled="!meta.dirty" @click="resetForm">
          Reset
        </BaseButton>

        <BaseButton
          color="primary"
          class="w-24 lg:w-full"
          :disabled="!meta.dirty"
          @click.prevent="onSubmit"
        >
          Update
        </BaseButton>
      </div>
    </div>

    <div class="max-w-4xl p-4">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="region">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="text"
              icon="ph:globe-hemisphere-west-light"
              label="Region"
              placeholder="Region"
              disabled
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="country">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="text"
              icon="gis:search-country"
              label="Country"
              placeholder="Country"
              disabled
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="city">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="text"
              icon="ph:city"
              label="City"
              placeholder="City"
              disabled
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="timeZone">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="text"
              icon="iconoir:time-zone"
              label="Time Zone"
              placeholder="Time Zone"
              disabled
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4 relative">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="school">
            <BaseAutocomplete
              label="School Name"
              :items="schoolNames"
              placeholder="School Name"
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

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="location">
            <BaseListbox
              ref="locationRef"
              label="Location Name"
              :items="locations?.map((l) => l.name)"
              placeholder="Location Name"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="schoolNames.length === 0"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="grade">
            <BaseListbox
              label="Grade"
              :items="grades"
              placeholder="Grade"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4 relative">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="level">
            <BaseListbox
              label="Academic Level"
              :items="levels"
              placeholder="Academic Level"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="currentYear">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="text"
              icon="uil:calender"
              label="Academic Year"
              placeholder="Academic Year"
              disabled
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="currentTerm">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="text"
              icon="material-symbols:transition-slide-outline"
              label="Academic Term"
              placeholder="Academic Term"
              disabled
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4 mt-8">
          <p class="nui-label mr-4 text-[0.825rem]">School Status</p>

          <BaseTag
            :color="statusColor(selectedSchool?.status)"
            shape="full"
            size="md"
            class="capitalize"
          >
            {{ selectedSchool?.status }}
          </BaseTag>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
