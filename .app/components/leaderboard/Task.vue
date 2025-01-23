<script setup>
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

let querySchool = route.query.school ? JSON.parse(route.query.school) : undefined

const schoolId = ref('')
const location = ref('')
const calendarMissingText = ref('')

const term = ref({})
const schoolInfo = ref({})
const academyYear = ref({})
const processing = ref(false)
const isCalendarMissing = ref(false)

const terms = ref([])
const locations = ref([])
const schoolsList = ref([])
const leaderBoard = ref([])
const academyYears = ref([])
const topLeaderBoard = ref([])
const selectedSchool = ref(querySchool ? `${querySchool?.school_name}` : '')

schoolsList.value = await getSchoolList()
const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

if (querySchool) {
  selectedSchool.value = querySchool?.school_name
} else {
  selectedSchool.value = schoolsList.value.length > 0 ? schoolsList.value[0]?.school_name : ''
}

const setSchoolParams = async () => {
  schoolInfo.value = await getSchoolDataByName(schoolsList.value, selectedSchool.value)
  schoolId.value = schoolInfo.value.School.id
  locations.value = schoolInfo.value.Location

  const selectedLocation = schoolInfo.value.Location.filter(
    (loc) => loc.id === querySchool?.location?.id,
  )
  location.value = selectedLocation[0]

  const academicPeriod = await useSchoolHistory(
    location.value?.school_history,
    location.value?.academic_year,
  )

  academyYears.value = academicPeriod?.years.value
  terms.value = academicPeriod?.terms.value

  term.value = terms.value.find((t) => t.value === querySchool?.location?.academic_term)
  academyYear.value = academyYears.value.find(
    (y) => y.value === querySchool?.location?.academic_year,
  )
}

const setDefaultSchool = async () => {
  schoolInfo.value = await getSchoolDataByName(schoolsList.value, selectedSchool.value)
  schoolId.value = schoolInfo.value.School.id
  locations.value = schoolInfo.value.Location
  location.value = schoolInfo.value.Location[0]

  const academicPeriod = await useSchoolHistory(
    location.value?.school_history,
    location.value?.academic_year,
  )

  academyYears.value = academicPeriod?.years.value
  terms.value = academicPeriod?.terms.value

  term.value = terms.value.find((t) => t.value === location.value?.academic_term)
  academyYear.value = academyYears.value.find((y) => y.value === location.value?.academic_year)
}

if (querySchool) {
  await setSchoolParams()
} else {
  await setDefaultSchool()
}

onMounted(async () => {
  if (querySchool) {
    window.history.replaceState({}, document.title, '/leaderboard')
  }
})

watch(
  () => selectedSchool.value,
  async (value) => {
    if (value) {
      schoolInfo.value = await getSchoolDataByName(schoolsList.value, value)
      schoolId.value = schoolInfo.value.School.id
      locations.value = schoolInfo.value.Location
      location.value = schoolInfo.value.Location[0]

      const academicPeriod = await useSchoolHistory(
        location.value?.school_history,
        location.value?.academic_year,
      )

      academyYears.value = academicPeriod?.years.value
      terms.value = academicPeriod?.terms.value

      term.value = terms.value.find((t) => t.value === location.value?.academic_term)
      academyYear.value = academyYears.value.find((y) => y.value === location.value?.academic_year)
    } else {
      term.value = ''
      schoolId.value = ''
      location.value = ''
      academyYear.value = ''
      calendarMissingText.value = ''
      locations.value = []
      schoolInfo.value = {}
      processing.value = false
      isCalendarMissing.value = false
    }
  },
)

watch(
  () => location.value,
  async (value) => {
    if (value) {
      schoolId.value = schoolInfo.value.School.id
      locations.value = schoolInfo.value.Location

      const academicPeriod = await useSchoolHistory(
        location.value?.school_history,
        location.value?.academic_year,
      )

      academyYears.value = academicPeriod?.years.value
      terms.value = academicPeriod?.terms.value

      term.value = terms.value.find((t) => t.value === location.value?.academic_term)
      academyYear.value = academyYears.value.find((y) => y.value === location.value?.academic_year)
    } else {
      term.value = ''
      schoolId.value = ''
      location.value = ''
      academyYear.value = ''
      calendarMissingText.value = ''
      locations.value = []
      processing.value = false
      isCalendarMissing.value = false
    }
  },
)

