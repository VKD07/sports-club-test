<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { format } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import '~/assets/css/vcalendar.css'
import { masks } from '../../constants'

const student = inject('student')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const zodSchema = z.object({
  calendar: z.string().min(1, 'Calendar name is required'),
  calendarId: z.string().min(1, 'Calendar id is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

const actionStatus = ref('')

const summary = ref({})
const activeTerm = ref({})
const selectedCalendar = ref(null)

const isModalHoldCalendar = ref(false)
const isModalResumeCalendar = ref(false)
const isModalDeleteCalendar = ref(false)
const isModalApproveCalendar = ref(false)
const isModalSuspendCalendar = ref(false)
const isModalReleaseCalendar = ref(false)

const getStudentPerformanceSummary = async () => {
  const query = {
    school_id: student.school_id,
    location_id: student.location_id,
  }

  const { data, error } = await schoolWriteApi(
    `/api/school-guest/student/${student.id}/performance-summary`,
    {
      query,
    },
  )

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch active term summary, please try again!')
  }

  summary.value = data.value?.summary
  activeTerm.value = data.value?.active_term
}
await getStudentPerformanceSummary()

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  calendar: activeTerm.value?.calendar_name || 'No tasks allocated',
  calendarId: activeTerm.value?.calendar_code || 'No tasks allocated',
  startDate:
    new Date(`${activeTerm.value?.start_date} ${activeTerm.value?.start_time}`).toString() ||
    'mm/dd/yyyy hh:mm',
  endDate:
    new Date(`${activeTerm.value?.end_date} ${activeTerm.value?.end_time}`).toString() ||
    'mm/dd/yyyy hh:mm',
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

const dateStart = ref(
  new Date(`${activeTerm.value?.start_date} ${activeTerm.value?.start_time}`).toString(),
)
const dateEnd = ref(
  new Date(`${activeTerm.value?.end_date} ${activeTerm.value?.end_time}`).toString(),
)

const selectCalendar = (calendar, action) => {
  selectedCalendar.value = calendar

  const statusActionMap = {
    Suspend: 'Suspended',
    Release: 'Active',
    Resume: 'Active',
    Hold: 'On-Hold',
  }

  if (action === 'Suspend') {
    isModalSuspendCalendar.value = true
  } else if (action === 'Release') {
    isModalReleaseCalendar.value = true
  } else if (action === 'Resume') {
    isModalResumeCalendar.value = true
  } else if (action === 'Hold') {
    isModalHoldCalendar.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeCalendarStatus = async () => {
  try {
    const body = {
      school_id: student?.school_id,
      location_calendar_id: selectedCalendar.value.id,
      student_id: student?.id,
      status: actionStatus.value,
    }

    const { error } = await schoolWriteApi(`/api/school-guest/student-calendar/status`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    isModalHoldCalendar.value = false
    isModalResumeCalendar.value = false
    isModalSuspendCalendar.value = false
    isModalReleaseCalendar.value = false

    selectedCalendar.value = null

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    setTimeout(() => {
      getStudentPerformanceSummary()
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

const formatDateTime = (dateString) => {
  // const timeZone = 'Africa/Lagos'
  // const date = utcToZonedTime(new Date(dateString), timeZone)
  const date = new Date(dateString)
  const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss')

  return formattedDate
}

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

const stStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Suspended':
      return 'danger'
    case 'Pending':
      return 'warning'
    case 'On-Hold':
      return 'info'
    case 'No Calendar':
      return 'muted'
    default:
      break
  }
}

const viewStudentPerformance = () => {
  router.push({
    name: 'student_performance',
    query: {
      student: JSON.stringify(student),
    },
  })
}
</script>

<template>
  <div>
    <BaseCard class="p-6 pb-10 mt-6">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 sm:col-span-9">
          <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
            <div>
              <BaseHeading
                tag="h2"
                size="md"
                weight="medium"
                lead="normal"
                class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
              >
                Current Term Overview
              </BaseHeading>

              <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                Snapshot of active term and educational progress.
              </BaseText>
            </div>

            <div class="flex gap-2 justify-end items-end">
              <BaseButton
                class="!border-primary-500 !text-primary-500 dark:!text-muted-100 !border-2 w-auto"
                :disabled="
                  (activeTerm?.student_calendar_status &&
                    activeTerm?.student_calendar_status === 'No Calendar') ||
                  activeTerm?.student_calendar_status === 'Pending'
                "
                @click="viewStudentPerformance"
              >
                View Performance
              </BaseButton>

              <!-- Action -->
              <div class="flex flex-row items-center lg:flex-col gap-4 my-6 lg:my-0 lg:items-start">
                <BaseDropdown
                  label="Actions"
                  orientation="end"
                  size="md"
                  class="add-dropdown small-dropdown"
                  :disabled="
                    (activeTerm?.student_calendar_status &&
                      activeTerm?.student_calendar_status === 'No Calendar') ||
                    activeTerm?.student_calendar_status === 'Pending'
                  "
                >
                  <!-- <BaseDropdownItem
                    v-if="activeTerm?.student_calendar_status === 'Active'"
                    :title="
                      actionMenuItems(activeTerm?.student_calendar_status, 'Calendar', 'Hold')
                        ?.buttonText
                    "
                    shape="smooth"
                    @click="() => selectCalendar(activeTerm, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="activeTerm?.student_calendar_status === 'Active'"
                    :title="
                      actionMenuItems(activeTerm?.student_calendar_status, 'Calendar', 'Suspend')
                        ?.buttonText
                    "
                    shape="smooth"
                    @click="() => selectCalendar(activeTerm, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="activeTerm?.student_calendar_status === 'On-Hold'"
                    :title="
                      actionMenuItems(activeTerm?.student_calendar_status, 'Calendar', 'Release')
                        ?.buttonText
                    "
                    shape="smooth"
                    @click="() => selectCalendar(activeTerm, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="activeTerm?.student_calendar_status === 'On-Hold'"
                    :title="
                      actionMenuItems(activeTerm?.student_calendar_status, 'Calendar', 'Suspend')
                        ?.buttonText
                    "
                    shape="smooth"
                    @click="() => selectCalendar(activeTerm, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="activeTerm?.student_calendar_status === 'Suspended'"
                    :title="
                      actionMenuItems(activeTerm?.student_calendar_status, 'Calendar', 'Resume')
                        ?.buttonText
                    "
                    shape="smooth"
                    @click="() => selectCalendar(activeTerm, 'Resume')"
                  />
                </BaseDropdown>
              </div>
            </div>
          </div>

          <div class="p-4">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="calendar">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    type="text"
                    icon="clarity:building-line"
                    label="Calendar Name"
                    placeholder="No tasks allocated"
                    disabled
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="calendarId">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    type="text"
                    icon="clarity:building-line"
                    label="Calendar ID"
                    placeholder="No tasks allocated"
                    disabled
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Start Date & Time</label>
                <div class="grid grid-cols-12 gap-2">
                  <div class="col-span-12">
                    <DatePicker
                      v-model="dateStart"
                      :masks="masks"
                      mode="dateTime"
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
                                type="text"
                                icon="ph:calendar-blank-duotone"
                                autocomplete="off"
                                placeholder="mm/dd/yyyy hh:mm"
                                :value="inputValue"
                                disabled
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
                <label class="nui-label pb-2 text-[0.825rem] w-full">End Date & Time</label>
                <div class="grid grid-cols-12 gap-2">
                  <div class="col-span-12">
                    <DatePicker
                      v-model="dateEnd"
                      :masks="masks"
                      mode="dateTime"
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
                                type="text"
                                icon="ph:calendar-blank-duotone"
                                autocomplete="off"
                                placeholder="mm/dd/yyyy hh:mm"
                                :value="inputValue"
                                disabled
                              />
                            </Field>
                          </div>
                        </div>
                      </template>
                    </DatePicker>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-3 mt-8">
                <p class="nui-label mr-4 text-[0.825rem]">LN-CL-Status</p>

                <BaseTag
                  v-if="activeTerm?.location_calendar_status"
                  :color="statusColor(activeTerm?.location_calendar_status)"
                  shape="full"
                  size="md"
                  class="capitalize"
                >
                  {{ activeTerm?.location_calendar_status }}
                </BaseTag>
                <span v-else>-</span>
              </div>

              <div class="col-span-12 sm:col-span-3 mt-8">
                <p class="nui-label mr-4 text-[0.825rem]">ST-CL-Status</p>

                <BaseTag
                  v-if="activeTerm?.student_calendar_status"
                  :color="stStatusColor(activeTerm?.student_calendar_status)"
                  shape="full"
                  size="md"
                  class="capitalize"
                >
                  {{ activeTerm?.student_calendar_status }}
                </BaseTag>
                <span v-else>-</span>
              </div>

              <div class="col-span-12 sm:col-span-6 flex items-end">
                <div class="flex gap-4 items-center">
                  <p class="nui-label text-[0.825rem]">Badges Earned</p>

                  <div class="flex items-center justify-center gap-4">
                    <div>
                      <img src="/img/badges/Badge 1.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ activeTerm?.badges_count?.platinum ?? '0' }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 2.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ activeTerm?.badges_count?.gold ?? '0' }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 4.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ activeTerm?.badges_count?.silver ?? '0' }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 3.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ activeTerm?.badges_count?.bronze ?? '0' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-3">
          <div class="p-4 pb-0">
            <BaseCard class="p-6">
              <div
                class="xs:divide-y divide-muted-200 dark:divide-muted-700 flex w-full flex-col items-center sm:divide-y"
              >
                <div class="flex-1 pb-4">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon name="ph:student" class="text-primary-500 mx-auto h-8 w-8" />

                    <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                      {{ activeTerm?.completed_tasks }} / {{ activeTerm?.total_tasks }}
                    </h4>

                    <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      Completed Tasks
                    </p>
                  </div>
                </div>

                <div class="flex-1 py-4">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="material-symbols:interactive-space-outline"
                      class="text-primary-500 mx-auto h-8 w-8"
                    />

                    <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                      {{ activeTerm?.time_spent?.d ?? '0' }}d
                      {{ activeTerm?.time_spent?.h ?? '0' }}h
                      {{ activeTerm?.time_spent?.m ?? '0' }}m
                    </h4>

                    <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">Time Taken</p>
                  </div>
                </div>

                <div class="flex-1 py-4">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon name="ph:ticket-duotone" class="text-primary-500 mx-auto h-8 w-8" />

                    <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                      {{ activeTerm?.current_avg_score }}
                    </h4>

                    <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">Avg Score</p>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </BaseCard>

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
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ student.first_name }} {{ student.last_name }}'s
      </span>
      academic tasks for the
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ student?.location?.academic_term }}{{ getSuffix(student?.location?.academic_term) }}

        term </span
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
      {{ `Are you sure you want to release this calendar from hold?` }}
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
      {{ `Are you sure you want to resume this calendar?` }}
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
      Are you sure you want to put
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ student.first_name }} {{ student.last_name }}'s</span
      >
      academic tasks on hold for the
      <span class="font-bold text-primary-500 dark:text-muted-200"
        >{{ student?.location?.academic_term
        }}{{ getSuffix(student?.location?.academic_term) }} term</span
      >?
    </BaseModal>
  </div>
</template>
