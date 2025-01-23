<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const schoolFilter = ref([])
const academyYear = ref('')
const term = ref('')
const tournament = ref('')

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

const perPage = ref(15)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school: schoolFilter.value,
    academyYear: academyYear.value,
    term: term.value,
    tournament: tournament.value,
    perPage: perPage.value,
    page: page.value,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )
  return filteredProperties
})

// const { data, pending, error, refresh } = await useApiFetch<any>('/api/admin/leader-board', {
//   query,
// })
// if (error.value) {
//   showErrorToast('Oops!', 'Something went wrong, please try again!')
// }

const academyYears = ref(['1st Year', '2nd Year', '3rd Year'])
const terms = ref(['1st Term', '2nd Term', '3rd Term'])
const tournaments = ref(['Tournament 1', 'Tournament 2', 'Tournament 3'])
const leaderboard = ref([
  {
    id: 0,
    rank: 1,
    src: '/img/avatars/1.svg',
    studentName: 'John Doe',
    studentID: 'S123456',
    avgScore: 85,
    completedTask: 10,
    takenTime: '1d 2h 30m 18s',
    trophy: 3,
  },
  {
    id: 1,
    rank: 2,
    src: '/img/avatars/2.svg',
    studentName: 'Jane Smith',
    studentID: 'S987654',
    avgScore: 92,
    completedTask: 8,
    takenTime: '4d 2h 30m 18s',
    trophy: 1,
  },
  {
    id: 2,
    rank: 3,
    src: '/img/avatars/3.svg',
    studentName: 'Alice Johnson',
    studentID: 'S456789',
    avgScore: 78,
    completedTask: 12,
    takenTime: '1d 2h 30m 18s',
    trophy: 2,
  },
  {
    id: 3,
    rank: 4,
    src: '/img/avatars/4.svg',
    studentName: 'Bob Williams',
    studentID: 'S654321',
    avgScore: 89,
    completedTask: 9,
    takenTime: '1d 5h 20m 18s',
    trophy: 0,
  },
  {
    id: 4,
    rank: 5,
    src: '/img/avatars/5.svg',
    studentName: 'Emily Brown',
    studentID: 'S135792',
    avgScore: 75,
    completedTask: 11,
    takenTime: '1d 2h 30m 0s',
    trophy: 1,
  },
  {
    id: 5,
    rank: 6,
    src: '/img/avatars/6.svg',
    studentName: 'David Wilson',
    studentID: 'S246810',
    avgScore: 82,
    completedTask: 10,
    takenTime: '2d 0h 0m 18s',
    trophy: 2,
  },
  {
    id: 6,
    rank: 7,
    src: '/img/avatars/7.svg',
    studentName: 'Olivia Taylor',
    studentID: 'S112233',
    avgScore: 88,
    completedTask: 9,
    takenTime: '25d 2h 30m 18s',
    trophy: 0,
  },
  {
    id: 7,
    rank: 8,
    src: '/img/avatars/8.svg',
    studentName: 'James Anderson',
    studentID: 'S445566',
    avgScore: 79,
    completedTask: 12,
    takenTime: '1d 2h 30m 18s',
    trophy: 1,
  },
  {
    id: 8,
    rank: 9,
    src: '/img/avatars/9.svg',
    studentName: 'Sophia Martinez',
    studentID: 'S778899',
    avgScore: 91,
    completedTask: 8,
    takenTime: '1d 2h 30m 18s',
    trophy: 3,
  },
  {
    id: 9,
    rank: 10,
    src: '/img/avatars/10.svg',
    studentName: 'William Davis',
    studentID: 'S990011',
    avgScore: 83,
    completedTask: 11,
    takenTime: '1d 2h 30m 18s',
    trophy: 1,
  },
])
</script>

