<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Add Task (Webinar)',
  path: '/tasks/add-webinar',
  middleware: ['auth'],
})

const segmentName = 'Academic Center'
const pageName = 'Add New Task'
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

const isAlphabeticalWithSpaces = (value: string) => /^[A-Za-z\s]+$/.test(value)

const skillsSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  url: z.string().min(1, 'Skill URL is required'),
})

const scoresSchema = z.object({
  section_name: z
    .string()
    .min(1, 'Section name is required')
    .refine((value) => isAlphabeticalWithSpaces(value), {
      message: 'Please provide a valid section name',
    }),

  score: z
    .string()
    .min(1, 'Score is required')
    .refine(
      (value) => {
        const intValue = parseInt(value)
        return intValue >= 0 && intValue <= 100
      },
      {
        message: 'Score must be a numerical value between 0 and 100',
      },
    ),
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
    category: z.string().min(1, 'Category is required'),
    calendar: z.string().min(1, 'Term calendar is required'),
    main_banner: z.string().min(1, 'Task main banner is required'),
    thumbnail: z.string().min(1, 'Thumbnail image is required'),
  }),
  introduction_topic: z.object({
    age: z.string().min(1, 'Age is required'),
    about_topic: z.string().min(1, 'Brief about the topic is required'),
    impact: z.string().min(1, 'Impact on student education is required'),
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
  skills_learning: z.object({
    description: z.string().min(1, 'Section description is required'),
    skills: z.array(skillsSchema),
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
  scoring_direction: z.object({
    description: z.string().min(1, 'Section description is required'),
    direction: z.string().min(1, 'Task direction is required'),
    scores: z.array(scoresSchema),
    awards: z.string().min(1, 'Awards is required'),
    image: z.string().min(1, 'Image is required'),
    score: z
      .string()
      .min(1, 'Score is required')
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
  webinar_video: z.object({
    description: z.string().min(1, 'Section description is required'),
    video_title: z.string().min(1, 'Video title is required'),
    video_url: z.string().min(1, 'Video URL is required'),
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

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  task_details: {
    name: '',
    category: '',
    calendar: '',
    main_banner: '',
    thumbnail: '',
  },
  introduction_topic: {
    age: '',
    about_topic: '',
    impact: '',
    image: '',
    score: '',
  },
  skills_learning: {
    description: '',
    skills: [
      {
        name: '',
        url: '',
      },
    ],
    image: '',
    score: '',
  },
  scoring_direction: {
    description: '',
    direction: '',
    scores: [
      {
        section_name: '',
        score: '',
      },
    ],
    awards: '',
    image: '',
    score: '',
  },
  webinar_video: {
    description: '',
    video_title: '',
    video_url: '',
    image: '',
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

const router = useRouter()
const success = ref(false)

const isModalSuccess = ref(false)
const isModalError = ref(false)
const modalContent = ref('')

const goToTasks = () => {
  router.push('/tasks')
}

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const taskCategory = ref(['Esports industry', 'Career opportunities'])
const termCalendar = ref(['EECA-1', 'EECA-2', 'EECA-3'])
const games = ref(['Game 1', 'Game 2', 'Game 3', 'Game 4'])
const difficulty = ref(['Basic', 'Advanced', 'Expert'])
const age = ref(['7', '8', '9', '10', '11', '12', '13', '14'])
const skills = ref(['Skill 1', 'Skill 2', 'Skill 3'])

const checkTotalScores = () => {
  const sections = [
    'introduction_topic',
    'skills_learning',
    'scoring_direction',
    'webinar_video',
    'knowledge_qa',
  ]

  const totalScore = sections.reduce((acc, section) => {
    const sectionScore = parseInt(values[section].score)
    return acc + (isNaN(sectionScore) ? 0 : sectionScore)
  }, 0)

  return totalScore === 100
}

const onSubmit = handleSubmit(async (values) => {
  try {
    success.value = false

    if (!checkTotalScores()) {
      throw new Error('Sum of all scores must be equal to 100')
    }

    alert(JSON.stringify(values))

    const { error } = await useFetch('/api/add-user', {
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

    openModal('success', 'Task created successfully!')

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

const listOfSkills = ref<{ name: string; url: string }[]>([
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
  if (listOfSkills.value.length < 10) {
    listOfSkills.value.push(newSkill)
  }
}

const removeSkills = (index: number) => {
  if (values.skills_learning?.skills) {
    const updatedSkills = [...values.skills_learning?.skills]
    updatedSkills.splice(index, 1)
    listOfSkills.value = updatedSkills
    setFieldValue('skills_learning.skills', listOfSkills.value)
  }
}

const scoreTable = ref<{ section_name: string; score: string }[]>([
  {
    section_name: '',
    score: '',
  },
])

const addScores = () => {
  const newScore = {
    section_name: '',
    score: '',
  }
  if (scoreTable.value.length < 6) {
    scoreTable.value.push(newScore)
  }
}

const removeScores = (index: number) => {
  if (values.scoring_direction?.scores) {
    const updatedScores = [...values.scoring_direction?.scores]
    updatedScores.splice(index, 1)
    scoreTable.value = updatedScores
    setFieldValue('scoring_direction.scores', scoreTable.value)
  }
}

const questions = ref<
  {
    question: string
    answer_1: string
    answer_2: string
    answer_3: string
    answer_4: string
    correct_ans: string
  }[]
>([
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
  if (questions.value.length < 4) {
    questions.value.push(newQuestion)
  }
}

const removeQuestions = (index: number) => {
  if (values.knowledge_qa?.questions) {
    const updatedQuestions = [...values.knowledge_qa?.questions]
    updatedQuestions.splice(index, 1)
    questions.value = updatedQuestions
    setFieldValue('knowledge_qa.questions', questions.value)
  }
}

const fileFolder = ref('')
const isMediaModalOpen = ref(false)
const uploadField = ref('')

const addBanner = (field: any) => {
  uploadField.value = field
  fileFolder.value = 'Admin Banners'
  isMediaModalOpen.value = true
}

const addThumbnail = (field: any) => {
  uploadField.value = field
  fileFolder.value = 'Admin Thumbnails'
  isMediaModalOpen.value = true
}

const addImage = (url, folder) => {
  isMediaModalOpen.value = false
  if (folder === 'Admin Banners') {
    setFieldValue(uploadField.value, url)
  } else {
    setFieldValue(uploadField.value, url)
  }
  uploadField.value = ''
}

const removeBanner = (field: any) => {
  setFieldValue(field, '')
}

const removeThumbnail = (field: any) => {
  setFieldValue(field, '')
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addTaskBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
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
          <BaseButton class="w-24" to="/tasks">Cancel</BaseButton>
          <BaseButton v-if="create" type="submit" color="primary" @submit.prevent="onSubmit">
            Create Task</BaseButton
          >
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

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="task_details.category"
                >
                  <BaseListbox
                    label="Category"
                    :items="taskCategory"
                    placeholder="Select category"
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
                    :items="termCalendar"
                    placeholder="Search calendar"
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
                <label class="nui-label pb-2 text-[0.825rem] w-full">Task main banner</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.task_details?.main_banner">
                  <BaseButton color="primary" @click="addBanner('task_details.main_banner')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.task_details?.main_banner"
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
                        @click.prevent="removeBanner('task_details.main_banner')"
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
                    name="task_details.main_banner"
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
                  <BaseButton color="primary" @click="addThumbnail('task_details.thumbnail')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.task_details?.thumbnail"
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

      <!-- INTRODUCTION FOR THE TOPIC -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Introduction for the topic">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_topic.about_topic"
                >
                  <CustomQuillEditor
                    fieldName="introduction_topic.about_topic"
                    label="Brief about the topic"
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
                  name="introduction_topic.age"
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

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="introduction_topic.impact"
                >
                  <CustomQuillEditor
                    fieldName="introduction_topic.impact"
                    label="Impact on student education"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
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

                <div v-if="!values.introduction_topic?.image">
                  <BaseButton color="primary" @click="addBanner('introduction_topic.image')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.introduction_topic?.image"
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
                        @click.prevent="removeBanner('introduction_topic.image')"
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
                    name="introduction_topic.image"
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
                    name="introduction_topic.score"
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

      <!-- SKILLS AND LEARNING -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Skills and learning">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="skills_learning.description"
                >
                  <CustomQuillEditor
                    fieldName="skills_learning.description"
                    label="Section description"
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
                    <div class="col-span-12 sm:col-span-5">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        :name="`skills_learning.skills[${index}].name`"
                      >
                        <BaseAutocomplete
                          :items="skills"
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

                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        :name="`skills_learning.skills[${index}].url`"
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
                <label class="nui-label pb-2 text-[0.875rem] w-full">Section image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.skills_learning?.image">
                  <BaseButton color="primary" @click="addBanner('skills_learning.image')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.skills_learning?.image"
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
                        @click.prevent="removeBanner('skills_learning.image')"
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
                    name="skills_learning.image"
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
                    name="skills_learning.score"
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

      <!-- SCORING AND DIRECTION -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Scoring and direction">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="scoring_direction.description"
                >
                  <CustomQuillEditor
                    fieldName="scoring_direction.description"
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
                  name="scoring_direction.direction"
                >
                  <CustomQuillEditor
                    fieldName="scoring_direction.direction"
                    label="Task direction"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.875rem] w-full">Score table</label>
                <div v-for="(score, index) in scoreTable" :key="index">
                  <div class="grid grid-cols-12 mb-3 sm:gap-4">
                    <div class="col-span-12 sm:col-span-8">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        :name="`scoring_direction.scores[${index}].section_name`"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          placeholder="Section name"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 sm:col-span-3">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        :name="`scoring_direction.scores[${index}].score`"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          placeholder="Score"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 sm:col-span-1">
                      <BaseButtonIcon
                        v-if="index === 0 && scoreTable.length === 1"
                        color="primary"
                        class="w-full"
                        @click="addScores"
                      >
                        <Icon name="lucide:plus" class="size-5" />
                      </BaseButtonIcon>

                      <BaseButtonIcon
                        v-if="index === scoreTable.length - 1 && scoreTable.length > 1"
                        color="primary"
                        class="w-full"
                        @click="addScores"
                      >
                        <Icon name="lucide:plus" class="size-5" />
                      </BaseButtonIcon>

                      <BaseButtonIcon
                        v-else-if="scoreTable.length > 1"
                        color="danger"
                        class="w-full"
                        @click="removeScores(index)"
                      >
                        <Icon name="lucide:minus" class="size-5" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="scoring_direction.awards"
                >
                  <CustomQuillEditor
                    fieldName="scoring_direction.awards"
                    label="Awards"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
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

                <div v-if="!values.scoring_direction?.image">
                  <BaseButton color="primary" @click="addBanner('scoring_direction.image')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.scoring_direction?.image"
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
                        @click.prevent="removeBanner('scoring_direction.image')"
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
                    name="scoring_direction.image"
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
                    name="scoring_direction.score"
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

      <!-- WEBINAR VIDEO -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8 py-12">
          <TairoFormGroup label="Webinar video">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="webinar_video.description"
                >
                  <CustomQuillEditor
                    fieldName="webinar_video.description"
                    label="Section description"
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
                  name="webinar_video.video_title"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="material-symbols-light:title"
                    label="Video title"
                    placeholder="Video title"
                    autocomplete="off"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="webinar_video.video_url"
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

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Section image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.webinar_video?.image">
                  <BaseButton color="primary" @click="addBanner('webinar_video.image')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.webinar_video?.image"
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
                        @click.prevent="removeBanner('webinar_video.image')"
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
                    name="webinar_video.image"
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
                    name="webinar_video.score"
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
                        >Question {{ index + 1 }}</label
                      >

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
                  <BaseButton color="primary" @click="addBanner('knowledge_qa.image')">
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
                          class="size-14 rounded-md object-cover object-center w-16"
                          :src="values.knowledge_qa?.image"
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
          <BaseButton v-if="create" type="submit" color="primary"> Create Task</BaseButton>
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
