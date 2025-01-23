<script setup>
import { refDebounced } from '@vueuse/core'
import { endOfYear, format } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks } from '../../../constants'

definePageMeta({
  name: 'calendars',
  title: 'Term Calendars',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const filter = ref('')
const debounced = refDebounced(filter, 500)

const datePreset = ref('')
const actionStatus = ref('')
const academicYear = ref('')
const academicTerm = ref('')
const calendarType = ref('')
const searchType = ref({ id: 'name', name: 'Name' })

const dateEnd = ref(null)
const dateStart = ref(null)
const calendars = ref(null)
const academic_years = ref(null)
const selectedCalendar = ref(null)

const isModalDeleteCalendar = ref(false)
const isModalActivateCalendar = ref(false)
const isModalDuplicateCalendar = ref(false)
const isModalDeactivateCalendar = ref(false)
const isModalCanNotDeactivateCalendar = ref(false)

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    academicYear.value = value
  } else if (dropdownId === 2) {
    academicTerm.value = value
  } else if (dropdownId === 3) {
    calendarType.value = value
  } else if (dropdownId === 4) {
    datePreset.value = value
  }
}

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    searchText: debounced.value,
    searchBy: debounced.value ? searchType.value?.id : undefined,
    academic_year: academicYear.value.charAt(0),
    term: academicTerm.value.charAt(0),
    type: calendarType.value?.id,
    start_date: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    end_date: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    perPage: perPage.value,
    page: page.value,
    sort_field: sorting.value.column,
    sort_direction: sorting.value.direction,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    nonEmptyProperties.dateRange = datePreset.value
    nonEmptyProperties.start_date = dateStart.value
      ? format(new Date(dateStart.value), 'yyyy-MM-dd')
      : undefined
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const getCalendarList = async () => {
  try {
    const { data, error } = await useApiFetch('/api/admin/calendars', {
      query,
      watch: false,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    academic_years.value = data.value?.academic_years
    calendars.value = data.value?.calendars
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getCalendarList()

const isAnyCalendarAllocatedForFuture = (calendar) => {
  if (!calendar.location_calendars || calendar.location_calendars.length === 0) {
    return false
  }

  const today = new Date()

  for (const locCalendar of calendar.location_calendars) {
    const termStartDate = new Date(locCalendar.term_start_date)

    if (termStartDate > today) {
      return true
    }
  }

  return false
}

const selectCalendar = async (calendar, modal) => {
  selectedCalendar.value = calendar
  const result = await isAnyCalendarAllocatedForFuture(selectedCalendar.value)

  if (modal === 'delete') {
    isModalDeleteCalendar.value = true
  } else if (modal === 'deactivate') {
    if (result) {
      isModalCanNotDeactivateCalendar.value = true
    } else {
      isModalDeactivateCalendar.value = true
    }
  } else if (modal === 'activate') {
    isModalActivateCalendar.value = true
  } else if (modal === 'duplicate') {
    isModalDuplicateCalendar.value = true
  }
}

const deactivateCalendar = async () => {
  try {
    const body = {
      status: 'Inactive',
    }

    const { error } = await useApiFetch(
      `/api/admin/calendars/${selectedCalendar.value?.id}/status`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCalendar.value = false
    isModalActivateCalendar.value = false
    isModalDuplicateCalendar.value = false
    isModalDeactivateCalendar.value = false
    isModalCanNotDeactivateCalendar.value = false

    await getCalendarList()
    showSuccessToast('Success', 'Calendar has been deactivated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const activateCalendar = async () => {
  try {
    const body = {
      status: 'Active',
    }

    const { error } = await useApiFetch(
      `/api/admin/calendars/${selectedCalendar.value?.id}/status`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCalendar.value = false
    isModalActivateCalendar.value = false
    isModalDuplicateCalendar.value = false
    isModalDeactivateCalendar.value = false
    isModalCanNotDeactivateCalendar.value = false

    await getCalendarList()
    showSuccessToast('Success', 'Calendar has been activated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const deleteCalendar = async () => {
  try {
    const { error } = await useApiFetch(
      `/api/admin/calendars/${selectedCalendar.value?.id}/delete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCalendar.value = false
    isModalActivateCalendar.value = false
    isModalDuplicateCalendar.value = false
    isModalDeactivateCalendar.value = false
    isModalCanNotDeactivateCalendar.value = false

    await getCalendarList()
    showSuccessToast('Success', 'Calendar has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const duplicateCalendar = async () => {
  try {
    const { error } = await useApiFetch(
      `/api/admin/calendars/${selectedCalendar.value?.id}/duplicate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCalendar.value = false
    isModalActivateCalendar.value = false
    isModalDuplicateCalendar.value = false
    isModalDeactivateCalendar.value = false
    isModalCanNotDeactivateCalendar.value = false

    await getCalendarList()
    showSuccessToast('Success', 'Calendar has been duplicated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const statusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    case 'draft':
      return 'warning'
    default:
      break
  }
}

const goToSchools = () => {
  router.push({ name: 'schools' })
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

watch(query, async () => {
  await getCalendarList()
})

watch([perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch(
  [
    filter,
    dateStart,
    dateEnd,
    perPage,
    searchType,
    academicYear,
    academicTerm,
    calendarType,
    sorting,
  ],
  () => {
    router.push({
      query: {
        page: undefined,
      },
    })
  },
)

const years = computed(() => {
  // const highestYear = Math.max(...calendars.value?.data.map((item) => item.academic_year))

  const yearLabels = []
  for (let i = 0; i < academic_years.value?.length; i++) {
    yearLabels.push(`${academic_years.value[i]}${getSuffix(academic_years.value[i])} Year`)
  }

  return yearLabels
})

onMounted(() => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const searchList = ref([
  { id: 'name', name: 'Name' },
  { id: 'id', name: 'ID' },
  { id: 'reference', name: 'Reference' },
])
// const years = ref(['1st Year', '2nd Year', '3rd Year'])
const terms = ref(['1st Term', '2nd Term', '3rd Term'])
const calendarTypes = ref([
  { id: 'Mandatory', name: 'Mandatory Calendar' },
  { id: 'Casual', name: 'Casual Calendar' },
  { id: 'Seasonal', name: 'Seasonal Calendar' },
])
</script>

<template>
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
          All Task Calendars
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Browse and manage all existing task calendars created for allocation to schools.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton color="primary" class="w-full sm:w-32" to="/tasks/calendars/add-calendar">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add New</span>
        </BaseButton>
      </div>
    </div>

    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div
            class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:ps-2 sm:basis-5/12"
          >
            <BaseButtonGroup>
              <BaseInput
                v-model="filter"
                icon="lucide:search"
                placeholder="Search"
                autocomplete="off"
                :classes="{
                  wrapper: 'w-full sm:w-full',
                }"
              />

              <BaseListbox
                v-model="searchType"
                :items="searchList"
                placeholder="Select"
                :properties="{
                  value: 'id',
                  label: 'name',
                }"
                class="w-52 min-w-max sa-group-search"
              />
            </BaseButtonGroup>
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-2/12">
            <CustomDropdown
              :options="years"
              placeholder="Select Year"
              @selected-value="handleSelectedValue(1, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-2/12">
            <CustomDropdown
              :options="terms"
              placeholder="Select Term"
              @selected-value="handleSelectedValue(2, $event)"
            />
          </div>

          <div
            class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2 relative sm:basis-3/12"
          >
            <BaseButtonClose
              v-if="calendarType !== ''"
              size="sm"
              rounded="sm"
              color="muted"
              class="close-btn-auto"
              @click="calendarType = ''"
            />

            <BaseListbox
              v-model="calendarType"
              :items="calendarTypes"
              placeholder="Select Type"
              :properties="{
                value: 'id',
                label: 'name',
              }"
            />
          </div>
        </div>

        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
            <CustomDropdown
              :options="datePresets"
              placeholder="Choose Date Preset"
              @selected-value="handleSelectedValue(4, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
            <DatePicker
              v-model="dateStart"
              :masks="masks"
              :max-date="new Date()"
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
              :max-date="datePreset !== 'This Year' ? new Date() : endOfYear(new Date())"
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
      <div v-if="calendars?.data.length === 0">
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
          <FlexTableRow
            v-for="(calendar, index) in calendars?.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Calendar"
                :hide-label="index > 0"
                :title="calendar.name"
                :subtitle="calendar.code"
                :initials="getInitialLettersFromFullName(calendar.name)"
                :picture="getImageUrl(calendar.banner)"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Type"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.type }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Year/ Term"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{
                    calendar.academic_year && calendar.term
                      ? `${calendar.academic_year} / ${calendar.term}${getSuffix(
                          calendar.term,
                        )} Term`
                      : '-/- '
                  }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Tasks"
                :hide-label="index > 0"
                :sort="true"
                class="w-full sm:w-36 lg:!justify-start"
                sortingBy="tasks_count"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag shape="full" variant="solid" color="primary" class="w-10 text-center">
                    {{ calendar.tasks_count }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created Date"
                sortingBy="created_at"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                  {{ formatDate(new Date(calendar.created_at)) }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="status"
                :hide-label="index > 0"
                :sort="true"
                class="w-full sm:w-28 lg:!justify-start"
                sortingBy="status"
                @sort-column="columnSort"
              >
                <BaseTag
                  :color="statusColor(calendar.status)"
                  shape="full"
                  size="sm"
                  class="capitalize"
                >
                  {{ calendar.status }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    :to="`/tasks/calendars/${calendar.id}`"
                    title="Manage"
                    text="Manage calendar"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'active'"
                    title="Deactivate"
                    text="Deactivate calendar"
                    shape="smooth"
                    @click="selectCalendar(calendar, 'deactivate')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'draft'"
                    title="Approve"
                    text="Approve calendar"
                    shape="smooth"
                    @click="selectCalendar(calendar, 'activate')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'inactive'"
                    title="Activate"
                    text="Activate calendar"
                    shape="smooth"
                    @click="selectCalendar(calendar, 'activate')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status !== 'active'"
                    title="Delete"
                    text="Remove calendar"
                    shape="smooth"
                    @click="selectCalendar(calendar, 'delete')"
                  />

                  <BaseDropdownItem
                    v-if="calendar.status === 'active'"
                    title="Duplicate"
                    text="Duplicate calendar"
                    shape="smooth"
                    @click="selectCalendar(calendar, 'duplicate')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>

      <div v-if="calendars?.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="calendars?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

    <BaseModal
      :isOpen="isModalDeactivateCalendar"
      :title="'Deactivate Calendar'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Deactivate'"
      :primaryButtonAction="deactivateCalendar"
      :cancelButtonText="'Cancel'"
      @close="isModalDeactivateCalendar = false"
    >
      Are you sure you want to deactivate
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedCalendar.name }}
      </span>
      calendar?
    </BaseModal>

    <BaseModal
      :isOpen="isModalCanNotDeactivateCalendar"
      :title="'Deactivate Calendar'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Check Schools'"
      :primaryButtonAction="goToSchools"
      :cancelButtonText="'Cancel'"
      @close="isModalCanNotDeactivateCalendar = false"
    >
      This calendar cannot be deactivated because it is scheduled for allocation to schools. Please
      remove this calendar from the schools and try deactivating it again.
    </BaseModal>

    <BaseModal
      :isOpen="isModalActivateCalendar"
      :title="selectedCalendar?.status === 'draft' ? 'Approve Calendar' : 'Activate Calendar'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="selectedCalendar?.status === 'draft' ? 'Approve' : 'Activate'"
      :primaryButtonAction="activateCalendar"
      :cancelButtonText="'Cancel'"
      @close="isModalActivateCalendar = false"
    >
      <span v-if="selectedCalendar?.status === 'draft'">
        Are you sure you want to approve
        <span class="font-bold text-primary-500 dark:text-muted-200">
          {{ selectedCalendar.name }}
        </span>
        calendar?
      </span>
      <span v-else>
        Are you sure you want to activate
        <span class="font-bold text-primary-500 dark:text-muted-200">
          {{ selectedCalendar.name }}
        </span>
        calendar again?
      </span>
    </BaseModal>

    <BaseModal
      :isOpen="isModalDeleteCalendar"
      :title="'Delete Calendar'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="deleteCalendar"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteCalendar = false"
    >
      Do you want to proceed to delete
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedCalendar.name }}
      </span>
      calendar?
    </BaseModal>

    <BaseModal
      :isOpen="isModalDuplicateCalendar"
      :title="'Duplicate Calendar'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Duplicate'"
      :primaryButtonAction="duplicateCalendar"
      :cancelButtonText="'Cancel'"
      @close="isModalDuplicateCalendar = false"
    >
      Are you sure you want to duplicate
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedCalendar.name }}
      </span>
      calendar?
    </BaseModal>
  </TairoContentWrapper>
</template>

<style scoped>
.close-btn-auto {
  position: absolute;
  right: 55px;
  z-index: 9;
  top: 16px;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
