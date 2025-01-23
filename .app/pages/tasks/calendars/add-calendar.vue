<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Add New Calendar',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const addCalendarBreadcrumb = [
  {
    label: 'Calendars',
    hideLabel: false,
    to: '/tasks/calendars',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const zodSchema = z.object({
  name: z
    .string()
    .min(1, 'Calendar name is required')
    .refine((val) => /^[\w\s\-!@#$%^&*()+=\[\]{};':"\\|,.<>\/?]*$/.test(val), {
      message: 'Calendar name can only contain numbers, letters, and symbols',
    }),
  academic_year: z.string().min(1, 'Academic year is required'),
  term: z.string().min(1, 'Term is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  special_reference: z
    .string()
    .min(1, 'Special reference is required')
    .max(200, 'Special reference must be 200 characters or less'),
  type: z.string().min(1, 'Calendar type is required'),
  level: z.string().min(1, 'Level is required'),
  minimum_tasks: z
    .number({
      required_error: 'Minimum tasks is required',
      invalid_type_error: 'Minimum tasks must be a number',
    })
    .positive(),
  banner: z
    .string()
    .min(1, 'Banner is required')
    .refine((val) => val.endsWith('.jpg') || val.endsWith('.png'), {
      message: 'Banner must be a JPEG or PNG file',
    }),
  tasks: z.array(
    z.object({
      task_id: z.string().min(1, 'Task ID is required'),
    }),
  ),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  name: '',
  term: '',
  type: '',
  level: '',
  banner: '',
  difficulty: '',
  academic_year: '',
  special_reference: '',
  tasks: [],
  minimum_tasks: 0,
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

const folderName = ref('')
const modalContent = ref('')
const newCalendar = ref(null)
const refCalendarsAddTasks = ref(null)

const success = ref(false)
const isModalDraft = ref(false)
const isModalError = ref(false)
const isSaveToDraft = ref(false)
const isModalSuccess = ref(false)
const isMediaModalOpen = ref(false)
const isCancelModalOpen = ref(false)

const getIdFromName = (name, objsArr) => {
  const obj = objsArr?.find((item) => item?.name === name)
  return obj ? obj?.id : null
}

const openModal = (type, content) => {
  modalContent.value = content

  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const isTaskCountLess = () => {
  if (values?.tasks.length <= values.minimum_tasks) {
    return true
  }
  return false
}

let addedTaskCount = 0
let minimumTaskCount = 0

const onSubmit = handleSubmit(async (values) => {
  try {
    addedTaskCount = values?.tasks.length
    minimumTaskCount = values.minimum_tasks

    if (!isSaveToDraft.value && addedTaskCount < minimumTaskCount) {
      isModalDraft.value = true
      return
    }

    success.value = false

    const body = {
      name: values?.name,
      academic_year: getIdFromName(values?.academic_year, years?.value),
      term: getIdFromName(values?.term, terms?.value),
      difficulty: values?.difficulty,
      special_reference: values?.special_reference,
      type: values?.type,
      level: values?.level,
      task_limit: values?.minimum_tasks,
      banner: values?.banner,
      tasks: values?.tasks,
    }

    const { data, error } = await useApiFetch('/api/admin/calendars', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    resetForm()

    if (refCalendarsAddTasks.value) {
      refCalendarsAddTasks.value.clearTasksTable()
    }

    newCalendar.value = data.value?.data
    openModal('success', 'Your calendar has been created successfully!')

    success.value = true
    isSaveToDraft.value = false
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

const submitToDraft = () => {
  isModalDraft.value = false
  isSaveToDraft.value = true
  onSubmit()
}

const addBanner = (folder) => {
  folderName.value = folder
  isMediaModalOpen.value = true
}

const addImage = (image) => {
  setFieldValue('banner', image)
  isMediaModalOpen.value = false
}

const removeBanner = () => {
  setFieldValue('banner', '')
}

const setTaskArray = (taskIdsArray) => {
  setFieldValue('tasks', taskIdsArray)
}

const goToCalendars = () => {
  router.push('/tasks/calendars')
}

const viewCalendar = () => {
  router.push(`/tasks/calendars/${newCalendar.value?.id}`)
}

const addTasks = () => {
  isModalDraft.value = false

  if (refCalendarsAddTasks.value) {
    refCalendarsAddTasks.value.openTasksList()
  }
}

const createNew = () => {
  isModalSuccess.value = false
  resetForm()
}

const cancelCreate = () => {
  isCancelModalOpen.value = true
}

const years = ref([
  { name: '1st', id: '1' },
  { name: '2nd', id: '2' },
  { name: '3rd', id: '3' },
  { name: '4th', id: '4' },
  { name: '5th', id: '5' },
  { name: '6th', id: '6' },
  { name: '7th', id: '7' },
  { name: '8th', id: '8' },
  { name: '9th', id: '9' },
  { name: '10th', id: '10' },
])

const terms = ref([
  { name: '1st Term', id: '1' },
  { name: '2nd Term', id: '2' },
  { name: '3rd Term', id: '3' },
])

const types = ref(['Mandatory', 'Casual', 'Seasonal'])
const difficulties = ref(['Basic', 'Advanced', 'Expert'])
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addCalendarBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" class="w-full pb-6">
      <BaseCard class="mt-6">
        <div class="flex items-center justify-between px-8 py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Term Calendar Creation
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Group multiple tasks into a new calendar.<br />Complete all required fields before
              saving to create a calendar for school allocation.
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
        </div>

        <div class="max-w-3xl p-8 pt-8 pb-12">
          <TairoFormGroup label="Calendar Details">
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
                    label="Academic Year"
                    :items="years?.map((year) => year?.name)"
                    placeholder="Select Year"
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
                    label="Academic Term"
                    :items="terms?.map((term) => term.name)"
                    placeholder="Select Term"
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
                    label="Difficulty Level"
                    :items="difficulties"
                    placeholder="Select Difficulty"
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
                    label="Special Reference"
                    placeholder="Write some description..."
                    :content="field.value"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="type">
                  <BaseListbox
                    label="Calendar Type"
                    :items="types"
                    placeholder="Select Type"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6 relative">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Grade Level</label>

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

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="minimum_tasks"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="number"
                    icon="fluent:task-list-square-ltr-24-regular"
                    label="Minimum Tasks"
                    placeholder="Minimum Tasks"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-1 text-[0.825rem] min-w-fit">Calendar Banner</label>

                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>JPEG or PNG only</span>
                </BaseParagraph>

                <div v-if="!values.banner">
                  <BaseButton color="primary" @click="addBanner('admin_banners/sub_category')">
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Banner Image</span>
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
                          :src="getImageUrl(values.banner)"
                          alt="Image preview"
                        />
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
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>
    </form>

    <!-- Add Tasks -->
    <div>
      <CalendarsAddTasks ref="refCalendarsAddTasks" @setTaskArray="setTaskArray" />
    </div>

    <!-- Actions -->
    <div class="max-w-3xl p-8">
      <div class="flex items-center gap-2 pt-6 pb-6">
        <BaseButton class="w-24" @click="cancelCreate">Cancel</BaseButton>
        <BaseButton color="primary" class="w-24" @click="onSubmit"> Create </BaseButton>
      </div>
    </div>

    <MediaPopup
      v-if="isMediaModalOpen"
      :isOpen="isMediaModalOpen"
      :folder="folderName"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />

    <BaseModal
      :isOpen="isModalSuccess"
      :title="'Operation Success'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="success"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'View'"
      :primaryButtonAction="viewCalendar"
      :cancelButtonText="'Create New'"
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
      :isOpen="isModalDraft"
      :title="'Insufficient Tasks'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Save & Draft'"
      :primaryButtonAction="submitToDraft"
      :cancelButtonText="'Add Tasks'"
      @close="addTasks"
    >
      This calendar only has
      <span class="font-bold text-primary-500 dark:text-muted-200">{{ values?.tasks.length }}</span>
      tasks. The minimum number of tasks required for this calendar is
      <span class="font-bold text-primary-500 dark:text-muted-200">{{ values.minimum_tasks }}</span
      >. Please add more tasks before saving.
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
      :primaryButtonAction="goToCalendars"
      :cancelButtonText="'No'"
      @close="isCancelModalOpen = false"
    >
      Are you sure you want to cancel creating this calendar?
    </BaseModal>
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
