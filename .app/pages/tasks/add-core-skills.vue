<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Add Task New (Core Skills)',
  path: '/tasks/add-core-skills',
  middleware: ['auth'],
})

const router = useRouter()
const auth = useAuthStore()

const segmentName = 'Academic Center'
const pageName = 'Add New Task'
const { view, create, approve } = await usePermissionChecker(segmentName, pageName)

watchEffect(() => {
  if (!view && auth.isLoggedIn) {
    showErrorToast('Oops!', "Sorry, You don't have View permission for this page! ")
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }
})

const addTaskBreadcrumb = [
  {
    label: 'Tasks',
    hideLabel: false,
    to: '/tasks',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const skillsSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  url: z.string().optional(),
})

const consoleSchema = z.object({
  url: z.string().min(1, { message: 'Console URL is required' }),
})

const questionsSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer_1: z.string().min(1, 'Answer 1 is required'),
  answer_2: z.string().min(1, 'Answer 2 is required'),
  answer_3: z.string().min(1, 'Answer 3 is required'),
  answer_4: z.string().min(1, 'Answer 4 is required'),
  correct_ans: z
    .string()
    .min(1, 'Correct answer is required')
    .refine(
      (value) => {
        const intValue = parseInt(value)
        return intValue >= 1 && intValue <= 4
      },
      {
        message: 'Correct answer must be a numerical value between 1 and 4',
      },
    ),
})

