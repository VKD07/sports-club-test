<script setup>
import { activeStatus, datePresets, masks } from '../../constants'
import { format, endOfYear } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { refDebounced } from '@vueuse/core'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

const { games, skills, segments } = defineProps(['games', 'skills', 'segments'])
const emits = defineEmits(['goToActive'])

const route = useRoute()
const router = useRouter()
const toaster = useToaster()

const game = ref([])
const skill = ref([])
const filter = ref('')
const segment = ref('')
const difficulty = ref('')
const datePreset = ref('')
const searchType = ref('Name')
const debounced = refDebounced(filter, 500)

const dateEnd = ref(null)
const dateStart = ref(null)
const selectedTask = ref(null)

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    segment.value = value
  } else if (dropdownId === 2) {
    difficulty.value = value
  } else if (dropdownId === 3) {
    datePreset.value = value
  }
}

const getIdFromName = (name, objsArr) => {
  const obj = objsArr?.find((item) => item?.name === name)
  return obj ? obj?.id : null
}

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const perPage = ref(10)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    page: page.value,
    status: 'draft',
    per_page: perPage.value,
    searchText: debounced.value ? debounced.value : undefined,
    difficulty: difficulty.value ? difficulty.value : undefined,
    games: game.value ? [getIdFromName(game.value, games?.games?.data)] : undefined,
    skills: skill.value ? [getIdFromName(skill.value, skills?.skills?.data)] : undefined,
    filterBy: debounced.value ? searchType.value : undefined,
    segments: segment.value ? [getIdFromName(segment.value, segments?.segments?.data)] : undefined,
    end_date: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    start_date: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
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
    Object.entries(nonEmptyProperties).filter(([key, value]) => {
      return value != null && !(Array.isArray(value) && value.includes(null))
    }),
  )

  Object.keys(filteredProperties).forEach((key) => {
    if (Array.isArray(filteredProperties[key])) {
      filteredProperties[key] = JSON.stringify(filteredProperties[key])
    }
  })

  return filteredProperties
})

const { data, pending, error, refresh } = await useApiFetch('/api/admin/tasks', { query })
if (error.value) {
  showErrorToast('Oops!', 'Something went wrong in fetch tasks, please try again!')
}

const gameList = computed(() => games?.games?.data?.map((game) => game?.name))
const skillList = computed(() => skills?.skills?.data?.map((skill) => skill?.name))
const segmentList = computed(() => segments?.segments?.data?.map((segment) => segment?.name))

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch(
  [filter, dateStart, dateEnd, perPage, searchType, difficulty, game, skill, segment, sorting],
  () => {
    router.push({
      query: {
        page: undefined,
      },
    })
  },
)

const isModalDeleteTask = ref(false)
const isModalActivateTask = ref(false)
const isModalDuplicateTask = ref(false)
const isModalDeactivateTask = ref(false)
const isModalCanNotDeactivateTask = ref(false)

const isAnyCalendarAllocatedForFuture = (task) => {
  if (!task.calendars || task.calendars.length === 0) {
    return false
  }

  const today = new Date()

  for (const calendar of task.calendars) {
    for (const locCalendar of calendar.location_calendars) {
      const termStartDate = new Date(locCalendar.term_start_date)

      if (termStartDate > today) {
        return true
      }
    }
  }

  return false
}

const selectTask = async (task, modal) => {
  selectedTask.value = task
  const result = await isAnyCalendarAllocatedForFuture(selectedTask.value)

  if (modal === 'delete') {
    isModalDeleteTask.value = true
  } else if (modal === 'deactivate') {
    if (result) {
      isModalCanNotDeactivateTask.value = true
    } else {
      isModalDeactivateTask.value = true
    }
  } else if (modal === 'activate') {
    isModalActivateTask.value = true
  } else if (modal === 'duplicate') {
    isModalDuplicateTask.value = true
  }
}

