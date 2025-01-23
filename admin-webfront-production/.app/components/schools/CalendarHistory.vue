<script setup>
const school = inject('school')
const locations = inject('locations')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const year = ref('')
const calendars = ref(null)

const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
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
      `/api/school-guest/school/${school?.id}/past-calendars`,
      {
        query,
        watch: false,
      },
    )

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    calendars.value = data.value?.locationCalendars
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getCalendarHistory()

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
  if (locations[0]?.school_history) {
    const academicPeriod = await useSchoolHistory(
      locations[0]?.school_history,
      locations[0]?.academic_year,
    )

    years.value = academicPeriod?.years.value
  }
})

const goToLeaderboard = (calendar) => {
  const selectedLocation = locations.filter((loc) => loc.id === calendar?.location_id)

  const updatedSchool = {
    ...school,
    location: {
      ...selectedLocation[0],
      academic_term: parseInt(calendar?.term, 10),
      academic_year: parseInt(calendar?.year, 10),
    },
  }

  router.push({
    name: 'leaderboard',
    query: {
      school: JSON.stringify(updatedSchool),
    },
  })
}

const viewHistoryPerformance = (calendar) => {
  const selectedLocation = locations.filter((loc) => loc.id === calendar?.location_id)

  const updatedSchool = {
    ...school,
    location: {
      ...selectedLocation[0],
      academic_term: parseInt(calendar?.term, 10),
      academic_year: parseInt(calendar?.year, 10),
    },
  }

  router.push({
    name: 'student_performance',
    query: {
      school: JSON.stringify(updatedSchool),
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
          <div class="relative">
            <BaseButtonClose
              v-if="year"
              size="sm"
              rounded="sm"
              color="muted"
              class="loc-close-btn"
              @click="year = ''"
            />
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
        <BasePlaceholderPage title="No past term calendars available for this school.">
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
                :title="calendar.name"
                :subtitle="calendar.code"
                :picture="getImageUrl(calendar.banner)"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Location"
                :hide-label="index > 0"
                class="w-full sm:w-52 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.location_name }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Type"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar.type }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Year / Term"
                :hide-label="index > 0"
                class="w-full sm:w-32 lg:!justify-start"
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
                label="Participation"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar?.total_students ?? 0 }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Completion Rate"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ calendar?.completion ?? 0 }}%
                </span>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    title="View Leaderboard"
                    shape="smooth"
                    @click="goToLeaderboard(calendar)"
                  />

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

<style scoped>
.loc-close-btn {
  position: absolute;
  right: 45px;
  z-index: 999;
  top: 8px;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
