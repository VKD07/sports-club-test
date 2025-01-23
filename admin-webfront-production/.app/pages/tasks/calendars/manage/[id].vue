<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { refDebounced } from '@vueuse/core'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Calendar Manage',
  middleware: ['auth'],
})

const segmentName = 'Academic Center'
const pageName = 'Calender View'
const { _delete, _export, create, update, view, approve } = await usePermissionChecker(
  segmentName,
  pageName,
)

const auth = useAuthStore()

watchEffect(() => {
  if (!view && auth.isLoggedIn) {
    showErrorToast('Oops!', "Sorry, You don't have View permission for this page! ")
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }
})

interface Task {
  id: number
  taskName: string
  segment: string
  game: string
  difficulty: string
  src: string
}

const statusColor = (itemStatus: string) => {
  switch (itemStatus) {
    case 'Active':
      return 'success'
    case 'Inactive':
      return 'danger'
    case 'Draft':
      return 'warning'
    default:
      break
  }
}

const addCalendarBreadcrumb = [
  {
    label: 'Calendars',
    hideLabel: false,
    to: '/tasks/calendars',
  },
  {
    label: 'Edit',
    hideLabel: false,
  },
]

const zodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  term: z.string().min(1, 'Term is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  level: z.string().min(1, 'Level is required'),
  special_reference: z.string().min(1, 'Special reference is required'),
  banner: z.string().min(1, 'Banner is required'),
  tasks: z.array(
    z.object({
      task_id: z.string().min(1, 'Task ID is required'),
    }),
  ),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  name: '',
  academic_year: '',
  term: '',
  difficulty: '',
  level: '',
  special_reference: '',
  banner: '',
  tasks: [{ task_id: '123' }],
}))

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  values,
  errors,
  resetForm,
  setValues,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const route = useRoute()
const router = useRouter()
const toaster = useToaster()

const success = ref(false)

const isModalSuccess = ref(false)
const isModalError = ref(false)
const modalContent = ref('')

const isModalAddTaskOpen = ref(false)

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const filter = ref('')
const debounced = refDebounced(filter, 500)

const segment = ref('')
const difficulty = ref('')
const age = ref('')
const console = ref('')
const skill = ref([])
const game = ref([])

const handleSelectedValue = (dropdownId: number, value: string) => {
  if (dropdownId === 1) {
    segment.value = value
  } else if (dropdownId === 2) {
    difficulty.value = value
  } else if (dropdownId === 3) {
    age.value = value
  } else if (dropdownId === 4) {
    console.value = value
  }
}

const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    filter: debounced.value,
    segment: segment.value,
    skill: skill.value,
    game: game.value,
    difficulty: difficulty.value,
    age: age.value,
    console: console.value,
    perPage: perPage.value,
    page: page.value,
  }

  // Filter out properties with null or empty values
  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const tasks = ref<Task[]>([
  {
    id: 0,
    taskName: 'Math Quiz',
    segment: 'Core skills',
    game: 'Math Game 1',
    difficulty: 'Medium',
    src: '/img/avatars/1.svg',
  },
  {
    id: 1,
    taskName: 'Art Challenge',
    segment: 'Creative series',
    game: 'Art Game 1',
    difficulty: 'Hard',
    src: '/img/avatars/2.svg',
  },
  {
    id: 2,
    taskName: 'Strategy Workshop',
    segment: 'Coaching',
    game: 'Strategy Game 1',
    difficulty: 'Expert',
    src: '/img/avatars/3.svg',
  },
  {
    id: 3,
    taskName: 'Language Quiz',
    segment: 'Webinars',
    game: 'Language Game 1',
    difficulty: 'Easy',
    src: '/img/avatars/4.svg',
  },
  {
    id: 4,
    taskName: 'Language Quiz',
    segment: 'Webinars',
    game: 'Language Game 1',
    difficulty: 'Easy',
    src: '/img/avatars/5.svg',
  },
])

const {
  data: tasksList,
  pending,
  error,
  refresh,
} = await useApiFetch<{ data: Task[] } | null>('/api/admin/tasks', {
  query,
})

// Watch for changes in the query object and refetch data accordingly
watch(query, async (newQuery) => {
  const { data, error, refresh } = await useApiFetch<{ data: Task[] } | null>('/api/admin/tasks', {
    query: newQuery,
  })
  if (!error.value) {
    tasksList.value = data.value
  }
})

const addBanner = () => {
  setFieldValue('banner', '/img/apps/2.png')
}

const removeBanner = () => {
  setFieldValue('banner', '')
}

