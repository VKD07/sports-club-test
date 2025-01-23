<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Add New Resource',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

const addPostBreadcrumb = [
  {
    label: 'All Posts',
    hideLabel: false,
    to: '/information-hub',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const zodSchema = z.object({
  title: z.string().min(1, 'Post title is required'),
  excerpt: z.string().min(1, 'Post excerpt is required'),
  body: z.string().min(1, 'Post body is required'),
  banner: z.string().min(1, 'Post main banner is required'),
  thumbnail: z.string().min(1, 'Post thumbnail image is required'),
  category: z.array(z.string()).min(1, 'At least one category is required'),
  author: z.object({
    id: z.string().min(1, 'Author name is required'),
    name: z.string().min(1, 'Author ID is required'),
  }),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  title: '',
  excerpt: '',
  body: '',
  banner: '',
  thumbnail: '',
  category: [],
  author: { id: '', name: '' },
}))

const { handleSubmit, isSubmitting, meta, values, errors, setFieldValue, resetForm, setErrors } =
  useForm({
    validationSchema,
    initialValues,
  })

const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const authors = ref([])
const categories = ref([])
const bannerName = ref('')
const thumbnailName = ref('')

const getAuthors = async () => {
  const { data, error } = await useApiFetch(
    '/api/admin/get-user-by-permission/InformationHub Add New Post Create',
  )

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch authors, please try again!')
  }

  return data
}

const getCategories = async () => {
  const { data, error } = await useApiFetch('/api/admin/blog-category')

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch categories, please try again!')
  }

  return data
}

const getData = async () => {
  try {
    const [categoriesData, authorsData] = await Promise.all([getCategories(), getAuthors()])

    // Process categories data
    categories.value = categoriesData.value?.data

    // Process authors data
    authors.value = authorsData.value?.data
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
}
await getData()

const authorsList = computed(() => {
  return authors.value.map((user) => {
    let profile_picture = '/img/avatars/16.svg'
    let initials = ''

    if (user.admin_profile && user.admin_profile.profile_picture) {
      profile_picture = user.admin_profile.profile_picture
    }

    const name = `${user.first_name} ${user.last_name}`

    if (user.first_name && user.last_name) {
      initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }

    return { id: user.id, name, profile_picture, initials }
  })
})

const modalContent = ref('')
const isModalError = ref(false)
const isModalSuccess = ref(false)

const openModal = (type, content) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const processing = ref(false)
const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('post_title', values.title)
    formData.append('post_banner', values.banner)
    formData.append('banner_name', bannerName.value)
    formData.append('thumbnail', values.thumbnail)
    formData.append('thumbnail_name', thumbnailName.value)
    formData.append('post_excerpt', values.excerpt)

    for (const cat of values.category) {
      formData.append('category[]', cat)
    }

    formData.append('body', values.body)
    formData.append('author', values.author.name)
    formData.append('authors_id', values.author.id)

    if (uploadedFilesArray.value && uploadedFilesArray.value.length > 0) {
      for (const file of uploadedFilesArray.value) {
        if (file.url !== '') {
          formData.append('document_attach[]', JSON.stringify(file))
        }
      }
    }

    processing.value = true
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })

    const { error } = await useApiFetch('/api/admin/blog', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      processing.value = false

      if (error.value.statusCode === 413) {
        openModal(
          'error',
          'Please upload images to the media library and insert the image URL in the source field to display it in the post body.',
        )
      } else {
        openModal('error', error.value?.data.message)
      }
      return
    }

    processing.value = false
    resetForm()
    uploadedFilesArray.value = []
    openModal('success', 'Blog post created successfully!')
  } catch (error) {
    processing.value = false

    if (error.status === 413) {
      showErrorToast(
        'Oops!',
        'Please upload images to the media library and insert the image URL in the source field to display it in the post body.',
      )
    } else {
      showErrorToast('Oops!', 'Something went wrong, please try again!')
    }
  }
})

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
  setFieldValue(uploadField.value, image.url)

  if (uploadField.value === 'banner') {
    bannerName.value = image.name
  } else {
    thumbnailName.value = image.name
  }

  uploadField.value = ''
  fileFolder.value = ''
}

const removeBanner = (field) => {
  setFieldValue(field, '')
}

const removeThumbnail = (field) => {
  setFieldValue(field, '')
}

const isModalAddPostOpen = ref(false)
const uploadedFilesArray = ref([{ name: '', type: '', url: '' }])

const addFileUpload = () => {
  uploadedFilesArray.value.push({ name: '', type: '', url: '' })
}

const filesCollect = (url, type, name) => {
  const fileObj = {
    name: name,
    type: type,
    url: url,
  }
  uploadedFilesArray.value = uploadedFilesArray.value.filter((f) => f.url !== '')
  uploadedFilesArray.value.push(fileObj)
}

const removeFileUpload = (index) => {
  let tempArr = [...uploadedFilesArray.value]
  uploadedFilesArray.value = []
  tempArr.splice(index, 1)

  setTimeout(() => {
    uploadedFilesArray.value = [...tempArr]
  }, 10)
}

