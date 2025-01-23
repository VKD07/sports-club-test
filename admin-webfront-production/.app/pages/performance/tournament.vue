<script setup lang="ts">
definePageMeta({
  title: 'Tournament Performance',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const segmentName = 'Performance'
const pageName = 'Tournament Performance'
const { _delete, _export, create, update, view, approve } = await usePermissionChecker(
  segmentName,
  pageName,
)

watchEffect(() => {
  if (!view && auth.isLoggedIn) {
    showErrorToast('Oops!', "Sorry, You don't have View permission for this page! ")
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }
})

const schoolFilter = ref([])
const locationRef = ref<any>(null)
const location = ref([])
const academyYear = ref('')
const term = ref('')
const tournament = ref('')
const studentFilter = ref([])

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    academyYear.value = value
  } else if (dropdownId === 2) {
    term.value = value
  } else if (dropdownId === 3) {
    tournament.value = value
  }
}

const schoolsList = ref<AllSchool[]>([])
schoolsList.value = await getSchoolList()

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))
const locations = ref<string[]>([])

watch(
  () => schoolFilter.value,
  async (value) => {
    if (value.length !== 0) {
      locations.value = await getSchoolLocationsByName(schoolsList.value, value)
    }
  },
)

const perPage = ref(15)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const activeGenerate = computed(() => {
  return (
    schoolFilter.value.length !== 0 &&
    location.value.length !== 0 &&
    academyYear.value !== '' &&
    term.value !== '' &&
    tournament.value !== ''
  )
})

const isPending = ref(false)
const performanceList = ref([
  {
    id: 0,
    src: '/img/avatars/2.svg',
    studentName: 'Alice Smith',
    location: 'New York, USA',
    participated: 'Yes',
    timeTaken: '5h 30m',
    avgScore: 85,
  },
])