const deactivateTask = async () => {
  try {
    const body = {
      status: 'Inactive',
      is_active: true,
    }

    const { error } = await useApiFetch(`/api/admin/tasks/${selectedTask.value?.id}/status`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteTask.value = false
    isModalActivateTask.value = false
    isModalDuplicateTask.value = false
    isModalDeactivateTask.value = false
    isModalCanNotDeactivateTask.value = false

    await refresh()
    showSuccessToast('Success', 'Task has been deactivated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const activateTask = async () => {
  try {
    const body = {
      status: 'Active',
      is_active: true,
    }

    const { error } = await useApiFetch(`/api/admin/tasks/${selectedTask.value?.id}/status`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteTask.value = false
    isModalActivateTask.value = false
    isModalDuplicateTask.value = false
    isModalDeactivateTask.value = false
    isModalCanNotDeactivateTask.value = false

    emits('goToActive')
    showSuccessToast('Success', 'Task has been approved!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const deleteTask = async () => {
  try {
    const { error } = await useApiFetch(`/api/admin/tasks/${selectedTask.value?.id}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteTask.value = false
    isModalActivateTask.value = false
    isModalDuplicateTask.value = false
    isModalDeactivateTask.value = false
    isModalCanNotDeactivateTask.value = false

    await refresh()
    showSuccessToast('Success', 'Task has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const duplicateTask = async () => {
  try {
    const { error } = await useApiFetch(`/api/admin/tasks/${selectedTask.value?.id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteTask.value = false
    isModalActivateTask.value = false
    isModalDuplicateTask.value = false
    isModalDeactivateTask.value = false
    isModalCanNotDeactivateTask.value = false

    await refresh()
    showSuccessToast('Success', 'Task has been duplicated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const downloadFunc = async () => {
  const queryParams = {
    page: page.value,
    status: 'active',
    per_page: perPage.value,
    searchText: debounced.value ? debounced.value : undefined,
    difficulty: difficulty.value ? difficulty.value : undefined,
    games: game.value ? [getIdFromName(game.value, games?.games?.data)] : undefined,
    skills: skill.value ? [getIdFromName(skill.value, skills?.skills?.data)] : undefined,
    filterBy: debounced.value ? searchType.value : undefined,
    segments: segment.value ? [getIdFromName(segment.value, segments?.segments?.data)] : undefined,
    end_date: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    start_date: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    sort_field: sorting.value.column,
    sort_direction: sorting.value.direction,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    queryParams.dateRange = datePreset.value
    queryParams.start_date = dateStart.value
      ? format(new Date(dateStart.value), 'yyyy-MM-dd')
      : undefined
  }

  const query = Object.fromEntries(
    Object.entries(queryParams).filter(([key, value]) => {
      return value != null && !(Array.isArray(value) && value.includes(null))
    }),
  )

  Object.keys(query).forEach((key) => {
    if (Array.isArray(query[key])) {
      query[key] = JSON.stringify(query[key])
    }
  })

  const { data, error } = await useApiFetch('/api/admin/tasks/export', { query })

  if (error.value) {
    throw new Error(error.value?.data?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `tasks_export_${Date()}.csv`)
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

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

const formatSegments = (segments) => {
  return segments
    .filter((segment) => segment.name !== 'All Activities')
    .map((segment, index, array) => {
      if (index !== array.length - 1 && array[index + 1].name !== 'All Activities') {
        return `${segment.name} /`
      }
      return segment.name
    })
    .join(' ')
}

const goToCalendars = () => {
  router.push({ name: 'calendars' })
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

window.addEventListener('download-event', downloadFunc)

onUnmounted(() => {
  window.removeEventListener('download-event', downloadFunc)
})

const difficulties = ref(['Basic', 'Advanced', 'Expert'])

onMounted(() => {
  router.push({
    query: {
      page: undefined,
    },
  })
})
</script>

<template>
  <div>
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div
            class="ptablet:ps-4 ptablet:col-span-6 w-full py-2 pe-2 ps-4 sm:w-auto sm:ps-2 relative"
          >
            <BaseButtonClose
              v-if="filter"
              size="sm"
              rounded="sm"
              color="muted"
              class="close-btn-auto"
              @click="filter = ''"
            />

            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Search"
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-full',
              }"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
            <CustomDropdown
              :options="segmentList"
              placeholder="Select Segment"
              @selected-value="handleSelectedValue(1, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <BaseButtonClose
              v-if="skill.length > 0"
              size="sm"
              rounded="sm"
              color="muted"
              class="close-btn-auto"
              @click="skill = []"
            />

            <BaseAutocomplete v-model="skill" :items="skillList" placeholder="Search Skill" />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <BaseButtonClose
              v-if="game.length > 0"
              size="sm"
              rounded="sm"
              color="muted"
              class="close-btn-auto"
              @click="game = []"
            />

            <BaseAutocomplete v-model="game" :items="gameList" placeholder="Search Game" />
          </div>
        </div>

        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
            <CustomDropdown
              :options="difficulties"
              placeholder="Select Difficulty"
              @selected-value="handleSelectedValue(2, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
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
      <div v-if="!pending && data?.tasks?.data.length === 0">
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
            v-for="(task, index) in data?.tasks?.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Task"
                :hide-label="index > 0"
                :title="task.name"
                :subtitle="formatSegments(task?.segments)"
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
                  {{ task?.games[0]?.name }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Consoles"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
              >
                <div class="flex gap-1">
                  <Icon
                    v-for="(console, index) in task?.games[0]?.game_consoles"
                    :key="index"
                    :name="console.icon"
                    class="text-muted-400 block w-5 h-5"
                  />
                </div>
              </FlexTableCell>

              <FlexTableCell
                label="Difficulty"
                sortingBy="difficulty"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ task.difficulty }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created date"
                sortingBy="created_at"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(task?.created_at).date }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created time"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(task?.created_at).time }}
                </span>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    :to="`/tasks/manage/${task.id}`"
                    title="Manage"
                    text="Manage Task"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="task.status !== 'Active'"
                    title="Approve"
                    text="Approve task"
                    shape="smooth"
                    @click="selectTask(task, 'activate')"
                  />

                  <BaseDropdownItem
                    v-if="task.status !== 'Active'"
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

      <div v-if="data?.tasks?.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="data?.tasks?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

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
      Are you sure you want to deactivate
      <span class="font-bold text-primary-500 dark:text-muted-200"> {{ selectedTask.name }} </span>
      task?
    </BaseModal>

    <BaseModal
      :isOpen="isModalCanNotDeactivateTask"
      :title="'Deactivate Task'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Check Calendar'"
      :primaryButtonAction="goToCalendars"
      :cancelButtonText="'Cancel'"
      @close="isModalCanNotDeactivateTask = false"
    >
      This task cannot be deactivated because it is currently in use within calendars that are
      scheduled for allocation to schools. Please remove this task from the associated calendar and
      try deactivating it again.
    </BaseModal>

    <BaseModal
      :isOpen="isModalActivateTask"
      :title="'Approve Task'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="activateTask"
      :cancelButtonText="'Cancel'"
      @close="isModalActivateTask = false"
    >
      Are you sure you want to approve
      <span class="font-bold text-primary-500 dark:text-muted-200"> {{ selectedTask.name }} </span>
      task?
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
      Do you want to proceed to delete
      <span class="font-bold text-primary-500 dark:text-muted-200"> {{ selectedTask.name }} </span>
      task?
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
      Are you sure you want to duplicate
      <span class="font-bold text-primary-500 dark:text-muted-200"> {{ selectedTask.name }} </span>
      task?
    </BaseModal>
  </div>
</template>