watch(
  () => academyYear.value,
  async (value) => {
    if (value) {
      const academicPeriod = await useSchoolHistory(
        location.value?.school_history,
        academyYear.value?.value,
      )

      terms.value = academicPeriod?.terms.value
      term.value = terms.value[0]
    } else {
      term.value = ''
      schoolId.value = ''
      location.value = ''
      academyYear.value = ''
      calendarMissingText.value = ''
      locations.value = []
      processing.value = false
      isCalendarMissing.value = false
    }
  },
)

const clearData = () => {
  term.value = ''
  schoolId.value = ''
  location.value = ''
  academyYear.value = ''
  calendarMissingText.value = ''
  selectedSchool.value = null
  total.value = 0
  locations.value = []
  leaderBoard.value = []
  topLeaderBoard.value = []
  processing.value = false
  isCalendarMissing.value = false
}

const total = ref(0)
const perPage = ref(20)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school_id: schoolId.value,
    location_id: location.value.id,
    year: academyYear.value?.value,
    term: term.value?.value,
    per_page: perPage.value,
    page: page.value,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const fetchStudents = async () => {
  try {
    const { data, error } = await schoolWriteApi('/api/school-guest/school/leaderboard', {
      query,
      watch: false,
    })

    if (error.value) {
      if (error.value?.data.code) {
        isCalendarMissing.value = true
        calendarMissingText.value = `Currently, there is no calendar allocated to ${
          selectedSchool.value
        } for ${academyYear.value?.text.toLowerCase()} ${term.value?.text.toLowerCase()}.`

        processing.value = false
        leaderBoard.value = []
        topLeaderBoard.value = []

        return
      } else {
        throw new Error(error.value?.data.message)
      }
    }

    topLeaderBoard.value = data.value.top_list
    leaderBoard.value = data.value.data
    total.value = data.value.total
    processing.value = false
  } catch (error) {
    processing.value = false
    leaderBoard.value = []
    topLeaderBoard.value = []
    showErrorToast('Oops!', `${error}`)
  }
}

if (schoolId.value && location.value && academyYear.value && term.value) {
  await fetchStudents()
}

const downloadFunc = async () => {
  const query = {
    school_id: schoolId.value,
    location_id: location.value.id,
    year: academyYear.value?.value,
    term: term.value?.value,
  }

  const { data, error } = await useSchoolReadService('/api/school/leaderboard/export', { query })

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
      `performance_${selectedSchool.value}_${location?.value.location_name}_${
        academyYear.value?.text
      }_${term.value?.text}_export_${Date()}.csv`,
    )
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

watch(query, async () => {
  if (processing.value || !schoolId.value || !location.value || !academyYear.value || !term.value)
    return

  processing.value = true
  setTimeout(async () => {
    await fetchStudents()
  }, 100)
})

