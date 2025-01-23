<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const term = ref('')
const year = ref('')

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    term.value = value
  } else if (dropdownId === 2) {
    year.value = value
  }
}

const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    term: term.value,
    year: year.value,
  }

  const filteredProperties = Object.fromEntries(Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''))
  return filteredProperties
})

const { data, pending, error, refresh } = await useApiFetch<any>('/api/tasks', { query })
if (error.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const selectedTournament = ref(null)

const viewTournament = () => {}

const terms = ['1st Term', '2nd Term', '3rd Term']
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
const tournaments = [
  {
    id: 0,
    src: '/img/avatars/22.svg',
    tournamentName: 'Chess Championship',
    tournamentId: 'T-CHS-001',
    tournamentType: 'End of the year',
    locations: 5,
    startDate: '2024-11-15',
    endDate: '2024-11-20',
    completionRate: 45,
  },
  {
    id: 1,
    src: '/img/avatars/24.svg',
    tournamentName: 'Soccer League',
    tournamentId: 'T-SOC-001',
    tournamentType: 'End of the year',
    locations: 5,
    startDate: '2024-12-01',
    endDate: '2024-12-10',
    completionRate: 60,
  },
  {
    id: 2,
    src: '/img/avatars/26.svg',
    tournamentName: 'Basketball Tournament',
    tournamentId: 'T-BKB-001',
    tournamentType: 'End of the year',
    locations: 5,
    startDate: '2024-12-05',
    endDate: '2024-12-15',
    completionRate: 55,
  },
  {
    id: 3,
    src: '/img/avatars/18.svg',
    tournamentName: 'Golf Invitational',
    tournamentId: 'T-GOL-001',
    tournamentType: 'End of the year',
    locations: 5,
    startDate: '2024-12-10',
    endDate: '2024-12-20',
    completionRate: 70,
  },
  {
    id: 4,
    src: '/img/avatars/10.svg',
    tournamentName: 'Swimming Competition',
    tournamentId: 'T-SWM-001',
    tournamentType: 'End of the year',
    locations: 5,
    startDate: '2024-12-15',
    endDate: '2024-12-25',
    completionRate: 50,
  },
]
</script>

<template>
  <BaseCard class="p-6 pb-10 mt-6">
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading tag="h2" size="md" weight="medium" lead="normal" class="uppercase tracking-wider text-primary-500 dark:text-muted-100">
          Tournament history
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400"> Customize user access and permissions for each segment </BaseText>
      </div>

      <!-- Filters -->
      <div>
        <div class="flex gap-6">
          <div>
            <CustomDropdown :options="years" placeholder="Select year" @selected-value="handleSelectedValue(1, $event)" class="sm:w-40" />
          </div>

          <div>
            <CustomDropdown :options="terms" placeholder="Select term" @selected-value="handleSelectedValue(2, $event)" class="sm:w-40" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2 pt-6 mt-6">
      <TransitionGroup
        enter-active-class="transform-gpu"
        enter-from-class="opacity-0 -translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="absolute transform-gpu"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-full"
      >
        <FlexTableRow v-for="(tournament, index) in tournaments" :key="index" shape="rounded" spaced>
          <template #start>
            <FlexTableStart
              label="Tournament"
              :hide-label="index > 0"
              :title="tournament.tournamentName"
              :subtitle="tournament.tournamentId"
              :picture="tournament.src"
            />
          </template>

          <template #end>
            <FlexTableCell label="Type" :hide-label="index > 0" class="w-full sm:w-36 lg:!justify-start">
              <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                {{ tournament.tournamentType }}
              </span>
            </FlexTableCell>

            <FlexTableCell label="Start date" :hide-label="index > 0" class="w-full sm:w-32 lg:!justify-start">
              <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                {{ tournament.startDate }}
              </span>
            </FlexTableCell>

            <FlexTableCell label="End date" :hide-label="index > 0" class="w-full sm:w-32 lg:!justify-start">
              <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                {{ tournament.endDate }}
              </span>
            </FlexTableCell>

            <FlexTableCell label="Completion" :hide-label="index > 0" class="w-full sm:w-32 lg:!justify-start">
              <span class="text-primary-500 dark:text-muted-400 font-sans text-md font-medium"> {{ tournament.completionRate }}% </span>
            </FlexTableCell>

            <FlexTableCell label="action" :hide-label="index > 0">
              <BaseButtonAction color="muted" @click="viewTournament">
                <span>View</span>
              </BaseButtonAction>
            </FlexTableCell>
          </template>
        </FlexTableRow>
      </TransitionGroup>
    </div>

    <div v-if="data?.data.length !== 0" class="mt-4">
      <BasePagination :total-items="data?.total ?? 0" :item-per-page="perPage" :current-page="page" shape="curved" />
    </div>
  </BaseCard>
</template>
