<script setup>
import { endOfYear, format } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks } from '../../../constants'

definePageMeta({
  title: 'School Locations',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const datePreset = ref('')
const actionStatus = ref('')
const schoolFilter = ref([])

const dateEnd = ref(null)
const dateStart = ref(null)
const locations = ref(null)
const selectedLocation = ref(null)

const isModalAddLocation = ref(false)
const isModalManageLocation = ref(false)

const isModalHoldLocation = ref(false)
const isModalResumeLocation = ref(false)
const isModalDeleteLocation = ref(false)
const isModalApproveLocation = ref(false)
const isModalSuspendLocation = ref(false)
const isModalReleaseLocation = ref(false)

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    datePreset.value = value
  }
}

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const schoolsList = ref([])
schoolsList.value = await getSchoolList()

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school: schoolFilter.value.length ? [schoolFilter.value] : undefined,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
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

const getLocationList = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/location-list', {
      query,
      watch: false,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    locations.value = data.value?.data
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getLocationList()

const manageLocation = (location) => {
  selectedLocation.value = location
  isModalManageLocation.value = true
}

const selectLocation = (location, action) => {
  selectedLocation.value = location

  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'deleted',
  }

  if (action === 'Approve') {
    isModalApproveLocation.value = true
  } else if (action === 'Suspend') {
    isModalSuspendLocation.value = true
  } else if (action === 'Release') {
    isModalReleaseLocation.value = true
  } else if (action === 'Resume') {
    isModalResumeLocation.value = true
  } else if (action === 'Hold') {
    isModalHoldLocation.value = true
  } else if (action === 'Delete') {
    isModalDeleteLocation.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeLocationStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('status', actionStatus.value)
    formData.append('location_id', selectedLocation.value?.id)
    formData.append('school_id', selectedLocation.value?.school_id)

    const { error } = await useApiFetch('/api/admin/school/location/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldLocation.value = false
    isModalResumeLocation.value = false
    isModalDeleteLocation.value = false
    isModalApproveLocation.value = false
    isModalSuspendLocation.value = false
    isModalReleaseLocation.value = false

    selectedLocation.value = null

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    await getLocationList()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'Location has been deleted!')
    } else {
      showSuccessToast('Success', 'Location status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

const downloadFunc = async () => {
  const query = {
    school: schoolFilter.value.length ? [schoolFilter.value] : undefined,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    perPage: perPage.value,
    page: page.value,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    query.dateRange = datePreset.value
    query.startDate = dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined
  }

  const { data, error } = await useAdminReadService('/api/admin/location-list/export', { query })

  if (error.value) {
    throw new Error(error.value?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `locations_export_${Date()}.csv`)
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const addLocation = async () => {
  isModalAddLocation.value = false
  await getLocationList()
}

const updateLocation = async () => {
  isModalManageLocation.value = false

  setTimeout(() => {
    getLocationList()
  }, 1000)
}

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
    case 'delete':
      return 'muted'
    default:
      break
  }
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'ASC' ? 'DESC' : 'ASC'
  sorting.value = { ...sorting.value, column }
}

watch(query, async () => {
  await getLocationList()
})

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch([schoolFilter, dateStart, dateEnd], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})
</script>

<template>
  <TairoContentWrapper>
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="sm"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Location Overview
        </BaseHeading>

        <BaseText size="xs" class="text-muted-600 dark:text-muted-400">
          View all school locations created on the platform. Create new locations or manage existing
          ones as needed.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton class="w-full sm:w-32" @click="downloadFunc">
          <Icon name="ph:export-light" class="h-4 w-4" />
          <span>Export</span>
        </BaseButton>

        <BaseButton
          color="primary"
          class="w-full px-0-important sm:w-32"
          @click="isModalAddLocation = true"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add Location</span>
        </BaseButton>
      </div>
    </div>

    <!-- Filter -->
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:ps-2">
            <BaseButtonClose
              v-if="schoolFilter.length > 0"
              size="sm"
              rounded="sm"
              color="muted"
              class="close-btn-auto"
              @click="schoolFilter = []"
            />

            <BaseAutocomplete
              v-model="schoolFilter"
              :items="schoolNames"
              icon="heroicons:building-library"
              placeholder="Search school"
              multiple
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
              @selected-value="handleSelectedValue(1, $event)"
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
      <div v-if="locations?.data.length === 0">
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
            v-for="(location, index) in locations?.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Location"
                sortingBy="location_name"
                :hide-label="index > 0"
                :title="location.location_name"
                :subtitle="location.school?.school_name"
                :avatar="getImageUrl(location.school?.schoolLogo)"
                :sort="true"
                @sort-column="columnSort"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Academic Level"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm capitalize">
                  {{ location.location_level }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Year / Term"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{
                    location.academic_year && location.academic_term
                      ? `${location.academic_year} / ${location.academic_term}${getSuffix(
                          location.academic_term,
                        )} Term`
                      : '-/- '
                  }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Active Students"
                sortingBy="active_student"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag shape="full" variant="solid" color="primary" class="w-20 text-center">
                    {{ location.active_student ?? '0' }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="LN-Status"
                sortingBy="status"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <BaseTag
                  :color="statusColor(location.status)"
                  shape="full"
                  size="sm"
                  class="capitalize"
                >
                  {{ location.status }}
                </BaseTag>
              </FlexTableCell>

              <!-- <FlexTableCell
                label="SL-Status"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
              >
                <BaseTag
                  :color="statusColor(location.school?.status)"
                  shape="full"
                  size="sm"
                  class="capitalize"
                >
                  {{ location.school?.status }}
                </BaseTag>
              </FlexTableCell> -->

              <FlexTableCell
                label="Created"
                sortingBy="created_at"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                  {{ formatDate(new Date(location.created_at)) }}
                </span>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    @click="manageLocation(location)"
                    title="Manage"
                    text="Manage location"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'draft'"
                    :title="createActionMenu(location.status, 'Location', 'Active')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Active')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Approve')"
                  />

                  <!-- <BaseDropdownItem
                    v-if="location.status === 'active'"
                    :title="createActionMenu(location.status, 'Location', 'Hold')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Hold')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="location.status === 'active'"
                    :title="createActionMenu(location.status, 'Location', 'Suspend')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'on hold'"
                    :title="createActionMenu(location.status, 'Location', 'Release')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Release')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'on hold'"
                    :title="createActionMenu(location.status, 'Location', 'Suspend')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'suspended'"
                    :title="createActionMenu(location.status, 'Location', 'Resume')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Resume')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Resume')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'draft' || location.status === 'suspended'"
                    :title="createActionMenu(location.status, 'Location', 'Delete')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Delete')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>

      <div v-if="locations?.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="locations?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

    <LocationsAdd v-if="isModalAddLocation" :isOpen="isModalAddLocation" @close="addLocation" />

    <LocationsEdit
      v-if="isModalManageLocation"
      :isOpen="isModalManageLocation"
      :schoolId="selectedLocation?.school_id"
      :locationId="selectedLocation?.id"
      @close="updateLocation"
    />

    <BaseModal
      v-if="isModalApproveLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveLocation"
      :title="'Approve Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveLocation = false"
    >
      Are you sure you want to approve this
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendLocation"
      :title="'Suspend Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendLocation = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedLocation?.location_name }}</span
      >
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseLocation"
      :title="'Release Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseLocation = false"
    >
      Are you sure you want to release
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalResumeLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeLocation"
      :title="'Resume Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeLocation = false"
    >
      Are you sure you want to resume all activities of
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalHoldLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldLocation"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldLocation = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
      location on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteLocation"
      :title="'Delete Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteLocation = false"
    >
      {{ `Do you want to proceed to delete this location?` }}
    </BaseModal>
  </TairoContentWrapper>
</template>

<style scoped>
.px-0-important {
  @apply px-0 !important;
}
</style>
