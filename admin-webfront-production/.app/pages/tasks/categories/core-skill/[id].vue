<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Manage Skill',
  middleware: ['auth'],
})

const route = useRoute()

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const selectedSkill = ref<any>(null)

const fetchSkill = async () => {
  const { data } = await useApiFetch<any>(`/api/admin/skills/${id}`)
  selectedSkill.value = data.value
}
await fetchSkill()

const statusColor = (status) => {
  switch (status) {
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

const addCategoryBreadcrumb = [
  {
    label: 'Core Skill',
    hideLabel: false,
    to: { name: 'categories', query: { fromSkill: 'true' } },
  },
  {
    label: 'Edit',
    hideLabel: false,
  },
]

// const { id } = route.params
// console.log(id)

const isAlphabeticalWithSpacesAndSpecialChars = (value: string) =>
  /^[A-Za-z\s!@#$%^&*()-_=+[\]{};:'",.<>/?`~]+$/.test(value)

const zodSchema = z.object({
  primaryCategory: z.string().min(1, 'Primary category is required'),

  skillName: z
    .string()
    .min(1, 'Skill name is required')
    .refine((value) => isAlphabeticalWithSpacesAndSpecialChars(value), {
      message: 'Please provide a valid Skill name',
    }),

  description: z.string().min(1, 'Description is required'),

  bannerImage: z.string().min(1, 'Banner image is required'),

  icon: z.string().min(1, 'Icon is required'),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  primaryCategory: 'Core Skills',
  skillName: selectedSkill?.value?.name || '',
  description: selectedSkill?.value?.description || '',
  bannerImage: selectedSkill?.value?.banner || '',
  icon: selectedSkill?.value?.icon || '',
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

const isModalDeleteCategory = ref(false)
const isModalActivateCategory = ref(false)
const isModalDeactivateCategory = ref(false)
const isModalCanNotDeactivateCategory = ref(false)

const goToCategories = () => {
  router.push('/tasks/categories')
}

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

// const {
//   data: segments,
//   pending: segmentsPending,
//   error: segmentsError,
//   refresh: refreshSegments,
// } = await useApiFetch<any>('/api/admin/segments?is_parent_segment=true&perPage=1000&page=1', {})
// if (segmentsError.value) {
//   showErrorToast('Oops!', 'Something went wrong, please try again!')
// }

const skills = ['Core Skills']

const isMediaModalOpen = ref(false)
const folderName = ref('')
const addBanner = (folder) => {
  folderName.value = folder
  isMediaModalOpen.value = true
}
const addImage = (image) => {
  setFieldValue('bannerImage', image)
  isMediaModalOpen.value = false
}
const removeBanner = () => {
  setFieldValue('bannerImage', '')
}

const onSubmit = handleSubmit(async (values) => {
  try {
    success.value = false
    let category = values

    const { error } = await useApiFetch<any>(`/api/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: values?.skillName,
        description: values?.description,
        banner: values?.bannerImage,
        icon: values?.icon,
        status: 'published',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // if (error) {
    //   throw new Error('Request failed! API not integrated')
    // }

    // resetForm()

    openModal('success', 'Category updated successfully!')

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

// new code
const selectedCategory = ref(null)

const isAnyCalendarAllocatedForFuture = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return false
  }

  const today = new Date()

  for (const task of tasks) {
    if (!task.calendars || task.calendars.length === 0) {
      continue
    }

    for (const calendar of task.calendars) {
      for (const locCalendar of calendar.location_calendars) {
        const termStartDate = new Date(locCalendar.term_start_date)

        if (termStartDate > today) {
          return true
        }
      }
    }
  }

  return false
}

const selectCategory = async (skill, modal) => {
  selectedCategory.value = skill
  const result = await isAnyCalendarAllocatedForFuture(selectedCategory.value?.tasks)

  if (modal === 'delete') {
    isModalDeleteCategory.value = true
  } else if (modal === 'deactivate') {
    if (result) {
      isModalCanNotDeactivateCategory.value = true
    } else {
      isModalDeactivateCategory.value = true
    }
  } else if (modal === 'activate') {
    isModalActivateCategory.value = true
  }
}

const deactivateCategory = async () => {
  try {
    const body = {
      status: 'Inactive',
    }

    const { error } = await useApiFetch(`/api/admin/skills/${selectedCategory.value?.id}/status`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCategory.value = false
    isModalActivateCategory.value = false
    isModalDeactivateCategory.value = false
    isModalCanNotDeactivateCategory.value = false

    await fetchSkill()
    showSuccessToast('Success', 'Skill has been deactivated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const activateCategory = async () => {
  try {
    const body = {
      status: 'Active',
    }

    const { error } = await useApiFetch(`/api/admin/skills/${selectedCategory.value?.id}/status`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCategory.value = false
    isModalActivateCategory.value = false
    isModalDeactivateCategory.value = false
    isModalCanNotDeactivateCategory.value = false

    await fetchSkill()
    showSuccessToast('Success', 'Skill has been activated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const deleteCategory = async () => {
  try {
    const { error } = await useApiFetch(`/api/admin/skills/${selectedCategory.value?.id}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalDeleteCategory.value = false
    isModalActivateCategory.value = false
    isModalDeactivateCategory.value = false
    isModalCanNotDeactivateCategory.value = false

    goToSkill()
    showSuccessToast('Success', 'Skill has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const goToTasks = () => {
  router.push({ name: 'tasks' })
}

const goToSkill = () => {
  router.push({ name: 'categories', query: { fromSkill: 'true' } })
}

const resetAll = () => {
  resetForm()
  setFieldValue('description', selectedSkill.value?.description)
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addCategoryBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <BaseCard class="!min-h-[600px]">
        <div class="flex flex-col md:flex-row gap-8 md:items-center justify-between px-8 pt-8 pb-0">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Edit {{ selectedSkill?.name }}
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              View, update, and manage core skills. Make necessary adjustments and remember to save
              any updates.
            </BaseText>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex gap-2 items-center mr-6 text-sm">
              Status
              <BaseTag
                :color="statusColor(selectedSkill.status)"
                shape="full"
                size="md"
                class="capitalize"
              >
                {{ selectedSkill.status }}
              </BaseTag>
            </div>
            <!-- <BaseDropdown
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
            </BaseDropdown> -->

            <BaseDropdown
              label="Action"
              orientation="end"
              size="md"
              class="add-dropdown small-dropdown"
            >
              <BaseDropdownItem
                v-if="selectedSkill.status === 'Active'"
                title="Deactivate"
                color="default"
                rounded="sm"
                @click="selectCategory(selectedSkill, 'deactivate')"
              />

              <BaseDropdownItem
                v-if="selectedSkill.status === 'Draft'"
                title="Approve"
                color="default"
                rounded="sm"
                @click="selectCategory(selectedSkill, 'activate')"
              />

              <BaseDropdownItem
                v-if="selectedSkill.status === 'Inactive'"
                title="Activate"
                color="default"
                rounded="sm"
                @click="selectCategory(selectedSkill, 'activate')"
              />

              <BaseDropdownItem
                v-if="selectedSkill.status !== 'Active'"
                title="Delete"
                color="default"
                rounded="sm"
                @click="selectCategory(selectedSkill, 'delete')"
              />
            </BaseDropdown>

            <BaseButton class="w-24" :disabled="!meta.dirty" @click="resetAll">Reset</BaseButton>
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

        <div class="">
          <div class="px-8">
            <div class="max-w-3xl space-y-12 py-8">
              <TairoFormGroup>
                <div class="grid grid-cols-12 gap-6">
                  <div class="col-span-12 sm:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="primaryCategory"
                    >
                      <BaseListbox
                        label="Primary category"
                        :items="skills"
                        placeholder="Select skill"
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
                      name="skillName"
                    >
                      <BaseInput
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        icon="carbon:skill-level"
                        label="Skill name"
                        placeholder="Skill name"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div class="col-span-12 sm:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="description"
                    >
                      <CustomQuillEditor
                        fieldName="description"
                        label="Description"
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

                    <div v-if="!values.bannerImage">
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
                              :src="getImageUrl(values.bannerImage)"
                              alt="Image preview"
                            />
                          </div>

                          <!-- <div class="font-sans">
                            <span
                              class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                            >
                              File name.jpg
                            </span>
                            <span class="text-muted-400 block text-xs"> 2MB </span>
                          </div> -->
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

                    <span class="custom-error">{{
                      errors?.bannerImage ? errors?.bannerImage : ''
                    }}</span>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="icon">
                      <BaseInput
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        icon="tabler:favicon"
                        label="Icon"
                        placeholder="ph:phone-incoming"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                    <BaseParagraph
                      size="xs"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400 pt-1"
                    >
                      <span
                        >Get icon names from here
                        <NuxtLink to="https://icones.js.org" target="_blank"
                          >https://icones.js.org</NuxtLink
                        ></span
                      >
                    </BaseParagraph>
                  </div>

                  <!-- <div class="col-span-12 sm:col-span-6">
                    <label class="nui-label pb-1 text-[0.825rem] min-w-fit">Icon</label>
                    <BaseParagraph
                      size="xs"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400 pb-2"
                    >
                      <span>Size: 100px x 100px</span>
                    </BaseParagraph>

                    <div>
                      <BaseButton color="primary" @click="addIcon">
                        <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                        <span>Add Icon</span>
                      </BaseButton>
                    </div>

                    <div v-if="values.icon">
                      <div
                        class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                      >
                        <div class="flex items-center gap-2">
                          <div class="shrink-0">
                            <img
                              class="size-14 rounded-md object-cover object-center w-16"
                              :src="values.icon"
                              alt="Image preview"
                            />
                          </div>

                          <div class="font-sans">
                            <span
                              class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                            >
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
                            @click.prevent="removeIcon"
                          >
                            <Icon name="lucide:x" class="size-4" />
                            <span class="sr-only">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <span class="custom-error">{{ errors?.icon ? errors?.icon : '' }}</span>
                  </div> -->
                </div>
              </TairoFormGroup>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-12">
              <BaseButton class="w-24" @click="goToSkill">Cancel</BaseButton>

              <BaseButton
                type="submit"
                color="primary"
                class="w-24"
                :disabled="!meta.dirty"
                :loading="isSubmitting"
              >
                Update
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
      :primaryButtonAction="goToSkill"
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
      :folder="folderName"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />

    <BaseModal
      :isOpen="isModalDeactivateCategory"
      :title="'Deactivate Category'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Deactivate'"
      :primaryButtonAction="deactivateCategory"
      :cancelButtonText="'Cancel'"
      @close="isModalDeactivateCategory = false"
    >
      {{ `Are you sure you want to deactivate ${selectedCategory?.name} skill? ` }}
    </BaseModal>

    <BaseModal
      :isOpen="isModalCanNotDeactivateCategory"
      :title="'Deactivate Category'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Check Tasks'"
      :primaryButtonAction="goToTasks"
      :cancelButtonText="'Cancel'"
      @close="isModalCanNotDeactivateCategory = false"
    >
      This skill is currently in use within tasks that are scheduled for allocation to schools.
      Please remove this skill from associated tasks and retry deactivating.
    </BaseModal>

    <BaseModal
      :isOpen="isModalActivateCategory"
      :title="selectedCategory?.status === 'Draft' ? 'Approve Category' : 'Activate Category'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="selectedCategory?.status === 'Draft' ? 'Approve' : 'Activate'"
      :primaryButtonAction="activateCategory"
      :cancelButtonText="'Cancel'"
      @close="isModalActivateCategory = false"
    >
      {{
        selectedCategory?.status === 'Draft'
          ? `Are you sure you want to approve ${selectedCategory.name} skill?`
          : `Are you sure you want to activate ${selectedCategory.name} skill again?`
      }}
    </BaseModal>

    <BaseModal
      :isOpen="isModalDeleteCategory"
      :title="'Delete Category'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="deleteCategory"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteCategory = false"
    >
      {{ `Do you want to proceed to delete ${selectedCategory.name} skill?` }}
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