const onSubmit = handleSubmit(async (values) => {
  try {
    success.value = false

    alert(JSON.stringify(values))

    const { error } = await useFetch('/api/admin/calendars', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error) {
      throw new Error('Request failed! API not integrated')
    }

    resetForm()

    openModal('success', 'Category created successfully!')

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (error) {
    success.value = false
    openModal('error', `${error}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const years = ref(['1st', '2nd', '3rd', '4th', '5th'])
const terms = ref(['1st Term', '2nd Term', '3rd Term', '4th Term'])
const difficulties = ref(['Basic', 'Advanced', 'Expert'])

const segments = ref(['Core skills', 'Creative series', 'Coaching', 'Webinars'])
const skills = ref(['Skill 1', 'Skill 2', 'Skill 3'])
const games = ref(['Game 1', 'Game 2', 'Game 3'])
const ages = ref(['8', '9', '10', '11', '12'])
const consoles = ref(['Xbox', 'Play station', 'Nintendo', 'Desktop', 'Smart Phone'])

// Task popup
const addedTasks = ref<Task[]>([])
const selectedTasks = ref<Task[]>([])

const selectTasks = (task: Task) => {
  const taskIndex = selectedTasks.value.findIndex((t) => t.id === task.id)
  if (taskIndex === -1) {
    selectedTasks.value.push(task)
  } else {
    selectedTasks.value.splice(taskIndex, 1)
  }
}

const addTasks = () => {
  const taskIds = new Set(addedTasks.value.map((task: Task) => task.id))
  selectedTasks.value.forEach((task: Task) => {
    if (!taskIds.has(task.id)) {
      addedTasks.value.push(task)
      taskIds.add(task.id)
    }
  })
  selectedTasks.value = []

  const taskIdsArray = extractTaskIds(addedTasks.value)
  setFieldValue('tasks', taskIdsArray)

  isModalAddTaskOpen.value = false
}

const removeAddedTasks = (task: Task) => {
  const taskIndex = addedTasks.value.findIndex((t) => t.id === task.id)
  if (taskIndex !== -1) {
    addedTasks.value.splice(taskIndex, 1)
  }

  const taskIdsArray = extractTaskIds(addedTasks.value)
  setFieldValue('tasks', taskIdsArray)
}

const extractTaskIds = (tasks: Task[]): { task_id: string }[] => {
  return tasks.map((task) => ({ task_id: String(task.id) }))
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addCalendarBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <div class="flex flex-col md:flex-row gap-8 md:items-center justify-between px-8 pt-4 pb-0">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Edit {Calendar Name}
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Edit, update, and manage calendar. Confirm any changes by saving to maintain accurate
            data.
          </BaseText>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex gap-2 items-center mr-6 text-sm">
            Status
            <BaseTag :color="statusColor('Active')" shape="full" size="md" class="capitalize">
              Active
            </BaseTag>
          </div>
          <BaseDropdown
            v-if="_delete || approve"
            label="Action"
            orientation="end"
            size="md"
            class="add-dropdown small-dropdown"
          >
            <BaseDropdownItem v-if="approve" title="Approve" color="default" rounded="sm" />
            <BaseDropdownItem v-if="approve" title="Deactivate" color="default" rounded="sm" />
            <BaseDropdownItem v-if="approve" title="Activate" color="default" rounded="sm" />
            <BaseDropdownItem v-if="_delete" title="Delete" color="default" rounded="sm" />
          </BaseDropdown>

          <BaseButton class="w-24" @click="resetForm">Reset</BaseButton>
        </div>
      </div>

      <div class="mx-8 w-fit">
        <BaseMessage
          class="mt-10"
          v-if="fieldsWithErrors"
          type="danger"
          @close="() => setErrors({})"
        >
          This form has {{ fieldsWithErrors }} errors, please check them before submitting
        </BaseMessage>
      </div>

      <!-- CALENDAR DETAILS -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Calendar details" sublabel="Others deserve to know you more">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="name">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="material-symbols-light:calendar-month-outline"
                    label="Calendar Name"
                    placeholder="Calendar Name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="academic_year"
                >
                  <BaseListbox
                    label="Year"
                    :items="years"
                    placeholder="Select year"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="term">
                  <BaseListbox
                    label="Term"
                    :items="terms"
                    placeholder="Select term"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="difficulty">
                  <BaseListbox
                    label="Difficulty"
                    :items="difficulties"
                    placeholder="Select difficulty"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="special_reference"
                >
                  <CustomQuillEditor
                    fieldName="special_reference"
                    label="Special reference"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-1 text-[0.825rem] min-w-fit">Banner image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>JPEG or PNG only</span>
                </BaseParagraph>

                <div>
                  <BaseButton color="primary" @click="addBanner">
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Banner Image</span>
                  </BaseButton>
                </div>

                <div v-if="values.banner">
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.banner"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                          File name.jpg
                        </span>
                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="removeBanner"
                      >
                        <Icon name="lucide:x" class="size-4" />
                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="banner">
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="hidden"
                      autocomplete="off"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6 relative">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Level appropriate</label>
                <div class="grid grid-cols-2 gap-6 md:max-w-lg md:grid-cols-4 mt-1">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="level">
                    <BaseRadio
                      id="Primary"
                      label="Primary"
                      value="primary"
                      color="primary"
                      :classes="{
                        label: 'relative top-0.5 text-xs',
                      }"
                      :model-value="field.value"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />

                    <BaseRadio
                      id="Secondary"
                      label="Secondary"
                      value="secondary"
                      color="primary"
                      :classes="{
                        label: 'relative top-0.5 text-xs',
                      }"
                      :model-value="field.value"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                    <span class="custom-error-msg absolute top-[60px]"> {{ errorMessage }}</span>
                  </Field>
                </div>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- ADD TASK -->
      <BaseCard class="mt-6">
        <div class="p-8 py-12">
          <TairoFormGroup>
            <div>
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
                    @click="isModalAddTaskOpen = true"
                  >
                    <Icon name="lucide:plus" class="h-4 w-4" />
                    <span>Add Task</span></BaseButton
                  >
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

              <!-- TABLE -->
              <div class="mt-8">
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
                        :title="task.taskName"
                        :avatar="task.src"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Segment"
                        :hide-label="index > 0"
                        class="w-full sm:w-36 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task.segment }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Game"
                        :hide-label="index > 0"
                        class="w-full sm:w-44 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task.game }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Difficulty"
                        :hide-label="index > 0"
                        class="w-full sm:w-24 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ task.difficulty }}
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

      <!-- ACTION -->
      <div class="max-w-3xl p-8">
        <div class="flex items-center gap-2 pt-8 pb-8">
          <BaseButton class="w-24" to="/schools">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" class="w-24"> Update </BaseButton>
        </div>
      </div>

      <!-- Add Task Modal component -->
      <div>
        <TairoModal :open="isModalAddTaskOpen" size="3xl" @close="isModalAddTaskOpen = false">
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
                      Select and filter tasks to include in the calendar. Review your choices
                      carefully before finalizing the calendar creation.
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
                @click="isModalAddTaskOpen = false"
                class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
              />
            </div>
          </template>

          <!-- Body -->
          <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-96 lg:overflow-auto lg:max-h-none">
            <div class="lg:max-h-96">
              <div class="mt-4">
                <!-- Filter -->
                <div class="relative">
                  <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
                    <div
                      class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                    >
                      <div
                        class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:ps-2"
                      >
                        <BaseInput
                          v-model="filter"
                          icon="lucide:search"
                          placeholder="Search"
                          :classes="{
                            wrapper: 'w-full sm:w-full',
                          }"
                        />
                      </div>

                      <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
                        <CustomDropdown
                          :options="segments"
                          placeholder="Select segment"
                          @selected-value="handleSelectedValue(1, $event)"
                        />
                      </div>

                      <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2">
                        <CustomDropdown
                          :options="difficulties"
                          placeholder="Select difficulty"
                          @selected-value="handleSelectedValue(2, $event)"
                        />
                      </div>

                      <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2">
                        <CustomDropdown
                          :options="ages"
                          placeholder="Select age"
                          @selected-value="handleSelectedValue(3, $event)"
                        />
                      </div>
                    </div>

                    <div
                      class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
                    >
                      <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
                        <CustomDropdown
                          :options="consoles"
                          placeholder="Select console"
                          @selected-value="handleSelectedValue(4, $event)"
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
                          :items="skills"
                          placeholder="Search skill"
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
                        <BaseAutocomplete v-model="game" :items="games" placeholder="Search game" />
                      </div>
                    </div>
                  </BaseCard>
                </div>
              </div>

              <div>
                <div v-if="!pending && tasks?.length === 0">
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
                      v-for="(task, index) in tasks"
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
                            <BaseAvatar :src="task.src" size="sm" />

                            <div class="ms-3 leading-none">
                              <h4 class="font-sans text-sm font-medium">
                                {{ task.taskName }}
                              </h4>
                            </div>
                          </div>
                        </FlexTableCell>
                      </template>

                      <template #end>
                        <FlexTableCell
                          label="Segment"
                          :hide-label="index > 0"
                          class="w-full sm:w-36 lg:!justify-start"
                        >
                          <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                            {{ task.segment }}
                          </span>
                        </FlexTableCell>

                        <FlexTableCell
                          label="Game"
                          :hide-label="index > 0"
                          class="w-full sm:w-44 lg:!justify-start"
                        >
                          <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                            {{ task.game }}
                          </span>
                        </FlexTableCell>

                        <FlexTableCell
                          label="Difficulty"
                          :hide-label="index > 0"
                          class="w-full sm:w-24 lg:!justify-start"
                        >
                          <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                            {{ task.difficulty }}
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
                <BaseButton @click="isModalAddTaskOpen = false"> Cancel </BaseButton>
                <BaseButton color="primary" variant="solid" @click="addTasks">
                  Add Tasks
                </BaseButton>
              </div>
            </div>
          </template>
        </TairoModal>
      </div>
    </form>
  </div>
</template>

<style scoped>
.custom-error {
  margin-top: 1rem;
  display: block;
  font-family:
    Inter Variable,
    sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  line-height: 1;
  width: 300px;
  --tw-text-opacity: 1;
  color: rgb(225 29 72 / 1);
  color: rgb(225 29 72 / var(--tw-text-opacity));
}
</style>
