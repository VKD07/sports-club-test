<script setup>
import { datePresets, masks } from '../../constants'
import { refDebounced, useDebounceFn } from '@vueuse/core'
import { format, endOfYear } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

const route = useRoute()
const router = useRouter()

const filter = ref('')
const debounced = refDebounced(filter, 300)
const category = ref('')
const datePreset = ref('')
const status = ref('publish')

const dateEnd = ref(null)
const dateStart = ref(null)
const selectedPost = ref(null)

onBeforeMount(() => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    datePreset.value = value
  }
}

const posts = ref([])
const categories = ref([])

const total = ref(0)
const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const getIdFromName = (name, objsArr) => {
  const obj = objsArr?.find((item) => item?.category_name === name)
  return obj ? obj?.id : null
}

const fetchBlogPosts = async () => {
  const query = computed(() => {
    const nonEmptyProperties = {
      search: debounced.value,
      category: getIdFromName(category.value, categories.value),
      status: status.value,
      startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
      endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
      perPage: perPage.value,
      page: page.value,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }

    if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
      nonEmptyProperties.dateRange = datePreset.value
      nonEmptyProperties.startDate = dateStart.value
        ? format(new Date(dateStart.value), 'yyyy-MM-dd')
        : 'undefined'
    }

    const filteredProperties = Object.fromEntries(
      Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
    )

    return filteredProperties
  })

  const { data, error } = await useApiFetch('/api/admin/blog', {
    query,
    watch: false,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong fetch in blog posts, please try again!')
  }

  posts.value = data.value.data?.data
  categories.value = data.value?.all_cat
  total.value = data.value.data?.total
}
await fetchBlogPosts()

const formattedDate = (date) => {
  return format(new Date(date), 'dd MMMM yyyy')
}

const debouncedFetchBlogPosts = useDebounceFn(async () => {
  if (page.value == 1 || page.value === undefined) {
    await fetchBlogPosts()
  }

  router.push({
    query: {
      page: undefined,
    },
  })
}, 300)

watch(page, async () => {
  await fetchBlogPosts()
})

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch([debounced, category, dateStart, dateEnd, perPage], async (value) => {
  await debouncedFetchBlogPosts()
})

const isModalDeletePost = ref(false)
const isModalActivatePost = ref(false)
const isModalDuplicatePost = ref(false)
const isModalDeactivatePost = ref(false)

const selectPost = (post, modal) => {
  selectedPost.value = post
  if (modal === 'delete') {
    isModalDeletePost.value = true
  } else if (modal === 'deactivate') {
    isModalDeactivatePost.value = true
  } else if (modal === 'activate') {
    isModalActivatePost.value = true
  } else if (modal === 'duplicate') {
    isModalDuplicatePost.value = true
  }
}

