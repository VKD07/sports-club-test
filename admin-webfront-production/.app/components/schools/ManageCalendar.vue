<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import '~/assets/css/vcalendar.css'
import { masks } from '../../constants'

const { isOpen, schoolId, calendarId } = defineProps(['isOpen', 'schoolId', 'calendarId'])
const emits = defineEmits(['close'])

const timeZone = inject('timeZone')

const selectedCalendar = ref(null)

const getCalendar = async () => {
  try {
    const { data, error } = await useApiFetch(`/api/admin/location-calendars/${calendarId}`)

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    selectedCalendar.value = data.value
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getCalendar()

const getCalendarTypeText = (name) => {
  const calendarTypes = {
    Mandatory: 'Mandatory Calendar',
    Casual: 'Casual Calendar',
  }

  return calendarTypes[name] || 'Seasonal Calendar'
}

const zodSchema = z.object({
  location: z.string().min(1, 'Location name is required'),
  type: z.string().min(1, 'Calendar type is required'),
  calendar: z.string().min(1, 'Calendar name is required'),
  year: z.string().min(1, 'Academic year is required'),
  term: z.object({
    value: z.number().min(1, 'Academic term is required'),
    text: z.string().min(1, 'Academic term is required'),
  }),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  location: selectedCalendar.value?.location?.location_name || '',
  type: getCalendarTypeText(selectedCalendar.value?.type) || '',
  calendar: selectedCalendar.value?.calendar?.name || '',
  year:
    `${selectedCalendar.value?.academic_year}${getSuffix(
      selectedCalendar.value?.academic_year,
    )} Year` || '',
  term: {
    text: `${selectedCalendar.value?.term}${getSuffix(selectedCalendar.value?.term)} Term`,
    value: parseInt(selectedCalendar.value?.term.charAt(0)) || 1, // Provide a fallback value of 1
  },
  startDate: new Date(selectedCalendar.value?.term_start_date).toString() || new Date().toString(),
  endDate: new Date(selectedCalendar.value?.term_end_date).toString() || new Date().toString(),
  startTime: new Date(selectedCalendar.value?.term_start_date).toString() || new Date().toString(),
  endTime: new Date(selectedCalendar.value?.term_end_date).toString() || new Date().toString(),
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

const locations = ref([])
const calendars = ref([])

const actionStatus = ref('')
const isModalHoldCalendar = ref(false)
const isModalResumeCalendar = ref(false)
const isModalDeleteCalendar = ref(false)
const isModalApproveCalendar = ref(false)
const isModalSuspendCalendar = ref(false)
const isModalReleaseCalendar = ref(false)

const time = {
  input: 'HH:mm A',
}

const academicYear = ref(1)
const dateEnd = ref(new Date(selectedCalendar.value?.term_end_date).toString())
const dateStart = ref(new Date(selectedCalendar.value?.term_start_date).toString())

const timeEnd = ref(new Date(selectedCalendar.value?.term_end_date).toString())
const timeStart = ref(new Date(selectedCalendar.value?.term_start_date).toString())

const getSchoolLocations = async () => {
  try {
    const query = {
      school_id: schoolId,
      sortBy: 'created_at',
      sortOrder: 'desc',
      perPage: '50',
    }

    const { data, error } = await useAdminReadService('/api/admin/school-location', {
      query,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    locations.value = data.value?.location_data.data.filter((l) => l.status === 'active')
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getSchoolLocations()

const getCalendarList = async () => {
  try {
    const query = {
      status: 'active',
      type: values.type?.id,
      per_page: '50',
    }

    const { data, error } = await useApiFetch('/api/admin/calendars', {
      query,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    calendars.value = data.value?.calendars.data
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getCalendarList()

const formatDateTime = (dateString, timeString) => {
  const date = new Date(dateString)
  const time = new Date(timeString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')

  const combinedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  return combinedDateTime
}

const closeModal = () => {
  emits('close')
}

const getCalendarType = (name) => {
  const calendarTypes = {
    'Mandatory Calendar': 'Mandatory',
    'Casual Calendar': 'Casual',
  }

  return calendarTypes[name] || 'Seasonal'
}

const selectCalendar = (action) => {
  const statusActionMap = {
    Approve: 'Active',
    Completed: 'Completed',
    Suspend: 'Suspended',
    Release: 'Active',
    Resume: 'Active',
    Hold: 'On-Hold',
    Delete: 'Deleted',
  }

  if (action === 'Approve') {
    isModalApproveCalendar.value = true
  } else if (action === 'Suspend') {
    isModalSuspendCalendar.value = true
  } else if (action === 'Release') {
    isModalReleaseCalendar.value = true
  } else if (action === 'Resume') {
    isModalResumeCalendar.value = true
  } else if (action === 'Hold') {
    isModalHoldCalendar.value = true
  } else if (action === 'Delete') {
    isModalDeleteCalendar.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const getIdFromName = (name, objsArr, key) => {
  const obj = objsArr?.find((item) => item?.[key] === name)
  return obj ? obj?.id : null
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()

    const newCalendarId = getIdFromName(values.calendar, calendars.value, 'name')
    const locationId = getIdFromName(values.location, locations.value, 'location_name')

    if (!calendarId || !locationId) {
      showErrorToast('Error', 'Invalid calendar or location name')
      return
    }

    formData.append('calendar_id', newCalendarId)
    formData.append('location_id', locationId)
    formData.append('type', getCalendarType(values.type))
    formData.append('academic_year', values.year.charAt(0))
    formData.append('term', values.term.value)
    formData.append('term_start_date', formatDateTime(values.startDate, values.startTime))
    formData.append('term_end_date', formatDateTime(values.endDate, values.endTime))
    formData.append('availability', '')
    formData.append('excluded_days', '')

    const { error } = await useApiFetch(`/api/admin/location-calendars/${calendarId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      let msg = ''

      switch (error.value?.data.code) {
        case 'location_year_term_type_already_exists':
          msg = `A calendar is already allocated to ${values.location} for the year ${values.year} and term ${values.term.text}.`
          break
        case 'can_not_update_after_calendar_started':
          msg = `The calendar start date and time for this calendar has already passed. Please choose a future start date and time.`
          break
        case 'term_end_date_can_only_be_updated_24_hours_before':
          msg = `End date and time updates are allowed only within 24 hours before`
          break
        default:
          msg = 'An unexpected error occurred.'
      }

      throw new Error(msg)
    }

    closeModal()
    showSuccessToast('Success', 'Your changes have been successfully updated!')
  } catch (error) {
    showErrorToast('Oops!', error, 4000)
  }
})

const changeCalendarStatus = async () => {
  try {
    const body = {
      status: actionStatus.value,
    }

    const { error } = await useApiFetch(
      `/api/admin/location-calendars/${selectedCalendar.value.id}/status`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    isModalHoldCalendar.value = false
    isModalResumeCalendar.value = false
    isModalDeleteCalendar.value = false
    isModalApproveCalendar.value = false
    isModalSuspendCalendar.value = false
    isModalReleaseCalendar.value = false

    selectedCalendar.value = null

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    setTimeout(() => {
      getActiveCalendars()
    }, 1000)

    if (actionStatus.value === 'Deleted') {
      showSuccessToast('Success', 'Calendar has been deleted!')
    } else {
      showSuccessToast('Success', 'Calendar status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

watch(
  () => dateStart.value,
  (value) => {
    setFieldValue('startDate', value.toString())
    dateEnd.value = value
    timeStart.value = value
  },
)

watch(
  () => dateEnd.value,
  (value) => {
    setFieldValue('endDate', value.toString())
    timeEnd.value = value
  },
)

watch(
  () => timeStart.value,
  (value) => {
    setFieldValue('startTime', value.toString())
  },
)

watch(
  () => timeEnd.value,
  (value) => {
    setFieldValue('endTime', value.toString())
  },
)

watch(
  () => values.year,
  async (year) => {
    const selectedLocation = locations.value.find(
      (location) => location.location_name === values.location,
    )

    const academicYear = selectedLocation?.academic_year
    const academicTerm = selectedLocation?.academic_term

    let availableTerms = [
      { text: '1st Term', value: 1 },
      { text: '2nd Term', value: 2 },
      { text: '3rd Term', value: 3 },
    ]

    if (academicYear && year.charAt(0) == academicYear) {
      if (academicTerm === 2) {
        availableTerms = availableTerms.slice(1)
      } else if (academicTerm === 3) {
        availableTerms = availableTerms.slice(2)
      }
    }

    terms.value = availableTerms
    setFieldValue('term', availableTerms[0])
  },
)

watch(
  () => values.location,
  async (value) => {
    let selectedLocation = locations.value.find((location) => location.location_name === value)

    const academicPeriod = await useSchoolHistory(
      selectedLocation?.location_history,
      selectedLocation?.academic_year,
    )

    academicYear.value = selectedLocation.academic_year
  },
)

watch(
  () => values.type,
  async (value) => {
    setFieldValue('calendar', '')
  },
)

const years = computed(() => {
  const year = academicYear.value
  return Array.from({ length: 4 }, (_, i) => `${year + i}${getSuffix(year + i)} Year`)
})

const fCalendars = ref([])

const filteredCalendars = () => {
  let filteredCal = []

  if (values.type === 'Mandatory Calendar') {
    filteredCal = calendars.value
      .filter((c) => c.type === 'Mandatory')
      .map((c) => ({ id: c.id, name: c.name }))
  } else if (values.type === 'Casual Calendar') {
    filteredCal = calendars.value
      .filter((c) => c.type === 'Casual')
      .map((c) => ({ id: c.id, name: c.name }))
  } else if (values.type === 'Seasonal Calendar') {
    filteredCal = calendars.value
      .filter((c) => c.type === 'Seasonal')
      .map((c) => ({ id: c.id, name: c.name }))
  }

  return filteredCal
}

const updateCalendars = () => {
  fCalendars.value = filteredCalendars()
}
await updateCalendars()

watch(
  () => values.type,
  (value) => {
    updateCalendars()
  },
)

const isCancelModalOpen = ref(false)
const cancelAllocation = () => {
  if (meta.value.dirty) {
    isCancelModalOpen.value = true
  } else {
    closeModal()
  }
}

const isAllocated = computed(() => {
  const status = selectedCalendar.value?.status
  const termStartDate = new Date(selectedCalendar.value?.term_start_date)

  return status == 'Active' && termStartDate <= new Date()
})

const isChangeable = computed(() => {
  const status = selectedCalendar.value?.status
  const termEndDate = new Date(selectedCalendar.value?.term_end_date)
  const timeDifference = termEndDate - new Date()
  const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000

  return status === 'Active' && timeDifference <= twentyFourHoursInMilliseconds
})

const statusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Suspended':
      return 'danger'
    case 'Draft':
      return 'warning'
    case 'On-Hold':
      return 'info'
    default:
      break
  }
}

const terms = ref([
  { text: '1st Term', value: 1 },
  { text: '2nd Term', value: 2 },
  { text: '3rd Term', value: 3 },
])
const calendarTypes = ref(['Mandatory Calendar', 'Casual Calendar', 'Seasonal Calendar'])
</script>

<template>
  <div>
    <TairoModal :open="isOpen" size="2xl" @close="closeModal">
      <template #header>
        <div class="relative">
          <div class="p-6 pe-16 flex justify-between gap-4">
            <div class="flex gap-4 lg:items-center justify-between flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="md"
                  weight="medium"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  Edit Calendar Allocation
                </BaseHeading>

                <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                  Customize user access and permissions for each segment
                </BaseText>
              </div>
            </div>

            <div class="gap-2 flex">
              <div class="flex gap-2 items-center mr-6 text-sm">
                Status
                <BaseTag
                  :color="statusColor(selectedCalendar?.status)"
                  shape="full"
                  size="md"
                  class="capitalize"
                >
                  {{ selectedCalendar?.status }}
                </BaseTag>
              </div>

              <BaseDropdown
                label="Actions"
                orientation="end"
                size="md"
                class="add-dropdown small-dropdown"
              >
                <BaseDropdownItem
                  v-if="selectedCalendar.status === 'Draft'"
                  :title="
                    actionMenuItems(selectedCalendar.status, 'Calendar', 'Active')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Approve')"
                />

                <!-- <BaseDropdownItem
                  v-if="selectedCalendar.status === 'Active'"
                  :title="actionMenuItems(selectedCalendar.status, 'Calendar', 'Hold')?.buttonText"
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Hold')"
                /> -->

                <BaseDropdownItem
                  v-if="selectedCalendar.status === 'Active'"
                  :title="
                    actionMenuItems(selectedCalendar.status, 'Calendar', 'Suspend')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Suspend')"
                />

                <BaseDropdownItem
                  v-if="selectedCalendar.status === 'On-Hold'"
                  :title="
                    actionMenuItems(selectedCalendar.status, 'Calendar', 'Release')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Release')"
                />

                <BaseDropdownItem
                  v-if="selectedCalendar.status === 'On-Hold'"
                  :title="
                    actionMenuItems(selectedCalendar.status, 'Calendar', 'Suspend')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Suspend')"
                />

                <BaseDropdownItem
                  v-if="selectedCalendar.status === 'Suspended'"
                  :title="
                    actionMenuItems(selectedCalendar.status, 'Calendar', 'Resume')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Resume')"
                />

                <BaseDropdownItem
                  v-if="
                    selectedCalendar.status === 'Draft' || selectedCalendar.status === 'Suspended'
                  "
                  :title="
                    actionMenuItems(selectedCalendar.status, 'Calendar', 'Delete')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectCalendar('Delete')"
                />
              </BaseDropdown>
            </div>
          </div>

          <BaseButtonClose
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="p-4 md:pt-0 md:p-6 max-h-[450px] lg:max-h-none">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 sm:col-span-6">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="location">
              <BaseListbox
                label="Location"
                placeholder="Select Location"
                :items="locations.map((l) => l.location_name)"
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isAllocated"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="type">
              <BaseListbox
                label="Calendar Type"
                placeholder="Select Type"
                :items="calendarTypes"
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isAllocated"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <!-- <div class="col-span-12 sm:col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="calendar">
            <BaseAutocomplete
              label="Calendar Name"
              placeholder="Select Calendar"
              :items="calendars.map((c) => c.name)"
              :model-value="[field.value]"
              :error="errorMessage"
              :disabled="isSubmitting"
              :class="errorMessage ? 'error-border' : ''"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div> -->

          <!-- <div class="col-span-12 sm:col-span-12">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="calendar">
              <BaseListbox
                label="Calendar Name"
                placeholder="Select Calendar"
                :items="fCalendars"
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isAllocated || values.type === ''"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div> -->

          <div class="col-span-12 sm:col-span-12 relative">
            <label class="nui-label pb-2 text-[0.825rem] w-full">Calendar Name</label>
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="calendar">
              <CustomSelect
                :disabled="isAllocated || values.type === ''"
                :name="values.calendar"
                :options="fCalendars"
                :model-value="field.value"
                :error="errorMessage"
                placeholder="Select Calendar"
                icon="material-symbols:calendar-today-outline"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <span class="custom-error-msg absolute bottom-0">
              {{ errors.calendar ? errors.calendar : '' }}</span
            >
          </div>

          <div class="col-span-12 sm:col-span-6">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="year">
              <BaseListbox
                label="Academic Year"
                placeholder="Select Year"
                :items="years"
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isAllocated"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="term">
              <BaseListbox
                label="Academic Term"
                placeholder="Select Term"
                :items="terms"
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isAllocated || values.year === ''"
                :properties="{
                  value: 'value',
                  label: 'text',
                }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <label class="nui-label pb-2 text-[0.825rem] w-full">Start date</label>
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-12">
                <DatePicker
                  v-model="dateStart"
                  :masks="masks"
                  :min-date="new Date()"
                  mode="date"
                  hide-time-header
                  trim-weeks
                >
                  <template #default="{ togglePopover, inputValue, inputEvents }">
                    <div class="flex w-full flex-col gap-4 sm:flex-row">
                      <div class="relative grow">
                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="startDate"
                        >
                          <BaseInput
                            v-if="!isAllocated"
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="Start Date"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isAllocated"
                            v-on="inputEvents"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          />

                          <BaseInput
                            v-else
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="Start Date"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isAllocated"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                            @click="togglePopover"
                          />
                        </Field>
                      </div>
                    </div>
                  </template>
                </DatePicker>
              </div>
            </div>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <label class="nui-label pb-2 text-[0.825rem] w-full">Start time</label>
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-12">
                <DatePicker
                  v-model="timeStart"
                  :masks="time"
                  mode="time"
                  hide-time-header
                  trim-weeks
                >
                  <template #default="{ togglePopover, inputValue, inputEvents }">
                    <div class="flex w-full flex-col gap-4 sm:flex-row">
                      <div class="relative grow">
                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="startTime"
                        >
                          <BaseInput
                            v-if="!isAllocated"
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="Start Time"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isAllocated"
                            v-on="inputEvents"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          />

                          <BaseInput
                            v-else
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="Start Time"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isAllocated"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                            @click="togglePopover"
                          />
                        </Field>
                      </div>
                    </div>
                  </template>
                </DatePicker>
              </div>
            </div>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <label class="nui-label pb-2 text-[0.825rem] w-full">End date</label>
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-12">
                <DatePicker
                  v-model="dateEnd"
                  :masks="masks"
                  :min-date="dateStart"
                  mode="date"
                  hide-time-header
                  trim-weeks
                >
                  <template #default="{ togglePopover, inputValue, inputEvents }">
                    <div class="flex w-full flex-col gap-4 sm:flex-row">
                      <div class="relative grow">
                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="endDate"
                        >
                          <BaseInput
                            v-if="!isChangeable"
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="End Date"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isChangeable"
                            v-on="inputEvents"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          />

                          <BaseInput
                            v-else
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="End Date"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isChangeable"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                            @click="togglePopover"
                          />
                        </Field>
                      </div>
                    </div>
                  </template>
                </DatePicker>
              </div>
            </div>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <label class="nui-label pb-2 text-[0.825rem] w-full">End time</label>
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-12">
                <DatePicker v-model="timeEnd" :masks="time" mode="time" hide-time-header trim-weeks>
                  <template #default="{ togglePopover, inputValue, inputEvents }">
                    <div class="flex w-full flex-col gap-4 sm:flex-row">
                      <div class="relative grow">
                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="endTime"
                        >
                          <BaseInput
                            v-if="!isChangeable"
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="End Time"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isChangeable"
                            v-on="inputEvents"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          />

                          <BaseInput
                            v-else
                            type="text"
                            icon="ph:calendar-blank-duotone"
                            autocomplete="off"
                            placeholder="End Time"
                            :value="inputValue"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isChangeable"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                            @click="togglePopover"
                          />
                        </Field>
                      </div>
                    </div>
                  </template>
                </DatePicker>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="cancelAllocation">Cancel</BaseButton>

            <BaseButton
              color="primary"
              variant="solid"
              :disabled="!meta.dirty"
              :loading="isSubmitting"
              @click.prevent="onSubmit"
            >
              Update Calendar
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <BaseModal
      :isOpen="isCancelModalOpen"
      :title="'Cancel Operation'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="error"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Yes'"
      :primaryButtonAction="cancelAllocation"
      :cancelButtonText="'No'"
      @close="isCancelModalOpen = false"
    >
      Are you sure you want to cancel task allocation?
    </BaseModal>

    <BaseModal
      v-if="isModalApproveCalendar"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveCalendar"
      :title="'Approve Calendar'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeCalendarStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveCalendar = false"
    >
      {{ `Are you sure you want to approve this calendar?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendCalendar"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendCalendar"
      :title="'Suspend Calendar'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeCalendarStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendCalendar = false"
    >
      Are you sure you want to suspend the selected calendar for
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedCalendar?.location?.location_name
      }}</span
      >?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseCalendar"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseCalendar"
      :title="'Release Calendar'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeCalendarStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseCalendar = false"
    >
      Are you sure you want to release
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedCalendar?.calendar?.name
      }}</span>
      calendar?
    </BaseModal>

    <BaseModal
      v-if="isModalResumeCalendar"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeCalendar"
      :title="'Resume Calendar'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeCalendarStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeCalendar = false"
    >
      Are you sure you want to resume activities of
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedCalendar?.calendar?.name
      }}</span>
      calendar?
    </BaseModal>

    <BaseModal
      v-if="isModalHoldCalendar"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldCalendar"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeCalendarStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldCalendar = false"
    >
      Are you sure you want to hold the selected calendar for
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedCalendar?.location?.location_name
      }}</span
      >?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteCalendar"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteCalendar"
      :title="'Delete Calendar'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeCalendarStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteCalendar = false"
    >
      Are you sure you want to delete the selected calendar for
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedCalendar?.location?.location_name
      }}</span
      >?
    </BaseModal>
  </div>
</template>

<style scoped>
.custom-error-msg {
  margin-top: 0.25rem;
  display: block;
  font-family:
    Inter Variable,
    sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  line-height: 1;
  bottom: -15px !important;
  --tw-text-opacity: 1;
  color: rgb(225 29 72 / 1);
  color: rgb(225 29 72 / var(--tw-text-opacity));
}
</style>
