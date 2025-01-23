<script setup>
import { refDebounced } from '@vueuse/core'

const games = inject('games')
const skills = inject('skills')
const segments = inject('segments')
const consoles = inject('consoles')
const allTaskss = inject('allTasks')

const { isOpen, remainingTasks } = defineProps(['isOpen', 'remainingTasks'])
const emits = defineEmits(['close', 'addTasks'])

const game = ref([])
const skill = ref([])
const allTasks = ref([])
const selectedTasks = ref([])
const tasksToSelect = ref(remainingTasks)

const age = ref('')
const filter = ref('')
const console = ref('')
const segment = ref('')
const difficulty = ref('')
const debounced = refDebounced(filter, 500)
const searchType = ref({ id: 'name', name: 'Name' })

const gameList = computed(() => games?.map((game) => game?.name))
const skillList = computed(() => skills?.map((skill) => skill?.name))
const consoleList = computed(() => consoles?.map((console) => console?.name))
const segmentList = computed(() => segments?.map((segment) => segment?.name))

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    difficulty.value = value
  } else if (dropdownId === 2) {
    age.value = value
  } else if (dropdownId === 3) {
    console.value = value
  }
}

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const page = ref(1)
const perPage = ref(300)

const getIdFromName = (name, objsArr) => {
  const obj = objsArr?.find((item) => item?.name === name)
  return obj ? obj?.id : null
}

const query = computed(() => {
  const nonEmptyProperties = {
    page: page.value,
    status: 'active',
    per_page: perPage.value,
    searchText: debounced.value ? debounced.value : undefined,
    difficulty: difficulty.value ? difficulty.value : undefined,
    age: age.value ? age.value : undefined,
    games: game.value ? [getIdFromName(game.value, games)] : undefined,
    skills: skill.value ? [getIdFromName(skill.value, skills)] : undefined,
    consoles: console.value ? [getIdFromName(console.value, consoles)] : undefined,
    filterBy: debounced.value ? searchType.value : undefined,
    segments: segment.value ? [getIdFromName(segment.value, segments)] : undefined,
    sort_field: sorting.value.column,
    sort_direction: sorting.value.direction,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([key, value]) => {
      return value != null && !(Array.isArray(value) && value.includes(null))
    }),
  )

  Object.keys(filteredProperties).forEach((key) => {
    if (Array.isArray(filteredProperties[key])) {
      filteredProperties[key] = JSON.stringify(filteredProperties[key])
    }
  })

  return filteredProperties
})

const openTasksList = () => {
  tasksToSelect.value = allTasks.value?.filter((task) =>
    remainingTasks.some((t) => task.id === t.id),
  )
}

const filterTasks = (tasks, query) => {
  return tasks.filter((task) => {
    let matches = false

    if (query.difficulty && task.difficulty === query.difficulty) matches = true
    if (query.age && task.age == query.age) matches = true

    if (query.searchText) {
      const searchRegex = new RegExp(query.searchText, 'i')
      if (searchRegex.test(task.name)) {
        matches = true
      }
    }

    if (query.games) {
      const gameMatch = query.games.some((gameId) => task.games.some((game) => game.id === gameId))
      if (gameMatch) matches = true
    }

    if (query.skills) {
      const skillMatch = query.skills.some((skillId) =>
        task.skills.some((skill) => skill.id === skillId),
      )
      if (skillMatch) matches = true
    }

    if (query.segments) {
      const segmentMatch = query.segments.some((segmentId) =>
        task.segments.some((segment) => segment.id === segmentId),
      )
      if (segmentMatch) matches = true
    }

    return matches
  })
}

