<script setup>
import { refDebounced } from '@vueuse/core'
import { endOfYear, format } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks, numberOfStudents, searchList } from '../../constants'

definePageMeta({
  name: 'schools',
  title: 'School Organisations',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const filter = ref('')
const debounced = refDebounced(filter, 300)

const datePreset = ref('')
const actionStatus = ref('')
const studentsCount = ref('')

const dateEnd = ref(null)
const schools = ref(null)
const dateStart = ref(null)
const statistics = ref(null)
const selectedSchool = ref(null)

const debouncedDateEnd = refDebounced(dateEnd, 300)
const debouncedDateStart = refDebounced(dateStart, 300)

const isModalHoldSchool = ref(false)
const isModalResumeSchool = ref(false)
const isModalDeleteSchool = ref(false)
const isModalApproveSchool = ref(false)
const isModalSuspendSchool = ref(false)
const isModalReleaseSchool = ref(false)

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    studentsCount.value = value
  } else if (dropdownId === 2) {
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
    search: debounced.value,
    no_of_student: studentsCount.value,
    startDate: debouncedDateStart.value
      ? format(new Date(debouncedDateStart.value), 'yyyy-MM-dd')
      : undefined,
    endDate: debouncedDateEnd.value
      ? format(new Date(debouncedDateEnd.value), 'yyyy-MM-dd')
      : undefined,
    perPage: perPage.value,
    page: page.value,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
  }

  if (
    (datePreset.value === 'Custom day' && debouncedDateStart.value) ||
    datePreset.value === 'Today'
  ) {
    nonEmptyProperties.dateRange = datePreset.value
    nonEmptyProperties.startDate = debouncedDateStart.value
      ? format(new Date(debouncedDateStart.value), 'yyyy-MM-dd')
      : undefined
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const getSchoolList = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/school-list', {
      query,
      watch: false,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    schools.value = data.value?.data
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getSchoolList()

const getSchoolStatistics = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/all-school-statistics')

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    statistics.value = data.value
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getSchoolStatistics()

const selectSchool = (school, action) => {
  selectedSchool.value = school

  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'deleted',
  }

  if (action === 'Approve') {
    isModalApproveSchool.value = true
  } else if (action === 'Suspend') {
    isModalSuspendSchool.value = true
  } else if (action === 'Release') {
    isModalReleaseSchool.value = true
  } else if (action === 'Resume') {
    isModalResumeSchool.value = true
  } else if (action === 'Hold') {
    isModalHoldSchool.value = true
  } else if (action === 'Delete') {
    isModalDeleteSchool.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeSchoolStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('school_id', selectedSchool.value?.id ?? '')
    formData.append('status', actionStatus.value)

    const { error } = await useApiFetch('/api/admin/school/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldSchool.value = false
    isModalResumeSchool.value = false
    isModalDeleteSchool.value = false
    isModalApproveSchool.value = false
    isModalSuspendSchool.value = false
    isModalReleaseSchool.value = false

    selectedSchool.value = null

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    await getSchoolList()
    await getSchoolStatistics()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'School has been deleted!')
    } else {
      showSuccessToast('Success', 'School status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  } finally {
    setTimeout(() => {
      selectedSchool.value = null
    }, 1000)
  }
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
    default:
      break
  }
}

const downloadFunc = async () => {
  const query = {
    search: debounced.value,
    no_of_student: studentsCount.value,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    query.dateRange = datePreset.value
    query.startDate = dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined
  }

  const { data, error } = await useAdminReadService('/api/admin/school-list/export', { query })

  if (error.value) {
    throw new Error(error.value?.data?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `schools_export_${Date()}.csv`)
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'ASC' ? 'DESC' : 'ASC'
  sorting.value = { ...sorting.value, column }
}

watch([page], async () => {
  await getSchoolList()
})

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch(
  [debounced, perPage, studentsCount, debouncedDateStart, debouncedDateEnd, sorting],
  async () => {
    if (page.value === 1) {
      await getSchoolList()
    } else {
      router.push({
        query: {
          page: undefined,
        },
      })
    }
  },
)
</script>

<template>
  <TairoContentWrapper>
    <div class="grid grid-cols-12 gap-4">
      <!-- Total Schools -->
      <div class="col-span-12 md:col-span-3">
        <BaseCard class="p-4 !bg-teal-500/10 !border-teal-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Total Schools</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-teal-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-teal-500 dark:border-2"
              shape="full"
            >
              <Icon name="heroicons-outline:library" class="h-5 w-5" />
            </BaseIconBox>
          </div>

          <div class="mb-2">
            <BaseHeading
              as="h4"
              size="3xl"
              weight="bold"
              lead="tight"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ statistics?.s_count ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <!-- Total Locations -->
      <div class="col-span-12 md:col-span-3">
        <BaseCard class="p-4 !bg-amber-500/10 !border-amber-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Total Locations</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-amber-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-amber-500 dark:border-2"
              shape="full"
            >
              <Icon name="material-symbols:location-on-outline" class="h-5 w-5" />
            </BaseIconBox>
          </div>

          <div class="mb-2">
            <BaseHeading
              as="h4"
              size="3xl"
              weight="bold"
              lead="tight"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ statistics?.s_location_count ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <!-- Total School Users -->
      <div class="col-span-12 md:col-span-3">
        <BaseCard class="p-4 !bg-indigo-500/10 !border-indigo-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Total School Users</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-indigo-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-indigo-500 dark:border-2"
              shape="full"
            >
              <Icon name="mdi-light:account" class="h-5 w-5" />
            </BaseIconBox>
          </div>

          <div class="mb-2">
            <BaseHeading
              as="h4"
              size="3xl"
              weight="bold"
              lead="tight"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ statistics?.s_users ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <!-- Total Students -->
      <div class="col-span-12 md:col-span-3">
        <BaseCard class="p-4 !bg-pink-500/10 !border-pink-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Total Students</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-pink-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-pink-500 dark:border-2"
              shape="full"
            >
              <Icon name="ph:users-four-light" class="h-5 w-5" />
            </BaseIconBox>
          </div>

          <div class="mb-2">
            <BaseHeading
              as="h4"
              size="3xl"
              weight="bold"
              lead="tight"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ statistics?.s_student ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>
    </div>

    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Schools Overview
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Manage school organizations from creation to oversight. Access details and perform tasks
          efficiently.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton class="w-full sm:w-32" @click="downloadFunc">
          <Icon name="ph:export-light" class="h-4 w-4" />
          <span>Export</span>
        </BaseButton>

        <BaseButton color="primary" class="w-full px-0-important sm:w-32" to="/schools/add-school">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add School</span>
        </BaseButton>
      </div>
    </div>

    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Search by School Name or School ID"
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-full',
              }"
            />
          </div>

          <div class="ptablet:col-span-6 w-full px-2 py-2 sm:w-[360px] relative">
            <CustomDropdown
              :options="numberOfStudents"
              placeholder="Students Count"
              @selected-value="handleSelectedValue(1, $event)"
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
              @selected-value="handleSelectedValue(2, $event)"
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
      <div v-if="schools?.data.length === 0">
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
          <FlexTableRow v-for="(item, index) in schools?.data" :key="index" shape="rounded" spaced>
            <template #start>
              <FlexTableStart
                label="School"
                sortingBy="school_name"
                :hide-label="index > 0"
                :title="item.school_name"
                :subtitle="item.school_id"
                :avatar="getImageUrl(item.schoolLogo)"
                :sort="true"
                @sort-column="columnSort"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Primary Email"
                :hide-label="index > 0"
                class="w-full sm:w-96 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ item.primary_contact_person_email }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Active Students"
                sortingBy="no_of_student"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
                :sort="true"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag shape="full" variant="solid" color="primary" class="w-20 text-center">
                    {{ item.no_of_student }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created"
                sortingBy="created_at"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                  {{ formatDate(new Date(item.created_at)) }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="SL-Status"
                sortingBy="status"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <BaseTag
                  :color="statusColor(item.status)"
                  shape="full"
                  size="sm"
                  class="capitalize"
                >
                  {{ item.status }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    :to="`/schools/${item.id}`"
                    title="Manage"
                    text="Manage School"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'draft'"
                    :title="createActionMenu(item.status, 'School', 'Active')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Active')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Approve')"
                  />

                  <!-- <BaseDropdownItem
                    v-if="item.status === 'active'"
                    :title="createActionMenu(item.status, 'School', 'Hold')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Hold')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="item.status === 'active'"
                    :title="createActionMenu(item.status, 'School', 'Suspend')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'on hold'"
                    :title="createActionMenu(item.status, 'School', 'Release')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Release')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'on hold'"
                    :title="createActionMenu(item.status, 'School', 'Suspend')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'suspended'"
                    :title="createActionMenu(item.status, 'School', 'Resume')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Resume')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Resume')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'draft' || item.status === 'suspended'"
                    :title="createActionMenu(item.status, 'School', 'Delete')?.buttonText"
                    :text="createActionMenu(item.status, 'School', 'Delete')?.title"
                    shape="smooth"
                    @click="() => selectSchool(item, 'Delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>

      <div v-if="schools?.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="schools?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

    <BaseModal
      v-if="isModalApproveSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveSchool"
      :title="'Approve School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveSchool = false"
    >
      Are you sure you want to approve this
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span
      >?
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendSchool"
      :title="'Suspend School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendSchool = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school account?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseSchool"
      :title="'Release School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseSchool = false"
    >
      Are you sure you want to release
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school?
    </BaseModal>

    <BaseModal
      v-if="isModalResumeSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeSchool"
      :title="'Resume School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeSchool = false"
    >
      Are you sure you want to resume activities of
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school?
    </BaseModal>

    <BaseModal
      v-if="isModalHoldSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldSchool"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldSchool = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school account on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteSchool"
      :title="'Delete School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteSchool = false"
    >
      {{ `Do you want to proceed to delete this school?` }}
    </BaseModal>
  </TairoContentWrapper>
</template>

<style scoped>
.px-0-important {
  @apply px-0 !important;
}
</style>
