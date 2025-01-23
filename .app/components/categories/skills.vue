<script setup>
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isModalDeleteCategory = ref(false)
const isModalActivateCategory = ref(false)
const isModalDeactivateCategory = ref(false)
const isModalCanNotDeactivateCategory = ref(false)

const skills = ref(null)
const actionsMessage = ref('')
const selectedCategory = ref(null)

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    per_page: perPage.value,
    page: page.value,
    sort_field: sorting.value.column,
    sort_direction: sorting.value.direction,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const getSkills = async () => {
  try {
    const { data, error } = await useApiFetch('/api/admin/skills', {
      query,
      watch: false,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    skills.value = data.value
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
if (!route.query.page) {
  await getSkills()
}

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

    await getSkills()
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

    await getSkills()
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

    await getSkills()
    showSuccessToast('Success', 'Skill has been deleted!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

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

const goToTasks = () => {
  router.push({ name: 'tasks', query: { selectedSkill: selectedCategory.value?.name } })
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

const formatDateTime = (dateString) => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = utcToZonedTime(new Date(dateString), systemTimeZone)

  const formattedDate = format(date, 'do MMMM yyyy', { timeZone: systemTimeZone })
  const formattedTime = format(date, 'p', { timeZone: systemTimeZone })

  return {
    date: formattedDate,
    time: formattedTime,
  }
}

watch(query, async () => {
  await getSkills()
})

watch([perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

onMounted(() => {
  router.push({
    query: {
      page: undefined,
    },
  })
})
</script>

<template>
  <div>
    <div class="flex gap-4 lg:items-center justify-between py-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Core Skills
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Create, update, and manage all essential skills categories
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton color="primary" class="w-full sm:w-32" to="/tasks/categories/add-core-skills">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add New</span>
        </BaseButton>
      </div>
    </div>

    <div class="mt-6">
      <div v-if="skills?.skills?.data.length === 0">
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
            v-for="(skill, index) in skills?.skills?.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Skill"
                :hide-label="index > 0"
                :title="skill?.name"
                :subtitle="skill?.code"
                :picture="getImageUrl(skill?.banner)"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Total Tasks"
                :hide-label="index > 0"
                class="w-full sm:w-36 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag shape="full" variant="solid" color="primary" class="w-14 text-center">
                    {{ skill?.tasks_count ?? 0 }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created date"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(skill?.created_at).date }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created time"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{ formatDateTime(skill?.created_at).time }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Status"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
              >
                <BaseTag
                  :color="statusColor(skill?.status)"
                  shape="full"
                  size="sm"
                  class="capitalize"
                >
                  {{ skill?.status }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    :to="`/tasks/categories/core-skill/${skill.id}`"
                    title="Manage"
                    text="Manage core skills"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="skill.status === 'Active'"
                    title="Deactivate"
                    text="Deactivate skill"
                    shape="smooth"
                    @click="selectCategory(skill, 'deactivate')"
                  />

                  <BaseDropdownItem
                    v-if="skill.status === 'Draft'"
                    title="Approve"
                    text="Approve skill"
                    shape="smooth"
                    @click="selectCategory(skill, 'activate')"
                  />

                  <BaseDropdownItem
                    v-if="skill.status === 'Inactive'"
                    title="Activate"
                    text="Activate skill"
                    shape="smooth"
                    @click="selectCategory(skill, 'activate')"
                  />

                  <BaseDropdownItem
                    v-if="skill.status !== 'Active'"
                    title="Delete"
                    text="Remove skill"
                    shape="smooth"
                    @click="selectCategory(skill, 'delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>

      <div v-if="skills?.data?.length !== 0" class="mt-4">
        <BasePagination
          :total-items="skills?.skills?.total"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

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
      Are you sure you want to deactivate
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedCategory?.name }}
      </span>
      skill?
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
      <span v-if="selectedCategory?.status === 'Draft'">
        Are you sure you want to approve
        <span class="font-bold text-primary-500 dark:text-muted-200">
          {{ selectedCategory.name }}
        </span>
        skill?
      </span>
      <span v-else>
        Are you sure you want to activate
        <span class="font-bold text-primary-500 dark:text-muted-200">
          {{ selectedCategory.name }}
        </span>
        skill again?
      </span>
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
      Do you want to proceed to delete
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedCategory.name }}
      </span>
      skill?
    </BaseModal>
  </div>
</template>