const fetchTaskPerformance = async () => {
  try {
    const query = {
      school: schoolFilter.value,
      location: [location.value],
      academyYear: academyYear.value,
      term: term.value,
      tournament: tournament.value,
      student: studentFilter.value,
      perPage: perPage.value,
      page: page.value,
    }

    const { data, pending, error, refresh } = await useApiFetch<any>(
      '/api/admin/tournament-performance',
      { query, watch: false },
    )
    performanceList.value = data.value
    isPending.value = pending.value

    if (error.value) {
      showErrorToast('Oops!', 'Something went wrong, please try again!')
    }
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const statusColor = (itemStatus: string) => {
  switch (itemStatus) {
    case 'Active':
      return 'success'
    case 'Inactive':
      return 'warning'
    case 'Draft':
      return 'danger'
    default:
      break
  }
}

watch(schoolFilter, () => {
  location.value = []
})

const completionColor = (itemCompletion: string) => {
  switch (itemCompletion) {
    case 'Completed':
      return 'success'
    case 'Incomplete':
      return 'warning'
    default:
      break
  }
}

const academyYears = ['1st Year', '2nd Year', '3rd Year']
const terms = ['1st Term', '2nd Term', '3rd Term']
const tournaments = ['Tournament 1', 'Tournament 2', 'Tournament 3']
const students = ['Student 1', 'Student 2', 'Student 3']
const studentPerformance = [
  {
    id: 0,
    src: '/img/avatars/2.svg',
    studentName: 'Alice Smith',
    location: 'New York, USA',
    participated: 'Yes',
    timeTaken: '5h 30m',
    avgScore: 85,
  },
  {
    id: 1,
    src: '/img/avatars/4.svg',
    studentName: 'Bob Johnson',
    location: 'Los Angeles, USA',
    participated: 'No',
    timeTaken: '4h 15m',
    avgScore: 78,
  },
  {
    id: 2,
    src: '/img/avatars/6.svg',
    studentName: 'Charlie Wilson',
    location: 'London, UK',
    participated: 'Yes',
    timeTaken: '6h 45m',
    avgScore: 92,
  },
  {
    id: 3,
    src: '/img/avatars/8.svg',
    studentName: 'David Thompson',
    location: 'Sydney, Australia',
    participated: 'No',
    timeTaken: '3h 50m',
    avgScore: 80,
  },
  {
    id: 4,
    src: '/img/avatars/10.svg',
    studentName: 'Emily Brown',
    location: 'Toronto, Canada',
    participated: 'Yes',
    timeTaken: '7h 20m',
    avgScore: 88,
  },
  {
    id: 5,
    src: '/img/avatars/12.svg',
    studentName: 'Fiona Garcia',
    location: 'Berlin, Germany',
    participated: 'No',
    timeTaken: '3h 10m',
    avgScore: 75,
  },
  {
    id: 6,
    src: '/img/avatars/14.svg',
    studentName: 'George Harris',
    location: 'Paris, France',
    participated: 'Yes',
    timeTaken: '8h 05m',
    avgScore: 90,
  },
  {
    id: 7,
    src: '/img/avatars/16.svg',
    studentName: 'Hannah Martinez',
    location: 'Madrid, Spain',
    participated: 'No',
    timeTaken: '2h 40m',
    avgScore: 70,
  },
  {
    id: 8,
    src: '/img/avatars/18.svg',
    studentName: 'Ian Taylor',
    location: 'Rome, Italy',
    participated: 'Yes',
    timeTaken: '4h 55m',
    avgScore: 83,
  },
  {
    id: 9,
    src: '/img/avatars/20.svg',
    studentName: 'Jessica Lopez',
    location: 'Tokyo, Japan',
    participated: 'No',
    timeTaken: '4h 30m',
    avgScore: 82,
  },
]
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
          All Students Performance
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Customize user access and permissions for each segment
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton v-if="_export" class="w-full sm:w-32"
          ><Icon name="ph:export-light" class="h-4 w-4" /> <span>Export</span></BaseButton
        >
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
                placeholder="Search school"
                icon="heroicons:building-library"
              />
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-28 relative">
              <BaseButtonClose
                v-if="location.length !== 0"
                size="sm"
                rounded="sm"
                color="muted"
                class="absolute z-[9] w-[25px] h-[25px] p-[6px] right-[55px] top-[15px]"
                @click="location = []"
              />
              <BaseListbox
                v-model="location"
                :items="locations"
                :disabled="schoolFilter.length === 0"
                multiple
              />
            </div>

            <div
              class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-28 relative"
            >
              <CustomDropdown
                :options="academyYears"
                placeholder="Select academy year"
                @selected-value="handleSelectedValue(1, $event)"
              />
            </div>
          </div>

          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:ps-2 sm:basis-1/5 relative">
              <CustomDropdown
                :options="terms"
                placeholder="Select term"
                @selected-value="handleSelectedValue(2, $event)"
              />
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:basis-2/5 relative">
              <CustomDropdown
                :options="tournaments"
                placeholder="Select tournament"
                @selected-value="handleSelectedValue(3, $event)"
              />
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:basis-2/5 relative">
              <BaseButtonClose
                v-if="studentFilter.length > 0"
                size="sm"
                rounded="sm"
                color="muted"
                class="close-btn-auto"
                @click="studentFilter = []"
              />
              <BaseAutocomplete
                v-model="studentFilter"
                :items="students"
                placeholder="Search student"
              />
            </div>

            <div class="ptablet:col-span-6 w-full px-2 py-2 sm:w-auto sm:pe-2">
              <BaseButton
                color="primary"
                class="w-full sm:w-32"
                :disabled="!activeGenerate"
                @click="fetchTaskPerformance"
              >
                <span>Generate</span>
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>

      <div>
        <div v-if="!isPending && performanceList?.length === 0">
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

        <div v-else class="space-y-2">
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <div key="1" class="performance-table">
              <TairoFlexTable>
                <template #header>
                  <TairoFlexTableHeading type="grow" class="text-muted-700 dark:text-muted-400">
                    Student
                  </TairoFlexTableHeading>

                  <TairoFlexTableHeading
                    type="stable"
                    class="w-full sm:!w-48 lg:!justify-start text-muted-700 dark:text-muted-400"
                  >
                    School / Location
                  </TairoFlexTableHeading>

                  <TairoFlexTableHeading
                    type="stable"
                    class="w-full sm:!w-36 lg:!justify-start text-muted-700 dark:text-muted-400"
                  >
                    Participation
                  </TairoFlexTableHeading>

                  <TairoFlexTableHeading
                    type="stable"
                    class="w-full sm:!w-40 lg:!justify-start text-muted-700 dark:text-muted-400"
                  >
                    Time Taken
                  </TairoFlexTableHeading>

                  <TairoFlexTableHeading
                    type="stable"
                    class="w-full sm:!w-28 lg:!justify-start text-muted-700 dark:text-muted-400"
                  >
                    Avg Score
                  </TairoFlexTableHeading>

                  <TairoFlexTableHeading
                    type="stable"
                    class="w-full sm:!w-32 lg:!justify-start text-muted-700 dark:text-muted-400"
                  >
                    Completion
                  </TairoFlexTableHeading>

                  <TairoFlexTableHeading
                    type="stable"
                    class="w-full sm:!w-28 lg:!justify-start text-muted-700 dark:text-muted-400"
                  >
                    Action
                  </TairoFlexTableHeading>
                </template>

                <TairoFlexTableRow
                  v-for="item in studentPerformance"
                  :key="item.id"
                  rounded="md"
                  class="hover:!border-primary-200 transition-border ease-in-out duration-300 !rounded-md"
                >
                  <TairoFlexTableCell type="grow" data-content="Student">
                    <div class="flex items-center">
                      <BaseAvatar :src="item.src" size="md" />

                      <div class="ms-3 leading-none">
                        <h4 class="font-sans text-sm font-medium">
                          {{ item.studentName }}
                        </h4>

                        <p class="text-muted-400 font-sans text-xs font-normal">
                          {{ item.location }}
                        </p>
                      </div>
                    </div>
                  </TairoFlexTableCell>

                  <TairoFlexTableCell
                    type="stable"
                    data-content="Participated"
                    class="w-full sm:!w-48 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item.location }}
                    </span>
                  </TairoFlexTableCell>

                  <TairoFlexTableCell
                    type="stable"
                    data-content="Participated"
                    class="w-full sm:!w-36 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item.participated }}
                    </span>
                  </TairoFlexTableCell>

                  <TairoFlexTableCell
                    type="stable"
                    data-content="Time Taken"
                    class="w-full sm:!w-40 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item.timeTaken }}
                    </span>
                  </TairoFlexTableCell>

                  <TairoFlexTableCell
                    type="stable"
                    data-content="Avg Score"
                    class="w-full sm:!w-28 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item.avgScore }}%
                    </span>
                  </TairoFlexTableCell>

                  <TairoFlexTableCell
                    type="stable"
                    data-content="Action"
                    class="w-full sm:!w-28 lg:!justify-start"
                  >
                    <BaseButtonAction color="muted" to="/performance/tournament-view">
                      <span>View</span>
                    </BaseButtonAction>
                  </TairoFlexTableCell>
                </TairoFlexTableRow>
              </TairoFlexTable>
            </div>
          </TransitionGroup>
        </div>

        <div v-if="!isPending && performanceList?.length !== 0" class="mt-4">
          <BasePagination
            :total-items="performanceList?.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </div>
  </TairoContentWrapper>
</template>
