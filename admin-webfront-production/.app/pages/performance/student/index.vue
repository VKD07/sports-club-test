<script setup>
definePageMeta({
  name: 'student_performance',
  title: 'Student Performance',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

let queryStudent = route.query.student ? JSON.parse(route.query.student) : undefined
let querySchool = route.query.school ? JSON.parse(route.query.school) : undefined

if (queryStudent) {
  localStorage.setItem('queryStudent', JSON.stringify(queryStudent))
}

const processing = ref(false)
const isCalendarMissing = ref(false)

const selectedSchool = ref('')
const selectedStudent = ref('')
const calendarMissingText = ref('')

const term = ref(null)
const schoolInfo = ref(null)
const academyYear = ref(null)
const selectedLocation = ref(null)
const selectedStudentId = ref(null)
const studentPerformance = ref(null)

const terms = ref([])
const locations = ref([])
const studentList = ref([])
const schoolsList = ref([])
const academyYears = ref([])

schoolsList.value = await getSchoolList()
if (queryStudent) {
  selectedStudentId.value = queryStudent?.id
  selectedSchool.value = queryStudent?.school
  selectedStudent.value = `${queryStudent?.first_name} ${queryStudent?.last_name}`
} else {
  if (querySchool) {
    selectedSchool.value = querySchool?.school_name
  } else {
    selectedSchool.value = schoolsList.value.length > 0 ? schoolsList.value[0]?.school_name : ''
  }
}

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

const setDefaultSchool = async () => {
  schoolInfo.value = await getSchoolDataByName(schoolsList.value, selectedSchool.value)
  locations.value = schoolInfo.value?.Location

  if (queryStudent) {
    selectedLocation.value = queryStudent?.location
  } else {
    if (querySchool) {
      selectedLocation.value = querySchool?.location
    } else {
      selectedLocation.value = schoolInfo.value?.Location[0]
    }
  }
}

onMounted(async () => {
  if (route.query.student || route.query.school) {
    window.history.replaceState({}, document.title, '/performance/student')
  }

  await setDefaultSchool()
})

const fetchStudents = async () => {
  try {
    const query = {
      school_id: schoolInfo.value?.School.id,
      location_ids: `["${selectedLocation.value?.id}"]`,
      year: academyYear.value?.value,
      term: term.value?.value,
    }

    const { data, error } = await schoolWriteApi('/api/school-guest/school/academy-students', {
      query,
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    studentList.value = data.value?.students
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const clearData = () => {
  selectedSchool.value = ''
  selectedStudent.value = ''
  calendarMissingText.value = ''
  processing.value = false
  isCalendarMissing.value = false
  term.value = null
  schoolInfo.value = null
  academyYear.value = null
  selectedLocation.value = null
  studentPerformance.value = {}
  locations.value = []
  studentList.value = []
  studentPerformance.value.data = []
}

watch(
  () => selectedSchool.value,
  async (value) => {
    if (value) {
      queryStudent = undefined
      querySchool = undefined
      selectedStudent.value = ''

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
      if (selectedLocation.value?.school_history || selectedLocation.value?.location_history) {
        let academicPeriod = {}
        if (queryStudent) {
          academicPeriod = await useSchoolHistory(
            selectedLocation.value?.location_history,
            selectedLocation.value?.academic_year,
          )
        } else {
          academicPeriod = await useSchoolHistory(
            selectedLocation.value?.school_history,
            selectedLocation.value?.academic_year,
          )
        }

        academyYears.value = academicPeriod?.years.value
        terms.value = academicPeriod?.terms.value

        term.value = terms.value.find((t) => t.value === selectedLocation.value?.academic_term)
        academyYear.value = academyYears.value.find(
          (y) => y.value === selectedLocation.value?.academic_year,
        )

        await fetchStudents()
      } else {
        isCalendarMissing.value = true
        calendarMissingText.value = `Currently, there is no calendar allocated to ${selectedSchool.value}.`

        studentPerformance.value = {}
        studentPerformance.value.data = []

        showErrorToast(
          'Oops!',
          'It seems that the school doesn’t have an academic year or term defined.',
        )
      }
    } else {
      term.value = null
      academyYear.value = null
      locations.value = []
      studentList.value = []
      schoolInfo.value = null
      calendarMissingText.value = ''
      processing.value = false
      isCalendarMissing.value = false
      selectedLocation.value = null
      studentPerformance.value = {}
      studentPerformance.value.data = []
    }
  },
)

watch(
  () => academyYear.value,
  async (value) => {
    if (value) {
      if (selectedLocation.value?.school_history || selectedLocation.value?.location_history) {
        let academicPeriod = {}
        if (queryStudent) {
          academicPeriod = await useSchoolHistory(
            selectedLocation.value?.location_history,
            academyYear.value?.value,
          )
        } else {
          academicPeriod = await useSchoolHistory(
            selectedLocation.value?.school_history,
            academyYear.value?.value,
          )
        }

        academyYears.value = academicPeriod?.years.value
        terms.value = academicPeriod?.terms.value

        term.value =
          terms.value.find((t) => t.value === selectedLocation.value?.academic_term) ||
          terms.value[0]
      }
    } else {
      term.value = null
      academyYear.value = null
      locations.value = []
      studentList.value = []
      schoolInfo.value = null
      calendarMissingText.value = ''
      processing.value = false
      isCalendarMissing.value = false
      selectedLocation.value = null
      studentPerformance.value = {}
      studentPerformance.value.data = []
    }
  },
)

const studentNames = computed(() => studentList.value.map((student) => student.name))

const sorting = ref({
  column: 'total_tasks_completed',
  direction: 'asc',
})

const getStudentNameFromId = (id) => {
  const obj = studentList.value?.find((item) => item?.id == id)
  return obj ? obj?.name : null
}

const perPage = ref(50)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school_id: schoolInfo.value?.School?.id,
    location_ids: `["${selectedLocation.value?.id}"]`,
    student_id: selectedStudentId.value,
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

const fetchStudentPerformance = async () => {
  try {
    processing.value = true

    const { data, error } = await schoolWriteApi(
      '/api/school-guest/school/academy-student-performance',
      {
        query,
        watch: false,
      },
    )

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    processing.value = false
    studentPerformance.value = data.value
  } catch (error) {
    processing.value = false
    showErrorToast('Oops!', `${error}`)
  }
}

const downloadFunc = async () => {
  const query = {
    school_id: schoolInfo.value?.School.id,
    location_ids: `["${selectedLocation.value?.id}"]`,
    year: academyYear.value?.value,
    term: term.value?.value,
  }

  const { data, error } = await useSchoolReadService(
    '/api/school/academy-student-performance/export',
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
      `students_performance_${schoolInfo.value.School.school_name}_${
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

const selectStudent = (student) => {
  const obj = {
    ...student,
    school_id: schoolInfo.value?.School?.id,
    location_ids: selectedLocation.value?.id,
    school_name: schoolInfo.value?.School?.school_name,
    location_name: selectedLocation.value?.location_name,
    year: academyYear.value?.value,
    term: term.value?.value,
    year_text: academyYear.value?.text,
    term_text: term.value?.text,
  }
  localStorage.setItem('selectStudent', JSON.stringify(obj))

  router.push({
    path: `/performance/student/${obj?.student_id}`,
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

  await fetchStudentPerformance()
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
        await fetchStudentPerformance()
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

watch(selectedStudentId, async (value) => {
  selectedStudent.value = await getStudentNameFromId(value)
  await fetchStudentPerformance()
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
          Academic Results of all students
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          View student results for each school, categorized by academic year and term.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton
          class="w-full sm:w-32"
          :disabled="
            !studentPerformance || (studentPerformance.data && studentPerformance.data.length === 0)
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

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-28 relative">
              <BaseListbox
                v-model="selectedLocation"
                placeholder="Select Location"
                :items="locations"
                :properties="{ value: 'id', label: 'location_name' }"
                :disabled="selectedSchool === ''"
              />
            </div>
          </div>

          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div
              class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-1/4 relative"
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

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:ps-2 sm:basis-1/4 relative">
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

            <!-- <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:basis-2/4 relative">
              <BaseButtonClose
                v-if="selectedStudent"
                size="sm"
                rounded="sm"
                color="muted"
                class="close-btn-auto"
                @click="selectedStudent = ''"
              />
              <BaseAutocomplete
                v-model="selectedStudent"
                :items="studentList.map((student) => student.name)"
                autocomplete="off"
                placeholder="Search Student"
                icon="ph:student"
              />
            </div> -->

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:basis-2/4">
              <CustomSelect
                :disabled="!(studentList && studentList.length)"
                :options="studentList"
                :name="selectedStudent"
                v-model="selectedStudentId"
                placeholder="Select a student"
                icon="ph:student"
              />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- List -->
      <div>
        <div v-if="studentPerformance?.data?.length === 0">
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
              v-for="(item, index) in studentPerformance?.data"
              :key="index"
              shape="rounded"
              spaced
            >
              <template #start>
                <FlexTableStart
                  label="Student"
                  :hide-label="index > 0"
                  :title="item?.student_name"
                  :subtitle="item?.location_name"
                  :avatar="item?.avatar"
                  :initials="getInitialLettersFromFullName(item.student_name)"
                />
              </template>

              <template #end>
                <FlexTableCell
                  label="Tasks Participated"
                  sortingBy="total_tasks_participated"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-40 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    <BaseTag shape="full" variant="solid" color="primary" class="w-14 text-center">
                      {{ item?.total_tasks_participated ?? '0' }}
                    </BaseTag>
                  </span>
                </FlexTableCell>

                <FlexTableCell
                  label="Tasks Completed"
                  sortingBy="total_tasks_completed"
                  :sort="true"
                  :hide-label="index > 0"
                  class="w-full sm:w-40 lg:!justify-start"
                  @sort-column="columnSort"
                >
                  <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                    <BaseTag shape="full" variant="solid" color="primary" class="w-14 text-center">
                      {{ item?.total_tasks_completed ?? '0' }}
                    </BaseTag>
                  </span>
                </FlexTableCell>

                <FlexTableCell
                  label="Avg Time Taken"
                  sortingBy="avg_time_spent"
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
                    {{ item?.satisfaction_ratio ?? '0' }}%
                  </span>
                </FlexTableCell>

                <FlexTableCell label="action" :hide-label="index > 0">
                  <BaseButtonAction color="primary" @click="selectStudent(item)">
                    <span>View</span>
                  </BaseButtonAction>
                </FlexTableCell>
              </template>
            </FlexTableRow>
          </TransitionGroup>
        </div>

        <div v-if="studentPerformance && studentPerformance?.data?.length !== 0" class="mt-4">
          <BasePagination
            :total-items="studentPerformance?.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </div>
  </TairoContentWrapper>
</template>
