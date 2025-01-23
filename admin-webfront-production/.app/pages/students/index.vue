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
import { utcToZonedTime } from 'date-fns-tz'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks } from '../../constants'

definePageMeta({
  title: 'All Students',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const filter = ref('')
const debounced = refDebounced(filter, 500)

const grade = ref('')
const location = ref('')
const datePreset = ref('')
const schoolLevel = ref('')
const actionStatus = ref('')

const locations = ref([])
const schoolsList = ref([])
schoolsList.value = await getSchoolList()

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

const selectedSchool = route.query.school
const school = ref(selectedSchool ? [selectedSchool] : [])

const dateEnd = ref(null)
const dateStart = ref(null)
const statistics = ref(null)
const selectedStudent = ref(null)

const isModalHoldStudent = ref(false)
const isModalResumeStudent = ref(false)
const isModalDeleteStudent = ref(false)
const isModalApproveStudent = ref(false)
const isModalSuspendStudent = ref(false)
const isModalReleaseStudent = ref(false)

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 2) {
    schoolLevel.value = value
  } else if (dropdownId === 3) {
    grade.value = value
  } else if (dropdownId === 4) {
    datePreset.value = value
  }
}

if (school.value.length !== 0) {
  locations.value = await getSchoolLocationsByName(schoolsList.value, selectedSchool)
}

onMounted(() => {
  if (route.query.school) {
    if (route.query.location) {
      location.value = route.query.location
    }

    window.history.replaceState({}, document.title, '/students')
  }
})

watch(
  () => school.value,
  async (value) => {
    if (value.length !== 0) {
      locations.value = await getSchoolLocationsByName(schoolsList.value, value)
    }
  },
)

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const perPage = ref(30)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    search: debounced.value,
    school: school.value,
    location: location.value,
    level: schoolLevel.value,
    grade: grade.value,
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

const { data, pending, error, refresh } = await useAdminReadService(
  '/api/admin/all-student-account',
  { query },
)

if (error.value) {
  showErrorToast('Oops!', error.value.data?.message)
}

const selectStudent = (student, action) => {
  selectedStudent.value = student

  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'deleted',
  }

  if (action === 'Approve') {
    isModalApproveStudent.value = true
  } else if (action === 'Suspend') {
    isModalSuspendStudent.value = true
  } else if (action === 'Release') {
    isModalReleaseStudent.value = true
  } else if (action === 'Resume') {
    isModalResumeStudent.value = true
  } else if (action === 'Hold') {
    isModalHoldStudent.value = true
  } else if (action === 'Delete') {
    isModalDeleteStudent.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeStudentStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('id', selectedStudent.value?.id ?? '')
    formData.append('status', actionStatus.value)

    const { error } = await useApiFetch('/api/admin/user-account-status', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldStudent.value = false
    isModalResumeStudent.value = false
    isModalDeleteStudent.value = false
    isModalApproveStudent.value = false
    isModalSuspendStudent.value = false
    isModalReleaseStudent.value = false

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    refresh()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'Student has been deleted!')
    } else {
      showSuccessToast('Success', 'Student status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  } finally {
    setTimeout(() => {
      selectedStudent.value = null
    }, 1000)
  }
}