const getTasks = async () => {
  try {
    const { data, error } = await useApiFetch('/api/admin/tasks', {
      query,
      watch: false,
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    allTasks.value = data.value?.tasks.data
    openTasksList()
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const selectTasks = (task) => {
  const taskIndex = selectedTasks.value.findIndex((t) => t.id === task.id)

  if (taskIndex === -1) {
    selectedTasks.value.push(task)
  } else {
    selectedTasks.value.splice(taskIndex, 1)
  }
}

const addTasks = () => {
  emits('addTasks', selectedTasks.value)
}

const closeModal = () => {
  emits('close')
}

watch(query, async () => {
  await getTasks()

  // const filteredTasks = await filterTasks(allTaskss, query.value)
  // tasksToSelect.value = filteredTasks?.filter((task) =>
  //   remainingTasks.some((t) => task.id === t.id),
  // )
})

const ages = ref(['7', '8', '9', '10', '11', '12'])
const types = ref(['Mandatory', 'Casual', 'Seasonal'])
const difficulties = ref(['Basic', 'Advanced', 'Expert'])
</script>

<template>
  <div>
    <TairoModal :open="isOpen" size="3xl" @click="closeModal">
      <template #header>
        <div class="relative">
          <div class="p-6 pe-16">
            <div class="flex gap-4 lg:items-center justify-between flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="md"
                  weight="medium"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  Filter and Add Tasks
                </BaseHeading>

                <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                  Select and filter tasks to include in the calendar. Review your choices carefully
                  before finalizing the calendar creation.
                </BaseText>
              </div>

              <div class="flex items-center gap-2">
                <BaseCard shape="curved" class="flex items-center gap-2 p-3">
                  <BaseIconBox
                    size="sm"
                    class="bg-info-100 text-info-500 dark:bg-info-500/20 dark:text-info-400 dark:border-info-500 dark:border-2"
                    shape="full"
                  >
                    <Icon name="material-symbols:task-outline" class="h-5 w-5" />
                  </BaseIconBox>

                  <div>
                    <BaseHeading
                      as="h2"
                      size="lg"
                      weight="semibold"
                      lead="tight"
                      class="text-muted-800 dark:text-white"
                    >
                      <span>{{ selectedTasks.length }}</span>
                    </BaseHeading>

                    <BaseParagraph size="xs">
                      <span class="text-muted-500 dark:text-muted-400">Selected tasks</span>
                    </BaseParagraph>
                  </div>
                </BaseCard>
              </div>
            </div>
          </div>

          <BaseButtonClose
            @click="closeModal"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>

      <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-96 lg:overflow-auto lg:max-h-none">
        <div class="lg:max-h-96">
          <div class="mt-2">
            <!-- Filter -->
            <div class="relative">
              <BaseCard class="ptablet:py-8 ptablet:px-4 mb-2 py-4 px-4">
                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div
                    class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:ps-2 relative"
                  >
                    <BaseButtonClose
                      v-if="filter"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="filter = ''"
                    />

                    <BaseInput
                      v-model="filter"
                      icon="lucide:search"
                      placeholder="Search"
                      autocomplete="off"
                      :classes="{
                        wrapper: 'w-full sm:w-full',
                      }"
                    />
                  </div>

                  <div
                    class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2 relative"
                  >
                    <BaseButtonClose
                      v-if="segment"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-segment"
                      @click="segment = ''"
                    />

                    <BaseListbox
                      v-model="segment"
                      :items="segmentList"
                      placeholder="Select Segment"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2">
                    <CustomDropdown
                      :options="difficulties"
                      placeholder="Select Difficulty"
                      @selected-value="handleSelectedValue(1, $event)"
                    />
                  </div>

                  <div class="ptablet:col-span-6 w-48 flex-1 px-2 py-2 sm:w-48 sm:pe-2">
                    <CustomDropdown
                      :options="ages"
                      placeholder="Select Age"
                      @selected-value="handleSelectedValue(2, $event)"
                    />
                  </div>
                </div>

                <div
                  class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                >
                  <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
                    <CustomDropdown
                      :options="consoleList"
                      placeholder="Select Console"
                      @selected-value="handleSelectedValue(3, $event)"
                    />
                  </div>

                  <div
                    class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 relative"
                  >
                    <BaseButtonClose
                      v-if="skill.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="skill = []"
                    />

                    <BaseAutocomplete
                      v-model="skill"
                      :items="skillList"
                      placeholder="Search Skill"
                    />
                  </div>

                  <div
                    class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 relative"
                  >
                    <BaseButtonClose
                      v-if="game.length > 0"
                      size="sm"
                      rounded="sm"
                      color="muted"
                      class="close-btn-auto"
                      @click="game = []"
                    />

                    <BaseAutocomplete v-model="game" :items="gameList" placeholder="Search Game" />
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>

          <div>
            <div v-if="tasksToSelect?.length === 0">
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

            <div v-else class="space-y-2 pt-12">
              <TransitionGroup
                enter-active-class="transform-gpu"
                enter-from-class="opacity-0 -translate-x-full"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="absolute transform-gpu"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-full"
              >
                <FlexTableRow
                  v-for="(task, index) in tasksToSelect"
                  :key="index"
                  shape="rounded"
                  spaced
                >
                  <template #start>
                    <FlexTableCell
                      label="Select"
                      :hide-label="index > 0"
                      class="w-full sm:w-28 lg:!justify-start"
                    >
                      <BaseCheckbox
                        name="table-1-main"
                        shape="rounded"
                        class="text-primary-500"
                        @click="selectTasks(task)"
                      />
                    </FlexTableCell>

                    <FlexTableCell
                      label="Task"
                      :hide-label="index > 0"
                      class="w-full lg:!justify-start"
                    >
                      <div class="flex items-center">
                        <div class="relative shrink-0">
                          <img
                            :src="getImageUrl(task?.thumbnail)"
                            :alt="task?.name"
                            class="h-12 w-16 rounded-lg object-cover"
                          />
                        </div>

                        <div class="ms-3 leading-none">
                          <h4 class="font-sans text-sm font-medium">{{ task?.name }}</h4>
                          <BaseParagraph
                            size="xs"
                            lead="tight"
                            class="text-muted-500 dark:text-muted-400"
                          >
                            <span>{{ task?.code }}</span>
                          </BaseParagraph>
                        </div>
                      </div>
                    </FlexTableCell>
                  </template>

                  <template #end>
                    <FlexTableCell
                      label="Game"
                      :hide-label="index > 0"
                      class="w-full sm:w-40 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ task.games?.[0]?.name }}
                      </span>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Segments"
                      :hide-label="index > 0"
                      class="w-full sm:w-48 lg:!justify-start"
                    >
                      <div class="flex gap-2 flex-wrap">
                        <BaseTag rounded="md" size="sm" v-for="segment in task?.segments">
                          {{ segment?.name }}
                        </BaseTag>
                      </div>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Difficulty"
                      :hide-label="index > 0"
                      class="w-full sm:w-24 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ task?.difficulty }}
                      </span>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Age"
                      :hide-label="index > 0"
                      class="w-full sm:w-12 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ task?.age }}
                      </span>
                    </FlexTableCell>
                  </template>
                </FlexTableRow>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="closeModal"> Cancel </BaseButton>
            <BaseButton color="primary" variant="solid" @click="addTasks"> Add Tasks </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>

<style scoped>
.close-btn-segment {
  position: absolute;
  right: 46px;
  z-index: 9;
  top: 16px !important;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
