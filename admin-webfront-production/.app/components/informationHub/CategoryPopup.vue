<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const { isOpen } = defineProps(['isOpen'])
const emits = defineEmits(['close'])

const closeModal = () => {
  emits('close')
}

const zodSchema = z.object({
  category: z
    .object({
      id: z.string().min(1, 'Parent category is required'),
      name: z.string(),
    })
    .refine((value) => value?.id, {
      message: 'Parent category is required',
    }),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Category description is required'),
  icon: z.string().min(1, 'Category icon is required'),
  banner: z.string().min(1, 'Category banner is required'),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  category: { id: '', name: '' },
  name: '',
  description: '',
  icon: '',
  banner: '',
}))

const { handleSubmit, isSubmitting, values, setFieldValue, errors, resetForm, setErrors } = useForm(
  {
    validationSchema,
    initialValues,
  },
)

const categories = ref([])
const getCategories = async () => {
  const { data, error } = await useApiFetch('/api/admin/blog-all-parent-category')

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch categories, please try again!')
  }

  categories.value = data.value?.data
}
await getCategories()

const parentCategories = computed(() => {
  const categoriesValue = categories.value
  if (!categoriesValue) return []

  const categoryArray = categoriesValue.map((c) => ({
    id: c.id,
    name: c.category_name,
  }))

  categoryArray.unshift({ id: 'parent category', name: 'Parent Category' })

  return categoryArray
})

const onSubmit = handleSubmit(async (values) => {
  try {
    // Create FormData object
    const formData = new FormData()
    formData.append('parent_category', values.category?.id)
    formData.append('category_name', values.name)
    formData.append('category_description', values.description)
    formData.append('category_icon', values.icon)
    formData.append('category_banner', values.banner)

    const { error } = await useApiFetch('/api/admin/blog-category', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      showErrorToast('Oops!', error.value?.data.message)
      return
    }

    resetForm()
    showSuccessToast('success', 'Category created successfully!')
    closeModal()
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
})

const bannerName = ref('')
const fileFolder = ref('')
const uploadField = ref('')
const isMediaModalOpen = ref(false)

const addBanner = (field, folder) => {
  uploadField.value = field
  fileFolder.value = folder
  isMediaModalOpen.value = true
}

const addImage = (image) => {
  isMediaModalOpen.value = false
  setFieldValue(uploadField.value, image.url)
  bannerName.value = image.name
  uploadField.value = ''
  fileFolder.value = ''
}

const removeBanner = (field) => {
  setFieldValue(field, '')
}
</script>

<template>
  <TairoModal :open="isOpen" size="lg" @close="closeModal">
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
                Create category
              </BaseHeading>

              <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                Customize user access and permissions for each segment
              </BaseText>
            </div>
          </div>
        </div>

        <BaseButtonClose
          @click="closeModal"
          class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
        />
      </div>
    </template>

    <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-16rem)]">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 sm:col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="category">
            <BaseListbox
              label="Parent category"
              :items="parentCategories"
              :properties="{ value: 'id', label: 'name' }"
              placeholder="Select category"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="name">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              icon="iconamoon:category-thin"
              label="Category name"
              placeholder="Category"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="description">
            <BaseTextarea
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="Category description"
              placeholder="Write some description..."
              rows="4"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="icon">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              icon="tabler:favicon"
              label="Category icon"
              placeholder="ph:phone-incoming"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <BaseParagraph size="xs" lead="tight" class="text-muted-500 dark:text-muted-400 pt-1">
            <span
              >Get icon names from here
              <NuxtLink to="https://icones.js.org" target="_blank">
                https://icones.js.org
              </NuxtLink>
            </span>
          </BaseParagraph>
        </div>

        <div class="col-span-12 sm:col-span-12">
          <label class="nui-label pb-2 text-[0.825rem] w-full">Category banner</label>
          <BaseParagraph size="xs" lead="tight" class="text-muted-500 dark:text-muted-400 pb-2">
            <span>Size: 100px x 100px</span>
          </BaseParagraph>

          <div v-if="!values.banner">
            <BaseButton color="primary" @click="addBanner('banner', 'admin_post_images')">
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
                    :src="getImageUrl(values.banner)"
                    alt="Image preview"
                  />
                </div>

                <div class="font-sans">
                  <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                    {{ values.banner ? bannerName : '' }}
                  </span>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                  type="button"
                  tooltip="Remove"
                  @click.prevent="removeBanner('banner')"
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
    </div>

    <template #footer>
      <div class="p-4 md:p-6">
        <div class="flex gap-x-2">
          <BaseButton @click="closeModal"> Cancel </BaseButton>

          <BaseButton color="primary" variant="solid" @click.prevent="onSubmit">
            Create Category
          </BaseButton>
        </div>
      </div>
    </template>

    <InformationHubMediaPopup
      v-if="isMediaModalOpen"
      :isOpen="isMediaModalOpen"
      :folder="fileFolder"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />
  </TairoModal>
</template>
