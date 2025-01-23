<script setup>
definePageMeta({
  name: 'tasks',
  title: 'Academic Tasks',
  middleware: ['auth'],
})

const games = ref(null)
const skills = ref(null)
const segments = ref(null)
const activeValue = ref('active')

const route = useRoute()
const toDraft = route.query.toDraft
const toActive = route.query.toActive

const selectedGame = route.query.selectedGame
const selectedSkill = route.query.selectedSkill
const selectedSegment = route.query.selectedSegment

const isToDraft = ref(false)
const isToActive = ref(false)

onMounted(() => {
  isToDraft.value = toDraft !== null && toDraft === 'true'
  isToActive.value = toActive !== null && toActive === 'true'

  if (isToDraft.value) {
    activeValue.value = 'draft'
    window.history.replaceState({}, document.title, '/tasks')
  }

  if (isToActive.value) {
    activeValue.value = 'active'
    window.history.replaceState({}, document.title, '/tasks')
  }
})

const getSegments = async () => {
  const query = {
    per_page: '100',
    page: '1',
  }

  const { data, error } = await useApiFetch('/api/admin/segments', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch segments, please try again!')
  }

  return data
}

const getSkills = async () => {
  const query = {
    per_page: '100',
    page: '1',
  }

  const { data, error } = await useApiFetch('/api/admin/skills', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch skills, please try again!')
  }

  return data
}

const getGames = async () => {
  const query = {
    per_page: '100',
    page: '1',
  }

  const { data, error } = await useApiFetch('/api/admin/games', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch games, please try again!')
  }

  return data
}

const getData = async () => {
  try {
    const [segmentsData, skillsData, gamesData] = await Promise.all([
      getSegments(),
      getSkills(),
      getGames(),
    ])

    // Process segments data
    segments.value = segmentsData.value

    // Process skills data
    skills.value = skillsData.value

    // Process games data
    games.value = gamesData.value
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
}
await getData()

const tabs = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Deactivated', value: 'deactivated' },
]

const goToActive = () => {
  activeValue.value = 'active'
}

const emitDownloadEvent = () => {
  window.dispatchEvent(new CustomEvent('download-event'))
}
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
          Educational Challenges
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Create, review, manage and update all the educational challenges available on the
          platform.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="activeValue !== 'deactivated'" class="flex items-center gap-2">
          <BaseButton class="w-full sm:w-32" @click="emitDownloadEvent">
            <Icon name="ph:export-light" class="h-4 w-4" />
            <span>Export</span>
          </BaseButton>
        </div>

        <BaseDropdown
          label="Add New"
          button-color="primary"
          orientation="end"
          size="md"
          class="add-dropdown"
        >
          <BaseDropdownItem to="/tasks/add-gaming-challenges" title="Gaming Challenges" />
          <!-- <BaseDropdownItem to="/tasks/add-coaching" title="Coaching" />
          <BaseDropdownItem to="/tasks/add-webinar" title="Webinar" /> -->
        </BaseDropdown>
      </div>
    </div>

    <BaseCard class="!min-h-[600px]">
      <div class="px-8 pt-8 pb-4">
        <BaseTabSlider
          v-slot="{ activeValue }"
          :model-value="activeValue"
          :tabs="tabs"
          @update:model-value="(value) => (activeValue = value)"
        >
          <div v-if="activeValue === 'active'">
            <TasksActive
              :games="games"
              :skills="skills"
              :segments="segments"
              :selectedGame="selectedGame"
              :selectedSkill="selectedSkill"
              :selectedSegment="selectedSegment"
            />
          </div>

          <div v-else-if="activeValue === 'draft'">
            <TasksDraft
              :games="games"
              :skills="skills"
              :segments="segments"
              @goToActive="goToActive"
            />
          </div>

          <div v-else-if="activeValue === 'deactivated'">
            <TasksDeactivated
              :games="games"
              :skills="skills"
              :segments="segments"
              @goToActive="goToActive"
            />
          </div>
        </BaseTabSlider>
      </div>
    </BaseCard>
  </TairoContentWrapper>
</template>