const zodSchema = z.object({
  task_details: z.object({
    name: z.string().min(1, 'Task name is required'),
    description: z.string().min(1, 'Description is required'),
    category: z
      .array(
        z
          .object({
            id: z.string().min(1, 'Category is required'),
          })
          .refine((value) => value?.id, {
            message: 'Category is required',
          }),
      )
      .refine((value) => value.length > 0, {
        message: 'At least one category is required',
      }),
    // calendar: z.array(z.string()).refine((value) => value.length > 0, {
    //   message: 'At least one calendar is required',
    // }),
    calendar: z.array(z.string()),
    banner: z.string().min(1, 'Task main banner is required'),
    thumbnail: z.string().min(1, 'Thumbnail image is required'),
  }),

  introduction_game: z.object({
    game: z.string().min(1, 'Game is required'),
    age: z.string().min(1, 'Age is required'),
    difficulty: z.string().min(1, 'Difficulty level is required'),
    about_game: z.string().min(1, 'Brief about the game is required'),
    video_url: z.string(),
    console_description: z.string().min(1, 'Gaming console description is required'),
    consoles: z.array(consoleSchema),
    image: z.string().min(1, 'Section image is required'),
    score: z
      .string()
      .min(1, 'Section score is required')
      .refine(
        (value) => {
          const intValue = parseInt(value)
          return intValue >= 0 && intValue <= 100
        },
        {
          message: 'Score must be a numerical value between 0 and 100',
        },
      ),
  }),

  core_learning: z.object({
    introduction: z.string().min(1, 'Section introduction is required'),
    activity_introduction: z.string().min(1, 'Activity instruction is required'),
    direction_to_submit: z.string().min(1, 'Direction to submit your work is required'),
    video_url: z.string().min(1, 'Video URL is required'),
    description: z.string().min(1, 'Description is required'),
    skills: z.array(skillsSchema),
    skill_description: z.string().min(1, 'Skills description is required'),
    score: z
      .string()
      .min(1, 'Section score is required')
      .refine(
        (value) => {
          const intValue = parseInt(value)
          return intValue >= 0 && intValue <= 100
        },
        {
          message: 'Score must be a numerical value between 0 and 100',
        },
      ),
  }),

  knowledge_qa: z.object({
    description: z.string().min(1, 'Section description is required'),
    questions: z.array(questionsSchema),
    image: z.string().min(1, 'Section image is required'),
    score: z
      .string()
      .min(1, 'Section score is required')
      .refine(
        (value) => {
          const intValue = parseInt(value)
          return intValue >= 0 && intValue <= 100
        },
        {
          message: 'Score must be a numerical value between 0 and 100',
        },
      ),
  }),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  task_details: {
    name: '',
    description: '',
    category: [],
    calendar: [],
    banner: '',
    thumbnail: '',
  },
  introduction_game: {
    game: '',
    age: '',
    difficulty: '',
    about_game: '',
    video_url: '',
    console_description: '',
    consoles: [],
    image: '',
    score: '',
  },
  core_learning: {
    description: '',
    introduction: '',
    activity_introduction: '',
    direction_to_submit: '',
    video_url: '',
    skill_description: '',
    skills: [],
    score: '',
  },
  knowledge_qa: {
    description: '',
    questions: [
      {
        question: '',
        answer_1: '',
        answer_2: '',
        answer_3: '',
        answer_4: '',
        correct_ans: '',
      },
    ],
    image: '',
    score: '',
  },
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

const success = ref(false)
const isModalError = ref(false)
const isModalSuccess = ref(false)

const modalContent = ref('')
const questionsLengthErr = ref('')

const openModal = (type, content) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const games = ref(null)
const skills = ref(null)
const consoles = ref(null)
const segments = ref(null)
const calendars = ref(null)

const checkTotalScores = () => {
  const sections = ['introduction_game', 'core_learning', 'knowledge_qa']

  const totalScore = sections.reduce((acc, section) => {
    const sectionScore = parseInt(values[section].score)
    return acc + (isNaN(sectionScore) ? 0 : sectionScore)
  }, 0)

  return totalScore === 100
}

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

const getCalendars = async () => {
  const { data, error } = await useApiFetch('/api/admin/all-calendars')

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch Calendars, please try again!')
  }

  return data
}

const getData = async () => {
  try {
    const [segmentsData, skillsData, gamesData, calendarsData] = await Promise.all([
      getSegments(),
      getSkills(),
      getGames(),
      getCalendars(),
    ])

    // Process segments data
    segments.value = segmentsData.value

    // Process skills data
    skills.value = skillsData.value

    // Process games data
    games.value = gamesData.value

    // Process calendars data
    calendars.value = calendarsData.value
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
}
await getData()

const calendarList = computed(() =>
  calendars?.value.map((item) => ({
    id: item.id,
    name: item.name,
  })),
)

const getIdFromName = (name, objsArr) => {
  const obj = objsArr?.find((item) => item?.name === name)
  return obj ? obj?.id : null
}

const getCombinedSkills = (skills, values) => {
  if (!Array.isArray(skills)) {
    return []
  }

  const combinedSkills = skills.map((skill) => {
    const matchedSkill = values?.core_learning?.skills.find((s) => s.name === skill.name)

    if (matchedSkill) {
      return {
        name: skill.name,
        banner: skill.banner,
        icon: skill.icon,
        description: skill.description,
      }
    }
  })

  const filteredSkills = combinedSkills.filter((skill) => skill !== undefined)
  return filteredSkills
}

const createBodyObject = (values, combinedSkills, skillsData, gamesData, calendarsData) => {
  const gamingConsoles = {
    name: 'Gaming Consoles',
    description: values?.introduction_game?.console_description,
    consoles: consoles.value.map((console, index) => ({
      url: values?.introduction_game?.consoles[index].url,
      console: console.name,
      icon: getConsoleByName(console.name),
    })),
  }

  const ConsoleWithName = {
    consoles: consoles.value.map((console, index) => ({
      url: values?.introduction_game?.consoles[index].url,
      name: console.name,
    })),
  }

  return {
    template: 'Core-Skills',
    name: values?.task_details?.name,
    description: values?.task_details?.description,
    banner: values?.task_details?.banner,
    thumbnail: values?.task_details?.thumbnail,
    difficulty: values?.introduction_game?.difficulty,
    age: values?.introduction_game?.age,

    sections: {
      introduction: {
        title: 'Introduction for the game',
        ...values?.introduction_game,
        impact: values?.task_details?.description,
        description: values?.introduction_game?.about_game,
        consoles: ConsoleWithName.consoles,
        gaming_consoles: gamingConsoles,
      },

      core_activity: {
        ...values?.core_learning,
        skills_and_development: {
          name: 'Skills & Learning',
          description: values?.core_learning?.skill_description,
          skills: combinedSkills,
        },
      },

      knowledge_qa: values?.knowledge_qa,
    },

    segments: values?.task_details?.category?.map((category) => ({
      segment_id: category?.id,
    })),

    skills: values?.core_learning?.skills?.map((skill) => ({
      skill_id: getIdFromName(skill?.name, skillsData),
    })),

    games: [
      {
        game_id: getIdFromName(values?.introduction_game?.game, gamesData),
      },
    ],

    calendars: values?.task_details?.calendar?.map((calendar) => ({
      calendar_id: getIdFromName(calendar, calendarsData),
    })),
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    if (values?.knowledge_qa.questions.length < 4) {
      questionsLengthErr.value = 'Add at least 4 questions and answers to create the task.'
      return
    }

    success.value = false

    if (!checkTotalScores()) {
      throw new Error('Sum of all scores must be equal to 100')
    }

    const combinedSkills = await getCombinedSkills(skills.value?.skills?.data, values)
    const body = createBodyObject(
      values,
      combinedSkills,
      skills.value?.skills?.data,
      games.value?.games?.data,
      calendars.value,
    )

    const { error } = await useApiFetch('/api/admin/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value)
    }

    // resetForm()

    if (approve) {
      openModal('success', `${values?.task_details.name} task has been created successfully!`)
    } else {
      openModal(
        'success',
        `${values?.task_details.name} task has been created successfully and will remain draft until approved by an admin`,
      )
    }

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 2000)
  } catch (error) {
    success.value = false
    openModal('error', `${error}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const validateQuestions = () => {
  if (values?.knowledge_qa.questions.length < 4) {
    questionsLengthErr.value = 'Add at least 4 questions and answers to create the task.'
  }
  onSubmit()
}

const listOfSkills = ref([
  {
    name: '',
    url: '',
  },
])

const addSkills = () => {
  const newSkill = {
    name: '',
    url: '',
  }

  if (listOfSkills.value.length < 25) {
    listOfSkills.value.push(newSkill)
  }
}

const removeSkills = (index) => {
  if (values.core_learning?.skills) {
    const updatedSkills = [...values.core_learning?.skills]
    updatedSkills.splice(index, 1)
    listOfSkills.value = updatedSkills
    setFieldValue('core_learning.skills', listOfSkills.value)
  }
}

const questions = ref([
  {
    question: '',
    answer_1: '',
    answer_2: '',
    answer_3: '',
    answer_4: '',
    correct_ans: '',
  },
])

const addQuestions = () => {
  const newQuestion = {
    question: '',
    answer_1: '',
    answer_2: '',
    answer_3: '',
    answer_4: '',
    correct_ans: '',
  }

  questions.value.push(newQuestion)
}

const removeQuestions = (index) => {
  if (values.knowledge_qa?.questions) {
    const updatedQuestions = [...values.knowledge_qa?.questions]
    updatedQuestions.splice(index, 1)
    questions.value = updatedQuestions
    setFieldValue('knowledge_qa.questions', questions.value)
  }
}

const fileFolder = ref('')
const uploadField = ref('')
const isMediaModalOpen = ref(false)

const addBanner = (field, folder) => {
  uploadField.value = field
  fileFolder.value = folder
  isMediaModalOpen.value = true
}

const addThumbnail = (field, folder) => {
  uploadField.value = field
  fileFolder.value = folder
  isMediaModalOpen.value = true
}

const addImage = (image) => {
  isMediaModalOpen.value = false
  setFieldValue(uploadField.value, image)
  uploadField.value = ''
  fileFolder.value = ''
}

const removeBanner = (field) => {
  setFieldValue(field, '')
}

const removeThumbnail = (field) => {
  setFieldValue(field, '')
}

const consolesList = ref([
  {
    name: 'Android',
    subText: '(Mobile/Tablet)',
    icon: 'uil:android-alt',
  },
  {
    name: 'Apple',
    subText: '(Mobile/Tablet)',
    icon: 'mingcute:apple-line',
  },
  {
    name: 'PC/Laptop',
    subText: '(Microsoft)',
    icon: 'streamline:computer-logo-windows-2-os-system-microsoft',
  },
  {
    name: 'Xbox',
    subText: '',
    icon: 'tabler:brand-xbox',
  },
  {
    name: 'PlayStation',
    subText: '',
    icon: 'ri:playstation-line',
  },
])

const getConsoleByName = (name) => {
  const console = consolesList.value.find(
    (console) => console.name.toLowerCase() === name.toLowerCase(),
  )
  return console ? console.icon : null
}

const isCancelModalOpen = ref(false)

const goToTasks = () => {
  isModalSuccess.value = false
  isCancelModalOpen.value = false

  if (auth.user.role == 'Super Admin') {
    router.push('/tasks')
  } else {
    router.push({ name: 'tasks', query: { toDraft: 'true' } })
  }
}

const cancelCreate = () => {
  if (meta.value.dirty) {
    isCancelModalOpen.value = true
  } else {
    router.push('/tasks')
  }
}

const clearGame = () => {
  setFieldValue('introduction_game.game', '')
}

watch(
  () => values?.introduction_game?.game,
  async (value) => {
    if (value) {
      const gameId = await getIdFromName(value, games?.value?.games?.data)
      consoles.value = games?.value?.games?.data.find((game) => game.id === gameId).game_consoles
    }
  },
)

watch(
  questions,
  (newValue) => {
    if (newValue.length > 3) {
      questionsLengthErr.value = ''
    } else {
      questionsLengthErr.value = 'Add at least 4 questions and answers to create the task.'
    }
  },
  { deep: true },
)

const termCalendar = ref(['EECA-1', 'EECA-2', 'EECA-3'])
const difficulty = ref(['Basic', 'Advanced', 'Expert'])
const age = ref(['7', '8', '9', '10', '11', '12', '13', '14'])
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addTaskBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="validateQuestions">
      <div class="flex gap-8 items-start justify-between px-8 py-8 pb-4">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Create a task
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Customize user access and permissions for each segment
          </BaseText>

          <BaseMessage
            class="mt-10"
            v-if="fieldsWithErrors"
            type="danger"
            @close="() => setErrors({})"
          >
            This form has {{ fieldsWithErrors }} errors, please check them before submitting
          </BaseMessage>
        </div>

        <div class="hidden sm:flex items-center gap-2">
          <BaseButton class="w-24" @click="cancelCreate">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" @submit.prevent="validateQuestions">
            Create Task
          </BaseButton>
        </div>
      </div>

      <!-- TASK DETAILS -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Task details">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="task_details.name"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="material-symbols-light:task-outline"
                    label="Task Name"
                    placeholder="Task name"
                    autocomplete="off"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="task_details.description"
                >
                  <CustomQuillEditor
                    fieldName="task_details.description"
                    label="Description"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="task_details.category"
                >
                  <BaseListbox
                    label="Category"
                    :items="segments?.segments?.data"
                    :properties="{ value: 'id', label: 'name' }"
                    multiple
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="task_details.calendar"
                >
                  <BaseAutocomplete
                    label="Term calendar"
                    :items="calendarList.map((c) => c.name)"
                    placeholder="Search calendar"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :class="errorMessage ? 'error-border' : ''"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    multiple
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Task main banner</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.task_details?.banner">
                  <BaseButton
                    color="primary"
                    @click="addBanner('task_details.banner', 'admin_banners/task_banners')"
                  >
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Main Banner</span>
                  </BaseButton>
                </div>

                <div v-else>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16 h-16"
                          :src="getImageUrl(values.task_details?.banner)"
                          alt="Image preview"
                        />
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="removeBanner('task_details.banner')"
                      >
                        <Icon name="lucide:x" class="size-4" />
                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="task_details.banner"
                  >
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

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Thumbnail image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.task_details?.thumbnail">
                  <BaseButton
                    color="primary"
                    @click="addThumbnail('task_details.thumbnail', 'admin_thumbnails')"
                  >
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Thumbnail Image</span>
                  </BaseButton>
                </div>

                <div v-else>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16 h-16"
                          :src="getImageUrl(values.task_details?.thumbnail)"
                          alt="Image preview"
                        />
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="removeThumbnail('task_details.thumbnail')"
                      >
                        <Icon name="lucide:x" class="size-4" />
                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="task_details.thumbnail"
                  >
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
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- INTRODUCTION TO THE GAME -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Introduction to the game">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12 relative">
                <BaseButtonClose
                  v-if="values.introduction_game.game"
                  size="sm"
                  rounded="sm"
                  color="muted"
                  class="close-btn-auto"
                  @click="clearGame"
                />
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_game.game"
                >
                  <BaseAutocomplete
                    label="Game"
                    :items="games?.games?.data?.map((game) => game.name)"
                    placeholder="Search game"
                    :model-value="[field.value]"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :class="errorMessage ? 'error-border' : ''"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_game.age"
                >
                  <BaseListbox
                    label="Age appropriate"
                    :items="age"
                    placeholder="Select age"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_game.difficulty"
                >
                  <BaseListbox
                    label="Difficulty level"
                    :items="difficulty"
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
                  name="introduction_game.about_game"
                >
                  <CustomQuillEditor
                    fieldName="introduction_game.about_game"
                    label="Brief about the game"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_game.video_url"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="material-symbols:link"
                    label="Trailer video URL"
                    placeholder="Video URL"
                    autocomplete="off"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_game.console_description"
                >
                  <CustomQuillEditor
                    fieldName="introduction_game.console_description"
                    label="Gaming console description"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div v-if="consoles?.length > 0" class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Gaming consoles</label>
                <div>
                  <div
                    v-for="(console, index) in consoles"
                    :key="index"
                    class="grid grid-cols-12 mb-3 sm:gap-4"
                  >
                    <div class="col-span-12 sm:col-span-3 flex items-center">
                      <BaseText
                        size="sm"
                        class="text-muted-600 dark:text-muted-400 flex gap-2 items-center"
                      >
                        <Icon :name="getConsoleByName(console.name)" class="w-5 h-5" />
                        <span>{{ console.name }} :</span>
                      </BaseText>
                    </div>

                    <div class="col-span-12 sm:col-span-9">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        :name="`introduction_game.consoles[${index}].url`"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          placeholder="URL"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Section image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.introduction_game?.image">
                  <BaseButton
                    color="primary"
                    @click="addBanner('introduction_game.image', 'admin_banners/task_games')"
                  >
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>

                <div v-else>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16 h-16"
                          :src="getImageUrl(values.introduction_game?.image)"
                          alt="Image preview"
                        />
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="removeBanner('introduction_game.image')"
                      >
                        <Icon name="lucide:x" class="size-4" />
                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="introduction_game.image"
                  >
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

              <div class="col-span-12 sm:col-span-6">
                <BaseButtonGroup>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="introduction_game.score"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="material-symbols:readiness-score-outline-sharp"
                      label="Section score"
                      placeholder="Section score"
                      autocomplete="off"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                    <BaseButton class="mt-[24px]" color="muted">
                      <span>%</span>
                    </BaseButton>
                  </Field>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- CORE LEARNING ACTIVITY -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Core learning activity">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="core_learning.description"
                >
                  <CustomQuillEditor
                    fieldName="core_learning.description"
                    label="Section description"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="core_learning.introduction"
                >
                  <CustomQuillEditor
                    fieldName="core_learning.introduction"
                    label="Section introduction"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="core_learning.activity_introduction"
                >
                  <CustomQuillEditor
                    fieldName="core_learning.activity_introduction"
                    label="Activity instruction"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="core_learning.direction_to_submit"
                >
                  <CustomQuillEditor
                    fieldName="core_learning.direction_to_submit"
                    label="Direction to submit your work"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="core_learning.video_url"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="material-symbols:link"
                    label="Video URL"
                    placeholder="Video URL"
                    autocomplete="off"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="core_learning.skill_description"
                >
                  <CustomQuillEditor
                    fieldName="core_learning.skill_description"
                    label="Skills description"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.875rem] w-full">List of skills</label>
                <div v-for="(skill, index) in listOfSkills" :key="index">
                  <div class="grid grid-cols-12 mb-3 sm:gap-4">
                    <div class="col-span-12 sm:col-span-11">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        :name="`core_learning.skills[${index}].name`"
                      >
                        <BaseAutocomplete
                          :items="skills?.skills?.data?.map((skill) => skill.name)"
                          placeholder="Search skill"
                          :model-value="[field.value]"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          class="sa-group-skills"
                          :class="errorMessage ? 'error-border' : ''"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 sm:col-span-1">
                      <BaseButtonIcon
                        v-if="index === 0 && listOfSkills.length === 1"
                        color="primary"
                        class="w-full"
                        @click="addSkills"
                      >
                        <Icon name="lucide:plus" class="size-5" />
                      </BaseButtonIcon>

                      <BaseButtonIcon
                        v-if="index === listOfSkills.length - 1 && listOfSkills.length > 1"
                        color="primary"
                        class="w-full"
                        @click="addSkills"
                      >
                        <Icon name="lucide:plus" class="size-5" />
                      </BaseButtonIcon>

                      <BaseButtonIcon
                        v-else-if="listOfSkills.length > 1"
                        color="danger"
                        class="w-full"
                        @click="removeSkills(index)"
                      >
                        <Icon name="lucide:minus" class="size-5" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <BaseButtonGroup>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="core_learning.score"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="material-symbols:readiness-score-outline-sharp"
                      label="Section score"
                      placeholder="Section score"
                      autocomplete="off"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                    <BaseButton class="mt-[24px]" color="muted">
                      <span>%</span>
                    </BaseButton>
                  </Field>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- Q & A -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Apply your knowledge - Q & A">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="knowledge_qa.description"
                >
                  <CustomQuillEditor
                    fieldName="knowledge_qa.description"
                    label="Section description"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Questions and answers</label>

                <TairoFormGroup>
                  <div v-for="(question, index) in questions" :key="index">
                    <div class="p-8 bg-muted-100 dark:bg-muted-700 rounded mb-4">
                      <label
                        class="nui-label pb-2 text-[0.825rem] lg:mb-2 min-w-fit text-primary-500 font-bold"
                      >
                        Question {{ index + 1 }}
                      </label>

                      <div class="grid grid-cols-12 gap-6">
                        <div class="col-span-12 sm:col-span-12">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            :name="`knowledge_qa.questions[${index}].question`"
                          >
                            <BaseInput
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              type="text"
                              icon="material-symbols:help-outline"
                              label="Question"
                              placeholder="Question"
                              autocomplete="off"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </div>

                        <div class="col-span-12 sm:col-span-6">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            :name="`knowledge_qa.questions[${index}].answer_1`"
                          >
                            <BaseInput
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              type="text"
                              icon="ri:question-answer-line"
                              label="Answer 1"
                              placeholder="Answer"
                              autocomplete="off"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </div>

                        <div class="col-span-12 sm:col-span-6">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            :name="`knowledge_qa.questions[${index}].answer_2`"
                          >
                            <BaseInput
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              type="text"
                              icon="ri:question-answer-line"
                              label="Answer 2"
                              placeholder="Answer"
                              autocomplete="off"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </div>

                        <div class="col-span-12 sm:col-span-6">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            :name="`knowledge_qa.questions[${index}].answer_3`"
                          >
                            <BaseInput
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              type="text"
                              icon="ri:question-answer-line"
                              label="Answer 3"
                              placeholder="Answer"
                              autocomplete="off"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </div>

                        <div class="col-span-12 sm:col-span-6">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            :name="`knowledge_qa.questions[${index}].answer_4`"
                          >
                            <BaseInput
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              type="text"
                              icon="ri:question-answer-line"
                              label="Answer 4"
                              placeholder="Answer"
                              autocomplete="off"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </div>

                        <div class="col-span-12 sm:col-span-6">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            :name="`knowledge_qa.questions[${index}].correct_ans`"
                          >
                            <BaseInput
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              type="text"
                              icon="icon-park-outline:check-correct"
                              label="Correct answer"
                              placeholder="Answer number"
                              autocomplete="off"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </div>

                        <div class="col-span-12 sm:col-span-6 flex justify-end items-end">
                          <BaseButton
                            v-if="questions.length > 1"
                            color="primary"
                            class="w-24"
                            @click="removeQuestions(index)"
                          >
                            Remove
                          </BaseButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </TairoFormGroup>

                <span v-if="questionsLengthErr" class="custom-error">
                  {{ questionsLengthErr }}
                </span>

                <div class="flex items-center gap-2 mt-4">
                  <BaseButton class="w-full sm:w-40 text-primary-500" @click="addQuestions">
                    <Icon name="lucide:plus" class="h-4 w-4" />
                    <span>Add Question</span>
                  </BaseButton>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Section image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.knowledge_qa?.image">
                  <BaseButton
                    color="primary"
                    @click="addBanner('knowledge_qa.image', 'admin_banners/task_questions')"
                  >
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>

                <div v-else>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16 h-16"
                          :src="getImageUrl(values.knowledge_qa?.image)"
                          alt="Image preview"
                        />
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="removeBanner('knowledge_qa.image')"
                      >
                        <Icon name="lucide:x" class="size-4" />
                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="knowledge_qa.image"
                  >
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

              <div class="col-span-12 sm:col-span-6">
                <BaseButtonGroup>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="knowledge_qa.score"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      label="Section score"
                      icon="material-symbols:readiness-score-outline-sharp"
                      placeholder="Section score"
                      autocomplete="off"
                      :classes="{
                        wrapper: 'w-full',
                      }"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                    <BaseButton class="mt-[24px]" color="muted">
                      <span>%</span>
                    </BaseButton>
                  </Field>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- ACTION -->
      <div class="max-w-3xl p-8">
        <div class="flex items-center gap-2 pt-8 pb-8">
          <BaseButton class="w-24" to="/tasks">Cancel</BaseButton>
          <BaseButton type="submit" color="primary"> Create Task </BaseButton>
        </div>
      </div>
    </form>

    <BaseModal
      :isOpen="isModalSuccess"
      :title="'Operation Success'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="success"
      :showCancelButton="false"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Ok'"
      :primaryButtonAction="goToTasks"
      :cancelButtonText="'Cancel'"
      @close="isModalSuccess = false"
    >
      {{ modalContent }}
    </BaseModal>

    <BaseModal
      :isOpen="isModalError"
      :title="'Operation Failed'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="error"
      :showCancelButton="false"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Ok'"
      :primaryButtonAction="() => (isModalError = false)"
      :cancelButtonText="'Cancel'"
      @close="isModalError = false"
    >
      {{ modalContent }}
    </BaseModal>

    <BaseModal
      :isOpen="isCancelModalOpen"
      :title="'Cancel Operation'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="error"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Yes'"
      :primaryButtonAction="goToTasks"
      :cancelButtonText="'No'"
      @close="isCancelModalOpen = false"
    >
      Are you sure you want to cancel creating this task?
    </BaseModal>

    <MediaPopup
      v-if="isMediaModalOpen"
      :isOpen="isMediaModalOpen"
      :folder="fileFolder"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />
  </div>
</template>

<style scoped>
.custom-error {
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

.close-btn-auto {
  position: absolute;
  right: 8px !important;
  z-index: 9;
  top: 32px !important;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