const downloadFunc = async () => {
  const query = {
    search: debounced.value,
    school: school.value,
    location: location.value,
    schoolLevel: schoolLevel.value,
    grade: grade.value,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    nonEmptyProperties.dateRange = datePreset.value
    nonEmptyProperties.startDate = dateStart.value
      ? format(new Date(dateStart.value), 'yyyy-MM-dd')
      : undefined
  }

  const { data, error } = await useAdminReadService('/api/admin/all-student-account/export', {
    query,
  })

  if (error.value) {
    throw new Error(error.value?.data?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `students_export_${Date()}.csv`)
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const getSchoolStatistics = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/all-student-statistics')

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

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

const formatDateAgo = (dateString) => {
  if (!dateString) {
    return 'never'
  }

  const timeZone = 'Africa/Lagos'
  const zonedDate = utcToZonedTime(new Date(dateString), timeZone)

  const now = new Date()
  const zonedNow = utcToZonedTime(now, timeZone)

  if (isYesterday(zonedDate)) {
    return 'yesterday'
  }

  const diffInMinutes = differenceInMinutes(zonedNow, zonedDate)
  const diffInHours = differenceInHours(zonedNow, zonedDate)
  const formattedDistance = formatDistance(zonedDate, zonedNow, { addSuffix: true })

  if (diffInMinutes < 60 || diffInHours < 24) {
    return formattedDistance
  }

  return format(zonedDate, 'dd MMMM yyyy')
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

const authStatus = (status) => {
  switch (status) {
    case 'login-success':
      return 'LoggedIn'
    case 'validation-success':
      return 'Validated'
    case 'otp-success':
      return 'Verified'
    case 'login-fail':
      return 'Login failed'
    case 'otp-fail':
      return 'Otp failed'
    case 'logout':
      return 'Logout'
    default:
      break
  }
}

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch(school, () => {
  location.value = ''
})

watch([filter, grade, location, schoolLevel, dateStart, dateEnd, sorting, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const schoolLevels = ref(['Primary', 'Secondary'])
const grades = ref(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
</script>

<template>
  <TairoContentWrapper>
    <div class="grid grid-cols-5 gap-4">
      <div class="col-span-12 md:col-span-1">
        <BaseCard class="p-4 !bg-purple-500/10 !border-purple-600">
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
              class="bg-purple-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-purple-500 dark:border-2"
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
              <span>{{ statistics?.school_students ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-12 md:col-span-1">
        <BaseCard class="p-4 !bg-teal-500/10 !border-teal-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Active Students</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-teal-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-teal-500 dark:border-2"
              shape="full"
            >
              <Icon name="material-symbols:shield-person-outline-rounded" class="h-5 w-5" />
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
              <span>{{ statistics?.active_students ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-12 md:col-span-1">
        <BaseCard class="p-4 !bg-amber-500/10 !border-amber-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Primary Students</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-amber-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-amber-500 dark:border-2"
              shape="full"
            >
              <Icon
                name="streamline:interface-user-full-body-geometric-human-person-single-up-user-full-body"
                class="h-5 w-5"
              />
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
              <span>{{ statistics?.primary_student ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-12 md:col-span-1">
        <BaseCard class="p-4 !bg-indigo-500/10 !border-indigo-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Secondary Students</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-indigo-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-indigo-500 dark:border-2"
              shape="full"
            >
              <Icon name="octicon:people-16" class="h-5 w-5" />
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
              <span>{{ statistics?.secondary_student ?? 0 }}</span>
            </BaseHeading>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-12 md:col-span-1">
        <BaseCard class="p-4 !bg-pink-500/10 !border-pink-500">
          <div class="mb-1 flex items-center justify-between">
            <BaseHeading
              as="h5"
              size="sm"
              weight="medium"
              lead="tight"
              class="text-muted-500 dark:text-muted-400"
            >
              <span>Engagement Rate</span>
            </BaseHeading>

            <BaseIconBox
              size="xs"
              class="bg-pink-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-pink-500 dark:border-2"
              shape="full"
            >
              <Icon name="material-symbols:av-timer" class="h-5 w-5" />
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
              <span>
                {{
                  ((statistics?.engaged_student / statistics?.school_students) * 100).toFixed(2)
                }}%
              </span>
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
          Students Directory
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Browse and manage all student accounts across schools. Use filters to refine your search
          and update student details as needed.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton class="w-full sm:w-32" @click="downloadFunc">
          <Icon name="ph:export-light" class="h-4 w-4" />
          <span>Export</span>
        </BaseButton>

        <BaseDropdown
          label="Add New"
          button-color="primary"
          orientation="end"
          size="md"
          class="add-dropdown"
        >
          <BaseDropdownItem to="students/add" title="Single student" color="default" rounded="sm" />

          <BaseDropdownItem
            to="students/add-bulk"
            title="Bulk Student"
            color="default"
            rounded="sm"
          />
        </BaseDropdown>
      </div>
    </div>

    <!-- filter -->
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Search Student Name/ Email"
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-full',
              }"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <BaseButtonClose
              v-if="school.length > 0"
              size="sm"
              rounded="sm"
              color="muted"
              class="close-btn-auto"
              @click="school = []"
            />
            <BaseAutocomplete
              v-model="school"
              :items="schoolNames"
              placeholder="Search School"
              icon="heroicons:building-library"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <BaseButtonClose
              v-if="location"
              size="sm"
              rounded="sm"
              color="muted"
              class="loc-close-btn"
              @click="location = ''"
            />
            <BaseListbox
              v-model="location"
              placeholder="Select Location"
              :items="locations"
              :disabled="school.length === 0"
            />
          </div>
        </div>

        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:col-span-6 w-full px-2 py-2 sm:w-[180px] relative">
            <CustomDropdown
              :options="schoolLevels"
              placeholder="Select Level"
              @selected-value="handleSelectedValue(2, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full px-2 py-2 sm:w-[180px] sm:ps-2">
            <CustomDropdown
              :options="grades"
              placeholder="Grade"
              @selected-value="handleSelectedValue(3, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <CustomDropdown
              :options="datePresets"
              placeholder="Choose Date Preset"
              @selected-value="handleSelectedValue(4, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
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

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
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
      <div v-if="!pending && data?.School_User?.data.data.length === 0">
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
            v-for="(student, index) in data?.School_User?.data.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Student"
                sortingBy="first_name"
                :sort="true"
                :hide-label="index > 0"
                :title="`${student.first_name} ${student.last_name}`"
                :subtitle="student.user_id"
                :avatar="student.student_profile?.profile_picture"
                :initials="getInitialLetters(student.first_name, student.last_name)"
                @sort-column="columnSort"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="School"
                sortingBy="school"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-44 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ student.school }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Location"
                :hide-label="index > 0"
                class="w-full sm:w-44 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ student.location }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Grade"
                sortingBy="grade"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-24 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ student.grade ? `Grade - ${student.grade}` : '-' }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="UR-Status"
                sortingBy="status"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <BaseTag
                  :color="statusColor(student.status)"
                  shape="full"
                  size="sm"
                  class="capitalize text-xs"
                >
                  {{ student.status }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell
                label="Last Login"
                sortingBy="last_attempt"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                  {{
                    student.last_attempt !== null
                      ? formatDateAgo(new Date(student.last_attempt))
                      : 'Never'
                  }}
                </span>
              </FlexTableCell>

              <!-- <FlexTableCell
                label="Auth-Status"
                sortingBy="user_action"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ authStatus(student.user_action) }}
                </span>
              </FlexTableCell> -->

              <FlexTableCell
                label="Created"
                sortingBy="created_at"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                  {{ formatDate(new Date(student.created_at)) }}
                </span>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    :to="`/students/${student.id}`"
                    title="Manage"
                    text="Manage Student"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="student.status === 'draft'"
                    :title="createActionMenu(student.status, 'Student', 'Active')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Active')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Approve')"
                  />

                  <!-- <BaseDropdownItem
                    v-if="student.status === 'active'"
                    :title="createActionMenu(student.status, 'Student', 'Hold')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Hold')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="student.status === 'active'"
                    :title="createActionMenu(student.status, 'Student', 'Suspend')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="student.status === 'on hold'"
                    :title="createActionMenu(student.status, 'Student', 'Release')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Release')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="student.status === 'on hold'"
                    :title="createActionMenu(student.status, 'Student', 'Suspend')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="student.status === 'suspended'"
                    :title="createActionMenu(student.status, 'Student', 'Resume')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Resume')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Resume')"
                  />

                  <BaseDropdownItem
                    v-if="student.status === 'draft' || student.status === 'suspended'"
                    :title="createActionMenu(student.status, 'Student', 'Delete')?.buttonText"
                    :text="createActionMenu(student.status, 'Student', 'Delete')?.title"
                    shape="smooth"
                    @click="() => selectStudent(student, 'Delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>

      <div v-if="data?.School_User?.data.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="data?.School_User?.data?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

    <BaseModal
      v-if="isModalApproveStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveStudent"
      :title="'Approve Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveStudent = false"
    >
      {{ `Are you sure you want to approve this student account?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendStudent"
      :title="'Suspend Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendStudent = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedStudent.first_name }} {{ selectedStudent.last_name }}
      </span>
      student account?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseStudent"
      :title="'Release Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseStudent = false"
    >
      {{ `Are you sure you want to release this student account from hold?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalResumeStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeStudent"
      :title="'Resume Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeStudent = false"
    >
      {{ `Are you sure you want to resume this student account?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalHoldStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldStudent"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldStudent = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedStudent.first_name }} {{ selectedStudent.last_name }}
      </span>
      student account on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteStudent"
      :title="'Delete Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteStudent = false"
    >
      Do you want to proceed to delete
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedStudent.first_name }} {{ selectedStudent.last_name }}
      </span>
      student account?
    </BaseModal>
  </TairoContentWrapper>
</template>

<style scoped>
.loc-close-btn {
  position: absolute;
  right: 55px;
  z-index: 9;
  top: 16px;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
