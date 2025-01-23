<script setup>
definePageMeta({
  name: 'task_performance',
  title: 'Task Performance',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const processing = ref(false)
const isCalendarMissing = ref(false)

const selectedTask = ref('')
const selectedSchool = ref('')
const calendarMissingText = ref('')

const term = ref(null)
const queryTask = ref(null)
const schoolInfo = ref(null)
const academyYear = ref(null)
const selectedTaskId = ref(null)
const taskPerformance = ref(null)
const selectedLocation = ref(null)

const terms = ref([])
const locations = ref([])
const tasksList = ref([])
const schoolsList = ref([])
const academyYears = ref([])

schoolsList.value = await getSchoolList()
selectedSchool.value = schoolsList.value.length > 0 ? schoolsList.value[0]?.school_name : ''

if (route.query.task) {
  queryTask.value = JSON.parse(route.query.task)
  selectedSchool.value = queryTask.value?.school_name

  window.history.replaceState({}, document.title, '/performance/task')
} else {
  selectedSchool.value = schoolsList.value.length > 0 ? schoolsList.value[0]?.school_name : ''
}

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

const setDefaultSchool = async () => {
  schoolInfo.value = await getSchoolDataByName(schoolsList.value, selectedSchool.value)
  locations.value = schoolInfo.value?.Location

  if (queryTask.value) {
    selectedLocation.value = locations.value.filter((l) => l.id === queryTask.value?.location_id)[0]
  } else {
    selectedLocation.value = schoolInfo.value?.Location[0]
  }
}

onMounted(async () => {
  if (route.query.school) {
    if (route.query.location) {
      selectedLocation.value = route.query.location
    }

    window.history.replaceState({}, document.title, '/performance/task')
  }

  await setDefaultSchool()
})

const fetchTasks = async () => {
  try {
    const query = {
      school_id: schoolInfo.value?.School.id,
      location_ids: `["${selectedLocation.value?.id}"]`,
      year: academyYear.value?.value,
      term: term.value?.value,
    }

    const { data, error } = await schoolWriteApi('/api/school-guest/school/tasks', {
      query,
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    tasksList.value = data.value.map((task) => ({
      id: task.task_id,
      name: task.name,
    }))
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const clearData = () => {
  selectedTask.value = ''
  selectedSchool.value = ''
  calendarMissingText.value = ''
  processing.value = false
  isCalendarMissing.value = false
  term.value = null
  schoolInfo.value = null
  academyYear.value = null
  selectedLocation.value = null
  taskPerformance.value = {}
  locations.value = []
  tasksList.value = []
  taskPerformance.value.data = []
}

watch(
  () => selectedSchool.value,
  async (value) => {
    if (value) {
      schoolInfo.value = await getSchoolDataByName(schoolsList.value, selectedSchool.value)
      locations.value = schoolInfo.value?.Location
      selectedLocation.value = schoolInfo.value?.Location[0]
    } else {
      clearData()
    }
  },
)

watch(
  () => selectedLocation.value,
  async (value) => {
    if (value) {
      if (selectedLocation.value?.school_history) {
        let academicPeriod = {}

        if (queryTask.value) {
          academicPeriod = await useSchoolHistory(
            selectedLocation.value?.school_history,
            queryTask.value?.year,
          )
        } else {
          academicPeriod = await useSchoolHistory(
            selectedLocation.value?.school_history,
            selectedLocation.value?.academic_year,
          )
        }

        academyYears.value = academicPeriod?.years.value
        terms.value = academicPeriod?.terms.value

        if (queryTask.value) {
          term.value = terms.value.find((t) => t.value === queryTask.value?.term)
          academyYear.value = academyYears.value.find((y) => y.value === queryTask.value?.year)
        } else {
          term.value = terms.value.find((t) => t.value === selectedLocation.value?.academic_term)
          academyYear.value = academyYears.value.find(
            (y) => y.value === selectedLocation.value?.academic_year,
          )
        }

        await fetchTasks()
      } else {
        isCalendarMissing.value = true
        calendarMissingText.value = `Currently, there is no calendar allocated to ${selectedSchool.value}.`

        taskPerformance.value = {}
        taskPerformance.value.data = []

        showErrorToast(
          'Oops!',
          'It seems that the school doesn’t have an academic year or term defined.',
        )
      }
    } else {
      term.value = null
      academyYear.value = null
      locations.value = []
      tasksList.value = []
      schoolInfo.value = null
      calendarMissingText.value = ''
      processing.value = false
      isCalendarMissing.value = false
      selectedLocation.value = null
      taskPerformance.value = {}
      taskPerformance.value.data = []
    }
  },
)

watch(
  () => academyYear.value,
  async (value) => {
    if (value) {
      const academicPeriod = await useSchoolHistory(
        selectedLocation.value?.school_history,
        academyYear.value?.value,
      )

      terms.value = academicPeriod?.terms.value
      term.value = terms.value[0]
    } else {
      term.value = null
      academyYear.value = null
      locations.value = []
      tasksList.value = []
      schoolInfo.value = null
      calendarMissingText.value = ''
      processing.value = false
      isCalendarMissing.value = false
      selectedLocation.value = null
      taskPerformance.value = {}
      taskPerformance.value.data = []
    }
  },
)

const taskNames = computed(() => tasksList.value.map((task) => task.name))

const sorting = ref({
  column: 'task_name',
  direction: 'asc',
})

const getIdFromName = (name, objsArr, key) => {
  const obj = objsArr?.find((item) => item?.[key] === name)
  return obj ? obj?.id : null
}

const getNameFromId = (id) => {
  const obj = tasksList.value?.find((item) => item?.task_id == id)
  return obj ? obj?.name : null
}

const perPage = ref(20)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school_id: schoolInfo.value?.School?.id,
    location_ids: `["${selectedLocation.value?.id}"]`,
    task_id: selectedTaskId.value,
    year: academyYear.value?.value,
    term: term.value?.value,
    per_page: perPage.value,
    page: page.value,
    sort_field: sorting.value.column,
    sort_direction: sorting.value.direction,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const fetchTaskPerformance = async () => {
  try {
    processing.value = true

    const { data, error } = await schoolWriteApi(
      '/api/school-guest/school/academy-task-performances',
      {
        query,
        watch: false,
      },
    )

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    processing.value = false
    taskPerformance.value = data.value
  } catch (error) {
    processing.value = false
    showErrorToast('Oops!', `${error}`)
  }
}

const downloadFunc = async () => {
  const query = {
    school_id: schoolInfo.value?.School.id,
    location_ids: `["${selectedLocation.value?.id}"]`,
    task_id: selectedTaskId.value,
    year: academyYear.value?.value,
    term: term.value?.value,
  }

  const { data, error } = await useSchoolReadService(
    '/api/school/academy-task-performances/export',
    { query },
  )

  if (error.value) {
    throw new Error(error.value?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `Task_performance_${schoolInfo.value.School.school_name}_${
        selectedLocation.value.location_name
      }_${academyYear.value?.text}_${term.value?.text}_export_${Date()}.csv`,
    )
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

const selectTask = (task) => {
  const obj = {
    ...task,
    school_id: schoolInfo.value?.School?.id,
    location_id: selectedLocation.value?.id,
    school_name: schoolInfo.value?.School?.school_name,
    location_name: selectedLocation.value?.location_name,
    year: academyYear.value?.value,
    term: term.value?.value,
    year_text: academyYear.value?.text,
    term_text: term.value?.text,
  }
  localStorage.setItem('selectTask', JSON.stringify(obj))

  router.push({
    path: `/performance/task/${obj?.id}`,
  })
}

watch([page], async () => {
  if (
    processing.value ||
    !schoolInfo.value?.School?.id ||
    !selectedLocation.value?.id ||
    !academyYear.value?.value ||
    !term.value?.value
  )
    return

  await fetchTaskPerformance()
})

watch([academyYear, term, sorting], async () => {
  if (page.value === 1) {
    if (
      schoolInfo.value?.School?.id &&
      selectedLocation.value?.id &&
      academyYear.value?.value &&
      term.value?.value
    ) {
      setTimeout(async () => {
        await fetchTaskPerformance()
      }, 100)
    }
  } else {
    router.push({
      query: {
        page: undefined,
      },
    })
  }
})

watch(selectedTaskId, async (value) => {
  selectedTask.value = await getNameFromId(value)
  await fetchTaskPerformance()
})
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
          Student Efforts on Tasks
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Review each student's performance on individual tasks to track progress.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton
          class="w-full sm:w-32"
          :disabled="
            !taskPerformance || (taskPerformance.data && taskPerformance.data.length === 0)
          "
          @click="downloadFunc"
        >
          <Icon name="ph:export-light" class="h-4 w-4" />
          <span>Export</span>
        </BaseButton>
      </div>
    </div>

    <div class="pb-4">
      <!-- Filter -->
      <div class="relative">
        <BaseCard class="ptablet:py-8 ptablet:px-4 mb-6 py-4 px-4">
          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div
              class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:grow sm:ps-2 flex-2 relative"
            >
              <BaseButtonClose
                v-if="selectedSchool"
                size="sm"
                rounded="sm"
                color="muted"
                class="close-btn-auto"
                @click="clearData"
              />
              <BaseAutocomplete
                v-model="selectedSchool"
                :items="schoolNames"
                autocomplete="off"
                placeholder="Search School"
                icon="heroicons:building-library"
              />
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-40 relative">
              <BaseListbox
                v-model="selectedLocation"
                placeholder="Select Location"
                :items="locations"
                :properties="{ value: 'id', label: 'location_name' }"
                :disabled="selectedSchool === ''"
              />
            </div>

            <div
              class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-16 relative"
            >
              <BaseListbox
                v-model="academyYear"
                placeholder="Select Year"
                :items="academyYears"
                :disabled="selectedLocation === null"
                :properties="{
                  value: 'value',
                  label: 'text',
                }"
              />
            </div>
          </div>

          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:ps-2 sm:basis-1/5 relative">
              <BaseListbox
                v-model="term"
                placeholder="Select Term"
                :items="terms"
                :disabled="academyYear === null"
                :properties="{
                  value: 'value',
                  label: 'text',
                }"
              />
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:basis-4/5 relative">
              <!-- <BaseButtonClose
                v-if="selectedTask"
                size="sm"
                rounded="sm"
                color="muted"
                class="close-btn-auto"
                @click="clearData"
              />
              <BaseAutocomplete
                v-model="selectedTask"
                :items="taskNames"
                autocomplete="off"
                placeholder="Search Task"
                icon="heroicons:building-library"
              /> -->

              <CustomSelect
                :disabled="!(tasksList && tasksList.length)"
                :options="tasksList"
                :name="selectedTask"
                v-model="selectedTaskId"
                placeholder="Search Task"
                icon="heroicons:building-library"
              />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- List -->
      <div>
        <div v-if="taskPerformance?.data?.length === 0">
          <ShowSpinner
            v-if="processing"
            :showSpinner="processing"
            label="Processing data..."
            class="mt-20"
          />

          <BasePlaceholderPage
            v-if="isCalendarMissing"
            title="No calendar allocated to a school"
            :subtitle="calendarMissingText"
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

          <BasePlaceholderPage
            v-else
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
              v-for="(item, index) in taskPerformance?.data"
              :key="index"
              shape="rounded"
              spaced
            >
              <template #start>
                <FlexTableStart
                  label="Task"
                  sortingBy="task_name"
                  :sort="true"
                  :hide-label="index > 0"
                  :title="item.task_name"
                  :subtitle="item.game"
                  :picture="getImageUrl(item.task_thumbnail)"
                  :initials="getInitialLettersFromFullName(item.task_name)"
                  @sort-column="columnSort"
                />
              </template>

              <template #end>
                <FlexTableCell
                  label="T-Participation"
                  sortingBy="total_tasks_performed"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-36 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    <BaseTag shape="full" variant="solid" color="primary" class="w-14 text-center">
                      {{ item?.total_tasks_performed ?? '0' }}
                    </BaseTag>
                  </span>
                </FlexTableCell>

                <FlexTableCell
                  label="T-Completed"
                  sortingBy="total_tasks_completed"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-36 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    <BaseTag shape="full" variant="solid" color="success" class="w-14 text-center">
                      {{ item?.total_tasks_completed ?? '0' }}
                    </BaseTag>
                  </span>
                </FlexTableCell>

                <FlexTableCell
                  label="Avg Time Taken"
                  sortingBy="avg_time"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-36 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    <span v-if="item?.avg_time_spent.d">{{ item?.avg_time_spent.d }}d</span>
                    {{ item?.avg_time_spent.h }}h {{ item?.avg_time_spent.m }}m
                  </span>
                </FlexTableCell>

                <FlexTableCell
                  label="Avg Score"
                  sortingBy="avg_score"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-28 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    {{ item?.avg_score ? parseFloat(item?.avg_score).toFixed(2) : 0 }}
                  </span>
                </FlexTableCell>

                <FlexTableCell
                  label="Feedback Ratio "
                  sortingBy="satisfaction_ratio"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-36 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    <div class="flex items-end gap-2">
                      <span class="leading-none"> {{ item.satisfaction_ratio ?? '0.00' }}% </span>

                      <Icon
                        name="bi:hand-thumbs-up"
                        class="text-success-500 h-5 w-5"
                        v-if="item.satisfaction_ratio > 49"
                      />

                      <Icon
                        name="bi:hand-thumbs-down"
                        class="text-danger-500 h-5 w-5"
                        v-else-if="item.satisfaction_ratio < 50"
                      />
                    </div>
                  </span>
                </FlexTableCell>

                <FlexTableCell label="action" :hide-label="index > 0">
                  <BaseButtonAction color="primary" @click="selectTask(item)">
                    <span>View</span>
                  </BaseButtonAction>
                </FlexTableCell>
              </template>
            </FlexTableRow>
          </TransitionGroup>
        </div>

        <div v-if="taskPerformance && taskPerformance?.data?.length !== 0" class="mt-4">
          <BasePagination
            :total-items="taskPerformance?.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </div>
  </TairoContentWrapper>
</template>
