<script setup>
import { format } from 'date-fns'
import AddTasksModal from './AddTasksModal.vue'

const emits = defineEmits(['setTaskArray'])
const tasksInList = inject('addedTasks')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const page = ref(1)
const perPage = ref(300)

const games = ref(null)
const skills = ref(null)
const segments = ref(null)
const consoles = ref(null)

const allTasks = ref([])
const addedTasks = ref([])
const selectedTasks = ref([])
const remainingTasks = ref([])

const isModalAddTaskOpen = ref(false)

const getTasks = async () => {
  const query = {
    page: page.value,
    per_page: perPage.value,
  }

  const { data, error } = await useApiFetch('/api/admin/tasks', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch tasks, please try again!')
  }

  return data
}

const getSegments = async () => {
  const query = {
    page: page.value,
    per_page: perPage.value,
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
    page: page.value,
    per_page: perPage.value,
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
    page: page.value,
    per_page: perPage.value,
  }

  const { data, error } = await useApiFetch('/api/admin/games', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch games, please try again!')
  }

  return data
}

const getConsoles = async () => {
  const query = {
    page: page.value,
    per_page: perPage.value,
  }

  const { data, error } = await useApiFetch('/api/admin/game-consoles', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch consoles, please try again!')
  }

  return data
}

const getData = async () => {
  try {
    const [tasksData, segmentsData, skillsData, gamesData, consolesData] = await Promise.all([
      getTasks(),
      getSegments(),
      getSkills(),
      getGames(),
      getConsoles(),
    ])

    // Process tasks data
    allTasks.value = tasksData.value?.tasks?.data

    // Process segments data
    segments.value = segmentsData.value?.segments?.data

    // Process skills data
    skills.value = skillsData.value?.skills?.data

    // Process games data
    games.value = gamesData.value?.games?.data

    // Process consoles data
    consoles.value = consolesData.value?.gameConsoles?.data
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
}
await getData()

if (tasksInList) {
  addedTasks.value = allTasks.value?.filter((task) =>
    tasksInList.some((t) => task.id === t.task_id),
  )
}

const clearTasksTable = () => {
  addedTasks.value = []
}

const openTasksList = () => {
  remainingTasks.value = allTasks.value?.filter(
    (task) => !addedTasks.value.some((t) => task.id === t.id),
  )

  isModalAddTaskOpen.value = true
}

defineExpose({
  clearTasksTable,
  openTasksList,
})

const selectTasks = (task) => {
  const taskIndex = selectedTasks.value.findIndex((t) => t.id === task.id)

  if (taskIndex === -1) {
    selectedTasks.value.push(task)
  } else {
    selectedTasks.value.splice(taskIndex, 1)
  }
}

const extractTaskIds = (tasks) => {
  return tasks.map((task) => ({ task_id: String(task.id) }))
}

const addTasks = (selectedTasks) => {
  const taskIds = new Set(addedTasks.value.map((task) => task.id))

  selectedTasks.forEach((task) => {
    if (!taskIds.has(task.id)) {
      addedTasks.value.push(task)
      taskIds.add(task.id)
    }
  })

  selectedTasks = []

  const taskIdsArray = extractTaskIds(addedTasks.value)
  emits('setTaskArray', taskIdsArray)

  isModalAddTaskOpen.value = false
}

const removeAddedTasks = (task) => {
  const taskIndex = addedTasks.value.findIndex((t) => t.id === task.id)

  if (taskIndex !== -1) {
    addedTasks.value.splice(taskIndex, 1)
  }

  const taskIdsArray = extractTaskIds(addedTasks.value)
  emits('setTaskArray', taskIdsArray)
}

const closeModal = () => {
  isModalAddTaskOpen.value = false
}

const formatDate = (dateString) => {
  const formattedDate = format(new Date(dateString), 'dd/MM/yyyy')
  return formattedDate
}

provide('games', games.value)
provide('skills', skills.value)
provide('segments', segments.value)
provide('consoles', consoles.value)
provide('allTasks', allTasks.value)
</script>

<template>
  <div>
    <BaseCard class="mt-6">
      <div class="p-8 py-12">
        <TairoFormGroup>
          <div class="flex justify-between gap-4">
            <legend class="mb-6">
              <p class="nui-heading nui-heading-md nui-weight-medium nui-lead-none" tag="h3">
                Add task
              </p>
            </legend>

            <div>
              <BaseButton
                color="primary"
                variant="solid"
                class="w-full sm:w-40 text-primary-500"
                @click="openTasksList"
              >
                <Icon name="lucide:plus" class="h-4 w-4" />
                <span>Add Task</span>
              </BaseButton>
            </div>

            <div>
              <BaseCard shape="curved" class="flex items-center gap-2 p-3">
                <BaseIconBox
                  size="sm"
                  class="bg-info-100 text-info-500 dark:bg-info-500/20 dark:text-info-400 dark:border-info-500 dark:border-2"
                  shape="full"
                >
                  <Icon name="fluent:task-list-square-ltr-24-regular" class="h-5 w-5" />
                </BaseIconBox>

                <div>
                  <BaseHeading
                    as="h2"
                    size="lg"
                    weight="semibold"
                    lead="tight"
                    class="text-muted-800 dark:text-white"
                  >
                    <span>{{ addedTasks.length }}</span>
                  </BaseHeading>

                  <BaseParagraph size="xs">
                    <span class="text-muted-500 dark:text-muted-400">Total tasks</span>
                  </BaseParagraph>
                </div>
              </BaseCard>
            </div>
          </div>

          <div>
            <div class="mt-4">
              <div v-if="addedTasks.length === 0">
                <BasePlaceholderPage
                  title="No tasks added."
                  subtitle="Please use the 'Add Task' button to schedule new tasks on this calendar."
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
                <FlexTableRow
                  v-for="(task, index) in addedTasks"
                  :key="index"
                  shape="rounded"
                  spaced
                >
                  <template #start>
                    <FlexTableStart
                      label="Task"
                      :hide-label="index > 0"
                      :title="task.name"
                      :subtitle="task.code"
                      :picture="getImageUrl(task.thumbnail)"
                    />
                  </template>

                  <template #end>
                    <FlexTableCell
                      label="Game"
                      :hide-label="index > 0"
                      class="w-full sm:w-40 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ task.games[0]?.name }}
                      </span>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Segments"
                      :hide-label="index > 0"
                      class="w-full sm:w-48 lg:!justify-start"
                    >
                      <div class="flex gap-2 flex-wrap">
                        <BaseTag rounded="md" size="sm" v-for="segment in task.segments">
                          {{ segment?.name }}
                        </BaseTag>
                      </div>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Difficulty"
                      :hide-label="index > 0"
                      class="w-full sm:w-28 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ task.difficulty }}
                      </span>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Created"
                      :hide-label="index > 0"
                      class="w-full sm:w-32 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ formatDate(task.created_at) }}
                      </span>
                    </FlexTableCell>

                    <FlexTableCell label="action" :hide-label="index > 0">
                      <BaseButtonAction color="danger" @click="removeAddedTasks(task)">
                        <span>Remove</span>
                      </BaseButtonAction>
                    </FlexTableCell>
                  </template>
                </FlexTableRow>
              </div>
            </div>
          </div>
        </TairoFormGroup>
      </div>
    </BaseCard>

    <!-- Add task modal component -->
    <div>
      <AddTasksModal
        v-if="isModalAddTaskOpen"
        :isOpen="isModalAddTaskOpen"
        :remainingTasks="remainingTasks"
        @addTasks="addTasks"
        @close="closeModal"
      />
    </div>
  </div>
</template>
