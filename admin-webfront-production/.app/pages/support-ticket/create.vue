<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Request Support',
  middleware: ['auth'],
})

const router = useRouter()
const auth = useAuthStore()

const addSupportTicketsBreadcrumb = [
  {
    label: 'Support Tickets',
    hideLabel: false,
    to: '/support-ticket',
  },
  {
    label: 'Create',
    hideLabel: false,
  },
]

const zodSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(150, 'Subject cannot exceed 150 characters'),
  departments: z
    .object({
      id: z.string().min(1, 'Department is required'),
      name: z.string().min(1, 'Department is required'),
    })
    .refine((value) => value?.id, {
      message: 'Department is required',
    }),
  issue: z.string().min(1, 'Issue type is required'),
  priority: z.string().min(1, 'Priority is required'),
  explanation: z.string().min(1, 'Explanation is required'),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  subject: '',
  departments: { id: '', departments: '' },
  issue: '',
  priority: '',
  explanation: '',
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

const departmentList = ref([])
departmentList.value = await getDepartmentList()

const departmentTasks = ref([])
const depTaskNames = ref([])
const issueType = ref('')
watch(
  () => values.departments,
  async (value) => {
    issueType.value = ''
    if (value?.id) {
      departmentTasks.value = await getDepartmentTasksById(value.id)
      depTaskNames.value = departmentTasks.value.map((task) => task.tasks)
    }
  },
)
watch(
  () => issueType,
  () => {
    setFieldValue('issue', issueType.value)
  },
)

const modalContent = ref('')
const isModalError = ref(false)
const isModalSuccess = ref(false)
const isCancelModalOpen = ref(false)

const uploadedFilesArray = ref([{ type: '' }])
// const fileUploads = ref([{ type: '' }])

const openModal = (type, content) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const goToSupportTicket = () => {
  router.push('/support-ticket')
}

const processing = ref(false)
const onSubmit = handleSubmit(async (values) => {
  try {
    let ticketId

    const formData = new FormData()
    formData.append('subject', values.subject)
    formData.append('department', values.departments.name)
    formData.append('issue_type', values.issue)
    formData.append('priority', values.priority)
    formData.append('explanation', values.explanation)

    for (const file of uploadedFilesArray.value) {
      formData.append('upload_files[]', file)
    }

    formData.append('created_by', auth.user?.index)
    formData.append('from', 'Admin')
    formData.append('by', 'admin')
    formData.append('name', `${auth.user?.first_name} ${auth.user?.last_name}`)

    processing.value = true
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })

    const { data, error } = await useSupportTicketService('/api/support-ticket/create', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      processing.value = false
      openModal('error', error.value?.data.message)
      return
    }

    ticketId = data.value?.support_department.case_id
    processing.value = false
    openModal(
      'success',
      `Your support ticket has been submitted successfully!</br></br>Your Ticket ID: ${ticketId}`,
    )
  } catch (error) {
    processing.value = false
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
})

const addFileUpload = () => {
  uploadedFilesArray.value.push({ type: '' })
  console.log(uploadedFilesArray.value)
}

const filesCollect = (file) => {
  uploadedFilesArray.value = uploadedFilesArray.value.filter((f) => f.type !== '')
  uploadedFilesArray.value.push(file)
}

const removeFileUpload = (fileToRemove, index) => {
  let tempArr = [...uploadedFilesArray.value]
  uploadedFilesArray.value = []
  tempArr.splice(index, 1)

  setTimeout(() => {
    uploadedFilesArray.value = tempArr
  }, 10)
}

const validateType = () => {
  setFieldValue('issue', issueType.value)
  onSubmit()
}

