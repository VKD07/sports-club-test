<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Add New Game',
  middleware: ['auth'],
})

const segmentName = 'Academic Center'
const pageName = 'Add New Category'
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

const addCategoryBreadcrumb = [
  {
    label: 'Game',
    hideLabel: false,
    to: '/tasks/categories',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const isAlphabeticalWithSpacesAndSpecialChars = (value: string) =>
  /^[A-Za-z\s!@#$%^&*()-_=+[\]{};:'",.<>/?`~]+$/.test(value)

const zodSchema = z.object({
  primaryCategory: z.string().min(1, 'Primary category is required'),

  name: z
    .string()
    .min(1, 'Game name is required')
    .refine((value) => isAlphabeticalWithSpacesAndSpecialChars(value), {
      message: 'Please provide a valid Game name',
    }),

  description: z.string().min(1, 'Description is required'),

  banner: z.string(),

  icon: z.string().min(1, 'Icon is required'),

  game_consoles: z.array(z.string()).min(1, 'Please select a at least one console'),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  primaryCategory: 'Games',
  name: '',
  description: '',
  banner: '',
  icon: '',
  game_consoles: [],
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

const {
  data: consoles,
  pending: consolesPending,
  error: consolesError,
  refresh: refreshConsoles,
} = await useApiFetch<any>('/api/admin/game-consoles?perPage=1000&page=1', {})
if (consolesError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const games = ['Games']
// const consoles = [
//   {
//     name: 'Android',
//     subText: '(Mobile/Tablet)',
//     icon: 'material-symbols:android',
//   },
//   {
//     name: 'Apple',
//     subText: '(Mobile/Tablet)',
//     icon: 'ic:baseline-apple',
//   },
//   {
//     name: 'PC/Laptop',
//     subText: '(Microsoft)',
//     icon: 'quill:desktop',
//   },
//   {
//     name: 'Xbox',
//     subText: '',
//     icon: 'tabler:brand-xbox',
//   },
//   {
//     name: 'Play station',
//     subText: '',
//     icon: 'mdi:sony-playstation',
//   },
// ]

const isMediaModalOpen = ref(false)
const folderName = ref('')
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

const onSubmit = handleSubmit(async (values) => {
  try {
    success.value = false

    const { error } = await useApiFetch<any>('/api/admin/games', {
      method: 'POST',
      body: JSON.stringify({
        name: values?.name,
        description: values?.description,
        banner: values?.banner,
        icon: values?.icon,
        game_consoles: values?.game_consoles?.map((game_console_id) => ({
          game_console_id,
          url: 'your_url_here',
        })),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // if (error) {
    //   throw new Error('Request failed! API not integrated')
    // }

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
        <div class="flex items-center justify-between px-8 py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Game Creation
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Provide the relevant information to set up a new game category. Double-check entries
              and save once all fields are completed.
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
                        :items="games"
                        placeholder="Select game"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="name">
                      <BaseInput
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        icon="material-symbols:videogame-asset-outline"
                        label="Game name"
                        placeholder="Game name"
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

                    <span class="custom-error">{{ errors?.banner ? errors?.banner : '' }}</span>
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

                  <div class="col-span-12 sm:col-span-12">
                    <label class="nui-label pb-2 text-[0.825rem] lg:ms-2 min-w-fit"
                      >Gaming Consoles</label
                    >
                    <div class="grid gap-6 sm:grid-cols-3 !mt-1">
                      <div
                        v-for="console in consoles?.gameConsoles?.data"
                        :key="console.name"
                        class="relative"
                      >
                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="game_consoles"
                        >
                          <BaseCheckboxHeadless
                            :value="console.id"
                            :name="console.name"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          >
                            <BaseCard
                              rounded="sm"
                              class="peer-checked:!border-primary-500 peer-checked:[&_.child]:!block border-2 p-3 opacity-60 peer-checked:opacity-100"
                            >
                              <div class="flex w-full items-center gap-2">
                                <Icon
                                  :name="console.icon"
                                  class="h-5 w-5 text-muted-600 dark:text-muted-400"
                                />
                                <div>
                                  <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                                    {{ console.name }}
                                  </BaseText>

                                  <BaseText size="xs" class="text-muted-400">
                                    {{ console.subText }}
                                  </BaseText>
                                </div>

                                <div class="child ms-auto hidden">
                                  <div
                                    class="h-5 w-5 rounded-full bg-primary-500 flex justify-center items-center"
                                  >
                                    <Icon
                                      name="teenyicons:tick-outline"
                                      class="h-3 w-3 text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            </BaseCard>
                          </BaseCheckboxHeadless>
                        </Field>
                      </div>
                    </div>
                    <span class="custom-error">{{
                      errors?.game_consoles ? errors?.game_consoles : ''
                    }}</span>
                  </div>
                </div>
              </TairoFormGroup>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-12">
              <BaseButton class="w-24" to="/tasks/categories">Cancel</BaseButton>
              <BaseButton
                v-if="create"
                type="submit"
                color="primary"
                class="w-24"
                :disabled="isSubmitting"
                :loading="isSubmitting"
              >
                Create
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
      :primaryButtonAction="goToCategories"
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
