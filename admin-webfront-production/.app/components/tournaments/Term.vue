<script setup lang="ts">
import type { AdminUser } from '../../types'
import { activeStatus, userRole, datePresets, masks } from '../../constants'
import { refDebounced } from '@vueuse/core'
import { endOfYear } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

const route = useRoute()
const router = useRouter()

const filter = ref('')
const debounced = refDebounced(filter, 500)
const theme = ref('')
const skillFilter = ref([])
const gameFilter = ref([])
const difficulty = ref('')
const datePreset = ref('')

const dateStart = ref<Date | null>(null)
const dateEnd = ref<Date | null>(null)

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    theme.value = value
  } else if (dropdownId === 2) {
    difficulty.value = value
  } else if (dropdownId === 3) {
    datePreset.value = value
  }
}

const perPage = ref(15)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    search: debounced.value,
    theme: theme.value,
    skill: skillFilter.value,
    game: gameFilter.value,
    difficulty: difficulty.value,
    startDate: dateStart.value,
    endDate: dateEnd.value,
    perPage: perPage.value,
    page: page.value,
  }

  const filteredProperties = Object.fromEntries(Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''))
  return filteredProperties
})

const { data, pending, error, refresh } = await useApiFetch<any>('/api/admin/all-tournaments', { query })
if (error.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
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

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const themes = ref(['Mandatory', 'Seasonal'])
const skills = ref(['Skill 1', 'Skill 2', 'Skill 3'])
const games = ref(['Game 1', 'Game 2', 'Game 3'])
const difficulties = ref(['Basic', 'Advanced', 'Expert'])
const tasks = ref([
  {
    id: 0,
    src: '/img/avatars/6.svg',
    taskName: 'Math Challenge',
    mainSegment: 'Core Skills',
    game: 'Math Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Medium',
  },
  {
    id: 1,
    src: '/img/avatars/8.svg',
    taskName: 'Trivia Quiz',
    mainSegment: 'Creative Series',
    game: 'Trivia Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Easy',
  },
  {
    id: 2,
    src: '/img/avatars/10.svg',
    taskName: 'Coding Challenge',
    mainSegment: 'Core Skills',
    game: 'Coding Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Hard',
  },
  {
    id: 3,
    src: '/img/avatars/12.svg',
    taskName: 'Strategy Mission',
    mainSegment: 'Coaching',
    game: 'Strategy Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Expert',
  },
  {
    id: 4,
    src: '/img/avatars/14.svg',
    taskName: 'History Quiz',
    mainSegment: 'Webinars',
    game: 'History Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Medium',
  },
  {
    id: 5,
    src: '/img/avatars/16.svg',
    taskName: 'Physics Challenge',
    mainSegment: 'Core Skills',
    game: 'Physics Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Hard',
  },
  {
    id: 6,
    src: '/img/avatars/18.svg',
    taskName: 'Language Quiz',
    mainSegment: 'Webinars',
    game: 'Language Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Easy',
  },
  {
    id: 7,
    src: '/img/avatars/20.svg',
    taskName: 'Logic Challenge',
    mainSegment: 'Core Skills',
    game: 'Logic Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Medium',
  },
  {
    id: 8,
    src: '/img/avatars/22.svg',
    taskName: 'Music Quiz',
    mainSegment: 'Webinars',
    game: 'Music Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Hard',
  },
  {
    id: 9,
    src: '/img/avatars/24.svg',
    taskName: 'Art Challenge',
    mainSegment: 'Creative Series',
    game: 'Art Game 1',
    createdDate: '2024-02-06',
    lastUpdate: '2024-02-06',
    difficultyLevel: 'Expert',
  },
])
</script>

<template>
  <div>
    <!-- Filter -->
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0">
          <div class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:grow sm:ps-2 flex-2">
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Search tournament name"
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-28 relative">
            <CustomDropdown :options="themes" placeholder="Select theme" @selected-value="handleSelectedValue(1, $event)" />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:basis-28 relative">
            <BaseButtonClose v-if="skillFilter.length > 0" size="sm" rounded="sm" color="muted" class="close-btn-auto" @click="skillFilter = []" />
            <BaseAutocomplete v-model="skillFilter" :items="skills" placeholder="Search skill" />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-28 relative">
            <BaseButtonClose v-if="gameFilter.length > 0" size="sm" rounded="sm" color="muted" class="close-btn-auto" @click="gameFilter = []" />
            <BaseAutocomplete v-model="gameFilter" :items="games" placeholder="Search game" />
          </div>
        </div>

        <div class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0">
          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2 relative">
            <CustomDropdown :options="difficulties" placeholder="Select difficulty" @selected-value="handleSelectedValue(2, $event)" />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <CustomDropdown :options="datePresets" placeholder="Choose date preset" @selected-value="handleSelectedValue(3, $event)" />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <DatePicker v-model="dateStart" :masks="masks" :max-date="setMaxDate()" mode="date" hide-time-header trim-weeks>
              <template #default="{ togglePopover, inputValue }">
                <div class="flex w-full flex-col gap-4 sm:flex-row">
                  <div class="relative grow">
                    <BaseInput
                      placeholder="Start date"
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
              :max-date="datePreset !== 'This Year' ? setMaxDate() : endOfYear(new Date())"
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
      <div v-if="!pending && data?.data.length === 0">
        <BasePlaceholderPage
          title="No matching results"
          subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
        >
          <template #image>
            <img class="block dark:hidden" src="/img/illustrations/placeholders/flat/placeholder-search-7.svg" alt="Placeholder image" />

            <img class="hidden dark:block" src="/img/illustrations/placeholders/flat/placeholder-search-7-dark.svg" alt="Placeholder image" />
          </template>
        </BasePlaceholderPage>
      </div>

      <div v-else>
        <div class="ltablet:grid-cols-3 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <BaseCard shape="curved" class="p-4 shadow-md">
              <div>
                <img src="/img/apps/1.jpg" alt="image" class="rounded-lg" />
              </div>

              <div class="flex items-center justify-between mt-4">
                <div class="leading-none">
                  <h4 class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium">Math challenge</h4>
                  <p class="text-muted-600 dark:text-muted-400 font-sans text-xs">Core skills</p>
                </div>

                <div class="flex gap-4 items-center">
                  <div>
                    <BaseTag :color="statusColor('Active')" shape="full" size="sm" class="capitalize"> Active </BaseTag>
                  </div>

                  <div>
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                      <BaseDropdownItem to="/tounaments/manage" title="Manage" text="Manage tournament" shape="smooth" />
                      <BaseDropdownItem title="Duplicate" text="Duplicate tournament" shape="smooth" />
                      <BaseDropdownItem title="Deactivate" text="Deactivete tournament" shape="smooth" />
                      <BaseDropdownItem title="Delete" text="Remove tournament" shape="smooth" @click="selectUser(item)" />
                    </BaseDropdown>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 items-center justify-between mt-4">
                <div class="flex gap-2 flex-wrap">
                  <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                  <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                  <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                  <BaseTag rounded="md" size="sm"> Label </BaseTag>
                  <BaseTag rounded="md" size="sm"> Label </BaseTag>
                </div>

                <div class="flex gap-1">
                  <Icon name="material-symbols:android" class="text-muted-400 block w-5 h-5" />
                  <Icon name="ic:baseline-apple" class="text-muted-400 block w-5 h-5" />
                  <Icon name="quill:desktop" class="text-muted-400 block w-5 h-5" />
                  <Icon name="tabler:brand-xbox" class="text-muted-400 block w-5 h-5" />
                </div>
              </div>
            </BaseCard>

            <BaseCard shape="curved" class="p-4 shadow-md">
              <div>
                <img src="/img/apps/7.png" alt="image" class="rounded-lg" />
              </div>

              <div class="flex items-center justify-between mt-4">
                <div class="leading-none">
                  <h4 class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium">Math challenge</h4>
                  <p class="text-muted-600 dark:text-muted-400 font-sans text-xs">Core skills</p>
                </div>

                <div class="flex gap-4 items-center">
                  <div>
                    <BaseTag :color="statusColor('Inactive')" shape="full" size="sm" class="capitalize"> Inactive </BaseTag>
                  </div>

                  <div>
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                      <BaseDropdownItem to="/tounaments/manage" title="Manage" text="Manage tournament" shape="smooth" />
                      <BaseDropdownItem title="Duplicate" text="Duplicate tournament" shape="smooth" />
                      <BaseDropdownItem title="Deactivate" text="Deactivete tournament" shape="smooth" />
                      <BaseDropdownItem title="Delete" text="Remove tournament" shape="smooth" @click="selectUser(item)" />
                    </BaseDropdown>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 items-center justify-between mt-4">
                <div class="flex gap-2 flex-wrap">
                  <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                  <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                  <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                  <BaseTag rounded="md" size="sm"> Label </BaseTag>
                  <BaseTag rounded="md" size="sm"> Label </BaseTag>
                </div>

                <div class="flex gap-1">
                  <Icon name="material-symbols:android" class="text-muted-400 block w-5 h-5" />
                  <Icon name="ic:baseline-apple" class="text-muted-400 block w-5 h-5" />
                  <Icon name="quill:desktop" class="text-muted-400 block w-5 h-5" />
                  <Icon name="tabler:brand-xbox" class="text-muted-400 block w-5 h-5" />
                </div>
              </div>
            </BaseCard>

            <BaseCard shape="curved" class="p-4 shadow-md">
              <div>
                <img src="/img/apps/3.jpg" alt="image" class="rounded-lg" />
              </div>

              <div class="flex items-center justify-between mt-4">
                <div class="leading-none">
                  <h4 class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium">Math challenge</h4>
                  <p class="text-muted-600 dark:text-muted-400 font-sans text-xs">Core skills</p>
                </div>

                <div class="flex gap-4 items-center">
                  <div>
                    <BaseTag :color="statusColor('Draft')" shape="full" size="sm" class="capitalize"> Draft </BaseTag>
                  </div>

                  <div>
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                      <BaseDropdownItem to="/tounaments/manage" title="Manage" text="Manage tournament" shape="smooth" />
                      <BaseDropdownItem title="Duplicate" text="Duplicate tournament" shape="smooth" />
                      <BaseDropdownItem title="Deactivate" text="Deactivete tournament" shape="smooth" />
                      <BaseDropdownItem title="Delete" text="Remove tournament" shape="smooth" @click="selectUser(item)" />
                    </BaseDropdown>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 items-center justify-between mt-4">
                <div class="flex gap-2 flex-wrap">
                  <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                  <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                  <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                  <BaseTag rounded="md" size="sm"> Label </BaseTag>
                  <BaseTag rounded="md" size="sm"> Label </BaseTag>
                </div>

                <div class="flex gap-1">
                  <Icon name="material-symbols:android" class="text-muted-400 block w-5 h-5" />
                  <Icon name="ic:baseline-apple" class="text-muted-400 block w-5 h-5" />
                  <Icon name="quill:desktop" class="text-muted-400 block w-5 h-5" />
                  <Icon name="tabler:brand-xbox" class="text-muted-400 block w-5 h-5" />
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
        </div>

        <div class="mt-6">
          <BasePagination :total-items="data?.total ?? 0" :item-per-page="perPage" :current-page="page" shape="curved" />
        </div>
      </div>
    </div>
  </div>
</template>