const goToAllPosts = () => {
  router.push('/information-hub')
}

const closeCategoryPopup = () => {
  isModalAddPostOpen.value = false
  getData()
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addPostBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between px-8 py-8 pb-4">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Create a Resource
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Add new educational materials to the directory.
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
          <BaseButton class="w-24" to="/information-hub">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" class="w-24"> Create</BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="ltablet:col-span-9 col-span-12 lg:col-span-8">
          <BaseCard>
            <div class="p-8 py-12">
              <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 sm:col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="title">
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="material-symbols-light:position-top-right-outline"
                      label="Post title"
                      placeholder="Post title"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="excerpt">
                    <CustomQuillEditor
                      fieldName="excerpt"
                      label="Post excerpt"
                      placeholder="Write some excerpt..."
                      :content="field.value"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="body">
                    <!-- <BlogEditor
                      fieldName="body"
                      label="Body text"
                      placeholder="Write some text..."
                      :content="field.value"
                      height="400px"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    /> -->
                    <client-only>
                      <TinyMCE
                        fieldName="body"
                        label="Body text"
                        placeholder="Write some text..."
                        :content="field.value"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </client-only>
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <TairoFormGroup label="Upload Files">
                    <div>
                      <FileUploadFromMedia
                        v-for="(file, index) in uploadedFilesArray"
                        :key="index"
                        :file="file"
                        :uploadedFilesArray="uploadedFilesArray"
                        class="mb-1.5"
                        @fileUploaded="filesCollect"
                        @removeFile="removeFileUpload"
                        :index="index"
                      />

                      <BaseButton
                        class="w-full sm:w-40 text-primary-500 mt-4"
                        @click="addFileUpload"
                      >
                        <Icon name="lucide:plus" class="h-4 w-4" /> <span>Add more file</span>
                      </BaseButton>
                    </div>
                  </TairoFormGroup>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="ltablet:col-span-3 col-span-12 lg:col-span-4">
          <BaseCard>
            <div class="p-8 py-12 space-y-6">
              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Post main banner</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
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

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Thumbnail image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>

                <div v-if="!values.thumbnail">
                  <BaseButton
                    color="primary"
                    @click="addThumbnail('thumbnail', 'admin_post_images')"
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
                          :src="getImageUrl(values.thumbnail)"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                          {{ values.thumbnail ? thumbnailName : '' }}
                        </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="removeThumbnail('thumbnail')"
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
                    name="thumbnail"
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

              <div>
                <label class="nui-label pb-2 text-[0.825rem] w-full mb-1">Categories</label>
                <div class="grid grid-cols-1">
                  <ul class="space-y-3">
                    <li v-for="(category, parentCategoryId) in categories" :key="parentCategoryId">
                      <p class="text-sm mb-2 text-muted-600 dark:text-muted-300">
                        {{ category.parent_category_name }}
                      </p>

                      <ul class="ms-4 space-y-1">
                        <li v-for="subCategory in category.subcategories" :key="subCategory.id">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            name="category"
                          >
                            <BaseCheckbox
                              :model-value="field.value"
                              :disabled="isSubmitting"
                              shape="rounded"
                              rounded="sm"
                              :label="subCategory.category_name"
                              :value="subCategory.id"
                              color="primary"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            />
                          </Field>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <div class="col-span-12 sm:col-span-12">
                    <span class="custom-error-msg mt-4">
                      {{ errors.category ? errors.category : '' }}</span
                    >
                  </div>
                </div>

                <div class="mt-4">
                  <BaseButton
                    color="primary"
                    variant="solid"
                    class="w-auto text-primary-500"
                    @click="isModalAddPostOpen = true"
                  >
                    <Icon name="lucide:plus" class="h-4 w-4" />
                    <span>Add New Category</span>
                  </BaseButton>
                </div>
              </div>

              <div>
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="author">
                  <BaseListbox
                    label="Author"
                    :items="authorsList"
                    :properties="{
                      value: 'id',
                      label: 'name',
                      media: 'profile_picture',
                    }"
                    placeholder="Select author"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- ACTION -->
      <div class="max-w-3xl p-8">
        <div class="flex items-center gap-2 pt-8 pb-8">
          <BaseButton class="w-24" to="/information-hub">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" class="w-24"> Create </BaseButton>
        </div>
      </div>

      <!-- Add Category component -->
      <informationHubCategoryPopup
        v-if="isModalAddPostOpen"
        :isOpen="isModalAddPostOpen"
        @close="closeCategoryPopup"
      />
    </form>

    <InformationHubMediaPopup
      v-if="isMediaModalOpen"
      :isOpen="isMediaModalOpen"
      :folder="fileFolder"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />

    <BaseModal
      :isOpen="isModalSuccess"
      :title="'Operation Success'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="success"
      :showCancelButton="false"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Ok'"
      :primaryButtonAction="goToAllPosts"
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
  </div>
</template>
