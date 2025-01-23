<script setup lang="ts">
import { formatDateFromString } from '~/utils'

definePageMeta({
  title: 'All Categories',
  middleware: ['auth'],
})

const segmentName = 'Academic Center'
const pageName = 'All Categories'
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

interface Category {
  id: number
  banner: string
  icon: string
  name: string
  description?: string
  parent_segment_id?: string
  parentCategory?: string
  numberOfTasks?: number
  status?: string
  is_active?: Boolean
  createdDate: string
}

const route = useRoute()
const router = useRouter()
const toaster = useToaster()

const isModalDeleteCategory = ref(false)
const isModalActivateCategory = ref(false)
const isModalDeactivateCategory = ref(false)

const selectedCategory = ref<Category | null>(null)
const selectedCategoryType = ref<string | null>(null)

const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const sorting = ref({
  column: 'created_at',
  direction: 'DESC',
})

const query = computed(() => {
  const nonEmptyProperties = {
    perPage: perPage.value,
    page: page.value,
    sort_field: sorting.value.column,
    sort_direction: sorting.value.direction,
  }

  // Filter out properties with null or empty values
  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const {
  data: segments,
  pending: segmentsPending,
  error: segmentsError,
  refresh: refreshSegments,
} = await useApiFetch<any>('/api/admin/segments', { query })
if (segmentsError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const {
  data: skills,
  pending: skillsPending,
  error: skillsError,
  refresh: refreshSkills,
} = await useApiFetch<any>('/api/admin/skills', { query })
if (skillsError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const {
  data: games,
  pending: gamesPending,
  error: gamesError,
  refresh: refreshGames,
} = await useApiFetch<any>('/api/admin/games', { query })
if (gamesError.value) {
  showErrorToast('Oops!', 'Something went wrong, please try again!')
}

const selectCategory = (category: Category, modal: string, type: string) => {
  selectedCategory.value = category
  selectedCategoryType.value = type
  if (modal === 'delete') {
    isModalDeleteCategory.value = true
  } else if (modal === 'deactivate') {
    isModalDeactivateCategory.value = true
  } else if (modal === 'activate') {
    isModalActivateCategory.value = true
  }
}

const refreshCategory = (categoryType: string) => {
  if (categoryType == 'segments') {
    refreshSegments()
  } else if (categoryType == 'skills') {
    refreshSkills()
  } else if (categoryType == 'games') {
    refreshGames()
  }
}

const deactivateCategory = async () => {
  try {
    let category = selectedCategory?.value
    const { error } = await useApiFetch<any>(
      `/api/admin/${selectedCategoryType.value}/${category?.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: category?.name,
          description: category?.description,
          banner: category?.banner,
          icon: category?.icon,
          parent_segment_id: category?.parent_segment_id,
          status: category?.status,
          is_active: 0,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    isModalDeactivateCategory.value = false
    selectedCategory.value = null

    if (error) {
      console.log('Error : ', error)
      // throw new Error('Request failed! API not integrated')
    }

    refreshCategory(selectedCategoryType.value ?? '')
    showSuccessToast('Success', 'Category has been deactivated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const activateCategory = async () => {
  try {
    let category = selectedCategory?.value
    const { error } = await useApiFetch<any>(
      `/api/admin/${selectedCategoryType.value}/${category?.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: category?.name,
          description: category?.description,
          banner: category?.banner,
          icon: category?.icon,
          parent_segment_id: category?.parent_segment_id,
          status: category?.status,
          is_active: 1,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    isModalActivateCategory.value = false
    selectedCategory.value = null

    if (error) {
      console.log('Error : ', error)
      // throw new Error('Request failed! API not integrated')
    }

    refreshCategory(selectedCategoryType.value ?? '')
    showSuccessToast('Success', 'Category has been activated!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const deleteCategory = async () => {
  try {
    let category = selectedCategory?.value
    const { error } = await useApiFetch<any>(
      `/api/admin/${selectedCategoryType.value}/${category?.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    isModalDeleteCategory.value = false
    selectedCategory.value = null

    if (error) {
      // throw new Error('Request failed! API not integrated')
      console.log('Error : ', error)
    }

    refreshCategory(selectedCategoryType.value ?? '')
    showSuccessToast('Success', 'Category has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const statusColor = (itemStatus: string) => {
  switch (itemStatus) {
    case 'Active':
      return 'success'
    case 'Inactive':
      return 'warning'
    case 'Draft':
      return 'danger'
    default:
      break
  }
}

const columnSort = (column: string) => {
  sorting.value.direction = sorting.value.direction === 'ASC' ? 'DESC' : 'ASC'
  sorting.value = { ...sorting.value, column }
}

watch([perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const tabs = [
  { label: 'Segments', value: 'segments' },
  { label: 'Core skills', value: 'coreskills' },
  { label: 'Games', value: 'games' },
]

const categories = [
  {
    id: 0,
    src: '/img/avatars/22.svg',
    name: 'Quest Adventures',
    parentCategory: 'Gaming',
    numberOfTasks: 10,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 1,
    src: '/img/avatars/15.svg',
    name: 'Battle Royale Battles',
    parentCategory: 'Gaming',
    numberOfTasks: 8,
    status: 'Inactive',
    createdDate: '2024-02-06',
  },
  {
    id: 2,
    src: '/img/avatars/11.svg',
    name: 'Skill Challenges',
    parentCategory: 'Skills',
    numberOfTasks: 6,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 3,
    src: '/img/avatars/18.svg',
    name: 'Team Showdowns',
    parentCategory: 'Gaming',
    numberOfTasks: 5,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 4,
    src: '/img/avatars/20.svg',
    name: 'Strategy Missions',
    parentCategory: 'Gaming',
    numberOfTasks: 7,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  // Dummy data entries based on the parent category
  {
    id: 5,
    src: '/img/avatars/15.svg',
    name: 'Code Challenges',
    parentCategory: 'Skills',
    numberOfTasks: 12,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 6,
    src: '/img/avatars/17.svg',
    name: 'Trivia Quizzes',
    parentCategory: 'Gaming',
    numberOfTasks: 9,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 7,
    src: '/img/avatars/10.svg',
    name: 'Math Puzzles',
    parentCategory: 'Skills',
    numberOfTasks: 5,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 8,
    src: '/img/avatars/13.svg',
    name: 'Memory Challenges',
    parentCategory: 'Gaming',
    numberOfTasks: 8,
    status: 'Active',
    createdDate: '2024-02-06',
  },
  {
    id: 9,
    src: '/img/avatars/10.svg',
    name: 'Language Learning',
    parentCategory: 'Skills',
    numberOfTasks: 10,
    status: 'Active',
    createdDate: '2024-02-06',
  },
]
</script>

<template>
  <TairoContentWrapper>
    <BaseCard class="!min-h-[600px]">
      <div class="px-8 pt-8 pb-4">
        <BaseTabSlider v-slot="{ activeValue }" model-value="segments" :tabs="tabs">
          <div v-if="activeValue === 'segments'">
            <div class="flex gap-4 lg:items-center justify-between py-4 my-2 flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="md"
                  weight="medium"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  All Segments
                </BaseHeading>

                <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                  Curriculum-based sections for educational categorization.
                </BaseText>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton
                  color="primary"
                  class="w-full sm:w-32"
                  to="/tasks/categories/add-segments"
                >
                  <Icon name="lucide:plus" class="h-4 w-4" />
                  <span>Add New</span>
                </BaseButton>
              </div>
            </div>

            <div class="mt-6">
              <div v-if="!segmentsPending && segments?.value?.segments?.data.length === 0">
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
                  <FlexTableRow
                    v-for="(category, index) in segments?.segments?.data"
                    :key="index"
                    shape="rounded"
                    spaced
                  >
                    <template #start>
                      <FlexTableStart
                        label="Segment"
                        :hide-label="index > 0"
                        :title="category.name"
                        :subtitle="category?.parent_segment?.name"
                        :picture="getImageUrl(category?.banner)"
                        :sort="true"
                        @sort-column="() => columnSort('name')"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Tasks"
                        :hide-label="index > 0"
                        class="w-full sm:w-36 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          <BaseTag
                            shape="full"
                            variant="solid"
                            color="primary"
                            class="w-10 text-center"
                          >
                            {{ category?.tasks_count ?? 0 }}
                          </BaseTag>
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Created date"
                        :sort="true"
                        :hide-label="index > 0"
                        class="w-full sm:w-40 lg:!justify-start"
                        @sort-column="() => columnSort('created_at')"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ formatDateFromString(category?.created_at) }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="status"
                        :hide-label="index > 0"
                        class="w-full sm:w-28 lg:!justify-start"
                      >
                        <BaseTag
                          :color="statusColor(category.is_active == 1 ? 'Active' : 'Inactive')"
                          shape="full"
                          size="sm"
                          class="capitalize"
                        >
                          {{ category.is_active == 1 ? 'Active' : 'Inactive' }}
                        </BaseTag>
                      </FlexTableCell>

                      <FlexTableCell label="action" :hide-label="index > 0">
                        <BaseDropdown
                          flavor="context"
                          label="Dropdown"
                          orientation="end"
                          shape="smooth"
                        >
                          <BaseDropdownItem
                            :to="`/tasks/categories/segment/${category.id}`"
                            title="Manage"
                            text="Manage segment"
                            shape="smooth"
                          />

                          <BaseDropdownItem
                            v-if="category.is_active"
                            title="Deactivate"
                            text="Deactivate segment"
                            shape="smooth"
                            @click="selectCategory(category, 'deactivate', 'segments')"
                          />

                          <BaseDropdownItem
                            v-if="!category.is_active"
                            title="Activate"
                            text="Activate segment"
                            shape="smooth"
                            @click="selectCategory(category, 'activate', 'segments')"
                          />

                          <BaseDropdownItem
                            v-if="!category.is_active"
                            title="Delete"
                            text="Remove segment"
                            shape="smooth"
                            @click="selectCategory(category, 'delete', 'segments')"
                          />
                        </BaseDropdown>
                      </FlexTableCell>
                    </template>
                  </FlexTableRow>
                </TransitionGroup>
              </div>

              <div v-if="!segmentsPending && segments?.segments?.data?.length !== 0" class="mt-4">
                <BasePagination
                  :total-items="segments?.segments?.total"
                  :item-per-page="perPage"
                  :current-page="page"
                  shape="curved"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeValue === 'coreskills'">
            <div class="flex gap-4 lg:items-center justify-between py-4 my-2 flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="md"
                  weight="medium"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  All Core Skills
                </BaseHeading>

                <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                  Fundamental abilities vital for academic progress.
                </BaseText>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton
                  color="primary"
                  class="w-full sm:w-32"
                  to="/tasks/categories/add-core-skills"
                >
                  <Icon name="lucide:plus" class="h-4 w-4" />
                  <span>Add New</span>
                </BaseButton>
              </div>
            </div>

            <div class="mt-6">
              <div v-if="!skillsPending && skills?.value?.skills?.data.length === 0">
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
                  <FlexTableRow
                    v-for="(category, index) in skills?.skills?.data"
                    :key="index"
                    shape="rounded"
                    spaced
                  >
                    <template #start>
                      <FlexTableStart
                        label="Skill"
                        :hide-label="index > 0"
                        :title="category?.name"
                        :picture="getImageUrl(category?.banner)"
                        :sort="true"
                        @sort-column="() => columnSort('name')"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Tasks"
                        :hide-label="index > 0"
                        class="w-full sm:w-36 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          <BaseTag
                            shape="full"
                            variant="solid"
                            color="primary"
                            class="w-10 text-center"
                          >
                            {{ category?.tasks_count ?? 0 }}
                          </BaseTag>
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Created date"
                        :sort="true"
                        :hide-label="index > 0"
                        class="w-full sm:w-40 lg:!justify-start"
                        @sort-column="() => columnSort('created_at')"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ formatDateFromString(category?.created_at) }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="status"
                        :hide-label="index > 0"
                        class="w-full sm:w-28 lg:!justify-start"
                      >
                        <BaseTag
                          :color="statusColor(category?.is_active ? 'Active' : 'Inactive')"
                          shape="full"
                          size="sm"
                          class="capitalize"
                        >
                          {{ category?.is_active ? 'Active' : 'Inactive' }}
                        </BaseTag>
                      </FlexTableCell>

                      <FlexTableCell label="action" :hide-label="index > 0">
                        <BaseDropdown
                          flavor="context"
                          label="Dropdown"
                          orientation="end"
                          shape="smooth"
                        >
                          <BaseDropdownItem
                            :to="`/tasks/categories/core-skill/${category.id}`"
                            title="Manage"
                            text="Manage core skills"
                            shape="smooth"
                          />

                          <BaseDropdownItem
                            v-if="category?.is_active"
                            title="Deactivate"
                            text="Deactivate core skills"
                            shape="smooth"
                            @click="selectCategory(category, 'deactivate', 'skills')"
                          />
                          <BaseDropdownItem
                            v-if="!category?.is_active"
                            title="Activate"
                            text="Activate core skills"
                            shape="smooth"
                            @click="selectCategory(category, 'activate', 'skills')"
                          />

                          <BaseDropdownItem
                            v-if="!category?.is_active"
                            title="Delete"
                            text="Remove core skills"
                            shape="smooth"
                            @click="selectCategory(category, 'delete', 'skills')"
                          />
                        </BaseDropdown>
                      </FlexTableCell>
                    </template>
                  </FlexTableRow>
                </TransitionGroup>
              </div>

              <div v-if="!skillsPending && skills?.skills?.data.length !== 0" class="mt-4">
                <BasePagination
                  :total-items="skills?.skills?.total"
                  :item-per-page="perPage"
                  :current-page="page"
                  shape="curved"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeValue === 'games'">
            <div class="flex gap-4 lg:items-center justify-between py-4 my-2 flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="md"
                  weight="medium"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  All Games
                </BaseHeading>

                <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                  Interactive learning activities enhancing student engagement.
                </BaseText>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton color="primary" class="w-full sm:w-32" to="/tasks/categories/add-games">
                  <Icon name="lucide:plus" class="h-4 w-4" />
                  <span>Add New</span>
                </BaseButton>
              </div>
            </div>

            <div class="mt-6">
              <div v-if="!gamesPending && games?.value?.games?.data.length === 0">
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
                  <FlexTableRow
                    v-for="(category, index) in games?.games?.data"
                    :key="index"
                    shape="rounded"
                    spaced
                  >
                    <template #start>
                      <FlexTableStart
                        label="Game"
                        :hide-label="index > 0"
                        :title="category?.name"
                        :picture="getImageUrl(category?.banner)"
                        :sort="true"
                        @sort-column="() => columnSort('name')"
                      />
                    </template>

                    <template #end>
                      <FlexTableCell
                        label="Tasks"
                        :hide-label="index > 0"
                        class="w-full sm:w-36 lg:!justify-start"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          <BaseTag
                            shape="full"
                            variant="solid"
                            color="primary"
                            class="w-10 text-center"
                          >
                            {{ category?.tasks?.[0]?.task_count ?? 0 }}
                          </BaseTag>
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="Created date"
                        :sort="true"
                        :hide-label="index > 0"
                        class="w-full sm:w-40 lg:!justify-start"
                        @sort-column="() => columnSort('created_at')"
                      >
                        <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                          {{ formatDateFromString(category?.created_at) }}
                        </span>
                      </FlexTableCell>

                      <FlexTableCell
                        label="status"
                        :hide-label="index > 0"
                        class="w-full sm:w-28 lg:!justify-start"
                      >
                        <BaseTag
                          :color="statusColor(category?.is_active ? 'Active' : 'Inactive')"
                          shape="full"
                          size="sm"
                          class="capitalize"
                        >
                          {{ category?.is_active ? 'Active' : 'Inactive' }}
                        </BaseTag>
                      </FlexTableCell>

                      <FlexTableCell label="action" :hide-label="index > 0">
                        <BaseDropdown
                          flavor="context"
                          label="Dropdown"
                          orientation="end"
                          shape="smooth"
                        >
                          <BaseDropdownItem
                            :to="`/tasks/categories/game/${category.id}`"
                            title="Manage"
                            text="Manage games"
                            shape="smooth"
                          />

                          <BaseDropdownItem
                            v-if="category.is_active"
                            title="Deactivate"
                            text="Deactivate games"
                            shape="smooth"
                            @click="selectCategory(category, 'deactivate', 'games')"
                          />

                          <BaseDropdownItem
                            v-if="!category.is_active"
                            title="Activate"
                            text="Activate games"
                            shape="smooth"
                            @click="selectCategory(category, 'activate', 'games')"
                          />

                          <BaseDropdownItem
                            v-if="!category.is_active"
                            title="Delete"
                            text="Remove games"
                            shape="smooth"
                            @click="selectCategory(category, 'delete', 'games')"
                          />
                        </BaseDropdown>
                      </FlexTableCell>
                    </template>
                  </FlexTableRow>
                </TransitionGroup>
              </div>

              <div v-if="!gamesPending && games?.games?.data.length !== 0" class="mt-4">
                <BasePagination
                  :total-items="games?.games?.total"
                  :item-per-page="perPage"
                  :current-page="page"
                  shape="curved"
                />
              </div>
            </div>
          </div>
        </BaseTabSlider>
      </div>
    </BaseCard>

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
      Are you sure you want to deactivate this category?
    </BaseModal>

    <BaseModal
      :isOpen="isModalActivateCategory"
      :title="'Activate Category'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Activate'"
      :primaryButtonAction="activateCategory"
      :cancelButtonText="'Cancel'"
      @close="isModalActivateCategory = false"
    >
      Are you sure you want to activate this category?
    </BaseModal>

    <BaseModal
      :isOpen="isModalDeleteCategory"
      :title="'Delete Category'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="error"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="deleteCategory"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteCategory = false"
    >
      Are you sure you want to delete this category?
    </BaseModal>
  </TairoContentWrapper>
</template>
