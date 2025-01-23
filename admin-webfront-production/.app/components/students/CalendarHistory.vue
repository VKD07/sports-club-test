<script setup>
const student = inject('student')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const year = ref('')
const calendars = ref(null)

const perPage = ref(10)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school_id: student.school_id,
    year: year.value?.value,
    per_page: perPage.value,
    page: page.value,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const getCalendarHistory = async () => {
  try {
    const { data, error } = await schoolWriteApi(
      `/api/school-guest/student/${student.id}/academy-history`,
      {
        query,
        watch: false,
      },
    )

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    calendars.value = data.value
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getCalendarHistory()

const goToPerformance = () => {
  router.push({ name: 'student-performance' })
}

watch(query, async () => {
  await getCalendarHistory()
})

watch([year, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const years = ref([])
onMounted(async () => {
  if (student.location?.location_history) {
    const academicPeriod = await useSchoolHistory(
      student.location?.location_history,
      student.location?.academic_year,
    )

    years.value = academicPeriod?.years.value
  }
})

const viewHistoryPerformance = (calendar) => {
  const updatedStudent = {
    ...student,
    location: {
      ...student.location,
      academic_term: parseInt(calendar?.term, 10),
      academic_year: parseInt(calendar?.year, 10),
    },
  }

  router.push({
    name: 'student_performance',
    query: {
      student: JSON.stringify(updatedStudent),
    },
  })
}
</script>

<template>
  <BaseCard class="p-6 pb-10 mt-6">
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Academic Calendars History
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Access a record of all completed academic calendars. Filter by academic year and term to
          find specific historical data.
        </BaseText>
      </div>

      <!-- filters -->
      <div>
        <div class="flex gap-6">
          <div>
            <BaseListbox
              v-model="year"
              placeholder="Academic Year"
              class="sm:w-48"
              :items="years"
              :properties="{
                value: 'value',
                label: 'text',
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <div>
      <div v-if="calendars.data?.length === 0">
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

      <div v-else class="space-y-2 pt-6 mt-6">
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-full"
        >
          <FlexTableRow
            v-for="(calendar, index) in calendars.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Calendar"
                :hide-label="index > 0"
                :title="calendar.calendar_name"
                :subtitle="calendar.calendar_code"
                :avatar="getImageUrl(calendar.banner)"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Year / Term"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{
                    calendar.year && calendar.term
                      ? `${calendar.year} / ${calendar.term}${getSuffix(calendar.term)} Term`
                      : '-/- '
                  }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Type"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.calendar_type }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Task"
                :hide-label="index > 0"
                class="w-full sm:w-16 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.total_tasks_completed ?? '0' }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Avg Score"
                :hide-label="index > 0"
                class="w-full sm:w-24 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.avg_score }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Time Spend"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar?.time_spent.d }}d {{ calendar?.time_spent.h }}h
                  {{ calendar?.time_spent.m }}m
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Ranking"
                :hide-label="index > 0"
                class="w-full sm:w-20 lg:!justify-start"
              >
                <BaseTag shape="full" variant="solid" color="primary" class="w-12 text-center">
                  {{ calendar.rank ?? '-' }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell
                label="Badges"
                :hide-label="index > 0"
                class="w-full sm:w-44 lg:!justify-start"
              >
                <div class="flex items-center justify-start gap-2">
                  <div>
                    <img src="/img/badges/Badge 1.png" class="w-6" />
                    <div class="text-xs font-medium mt-1 text-center">
                      {{ calendar.badges_count.platinum ?? '0' }}
                    </div>
                  </div>

                  <div>
                    <img src="/img/badges/Badge 2.png" class="w-6" />
                    <div class="text-xs font-medium mt-1 text-center">
                      {{ calendar.badges_count.gold ?? '0' }}
                    </div>
                  </div>

                  <div>
                    <img src="/img/badges/Badge 4.png" class="w-6" />
                    <div class="text-xs font-medium mt-1 text-center">
                      {{ calendar.badges_count.silver ?? '0' }}
                    </div>
                  </div>

                  <div>
                    <img src="/img/badges/Badge 3.png" class="w-6" />
                    <div class="text-xs font-medium mt-1 text-center">
                      {{ calendar.badges_count.bronze ?? '0' }}
                    </div>
                  </div>
                </div>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    title="View Performance"
                    shape="smooth"
                    @click="viewHistoryPerformance(calendar)"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>
    </div>

    <div v-if="calendars.data?.length !== 0" class="mt-4">
      <BasePagination
        :total-items="calendars?.total ?? 0"
        :item-per-page="perPage"
        :current-page="page"
        shape="curved"
      />
    </div>
  </BaseCard>
</template>
