<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

definePageMeta({
  title: 'All Tasks',
  middleware: ['auth'],
})

const segmentName = 'Academic Center'
const pageName = 'All Tasks'
const { _delete, _export, create, update, view, approve } = await usePermissionChecker(
  segmentName,
  pageName,
)

const auth = useAuthStore()

watchEffect(() => {
  if (!view && auth.isLoggedIn) {
    showErrorToast('Oops!', "Sorry, You don't have View permission for this page! ")
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }
})

interface Task {
  id: number
  src: string
  taskName: string
  mainSegment: string
  game: string
  createdDate: string
  status: string
  difficultyLevel: string
}

const route = useRoute()
const router = useRouter()
const toaster = useToaster()

const filter = ref('')
const debounced = refDebounced(filter, 500)

const searchType = ref('Name')
const segment = ref('')
const skill = ref([])
const game = ref([])
const difficulty = ref('')
const datePreset = ref('')

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    segment.value = value
  } else if (dropdownId === 2) {
    difficulty.value = value
  } else if (dropdownId === 3) {
    datePreset.value = value
  }
}

const isModalDeleteTask = ref(false)
const isModalDeactivateTask = ref(false)
const isModalActivateTask = ref(false)
const isModalDuplicateTask = ref(false)

const selectedTask = ref<Task | null>(null)

const dateStart = ref<Date | null>(null)
const dateEnd = ref<Date | null>(null)

const masks = ref({
  input: 'DD/MM/YYYY',
})

const searchList = ref(['Name', 'Game', 'Skills'])
// const segments = ref(['Core skills', 'Creative series', 'Coaching', 'Webinars'])
// const skills = ref(['Skill 1', 'Skill 2', 'Skill 3'])
// const games = ref(['Game 1', 'Game 2', 'Game 3'])
const difficulties = ref(['Basic', 'Advanced', 'Expert'])

const datePresets = ref([
  'Custom day',
  'Custom range',
  'Today',
  'Last 7 days',
  'Last 14 days',
  'This week',
  'Last week',
  'This month',
  'Last month',
  'This Year',
  'Maximum',
])