const deactivatePost = async () => {
  try {
    const formData = new FormData()
    formData.append('index', selectedPost.value?.id ?? '')

    const { error } = await useApiFetch('/api/admin/blog/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    selectedPost.value = null
    isModalDeactivatePost.value = false

    if (error.value) {
      throw new Error(error.value)
    }

    await fetchBlogPosts()
    showSuccessToast('Success', 'Post has been deactivated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const activatePost = async () => {
  try {
    const formData = new FormData()
    formData.append('index', selectedPost.value?.id ?? '')

    const { error } = await useApiFetch('/api/admin/blog/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    selectedPost.value = null
    isModalActivatePost.value = false

    if (error.value) {
      throw new Error(error.value)
    }

    await fetchBlogPosts()
    showSuccessToast('Success', 'Post has been activated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const deletePost = async () => {
  try {
    const { error } = await useApiFetch(`/api/admin/blog/${selectedPost.value?.id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })

    selectedPost.value = null
    isModalDeletePost.value = false

    if (error.value) {
      throw new Error(error.value)
    }

    await fetchBlogPosts()
    showSuccessToast('Success', 'Post has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const duplicatePost = async () => {
  try {
    const { error } = await useApiFetch(`/api/admin/blog/${selectedPost.value?.id}/duplicate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })

    selectedPost.value = null
    isModalDuplicatePost.value = false

    if (error.value) {
      throw new Error(error.value)
    }

    await fetchBlogPosts()
    showSuccessToast('Success', 'Post has been duplicated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const groupByParentId = (categories) => {
  const grouped = categories.reduce((acc, category) => {
    const parentId = category.parent_id
    if (!acc[parentId]) {
      acc[parentId] = []
    }
    acc[parentId].push(category)
    return acc
  }, {})

  const categoryNames = Object.values(grouped).map(
    (group) => group[0].parent_category.category_name,
  )

  return categoryNames
}
</script>

<template>
  <TairoContentWrapper>
    <div>
      <!-- Filter -->
      <div class="relative">
        <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div
              class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:grow sm:ps-2 flex-2"
            >
              <BaseInput
                v-model="filter"
                icon="lucide:search"
                placeholder="Search post"
                autocomplete="off"
                :classes="{
                  wrapper: 'w-full sm:w-full',
                }"
              />
            </div>

            <div
              class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2 sm:basis-28 relative"
            >
              <BaseButtonClose
                v-if="category"
                size="sm"
                rounded="sm"
                color="muted"
                class="close-btn-auto"
                @click="category = ''"
              />
              <BaseAutocomplete
                v-model="category"
                :items="categories?.map((c) => c.category_name)"
                autocomplete="off"
                placeholder="Search category"
              />
            </div>
          </div>

          <div
            class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
          >
            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:ps-2">
              <CustomDropdown
                :options="datePresets"
                placeholder="Choose date preset"
                @selected-value="handleSelectedValue(1, $event)"
              />
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto">
              <DatePicker
                v-model="dateStart"
                :masks="masks"
                :max-date="setMaxDate()"
                mode="date"
                hide-time-header
                trim-weeks
              >
                <template #default="{ togglePopover, inputValue }">
                  <div class="flex w-full flex-col gap-4 sm:flex-row">
                    <div class="relative grow">
                      <BaseInput
                        placeholder="Start date"
                        autocomplete="off"
                        icon="ph:calendar-blank-duotone"
                        :value="inputValue"
                        type="text"
                        :disabled="datePreset !== 'Custom day' && datePreset !== 'Custom range'"
                        @click="togglePopover"
                      />
                    </div>
                  </div>
                </template>
              </DatePicker>
            </div>

            <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto sm:pe-2">
              <DatePicker
                v-model="dateEnd"
                :masks="masks"
                :max-date="datePreset !== 'This Year' ? setMaxDate() : endOfYear(new Date())"
                mode="date"
                hide-time-header
                trim-weeks
              >
                <template #default="{ togglePopover, inputValue }">
                  <div class="flex w-full flex-col gap-4 sm:flex-row">
                    <div class="relative grow">
                      <BaseInput
                        placeholder="End date"
                        autocomplete="off"
                        icon="ph:calendar-blank-duotone"
                        :value="inputValue"
                        type="text"
                        :disabled="datePreset !== 'Custom range'"
                        @click="togglePopover"
                      />
                    </div>
                  </div>
                </template>
              </DatePicker>
            </div>
          </div>
        </BaseCard>
      </div>

      <BaseCard class="!min-h-[600px]">
        <div class="px-8 pt-12 pb-12">
          <div>
            <div v-if="posts.length === 0">
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

            <div v-else class="space-y-2 pt-6">
              <TransitionGroup
                enter-active-class="transform-gpu"
                enter-from-class="opacity-0 -translate-x-full"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="absolute transform-gpu"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-full"
              >
                <FlexTableRow v-for="(post, index) in posts" :key="index" shape="rounded" spaced>
                  <template #start>
                    <FlexTableStartPost
                      label="Post"
                      :hide-label="index > 0"
                      :title="post.post_title"
                      :author="post.author"
                      :date="formattedDate(post.created_at)"
                      :picture="getImageUrl(post.thumbnail)"
                    />
                  </template>

                  <template #end>
                    <FlexTableCell
                      label="Post ID"
                      :hide-label="index > 0"
                      class="w-full sm:w-28 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        {{ post.post_id }}
                      </span>
                    </FlexTableCell>

                    <FlexTableCell
                      label="Category"
                      :hide-label="index > 0"
                      class="w-full sm:w-64 lg:!justify-start"
                    >
                      <div class="flex gap-2 flex-wrap">
                        <BaseTag
                          rounded="md"
                          size="sm"
                          v-for="cat in groupByParentId(post.categories)"
                        >
                          {{ cat }}
                        </BaseTag>
                      </div>
                    </FlexTableCell>

                    <FlexTableCell
                      label="View"
                      :hide-label="index > 0"
                      class="w-full sm:w-24 lg:!justify-start"
                    >
                      <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                        <BaseTag
                          shape="full"
                          variant="solid"
                          color="primary"
                          class="w-12 text-center"
                        >
                          {{ post.read_counts }}
                        </BaseTag>
                      </span>
                    </FlexTableCell>

                    <FlexTableCell label="action" :hide-label="index > 0">
                      <BaseDropdown
                        flavor="context"
                        label="Dropdown"
                        orientation="end"
                        shape="smooth"
                      >
                        <BaseDropdownItem
                          :to="`/information-hub/${post.id}`"
                          title="Manage"
                          text="Manage post"
                          shape="smooth"
                        />

                        <BaseDropdownItem
                          title="Deactivate"
                          text="Deactivate post"
                          shape="smooth"
                          @click="selectPost(post, 'deactivate')"
                        />

                        <BaseDropdownItem
                          title="Duplicate"
                          text="Duplicate post"
                          shape="smooth"
                          @click="selectPost(post, 'duplicate')"
                        />

                        <!-- <BaseDropdownItem
                          title="Delete"
                          text="Remove post"
                          shape="smooth"
                          @click="selectPost(post, 'delete')"
                        /> -->
                      </BaseDropdown>
                    </FlexTableCell>
                  </template>
                </FlexTableRow>
              </TransitionGroup>
            </div>

            <div v-if="posts.length !== 0" class="mt-4">
              <BasePagination
                :total-items="total ?? 0"
                :item-per-page="perPage"
                :current-page="page"
                shape="curved"
              />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseModal
      :isOpen="isModalDeactivatePost"
      :title="'Deactivate post'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Deactivate'"
      :primaryButtonAction="deactivatePost"
      :cancelButtonText="'Cancel'"
      @close="isModalDeactivatePost = false"
    >
      Are you sure you want to deactivate this post?
    </BaseModal>

    <BaseModal
      :isOpen="isModalActivatePost"
      :title="'Activate post'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Activate'"
      :primaryButtonAction="activatePost"
      :cancelButtonText="'Cancel'"
      @close="isModalActivatePost = false"
    >
      Are you sure you want to activate this post?
    </BaseModal>

    <BaseModal
      :isOpen="isModalDeletePost"
      :title="'Delete post'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="deletePost"
      :cancelButtonText="'Cancel'"
      @close="isModalDeletePost = false"
    >
      Are you sure you want to delete this post?
    </BaseModal>

    <BaseModal
      :isOpen="isModalDuplicatePost"
      :title="'Duplicate post'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Duplicate'"
      :primaryButtonAction="duplicatePost"
      :cancelButtonText="'Cancel'"
      @close="isModalDuplicatePost = false"
    >
      Are you sure you want to duplicate this post?
    </BaseModal>
  </TairoContentWrapper>
</template>