watch([selectedSchool, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const viewHistoryPerformance = (student) => {
  const [first_name, last_name] = student.name.split(' ')

  const updatedStudent = {
    id: student.student_id,
    first_name: first_name,
    last_name: last_name,
    school: selectedSchool.value,
    location: {
      ...location.value,
      location_history: location.value?.school_history,
      academic_term: parseInt(term.value?.value, 10),
      academic_year: parseInt(academyYear.value?.value, 10),
    },
  }

  console.log(updatedStudent)

  router.push({
    name: 'student_performance',
    query: {
      student: JSON.stringify(updatedStudent),
    },
  })
}
</script>

<template>
  <div>
    <div class="w-full flex justify-end gap-2 relative">
      <BaseButton
        class="w-full sm:w-32 absolute right-0 top-[-65px]"
        :disabled="topLeaderBoard?.length === 0"
        @click="downloadFunc"
      >
        <Icon name="ph:export-light" class="h-4 w-4" />
        <span>Export</span>
      </BaseButton>
    </div>

    <!-- Filter -->
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div
            class="ptablet:ps-4 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:grow sm:ps-2 flex-2 relative"
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
              placeholder="School Name"
              icon="heroicons:building-library"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-36 relative">
            <BaseListbox
              v-model="location"
              :items="locations"
              :properties="{ value: 'id', label: 'location_name' }"
              placeholder="Location Name"
              :disabled="selectedSchool === null"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto lg:w-20 relative">
            <BaseListbox
              v-model="academyYear"
              :items="academyYears"
              placeholder="Academic Year"
              :properties="{
                value: 'value',
                label: 'text',
              }"
              :disabled="location === ''"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto lg:w-20 relative">
            <BaseListbox
              v-model="term"
              :items="terms"
              placeholder="Academic Term"
              :properties="{
                value: 'value',
                label: 'text',
              }"
              :disabled="academyYear === ''"
            />
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- List -->
    <div>
      <div v-if="topLeaderBoard?.length === 0">
        <ShowSpinner
          v-if="processing"
          :showSpinner="processing"
          label="Processing data..."
          class="mt-20"
        />

        <BasePlaceholderPage v-if="isCalendarMissing" :title="calendarMissingText">
          <template #image>
            <img
              class="block dark:hidden"
              src="/img/placeholders/Admin - No Academic History.png"
              alt="Placeholder image"
            />

            <img
              class="hidden dark:block"
              src="/img/placeholders/Admin - No Academic History.png"
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

      <div v-else class="space-y-2">
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-full"
        >
          <div key="1">
            <!-- Card Start-->
            <div
              class="ltablet:grid-cols-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-16"
            >
              <BaseCard
                v-for="(item, index) in topLeaderBoard"
                shape="rounded"
                elevated-hover
                class="overflow-hidden shadow-md"
              >
                <div class="nui-bg-50 px-3 py-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <BaseHeading
                        tag="h3"
                        size="md"
                        weight="medium"
                        lead="none"
                        class="text-primary-500 dark:text-white"
                      >
                        {{ item?.avg_score ? parseFloat(item?.avg_score).toFixed(2) : 0 }}
                      </BaseHeading>

                      <BaseParagraph size="xs" class="text-muted-500 !text-[0.6rem]">
                        Avg Score
                      </BaseParagraph>
                    </div>

                    <div>
                      <BaseHeading
                        tag="h3"
                        size="md"
                        weight="medium"
                        lead="none"
                        class="text-primary-500 dark:text-white"
                      >
                        {{ item?.tasks_completed }}/{{ item?.total_tasks }}
                      </BaseHeading>

                      <BaseParagraph size="xs" class="text-muted-500 !text-[0.6rem]">
                        Tasks Completed
                      </BaseParagraph>
                    </div>

                    <div>
                      <div
                        class="text-base px-2 rounded-full w-8 h-8 flex items-center justify-center bg-yellow-500"
                      >
                        {{ item?.rank }}
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-2 mt-4">
                    <BaseParagraph size="xs" class="text-muted-500 !text-[0.6rem]">
                      Time taken
                    </BaseParagraph>

                    <BaseHeading
                      tag="h3"
                      size="xs"
                      weight="medium"
                      lead="none"
                      class="text-primary-500 dark:text-white"
                    >
                      {{ item?.time_spent.d }}d {{ item?.time_spent.h }}h {{ item?.time_spent.m }}m
                      {{ item?.time_spent.s }}s
                    </BaseHeading>
                  </div>
                </div>

                <div class="p-6">
                  <div class="mb-3 flex w-full items-center justify-center">
                    <BaseAvatar v-if="item?.avatar" size="xl" :src="item?.avatar" shape="curved" />
                    <div
                      v-else
                      class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 h-20 w-20 p-6 rounded-full object-cover object-center flex items-center justify-center text-4xl nui-weight-bold"
                    >
                      <span>{{ getInitialLettersFromFullName(item?.name) }}</span>
                    </div>
                  </div>

                  <div class="text-center">
                    <BaseHeading tag="h3" size="md" weight="medium" lead="none">
                      {{ item?.name }}
                    </BaseHeading>

                    <BaseParagraph size="xs" class="text-muted-400">
                      {{ item?.index }}
                    </BaseParagraph>
                  </div>

                  <div class="mb-6 mt-4 flex items-center justify-center gap-3">
                    <div>
                      <img src="/img/badges/Badge 1.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ item?.badges_count.platinum ?? 0 }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 2.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ item?.badges_count.gold ?? 0 }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 4.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ item?.badges_count.silver ?? 0 }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 3.png" class="w-6" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ item?.badges_count.bronze ?? 0 }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-center">
                    <BaseButton
                      shape="rounded"
                      size="sm"
                      variant="solid"
                      color="primary"
                      class="!px-6"
                      @click="viewHistoryPerformance(item)"
                    >
                      <span>View</span>
                    </BaseButton>
                  </div>
                </div>
              </BaseCard>
            </div>

            <!-- Card End-->
            <div class="space-y-2">
              <FlexTableRow
                v-for="(item, index) in leaderBoard"
                :key="index"
                shape="rounded"
                spaced
              >
                <template #start>
                  <FlexTableCell
                    label="Rank"
                    :hide-label="index > 0"
                    class="w-full sm:w-14 lg:!justify-start [&>span]:hidden"
                  >
                    <div
                      class="text-base px-2 rounded-full w-8 h-8 flex items-center justify-center bg-primary-50"
                    >
                      {{ item?.rank }}
                    </div>
                  </FlexTableCell>

                  <FlexTableStart
                    label="Student"
                    :hide-label="index > 0"
                    :title="item?.name"
                    :subtitle="item?.index"
                    :initials="getInitialLettersFromFullName(item?.name)"
                    :avatar="item?.avatar"
                  />
                </template>

                <template #end>
                  <FlexTableCell
                    label="Avg Score"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item?.avg_score ? parseFloat(item?.avg_score).toFixed(2) : 0 }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Task Completed"
                    :hide-label="index > 0"
                    class="w-full sm:w-36 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      <BaseTag
                        shape="full"
                        variant="solid"
                        color="primary"
                        class="w-14 text-center"
                      >
                        {{ item?.tasks_completed }}/{{ item?.total_tasks }}
                      </BaseTag>
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Time Taken"
                    :hide-label="index > 0"
                    class="w-full sm:w-44 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item?.time_spent.d }}d {{ item?.time_spent.h }}h {{ item?.time_spent.m }}m
                      {{ item?.time_spent.s }}s
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Badges Earned"
                    :hide-label="index > 0"
                    class="w-full sm:w-44 lg:!justify-start"
                  >
                    <div class="mb-6 mt-4 flex items-center justify-center gap-3">
                      <div>
                        <img src="/img/badges/Badge 1.png" class="w-6" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ item?.badges_count.platinum ?? 0 }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 2.png" class="w-6" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ item?.badges_count.gold ?? 0 }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 4.png" class="w-6" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ item?.badges_count.silver ?? 0 }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 3.png" class="w-6" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ item?.badges_count.bronze ?? 0 }}
                        </div>
                      </div>
                    </div>
                  </FlexTableCell>

                  <FlexTableCell :hide-label="index > 0" class="w-full sm:w-24 lg:!justify-start">
                    <BaseButtonAction color="muted" @click="viewHistoryPerformance(item)">
                      <span>View</span>
                    </BaseButtonAction>
                  </FlexTableCell>
                </template>
              </FlexTableRow>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div v-if="leaderBoard && leaderBoard?.length !== 0" class="mt-4">
        <BasePagination
          :total-items="total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>
  </div>
</template>