<template>
  <div>
    <div class="w-full flex justify-end gap-2 relative">
      <BaseButton v-if="_export" class="w-full sm:w-32 absolute right-0 top-[-65px]">
        <Icon name="ph:export-light" class="h-4 w-4" />
        <span>Export</span>
      </BaseButton>
    </div>

    <BasePlaceholderPage title="There are no active tournaments at this time. " class="mt-8">
      <template #image>
        <img class="block dark:hidden" src="/img/placeholders/PH 4.png" alt="Placeholder image" />

        <img class="hidden dark:block" src="/img/placeholders/PH 4.png" alt="Placeholder image" />
      </template>
    </BasePlaceholderPage>

    <!-- Filter -->
    <!-- <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-2 px-2">
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
              icon="heroicons:building-library"
              placeholder="Search school"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-16 relative">
            <CustomDropdown
              :options="academyYears"
              placeholder="Select year"
              @selected-value="handleSelectedValue(1, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-4 py-2 sm:w-auto sm:basis-16 relative">
            <CustomDropdown
              :options="terms"
              placeholder="Select term"
              @selected-value="handleSelectedValue(2, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-48 relative">
            <CustomDropdown
              :options="tournaments"
              placeholder="Select tournament"
              @selected-value="handleSelectedValue(3, $event)"
            />
          </div>
        </div>
      </BaseCard>
    </div> -->

    <!-- List -->
    <!-- <div>
      <div v-if="!pending && data?.data.length === 0">
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
          <div key="1">
            
            <div
              class="ltablet:grid-cols-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-16"
            >
              <BaseCard
                v-for="(item, index) in leaderboard.slice(0, 5)"
                :key="index"
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
                        {{ item.avgScore }}%
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
                        {{ item.completedTask }}/36
                      </BaseHeading>

                      <BaseParagraph size="xs" class="text-muted-500 !text-[0.6rem]">
                        Tasks Completed
                      </BaseParagraph>
                    </div>

                    <div>
                      <div
                        class="text-base px-2 rounded-full w-8 h-8 flex items-center justify-center bg-yellow-500"
                      >
                        {{ item.rank }}
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
                      {{ item.takenTime }}
                    </BaseHeading>
                  </div>
                </div>

                <div class="p-6">
                  <div class="mb-3 flex w-full items-center justify-center">
                    <BaseAvatar size="xl" :src="item.src" shape="curved" />
                  </div>

                  <div class="text-center">
                    <BaseHeading tag="h3" size="md" weight="medium" lead="none">
                      {{ item.studentName }}
                    </BaseHeading>

                    <BaseParagraph size="xs" class="text-muted-400">
                      {{ item.studentID }}
                    </BaseParagraph>
                  </div>

                  <div class="mb-6 mt-4 flex items-center justify-center gap-2">
                    <img src="/img/trophy/trophy-1.png" class="w-12" />
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-xs">
                      Trophy name
                    </span>
                  </div>

                  <div class="flex items-center justify-center">
                    <BaseButton
                      shape="rounded"
                      size="sm"
                      variant="solid"
                      color="primary"
                      class="!px-6"
                      :to="`/students/${item.id}`"
                    >
                      <span>View</span>
                    </BaseButton>
                  </div>
                </div>
              </BaseCard>
            </div>

           
            <div class="space-y-2">
              <FlexTableRow
                v-for="(item, index) in leaderboard.slice(5)"
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
                      {{ item.rank }}
                    </div>
                  </FlexTableCell>

                  <FlexTableStart
                    label="Student"
                    :hide-label="index > 0"
                    :title="item.studentName"
                    :subtitle="item.studentID"
                    :avatar="item.src"
                  />
                </template>

                <template #end>
                  <FlexTableCell
                    label="Avg Score"
                    :hide-label="index > 0"
                    class="w-full sm:w-36 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item.avgScore }}%
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Time taken"
                    :hide-label="index > 0"
                    class="w-full sm:w-32 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item.takenTime }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Trophy"
                    :hide-label="index > 0"
                    class="w-full sm:w-40 lg:!justify-start flex items-center gap-2"
                  >
                    <img src="/img/trophy/trophy-1.png" class="w-10" />
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-xs">
                      Trophy name
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label=""
                    :hide-label="index > 0"
                    class="w-full sm:w-24 lg:!justify-start"
                  >
                    <BaseButtonAction color="muted" :to="`/students/${item.id}`">
                      <span>View</span>
                    </BaseButtonAction>
                  </FlexTableCell>
                </template>
              </FlexTableRow>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div v-if="!pending && data?.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="data?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div> -->
  </div>
</template>