const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const {
  data: segments,
  pending: segmentsPending,
  error: segmentsError,
  refresh: refreshSegments,
} = await useApiFetch<any>('/api/admin/segments?per_page=1000&page=1')
if (segmentsError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}
const {
  data: skills,
  pending: skillsPending,
  error: skillsError,
  refresh: refreshSkills,
} = await useApiFetch<any>('/api/admin/skills?per_page=1000&page=1')
if (skillsError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}
const {
  data: games,
  pending: gamesPending,
  error: gamesError,
  refresh: refreshGames,
} = await useApiFetch<any>('/api/admin/games?per_page=1000&page=1')
if (gamesError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const getIdFromName = (name: string, objsArr: any) => {
  const obj = objsArr?.find((item: any) => item?.name === name)
  return obj ? obj?.id : null
}

const query = computed(() => {
  const nonEmptyProperties = {
    searchText: debounced.value,
    filterBy: debounced.value ? searchType.value : undefined,
    segment: getIdFromName(segment.value, segments?.value?.segments?.data),
    skill: getIdFromName(skill.value, skills?.value?.skills?.data),
    game: getIdFromName(game.value, games?.value?.games?.data),
    difficulty: difficulty.value,
    start_date: dateStart.value ? formatDateFromString(dateStart.value) : dateStart.value,
    end_date: dateEnd.value ? formatDateFromString(dateEnd.value) : dateEnd.value,
    perPage: perPage.value,
    page: page.value,
  }

  // Filter out properties with null or empty values
  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

// const { data, pending, error, refresh } = await useFetch('/api/users', {
//   query,
// })
// if (error.value) {
//   showErrorToast('Oops!', 'No Data')
// }

const selectTask = (task: Task, modal: string) => {
  selectedTask.value = task
  if (modal === 'delete') {
    isModalDeleteTask.value = true
  } else if (modal === 'deactivate') {
    isModalDeactivateTask.value = true
  } else if (modal === 'activate') {
    isModalActivateTask.value = true
  } else if (modal === 'duplicate') {
    isModalDuplicateTask.value = true
  }
}

const refreshAll = () => {
  refreshActiveTasks()
  refreshDraftTasks()
  refreshDeactivatedTasks()
}

const deactivateTask = async () => {
  try {
    let task = selectedTask?.value
    const { error } = await useApiFetch<any>(`/api/admin/tasks/${task?.id}/status`, {
      method: 'POST',
      body: JSON.stringify({
        status: task?.status,
        is_active: 0,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    isModalDeactivateTask.value = false
    selectedTask.value = null

    if (error) {
      console.log('Error : ', error)
      // throw new Error('Request failed! API not integrated')
    }

    refreshAll()
    showSuccessToast('Success', 'Task has been deactivated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const activateTask = async () => {
  try {
    let task = selectedTask?.value
    const { error } = await useApiFetch<any>(`/api/admin/tasks/${task?.id}/status`, {
      method: 'POST',
      body: JSON.stringify({
        status: 'published',
        is_active: 1,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    isModalActivateTask.value = false
    selectedTask.value = null

    if (error) {
      console.log('Error : ', error)
      // throw new Error('Request failed! API not integrated')
    }

    refreshAll()
    showSuccessToast('Success', 'Task has been activated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const deleteTask = async () => {
  try {
    let task = selectedTask?.value
    const { error } = await useApiFetch<any>(`/api/admin/tasks/${task?.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    isModalDeleteTask.value = false
    selectedTask.value = null

    if (error) {
      // throw new Error('Request failed! API not integrated')
      console.log('Error : ', error)
    }

    refreshAll()
    showSuccessToast('Success', 'Task has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const duplicateTask = async () => {
  try {
    let task = selectedTask?.value
    const { error } = await useApiFetch<any>(`/api/admin/tasks/${task?.id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    isModalDuplicateTask.value = false
    selectedTask.value = null

    if (error) {
      // throw new Error('Request failed! API not integrated')
      console.log('Error : ', error)
    }

    refreshAll()
    showSuccessToast('Success', 'Task has been duplicated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

watch([perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const tabs = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Deactivated', value: 'deactivated' },
]

// Function to set values for dates based on the selected date preset
const setDateValues = () => {
  const today = startOfToday()

  switch (datePreset.value) {
    case 'Custom day':
      dateStart.value = null
      dateEnd.value = null
      break
    case 'Custom range':
      dateStart.value = null
      dateEnd.value = null
      break
    case 'Maximum':
      dateStart.value = new Date('2024-01-01')
      dateEnd.value = today
      break
    case 'Today':
      dateStart.value = today
      dateEnd.value = null
      break
    case 'Last 7 days':
      dateStart.value = subDays(today, 7)
      dateEnd.value = today
      break
    case 'Last 14 days':
      dateStart.value = subDays(today, 14)
      dateEnd.value = today
      break
    case 'This week':
      dateStart.value = startOfWeek(today)
      dateEnd.value = today
      break
    case 'Last week':
      dateStart.value = startOfWeek(subDays(today, 7))
      dateEnd.value = endOfWeek(subDays(today, 7))
      break
    case 'This month':
      dateStart.value = startOfMonth(today)
      dateEnd.value = today
      break
    case 'Last month':
      dateStart.value = startOfMonth(subDays(today, 30))
      dateEnd.value = endOfMonth(subDays(today, 30))
      break
    case 'This Year':
      dateStart.value = startOfYear(today)
      dateEnd.value = endOfYear(today)
      break

    default:
      dateStart.value = null
      dateEnd.value = null
  }
}

// Watch for changes in the selected date preset and update dates accordingly
watch(datePreset, setDateValues)

const clearFilters = () => {
  filter.value = ''
  searchType.value = 'Name'
  segment.value = ''
  skill.value = []
  game.value = []
  difficulty.value = ''
  datePreset.value = ''
  dateStart.value = null
  dateEnd.value = null
  perPage.value = 10
  selectedTask.value = null

  router.push({
    query: {
      page: undefined,
    },
  })
}

const {
  data: activeTasks,
  pending: activeTasksPending,
  error: activeTasksError,
  refresh: refreshActiveTasks,
} = await useApiFetch<any>('/api/admin/tasks?status=published&is_active=1', {
  query,
})
if (activeTasksError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const {
  data: draftTasks,
  pending: draftTasksPending,
  error: draftTasksError,
  refresh: refreshDraftTasks,
} = await useApiFetch<any>('/api/admin/tasks?status=draft', { query })
if (draftTasksError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const {
  data: deactivatedTasks,
  pending: deactivatedTasksPending,
  error: deactivatedTasksError,
  refresh: refreshDeactivatedTasks,
} = await useApiFetch<any>('/api/admin/tasks?is_active=0', { query })
if (deactivatedTasksError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

function filterItems(query?: string, items?: any[]) {
  if (!query || !items) {
    return items ?? []
  }

  // search by name or text
  return items.filter((item) => {
    const nameMatches = item?.name?.toLowerCase().includes(query.toLowerCase())
    const textMatches = item?.text?.toLowerCase().includes(query.toLowerCase())
    return nameMatches || textMatches
  })
}
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
          All Tasks table
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Customize user access and permissions for each segment
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <BaseButton v-if="_export" class="w-full sm:w-32">
            <Icon name="ph:export-light" class="h-4 w-4" />
            <span>Export</span>
          </BaseButton>
        </div>

        <BaseDropdown
          v-if="create"
          label="Add New"
          button-color="primary"
          orientation="end"
          size="md"
          class="add-dropdown"
        >
          <BaseDropdownItem to="/tasks/add-core-skills" title="Core skills / Creative series" />
          <BaseDropdownItem to="/tasks/add-coaching" title="Coaching" />
          <BaseDropdownItem to="/tasks/add-webinar" title="Webinar" />
        </BaseDropdown>
      </div>
    </div>

    <BaseCard class="!min-h-[600px]">
      <div class="px-8 pt-8 pb-4">
        <BaseTabSlider v-slot="{ activeValue }" model-value="active" :tabs="tabs">
          <div v-if="activeValue === 'active'">
            <!-- Filter -->
            <div class="relative">
              <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div
                    class="ptablet:ps-4 ptablet:col-span-6 w-full py-2 pe-2 ps-4 sm:w-auto sm:ps-2"
                  >
                    <BaseButtonGroup>
                      <BaseInput
                        v-model="filter"
                        icon="lucide:search"
                        placeholder="Search"
                        :classes="{
                          wrapper: 'w-full sm:w-full',
                        }"
                      />

                      <BaseListbox
                        v-model="searchType"
                        :items="searchList"
                        placeholder="Select"
                        class="w-40 min-w-max sa-group-search"
                      />
                    </BaseButtonGroup>
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
                    <CustomDropdown
                      :options="segments?.segments?.data?.map((segment: any) => segment?.name)"
                      placeholder="Select segment"
                      @selected-value="handleSelectedValue(1, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
                    <BaseButtonClose
                      v-if="skills?.skills?.data?.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="skill = []"
                    />
                    <BaseAutocomplete
                      v-model="skill"
                      :items="skills?.skills?.data?.map((skill: any) => skill?.name)"
                      placeholder="Search skill"
                      clearable
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
                    <BaseButtonClose
                      v-if="games?.games?.data?.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="game = []"
                    />
                    <BaseAutocomplete
                      v-model="game"
                      :items="games?.games?.data?.map((game: any) => game?.name)"
                      placeholder="Search game"
                    />
                  </div>
                </div>

                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
                    <CustomDropdown
                      :options="difficulties"
                      placeholder="Select difficulty"
                      @selected-value="handleSelectedValue(2, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
                    <CustomDropdown
                      :options="datePresets"
                      placeholder="Choose date preset"
                      @selected-value="handleSelectedValue(3, $event)"
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
                              placeholder="Start date"
                              autocomplete="off"
                              icon="ph:calendar-blank-duotone"
                              :value="inputValue"
                              type="text"
                              :disabled="
                                datePreset !== 'Custom day' && datePreset !== 'Custom range'
                              "
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
                              placeholder="End date"
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
              <div v-if="!activeTasksPending && activeTasks?.tasks?.data.length === 0">
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
                    v-for="(task, index) in activeTasks?.tasks?.data"
                    :key="index"
                    shape="rounded"
                    spaced
                  >
                    <template #start>
                      <FlexTableStart
                        label="Task"
                        :hide-label="index > 0"
                        :title="task.name"
                        :subtitle="task?.segment?.name ?? ''"
                        :picture="getImageUrl(task.thumbnail)"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Game"
                        :hide-label="index > 0"
                        class="w-full sm:w-48 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task?.games?.[0]?.name }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Difficulty"
                        :hide-label="index > 0"
                        class="w-full sm:w-32 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task.difficulty }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Created Date"
                        :hide-label="index > 0"
                        class="w-full sm:w-32 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ formatDateFromString(task?.created_at) }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        v-if="_delete || update || approve || create"
                        label="action"
                        :hide-label="index > 0"
                      >
                        <BaseDropdown
                          flavor="context"
                          label="Dropdown"
                          orientation="end"
                          shape="smooth"
                        >
                          <BaseDropdownItem
                            v-if="update"
                            :to="`/tasks/manage/${task.id}`"
                            title="Manage"
                            text="Manage Task"
                            shape="smooth"
                          />

                          <BaseDropdownItem
                            v-if="create"
                            title="Duplicate"
                            text="Duplicate task"
                            shape="smooth"
                            @click="selectTask(task, 'duplicate')"
                          />

                          <BaseDropdownItem
                            v-if="approve && task.is_active !== 0"
                            title="Deactivate"
                            text="Deactivate task"
                            shape="smooth"
                            @click="selectTask(task, 'deactivate')"
                          />

                          <BaseDropdownItem
                            v-if="approve && task.is_active === 0"
                            title="Activate"
                            text="Activate task"
                            shape="smooth"
                            @click="selectTask(task, 'activate')"
                          />

                          <BaseDropdownItem
                            v-if="_delete && task.is_active === 0"
                            title="Delete"
                            text="Remove task"
                            shape="smooth"
                            @click="selectTask(task, 'delete')"
                          />
                        </BaseDropdown>
                      </FlexTableCell>
                    </template>
                  </FlexTableRow>
                </TransitionGroup>
              </div>

              <div v-if="!activeTasksPending && activeTasks?.tasks?.data.length !== 0" class="mt-4">
                <BasePagination
                  :total-items="activeTasks?.tasks?.total ?? 0"
                  :item-per-page="perPage"
                  :current-page="page"
                  shape="curved"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeValue === 'draft'" class="">
            <!-- Filter -->
            <div class="relative">
              <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div
                    class="ptablet:ps-4 ptablet:col-span-6 w-full py-2 pe-2 ps-4 sm:w-auto sm:ps-2"
                  >
                    <BaseButtonGroup>
                      <BaseInput
                        v-model="filter"
                        icon="lucide:search"
                        placeholder="Search"
                        :classes="{
                          wrapper: 'w-full sm:w-full',
                        }"
                      />

                      <BaseListbox
                        v-model="searchType"
                        :items="searchList"
                        placeholder="Select"
                        class="w-40 min-w-max sa-group-search"
                      />
                    </BaseButtonGroup>
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
                    <CustomDropdown
                      :options="segments?.segments?.data?.map((segment: any) => segment?.name)"
                      placeholder="Select segment"
                      @selected-value="handleSelectedValue(1, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
                    <BaseButtonClose
                      v-if="skills?.skills?.data?.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="skill = []"
                    />
                    <BaseAutocomplete
                      v-model="skill"
                      :items="skills?.skills?.data?.map((skill: any) => skill?.name)"
                      placeholder="Search skill"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
                    <BaseButtonClose
                      v-if="games?.games?.data?.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="game = []"
                    />
                    <BaseAutocomplete
                      v-model="game"
                      :items="games?.games?.data?.map((game: any) => game?.name)"
                      placeholder="Search game"
                    />
                  </div>
                </div>

                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
                    <CustomDropdown
                      :options="difficulties"
                      placeholder="Select difficulty"
                      @selected-value="handleSelectedValue(2, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
                    <CustomDropdown
                      :options="datePresets"
                      placeholder="Choose date preset"
                      @selected-value="handleSelectedValue(3, $event)"
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
                              placeholder="Start date"
                              autocomplete="off"
                              icon="ph:calendar-blank-duotone"
                              :value="inputValue"
                              type="text"
                              :disabled="
                                datePreset !== 'Custom day' && datePreset !== 'Custom range'
                              "
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
                              placeholder="End date"
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
              <div v-if="!draftTasksPending && draftTasks?.tasks?.data.length === 0">
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
                    v-for="(task, index) in draftTasks?.tasks?.data"
                    :key="index"
                    shape="rounded"
                    spaced
                  >
                    <template #start>
                      <FlexTableStart
                        label="Task"
                        :hide-label="index > 0"
                        :title="task.name"
                        :subtitle="task.segment?.name"
                        :picture="getImageUrl(task?.thumbnail)"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Game"
                        :hide-label="index > 0"
                        class="w-full sm:w-48 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task?.games?.[0]?.name }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Difficulty"
                        :hide-label="index > 0"
                        class="w-full sm:w-32 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task.difficulty }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Created Date"
                        :hide-label="index > 0"
                        class="w-full sm:w-32 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ formatDateFromString(task?.created_at) }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        v-if="_delete || update || approve || create"
                        label="action"
                        :hide-label="index > 0"
                      >
                        <BaseDropdown
                          flavor="context"
                          label="Dropdown"
                          orientation="end"
                          shape="smooth"
                        >
                          <BaseDropdownItem
                            v-if="update"
                            :to="`/tasks/manage/${task.id}`"
                            title="Manage"
                            text="Manage Task"
                            shape="smooth"
                          />

                          <BaseDropdownItem
                            v-if="create"
                            title="Duplicate"
                            text="Duplicate task"
                            shape="smooth"
                            @click="selectTask(task, 'duplicate')"
                          />

                          <BaseDropdownItem
                            v-if="approve && task.is_active !== 0 && task?.status == 'published'"
                            title="Deactivate"
                            text="Deactivate task"
                            shape="smooth"
                            @click="selectTask(task, 'deactivate')"
                          />

                          <BaseDropdownItem
                            v-if="approve && (task.is_active === 0 || task.status === 'draft')"
                            title="Activate"
                            text="Activate task"
                            shape="smooth"
                            @click="selectTask(task, 'activate')"
                          />

                          <BaseDropdownItem
                            v-if="_delete && task.is_active === 0"
                            title="Delete"
                            text="Remove task"
                            shape="smooth"
                            @click="selectTask(task, 'delete')"
                          />
                        </BaseDropdown>
                      </FlexTableCell>
                    </template>
                  </FlexTableRow>
                </TransitionGroup>
              </div>

              <div v-if="!draftTasksPending && draftTasks?.tasks?.data.length !== 0" class="mt-4">
                <BasePagination
                  :total-items="draftTasks?.tasks?.total ?? 0"
                  :item-per-page="perPage"
                  :current-page="page"
                  shape="curved"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeValue === 'deactivated'" class="">
            <!-- Filter -->
            <div class="relative">
              <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div
                    class="ptablet:ps-4 ptablet:col-span-6 w-full py-2 pe-2 ps-4 sm:w-auto sm:ps-2"
                  >
                    <BaseButtonGroup>
                      <BaseInput
                        v-model="filter"
                        icon="lucide:search"
                        placeholder="Search"
                        :classes="{
                          wrapper: 'w-full sm:w-full',
                        }"
                      />

                      <BaseListbox
                        v-model="searchType"
                        :items="searchList"
                        placeholder="Select"
                        class="w-40 min-w-max sa-group-search"
                      />
                    </BaseButtonGroup>
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
                    <CustomDropdown
                      :options="segments?.segments?.data?.map((segment: any) => segment?.name)"
                      placeholder="Select segment"
                      @selected-value="handleSelectedValue(1, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
                    <BaseButtonClose
                      v-if="skills?.skills?.data?.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="skill = []"
                    />
                    <BaseAutocomplete
                      v-model="skill"
                      :items="skills?.skills?.data?.map((skill: any) => skill?.name)"
                      placeholder="Search skill"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
                    <BaseButtonClose
                      v-if="games?.games?.data?.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="game = []"
                    />
                    <BaseAutocomplete
                      v-model="game"
                      :items="games?.games?.data?.map((game: any) => game?.name)"
                      placeholder="Search game"
                    />
                  </div>
                </div>

                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
                    <CustomDropdown
                      :options="difficulties"
                      placeholder="Select difficulty"
                      @selected-value="handleSelectedValue(2, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
                    <CustomDropdown
                      :options="datePresets"
                      placeholder="Choose date preset"
                      @selected-value="handleSelectedValue(3, $event)"
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
                              placeholder="Start date"
                              autocomplete="off"
                              icon="ph:calendar-blank-duotone"
                              :value="inputValue"
                              type="text"
                              :disabled="
                                datePreset !== 'Custom day' && datePreset !== 'Custom range'
                              "
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
                              placeholder="End date"
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
              <div v-if="!deactivatedTasksPending && deactivatedTasks?.tasks?.data.length === 0">
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
                    v-for="(task, index) in deactivatedTasks?.tasks?.data"
                    :key="index"
                    shape="rounded"
                    spaced
                  >
                    <template #start>
                      <FlexTableStart
                        label="Task"
                        :hide-label="index > 0"
                        :title="task.name"
                        :subtitle="task.segment?.name"
                        :picture="getImageUrl(task?.thumbnail)"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Game"
                        :hide-label="index > 0"
                        class="w-full sm:w-48 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task?.games?.[0]?.name }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Difficulty"
                        :hide-label="index > 0"
                        class="w-full sm:w-32 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task.difficulty }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Created Date"
                        :hide-label="index > 0"
                        class="w-full sm:w-32 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ formatDateFromString(task?.created_at) }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        v-if="_delete || update || approve || create"
                        label="action"
                        :hide-label="index > 0"
                      >
                        <BaseDropdown
                          flavor="context"
                          label="Dropdown"
                          orientation="end"
                          shape="smooth"
                        >
                          <BaseDropdownItem
                            v-if="update"
                            :to="`/tasks/manage/${task.id}`"
                            title="Manage"
                            text="Manage Task"
                            shape="smooth"
                          />

                          <BaseDropdownItem
                            v-if="create"
                            title="Duplicate"
                            text="Duplicate task"
                            shape="smooth"
                            @click="selectTask(task, 'duplicate')"
                          />

                          <BaseDropdownItem
                            v-if="approve && task.is_active !== 0"
                            title="Deactivate"
                            text="Deactivate task"
                            shape="smooth"
                            @click="selectTask(task, 'deactivate')"
                          />

                          <BaseDropdownItem
                            v-if="approve && task.is_active === 0"
                            title="Activate"
                            text="Activate task"
                            shape="smooth"
                            @click="selectTask(task, 'activate')"
                          />

                          <BaseDropdownItem
                            v-if="_delete && task.is_active === 0"
                            title="Delete"
                            text="Remove task"
                            shape="smooth"
                            @click="selectTask(task, 'delete')"
                          />
                        </BaseDropdown>
                      </FlexTableCell>
                    </template>
                  </FlexTableRow>
                </TransitionGroup>
              </div>

              <div
                v-if="!deactivatedTasksPending && deactivatedTasks?.tasks?.data.length !== 0"
                class="mt-4"
              >
                <BasePagination
                  :total-items="deactivatedTasks?.tasks?.total ?? 0"
                  :item-per-page="perPage"
                  :current-page="page"
                  shape="curved"
                />
              </div>
            </div>
          </div>
        </BaseTabSlider>
      </div>
    </BaseCard>

    <BaseModal
      :isOpen="isModalDeactivateTask"
      :title="'Deactivate Task'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Deactivate'"
      :primaryButtonAction="deactivateTask"
      :cancelButtonText="'Cancel'"
      @close="isModalDeactivateTask = false"
    >
      Are you sure you want to deactivate this task?
    </BaseModal>

    <BaseModal
      :isOpen="isModalActivateTask"
      :title="'Activate Task'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Activate'"
      :primaryButtonAction="activateTask"
      :cancelButtonText="'Cancel'"
      @close="isModalActivateTask = false"
    >
      Are you sure you want to activate this task?
    </BaseModal>

    <BaseModal
      :isOpen="isModalDeleteTask"
      :title="'Delete Task'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="deleteTask"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteTask = false"
    >
      Are you sure you want to delete this task?
    </BaseModal>

    <BaseModal
      :isOpen="isModalDuplicateTask"
      :title="'Duplicate Task'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Duplicate'"
      :primaryButtonAction="duplicateTask"
      :cancelButtonText="'Cancel'"
      @close="isModalDuplicateTask = false"
    >
      Are you sure you want to duplicate this task?
    </BaseModal>
  </TairoContentWrapper>
</template>
