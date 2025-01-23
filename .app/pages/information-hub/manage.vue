<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  title: 'Edit Post',
  middleware: ['auth'],
})

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

const fileType = ['Screenshot', 'Document', 'Screen recording']

const authors = [
  {
    id: 1,
    name: 'Author 1',
    avatar: '/img/avatars/1.svg',
  },
  {
    id: 2,
    name: 'Author 2',
    avatar: '/img/avatars/2.svg',
  },
  {
    id: 3,
    name: 'Author 3',
    avatar: '/img/avatars/3.svg',
  },
]

const category = ['Parent Category', 'Category 1', 'Category 2', 'Category 3']

const isModalAddPostOpen = ref(false)
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addPostBreadcrumb">
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
            Manage Post
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Customize user access and permissions for each segment
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
            label="Action"
            orientation="end"
            size="md"
            class="add-dropdown small-dropdown"
          >
            <BaseDropdownItem title="Approve" color="default" rounded="sm" />
            <BaseDropdownItem title="Deactivate" color="default" rounded="sm" />
            <BaseDropdownItem title="Activate" color="default" rounded="sm" />
            <BaseDropdownItem title="Delete" color="default" rounded="sm" />
          </BaseDropdown>
          <BaseButton class="w-24" to="/tasks">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" class="w-24" @submit.prevent="onSubmit">
            Update
          </BaseButton>
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

      <div class="grid grid-cols-12 gap-4 mt-6">
        <div class="ltablet:col-span-9 col-span-12 lg:col-span-8">
          <BaseCard>
            <div class="p-8 py-12">
              <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 sm:col-span-12">
                  <BaseInput
                    type="text"
                    icon="material-symbols-light:position-top-right-outline"
                    label="Post title"
                    placeholder="Post title"
                  />
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <BaseTextarea label="Post excerpt" placeholder="Write some excert..." />
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <BaseTextarea label="Body text" placeholder="Write some text..." rows="20" />
                </div>

                <div class="col-span-12 sm:col-span-12">
                  <TairoFormGroup label="Upload Files">
                    <div class="space-y-1.5">
                      <!-- FIELD GROUP -->
                      <div class="p-4 bg-muted-100 rounded-md flex gap-6">
                        <div class="w-64">
                          <BaseListbox :items="fileType" placeholder="Select file type" />
                        </div>

                        <div class="flex-1">
                          <BaseButton color="primary">
                            <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                            <span>Add Screenshot</span>
                          </BaseButton>
                        </div>
                      </div>

                      <!-- FIELD GROUP -->
                      <div class="p-4 bg-muted-100 rounded-md flex gap-6">
                        <div class="w-64">
                          <BaseListbox :items="fileType" placeholder="Select file type" />
                        </div>

                        <div class="flex-1">
                          <BaseButton color="primary">
                            <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                            <span>Add Document</span>
                          </BaseButton>
                        </div>
                      </div>

                      <!-- FIELD GROUP -->
                      <div class="p-4 bg-muted-100 rounded-md flex gap-6">
                        <div class="w-64">
                          <BaseListbox :items="fileType" placeholder="Select file type" />
                        </div>

                        <div class="flex-1">
                          <BaseButton color="primary">
                            <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                            <span>Add Screen recording</span>
                          </BaseButton>
                        </div>
                      </div>
                    </div>
                    <BaseButton class="w-full sm:w-40 text-primary-500 mt-4"
                      ><Icon name="lucide:plus" class="h-4 w-4" />
                      <span>Add more file</span></BaseButton
                    >
                  </TairoFormGroup>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        <div class="ltablet:col-span-3 col-span-12 lg:col-span-4">
          <BaseCard>
            <div class="p-8 py-12 space-y-6">
              <div>
                <label class="nui-label pb-2 text-[0.825rem] w-full">Post main banner</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Main Banner</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
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
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label class="nui-label pb-2 text-[0.825rem] w-full">Thumbnail image</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Thumbnail Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
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
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="">
                <label class="nui-label pb-2 text-[0.825rem] w-full mb-1">Categories</label>
                <div class="grid grid-cols-1">
                  <ul class="space-y-3">
                    <li>
                      <p class="text-sm mb-1 text-muted-600 dark:text-muted-300">
                        Parent Category 1
                      </p>
                      <ul class="ms-4 space-y-1">
                        <li>
                          <BaseCheckbox label="Sub Category 1" rounded="sm" />
                        </li>
                        <li>
                          <BaseCheckbox label="Sub Category 1" rounded="sm" />
                        </li>
                      </ul>
                    </li>
                    <li>
                      <p class="text-sm mb-1 text-muted-600 dark:text-muted-300">
                        Parent Category 2
                      </p>
                      <ul class="ms-4 space-y-1">
                        <li>
                          <BaseCheckbox label="Sub Category 1" rounded="sm" />
                        </li>
                        <li>
                          <BaseCheckbox label="Sub Category 1" rounded="sm" />
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div class="mt-4">
                  <BaseButton
                    color="primary"
                    variant="solid"
                    class="w-auto text-primary-500"
                    @click="isModalAddPostOpen = true"
                    ><Icon name="lucide:plus" class="h-4 w-4" />
                    <span>Add New Category</span></BaseButton
                  >
                </div>
              </div>
              <div class="">
                <BaseListbox
                  :items="authors"
                  label="Author"
                  placeholder="Select author"
                  :properties="{
                    value: 'id',
                    label: 'name',
                    media: 'avatar',
                  }"
                />
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- ACTION -->
      <div class="max-w-3xl p-8">
        <div class="flex items-center gap-2 pt-8 pb-8">
          <BaseButton class="w-24" to="/schools">Cancel</BaseButton>

          <BaseButton type="submit" color="primary" class="w-24"> Create </BaseButton>
        </div>
      </div>

      <!-- Add Category component -->
      <div>
        <TairoModal :open="isModalAddPostOpen" size="lg" @close="isModalAddPostOpen = false">
          <template #header>
            <!-- Header -->
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
                      Customise user access and permissions for each segment
                    </BaseText>
                  </div>
                </div>
              </div>

              <BaseButtonClose
                @click="isModalAddPostOpen = false"
                class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
              />
            </div>
          </template>
          <!-- Body -->
          <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-16rem)]">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <BaseListbox
                  :items="category"
                  label="Parent category"
                  placeholder="Select category"
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseInput
                  type="text"
                  icon="iconamoon:category-thin"
                  label="Category name"
                  placeholder="Category"
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Category description"
                  placeholder="Write some description..."
                  rows="4"
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseInput
                  type="text"
                  icon="tabler:favicon"
                  label="Category icon"
                  placeholder="ph:phone-incoming"
                />
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
              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full">Category banner</label>
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                    <span>Add Banner</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
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
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <!-- Footer -->
            <div class="p-4 md:p-6">
              <div class="flex gap-x-2">
                <BaseButton @click="isModalAddPostOpen = false"> Cancel </BaseButton>

                <BaseButton color="primary" variant="solid" @click="isModalAddPostOpen = false">
                  Create Category
                </BaseButton>
              </div>
            </div>
          </template>
        </TairoModal>
      </div>
    </form>
  </div>
</template>
