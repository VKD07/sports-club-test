<script setup>
import { refDebounced } from '@vueuse/core'
import {
  differenceInHours,
  differenceInMinutes,
  endOfYear,
  format,
  formatDistance,
  isYesterday,
} from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks } from '../../constants'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const departmentList = ref([])
departmentList.value = await getDepartmentList()
const departmentNames = computed(() => departmentList.value.map((department) => department.name))

const filter = ref('')
const debounced = refDebounced(filter, 500)

const status = ref('')
const department = ref('')
const datePreset = ref('')

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    department.value = value
  } else if (dropdownId === 2) {
    status.value = value
  } else if (dropdownId === 3) {
    datePreset.value = value
  }
}

const dateEnd = ref(null)
const dateStart = ref(null)

const perPage = ref(20)
const page = computed(() => parseInt(route.query.page ?? '1'))

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const query = computed(() => {
  const nonEmptyProperties = {
    from: 'Admin',
    search: debounced.value,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    department: department.value,
    status: status.value,
    perPage: perPage.value,
    page: page.value,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
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

const { data, error, pending, refresh } = await useSupportTicketService(
  '/api/admin-support-ticket/view-all',
  { query },
)
if (error.value) {
  showErrorToast('Oops!', 'Support tickets loading failed, please try again!')
}

const actionType = ref('')
const modalTitle = ref('')
const modalBtnText = ref('')
const modalContent = ref('')
const selectedTicket = ref(null)
const isModalChangeTicketStatus = ref(false)

const selectTicket = (ticket, type) => {
  selectedTicket.value = ticket

  let modalTitleText
  let modalButtonText
  let actionTypeValue
  let modalContentText

  switch (type) {
    case 'in progress':
      modalTitleText = 'Review support ticket'
      modalButtonText = 'Review'
      actionTypeValue = 'in progress'
      modalContentText = 'Are you sure you want to review this ticket?'
      break
    case 'resolved':
      modalTitleText = 'Resolve support ticket'
      modalButtonText = 'Resolve'
      actionTypeValue = 'resolved'
      modalContentText = 'Are you sure you want to resolve this ticket?'
      break
    case 'closed':
      modalTitleText = 'Close support ticket'
      modalButtonText = 'Close'
      actionTypeValue = 'closed'
      modalContentText = 'Are you sure you want to close this ticket?'
      break
    case 'reopen':
      modalTitleText = 'Reopen support ticket'
      modalButtonText = 'Reopen'
      actionTypeValue = 'reopened'
      modalContentText = 'Are you sure you want to reopen this ticket?'
      break

    default:
      throw new Error('Invalid type')
  }

  modalTitle.value = modalTitleText
  modalBtnText.value = modalButtonText
  actionType.value = actionTypeValue
  modalContent.value = modalContentText

  isModalChangeTicketStatus.value = true
}

const changeTicketStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('st_id', selectedTicket.value?.id ?? '')
    formData.append('status', actionType.value)

    const { error } = await useSupportTicketService('/api/admin-support-ticket/action-update', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalChangeTicketStatus.value = false

    if (error.value) {
      throw new Error(error.value?.message)
    }

    refresh()
    showSuccessToast('Success', 'Ticket status has been updated!')
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  } finally {
    setTimeout(() => {
      selectedTicket.value = null
    }, 1500)
  }
}

const priority = (itemPriority) => {
  switch (itemPriority) {
    case 'Low':
      return 'success'
    case 'Medium':
      return 'warning'
    case 'High':
      return 'danger'
    default:
      break
  }
}

const statusColor = (status) => {
  switch (status) {
    case 'resolved':
      return 'tag-resolved'
    case 'in progress':
      return 'tag-in-progress'
    case 'pending':
      return 'tag-pending'
    case 'opened':
      return 'tag-opened'
    case 'closed':
      return 'tag-closed'
    default:
      break
  }
}

const formatDateAgo = (dateString) => {
  if (!dateString) {
    return 'never'
  }

  const now = new Date()

  if (isYesterday(dateString)) {
    return 'yesterday'
  }

  const diffInMinutes = differenceInMinutes(now, dateString)
  const diffInHours = differenceInHours(now, dateString)
  const formattedDistance = formatDistance(dateString, now, { addSuffix: true })

  if (diffInMinutes < 60 || diffInHours < 24) {
    return formattedDistance
  }

  return format(dateString, 'dd MMMM yyyy')
}

const formatDateTime = (dateString) => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = new Date(dateString)

  const formattedDate = format(date, 'do MMMM yyyy', { timeZone: systemTimeZone })
  const formattedTime = format(date, 'p', { timeZone: systemTimeZone })

  return {
    date: formattedDate,
    time: formattedTime,
  }
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch([filter, dateStart, dateEnd, department, status, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const statusList = ['Pending', 'Opened', 'In Progress', 'Resolved', 'Closed']
</script>

<template>
  <div>
    <TairoContentWrapper>
      <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Admin Support Enquiries
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            View and manage support inquiries raised by administrators.
          </BaseText>
        </div>

        <div class="flex items-center gap-2"></div>
      </div>

      <!-- Filter -->
      <div class="relative">
        <BaseCard class="ptablet:py-8 ptablet:px-2 mb-10 py-4 px-4">
          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-2/4 sm:ps-2">
              <BaseInput
                v-model="filter"
                icon="lucide:search"
                placeholder="Search by Case ID / Name"
                autocomplete="off"
                :classes="{
                  wrapper: 'w-full sm:w-auto',
                }"
              />
            </div>

            <div class="ptablet:col-span-6 w-full px-2 py-2 sm:w-1/4">
              <CustomDropdown
                :options="departmentNames"
                placeholder="Select Department"
                @selected-value="handleSelectedValue(1, $event)"
              />
            </div>

            <div class="ptablet:col-span-6 w-full px-2 py-2 sm:w-1/4 sm:pe-2">
              <CustomDropdown
                :options="statusList"
                placeholder="Select Case Status"
                @selected-value="handleSelectedValue(2, $event)"
              />
            </div>
          </div>

          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
              <CustomDropdown
                :options="datePresets"
                placeholder="Choose Date Preset"
                @selected-value="handleSelectedValue(3, $event)"
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
                        placeholder="Start Date"
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
                        placeholder="End Date"
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

      <div>
        <div v-if="!pending && data?.data.data.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />

              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>

        <div v-else class="space-y-2 pt-6">
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <div key="1" class="space-y-2">
              <FlexTableRow
                v-for="(ticket, index) in data?.data?.data"
                :key="index"
                shape="rounded"
                spaced
              >
                <template #start>
                  <FlexTableStart
                    label="Ticket"
                    :hide-label="index > 0"
                    :title="ticket.case_id"
                    :subtitle="ticket.name"
                  />
                </template>

                <template #end>
                  <FlexTableCell
                    label="Department"
                    :hide-label="index > 0"
                    class="w-full sm:w-32 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ ticket.department }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Status"
                    sortingBy="status"
                    :sort="true"
                    :hide-label="index > 0"
                    class="w-full sm:w-24 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <BaseTag
                      shape="full"
                      size="sm"
                      class="capitalize status-tab"
                      :class="statusColor(ticket.status)"
                    >
                      {{ ticket.status }}
                    </BaseTag>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Last Update"
                    :hide-label="index > 0"
                    class="w-full sm:w-40 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ formatDateAgo(new Date(ticket.updated_at)) }}
                    </span>
                  </FlexTableCell>

                  <!-- <FlexTableCell
                    label="Comments"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      <Icon
                        name="majesticons:messages-line"
                        class="h-5 w-5 flex object-contain mr-3"
                      />

                      <BaseTag color="primary" shape="full" size="sm" class="capitalize">
                        10
                      </BaseTag>
                    </span>
                  </FlexTableCell> -->

                  <FlexTableCell
                    label="Created Date"
                    sortingBy="created_at"
                    :sort="true"
                    :hide-label="index > 0"
                    class="w-full sm:w-40 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ formatDateTime(ticket?.created_at).date }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Created Time"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ formatDateTime(ticket?.created_at).time }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Priority"
                    :hide-label="index > 0"
                    class="w-full sm:w-24 lg:!justify-start"
                  >
                    <BaseTag
                      :color="priority(ticket.priority)"
                      shape="full"
                      size="sm"
                      class="capitalize"
                    >
                      {{ ticket.priority }}
                    </BaseTag>
                  </FlexTableCell>

                  <FlexTableCell label="action" :hide-label="index > 0">
                    <BaseDropdown
                      flavor="context"
                      label="Dropdown"
                      orientation="end"
                      shape="smooth"
                    >
                      <BaseDropdownItem
                        :to="`/support-ticket/${ticket.id}?tab=Admin`"
                        title="Manage"
                        text="Manage ticket"
                        shape="smooth"
                      />

                      <BaseDropdownItem
                        v-if="ticket.status === 'opened'"
                        title="Review"
                        text="Review ticket"
                        shape="smooth"
                        @click="selectTicket(ticket, 'in progress')"
                      />

                      <BaseDropdownItem
                        v-if="ticket.status === 'in progress'"
                        title="Resolve"
                        text="Resolve ticket"
                        shape="smooth"
                        @click="selectTicket(ticket, 'resolved')"
                      />

                      <BaseDropdownItem
                        v-if="ticket.status === 'resolved'"
                        title="Review"
                        text="Review ticket"
                        shape="smooth"
                        @click="selectTicket(ticket, 'in progress')"
                      />

                      <BaseDropdownItem
                        v-if="ticket.status === 'resolved'"
                        title="Close"
                        text="Close ticket"
                        shape="smooth"
                        @click="selectTicket(ticket, 'closed')"
                      />

                      <BaseDropdownItem
                        v-if="ticket.status === 'closed' && auth.user?.index === ticket.creator_id"
                        title="Reopen"
                        text="Reopen ticket"
                        shape="smooth"
                        @click="selectTicket(ticket, 'reopen')"
                      />
                    </BaseDropdown>
                  </FlexTableCell>
                </template>
              </FlexTableRow>
            </div>
          </TransitionGroup>
        </div>

        <div v-if="data?.data.data.length !== 0" class="mt-4">
          <BasePagination
            :total-items="data?.data.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </TairoContentWrapper>

    <BaseModal
      :isOpen="isModalChangeTicketStatus"
      :title="modalTitle"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="modalBtnText"
      :primaryButtonAction="changeTicketStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalChangeTicketStatus = false"
    >
      {{ modalContent }}
    </BaseModal>
  </div>
</template>