const cancelCreate = () => {
  if (meta.value.dirty) {
    isCancelModalOpen.value = true
  } else {
    router.push('/get-support')
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addSupportTicketsBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" class="w-full pb-16" @submit.prevent="validateType">
      <BaseCard class="!min-h-[600px]">
        <div class="flex items-center justify-between px-8 py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Create Your Enquiry
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Reach out for assistance by creating a support ticket.
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

          <div>
            <ShowSpinner :showSpinner="processing" label="Processing data..." />
          </div>
        </div>

        <div class="">
          <div class="px-8">
            <div class="max-w-3xl space-y-12 py-8">
              <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 sm:col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="subject">
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="uil:subject"
                      label="Subject"
                      placeholder="Type Case Subject"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="departments"
                  >
                    <BaseListbox
                      label="Department"
                      :items="departmentList"
                      :properties="{ value: 'id', label: 'name' }"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                      class="z-top"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-6">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="issue">
                    <BaseListbox
                      label="Issue Type"
                      :items="depTaskNames"
                      v-model="issueType"
                      :error="errorMessage"
                      :disabled="depTaskNames.length === 0"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-6">
                  <label class="nui-label pb-2 text-[0.825rem] lg:ms-2 min-w-fit">Priority</label>
                  <fieldset class="w-full space-y-6">
                    <div class="grid gap-6 sm:grid-cols-3">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="priority"
                      >
                        <BaseRadioHeadless
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                          name="priority"
                          value="Low"
                        >
                          <BaseCard
                            rounded="full"
                            class="peer-checked:!border-success-500 peer-checked:!bg-success-500/10 relative border-2 p-2 peer-checked:[&_.child]:!opacity-100 !rounded-full"
                          >
                            <div class="flex justify-between items-center gap-2">
                              <h4
                                class="text-muted-500 dark:text-muted-200 font-sans text-sm font-medium leading-none ps-2"
                              >
                                Low
                              </h4>

                              <div class="flex items-center">
                                <div class="child opacity-0">
                                  <Icon
                                    name="ph:check-circle-duotone"
                                    class="text-primary-500 dark:text-muted-400 w-5 h-5"
                                  />
                                </div>
                              </div>
                            </div>
                          </BaseCard>
                        </BaseRadioHeadless>
                      </Field>

                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="priority"
                      >
                        <BaseRadioHeadless
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                          name="priority"
                          value="Medium"
                        >
                          <BaseCard
                            rounded="full"
                            class="peer-checked:!border-warning-500 peer-checked:!bg-warning-500/10 relative border-2 p-2 peer-checked:[&_.child]:!opacity-100 !rounded-full"
                          >
                            <div class="flex justify-between items-center gap-2">
                              <h4
                                class="text-muted-500 dark:text-muted-200 font-sans text-sm font-medium leading-none ps-2"
                              >
                                Medium
                              </h4>
                              <div class="flex items-center">
                                <div class="child opacity-0">
                                  <Icon
                                    name="ph:check-circle-duotone"
                                    class="text-primary-500 dark:text-muted-400 w-5 h-5"
                                  />
                                </div>
                              </div>
                            </div>
                          </BaseCard>
                        </BaseRadioHeadless>
                      </Field>

                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="priority"
                      >
                        <BaseRadioHeadless
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                          name="priority"
                          value="High"
                        >
                          <BaseCard
                            rounded="full"
                            class="peer-checked:!border-danger-500 peer-checked:!bg-danger-500/10 relative border-2 p-2 peer-checked:[&_.child]:!opacity-100 !rounded-full"
                          >
                            <div class="flex justify-between items-center gap-2">
                              <h4
                                class="text-muted-500 dark:text-muted-200 font-sans text-sm font-medium leading-none ps-2"
                              >
                                High
                              </h4>
                              <div class="flex items-center">
                                <div class="child opacity-0">
                                  <Icon
                                    name="ph:check-circle-duotone"
                                    class="text-primary-500 dark:text-muted-400 w-5 h-5"
                                  />
                                </div>
                              </div>
                            </div>
                          </BaseCard>
                        </BaseRadioHeadless>
                      </Field>
                    </div>

                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="priority"
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
                  </fieldset>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="explanation"
                  >
                    <CustomQuillEditor
                      fieldName="explanation"
                      label="Explanation"
                      placeholder="Explain your issue in detail"
                      :content="field.value"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <TairoFormGroup label="Upload Files">
                    <div>
                      <FileUploadSection
                        v-for="(fileUpload, index) in uploadedFilesArray"
                        :key="index"
                        :fileUpload="fileUpload"
                        :uploadedFilesArray="uploadedFilesArray"
                        class="mb-1.5"
                        @fileUploaded="filesCollect"
                        @removeFile="removeFileUpload($event, index)"
                      />

                      <BaseButton
                        class="w-full sm:w-44 text-primary-500 mt-4"
                        @click="addFileUpload"
                      >
                        <Icon name="lucide:plus" class="h-4 w-4" /> <span>Add More Files</span>
                      </BaseButton>
                    </div>
                  </TairoFormGroup>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-12">
              <BaseButton class="w-24" @click="cancelCreate">Cancel</BaseButton>

              <BaseButton
                type="submit"
                color="primary"
                class="w-24"
                :disabled="isSubmitting"
                :loading="isSubmitting"
              >
                Submit
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
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
      :primaryButtonAction="goToSupportTicket"
      :cancelButtonText="'Cancel'"
      @close="isModalSuccess = false"
    >
      <div v-html="modalContent"></div>
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
      :primaryButtonAction="goToSupportTicket"
      :cancelButtonText="'No'"
      @close="isCancelModalOpen = false"
    >
      Are you sure you want to cancel the creation of this support ticket?
    </BaseModal>
  </div>
</template>

<style>
ul#headlessui-listbox-options-8 {
  z-index: 999 !important;
}
</style>
