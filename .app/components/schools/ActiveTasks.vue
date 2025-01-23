<script setup>
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

const { schoolId } = defineProps(['schoolId'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const actionStatus = ref('')

const calendars = ref(null)
const selectedCalendar = ref(null)

const isModalAddCalendar = ref(false)
const isModalManageCalendar = ref(false)

const isModalHoldCalendar = ref(false)
const isModalResumeCalendar = ref(false)
const isModalDeleteCalendar = ref(false)
const isModalApproveCalendar = ref(false)
const isModalSuspendCalendar = ref(false)
const isModalReleaseCalendar = ref(false)

const getActiveCalendars = async () => {
  try {
    const { data, error } = await schoolWriteApi(
      `/api/school-guest/school/${schoolId}/active-calendars`,
    )

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    calendars.value = data.value?.locationCalendars
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getActiveCalendars()

const manageCalendar = (calendar) => {
  selectedCalendar.value = calendar
  isModalManageCalendar.value = true
}

const selectCalendar = (calendar, action) => {
  selectedCalendar.value = calendar

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

const addCalendar = () => {
  isModalAddCalendar.value = false
  setTimeout(() => {
    getActiveCalendars()
  }, 3000)
}

const updateCalendar = () => {
  isModalManageCalendar.value = false
  setTimeout(() => {
    getActiveCalendars()
  }, 3000)
}

// const formatDateTime = (dateString) => {
//   const timeZone = 'UTC'
//   const date = utcToZonedTime(new Date(dateString), timeZone)

//   const formattedDate = format(date, 'do MMMM yyyy', { timeZone })
//   const formattedTime = format(date, 'p', { timeZone })

//   return {
//     date: formattedDate,
//     time: formattedTime,
//   }
// }

const formatDateTime = (dateString) => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = utcToZonedTime(new Date(dateString), systemTimeZone)

  const formattedDate = format(date, 'do MMMM yyyy', { timeZone: systemTimeZone })
  const formattedTime = format(date, 'p', { timeZone: systemTimeZone })

  return {
    date: formattedDate,
    time: formattedTime,
  }
}

// const formatDateTime = (dateString) => {
//   const timeZone = 'Africa/Lagos'
//   const date = utcToZonedTime(new Date(dateString), timeZone)

//   // const date = new Date(dateString)
//   const formattedDate = format(date, 'do MMMM yyyy')
//   const formattedTime = format(date, 'p')

//   return {
//     date: formattedDate,
//     time: formattedTime,
//   }
// }

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
</script>

<template>
  <BaseCard class="p-6 pb-10 mt-6">
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Active Academic Calendars
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Manage all active academic calendars and assign new ones for upcoming terms.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton color="primary" @click="isModalAddCalendar = true">
          Allocate Calendar
        </BaseButton>
      </div>
    </div>

    <div>
      <div v-if="calendars?.length === 0">
        <BasePlaceholderPage title="No educational challenges assigned for this school.">
          <template #image>
            <img
              class="block dark:hidden"
              src="/img/placeholders/Admin - No Active Calendar.png"
              alt="Placeholder image"
            />

            <img
              class="hidden dark:block"
              src="/img/placeholders/Admin - No Active Calendar.png"
              alt="Placeholder image"
            />
          </template>
        </BasePlaceholderPage>
      </div>

      <div v-else class="space-y-2 pt-6 mt-6">
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-full"
        >
          <FlexTableRow v-for="(calendar, index) in calendars" :key="index" shape="rounded" spaced>
            <template #start>
              <FlexTableStart
                label="Calendar"
                :hide-label="index > 0"
                :title="calendar.name"
                :subtitle="calendar.code"
                :picture="getImageUrl(calendar.banner)"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Location"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.location_name }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Type"
                :hide-label="index > 0"
                class="w-full sm:w-24 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.type }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Start Date"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(calendar.term_start_date).date }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Time"
                :hide-label="index > 0"
                class="w-full sm:w-20 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(calendar.term_start_date).time }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="End Date"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(calendar.term_end_date).date }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Time"
                :hide-label="index > 0"
                class="w-full sm:w-20 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(calendar.term_end_date).time }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="LN-CL-Status"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag
                    :color="statusColor(calendar.status)"
                    shape="full"
                    size="sm"
                    class="capitalize"
                  >
                    {{ calendar.status }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    title="Manage"
                    text="Manage calendar"
                    shape="smooth"
                    @click="manageCalendar(calendar)"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'Draft'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Active')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Active')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Approve')"
                  />

                  <!-- <BaseDropdownItem
                    v-if="calendar.status === 'Active'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Hold')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Hold')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="calendar.status === 'Active'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Suspend')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'On-Hold'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Release')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Release')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'On-Hold'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Suspend')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'Suspended'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Resume')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Resume')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Resume')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'Draft' || calendar.status === 'Suspended'"
                    :title="actionMenuItems(calendar.status, 'Calendar', 'Delete')?.buttonText"
                    :text="actionMenuItems(calendar.status, 'Calendar', 'Delete')?.title"
                    shape="smooth"
                    @click="() => selectCalendar(calendar, 'Delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>
    </div>
  </BaseCard>

  <SchoolsAllocateCalendar
    v-if="isModalAddCalendar"
    :isOpen="isModalAddCalendar"
    :schoolId="schoolId"
    @close="addCalendar"
  />

  <SchoolsManageCalendar
    v-if="isModalManageCalendar"
    :isOpen="isModalManageCalendar"
    :schoolId="schoolId"
    :calendarId="selectedCalendar.id"
    @close="updateCalendar"
  />

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
      selectedCalendar?.location_name
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
    <span class="font-bold text-primary-500 dark:text-muted-200"
      >{{ selectedCalendar?.name }}
    </span>
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
    <span class="font-bold text-primary-500 dark:text-muted-200">{{ selectedCalendar?.name }}</span>
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
      selectedCalendar?.location_name
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
      selectedCalendar?.location_name
    }}</span
    >?
  </BaseModal>
</template>
