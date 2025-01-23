<script setup>
definePageMeta({
  title: 'Individual Task',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const task = ref(null)
const summary = ref(null)
const studentList = ref(null)
const selectedEvidence = ref(null)

const selectedStudent = ref({})
const taskPerformance = ref([])

const isModalEvidenceOpen = ref(false)
const isModalRejectEvidence = ref(false)
const isModalApproveEvidence = ref(false)

onMounted(() => {
  const taskData = localStorage.getItem('selectTask')

  if (taskData) {
    task.value = JSON.parse(taskData)
  }
})

const sorting = ref({
  column: 'status',
  direction: 'asc',
})

const perPage = ref(20)
const page = computed(() => parseInt(route.query.page ?? '1'))

const fetchSchoolTaskPerformances = async () => {
  try {
    const body = {
      school_id: task.value?.school_id,
      location_id: task.value?.location_id,
      year: task.value?.year,
      term: task.value?.term,
      per_page: perPage.value,
      page: page.value,
    }

    const { data, error } = await schoolWriteApi(
      `/api/school-guest/school/academy-task-performances/${task.value?.id}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    studentList.value = data.value
    summary.value = data.value?.summary
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

watch(task, async () => {
  taskPerformance.value = [
    {
      label: 'Task Performance',
      hideLabel: false,
      to: '/performance/task',
      to: {
        name: 'task_performance',
        query: {
          task: JSON.stringify(task.value),
        },
      },
    },
    {
      label: task.value?.task_name || '',
      hideLabel: false,
    },
  ]

  if (task.value) {
    await fetchSchoolTaskPerformances()
  }
})

watch([page], async () => {
  await fetchSchoolTaskPerformances()
})

watch([sorting], async () => {
  if (page.value === 1) {
    await fetchSchoolTaskPerformances()
  } else {
    router.push({
      query: {
        page: undefined,
      },
    })
  }
})

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

const selectStudent = async (student, action) => {
  const modalStates = {
    approve: isModalApproveEvidence,
    disapprove: isModalRejectEvidence,
  }

  selectedStudent.value = student

  if (modalStates[action]) {
    modalStates[action].value = true
  }
}

const showEvidence = async (evidence) => {
  selectedEvidence.value = evidence
  isModalEvidenceOpen.value = true
}

const showEvidenceStatus = (approval, isSubmission) => {
  let color = 'danger'
  let text = 'Disapproved'

  if (approval == 1 && isSubmission) {
    color = 'success'
    text = 'Approved'
  } else if (approval == 0 && isSubmission) {
    color = 'danger'
    text = 'Disapproved'
  } else if (!isSubmission) {
    color = 'primary'
    text = 'Not Submitted'
  }

  return { color, text }
}

const statusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'pending':
      return 'In Progress'
    case 'incomplete':
      return 'Incomplete'
    case 'inactive':
      return 'Not Started'
    default:
      break
  }
}

const statusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'incomplete':
      return 'danger'
    case 'inactive':
      return 'primary'
    case 'rejected':
      return 'warning'
    default:
      break
  }
}

const approvalStatus = (status) => {
  switch (status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    default:
      break
  }
}

const downloadFunc = async () => {
  const query = {
    school_id: task.value?.school_id,
    location_id: task.value?.location_id,
    year: task.value?.year,
    term: task.value?.term,
  }

  const { data, error } = await useSchoolReadService(
    `/api/school/academy-task-performances/${task.value?.task_id}/export`,
    {
      query,
    },
  )

  if (error.value) {
    throw new Error(error.value?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `task_performance_${task.value?.school_name}_${task.value?.location_name}_${
        task.value?.year_text
      }_${task.value?.term_text}_${task.value?.task_name}_export_${Date()}.csv`,
    )
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const approveTaskEvidence = async (status) => {
  try {
    const body = {
      school_id: task.value?.school_id,
      location_id: task.value?.location_id,
      student_id: selectedStudent.value?.student_id,
      task_id: task.value?.id,
      section: 'core_activity',
      is_approved: status,
    }

    const { data, error } = await schoolWriteApi(
      '/api/school-guest/approve-student-task-performance',
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    isModalRejectEvidence.value = false
    isModalApproveEvidence.value = false

    if (status === 1) {
      showSuccessToast('Success', 'Evidence has been approved!')
    } else {
      showSuccessToast('Success', 'Evidence has been disapproved!')
    }

    await fetchSchoolTaskPerformances()
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="taskPerformance">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <TairoContentWrapper>
      <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Explore Students' Task Results
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Review the results of the selected task for each student.
          </BaseText>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            class="w-full sm:w-32"
            :disabled="!studentList || (studentList?.data && studentList?.data.length === 0)"
            @click="downloadFunc"
          >
            <Icon name="ph:export-light" class="h-4 w-4" />
            <span>Export</span>
          </BaseButton>
        </div>
      </div>

      <div class="pt-4 pb-4">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 lg:col-span-12">
            <BaseCard class="p-6 !bg-primary-500" color="primary">
              <div
                class="xs:divide-y divide-muted-200 dark:divide-muted-700 flex w-full flex-col items-center sm:flex-row sm:divide-x"
              >
                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="heroicons:building-library"
                      class="text-primary-100 mx-auto h-8 w-8"
                    />
                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      {{ task?.school_name }}
                    </h4>
                    <p class="text-muted-300 font-sans text-sm">School name</p>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="material-symbols:location-on-outline"
                      class="text-primary-100 mx-auto h-8 w-8"
                    />
                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      {{ task?.location_name }}
                    </h4>
                    <p class="text-muted-300 font-sans text-sm">Location name</p>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="material-symbols:transition-slide-outline"
                      class="text-primary-100 mx-auto h-8 w-8"
                    />
                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      {{ task?.year_text }} , {{ task?.term_text }}
                    </h4>
                    <p class="text-muted-300 font-sans text-sm">Year , Term</p>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="material-symbols:task-outline"
                      class="text-primary-100 mx-auto h-8 w-8"
                    />
                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      {{ task?.task_name }}
                    </h4>
                    <p class="text-muted-300 font-sans text-sm">Task Name</p>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>

        <div>
          <div v-if="studentList?.data.length === 0">
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

          <div v-else class="space-y-2 mt-14">
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="absolute transform-gpu"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-full"
            >
              <FlexTableRow
                v-for="(item, index) in studentList?.data"
                :key="index"
                shape="rounded"
                spaced
              >
                <template #start>
                  <FlexTableStart
                    label="Student"
                    :hide-label="index > 0"
                    :title="item?.student_name ? item?.student_name : ''"
                    :subtitle="item?.code ? item?.code : ''"
                    :avatar="item?.avatar ? item?.avatar : ''"
                    :initials="
                      getInitialLettersFromFullName(item?.student_name ? item?.student_name : '')
                    "
                  />
                </template>

                <template #end>
                  <FlexTableCell
                    label="Time Taken"
                    :hide-label="index > 0"
                    class="w-full sm:w-40 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item?.total_time_spent }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Score"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item?.score }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="w-full sm:w-32 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      <BaseTag
                        :color="statusColor(item?.status)"
                        shape="full"
                        size="sm"
                        class="capitalize"
                      >
                        {{ statusText(item?.status) }}
                      </BaseTag>
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Feedback Index"
                    :hide-label="index > 0"
                    class="w-full sm:w-36 lg:!justify-start"
                  >
                    <span
                      class="text-muted-600 dark:text-muted-400 font-sans text-sm"
                      v-if="item?.satisfaction == null"
                    >
                      {{ item?.satisfaction == null ? 'Not Rated' : '' }}
                    </span>

                    <span class="" v-else-if="item?.satisfaction === 1">
                      <Icon name="bi:hand-thumbs-up" class="text-success-500 mx-auto h-6 w-6" />
                    </span>

                    <span class="" v-else-if="item?.satisfaction === 0">
                      <Icon name="bi:hand-thumbs-down" class="text-danger-500 mx-auto h-6 w-6" />
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Evidence"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      <img
                        v-if="item?.submission"
                        :src="getImageUrl(JSON.parse(JSON.parse(item.submission).evidence).url)"
                        :alt="JSON.parse(JSON.parse(item.submission).evidence).name"
                        class="h-12 w-16 object-cover cursor-pointer"
                        @click="showEvidence(JSON.parse(JSON.parse(item.submission).evidence).url)"
                      />

                      <img
                        v-else
                        src="/img/dummy.png"
                        class="h-12 w-16 object-cover cursor-pointer"
                      />
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="E-Status"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      <BaseTag
                        :color="
                          showEvidenceStatus(item?.core_activity_approval_status, item?.submission)
                            .color
                        "
                        shape="full"
                        size="sm"
                        class="capitalize"
                      >
                        {{
                          showEvidenceStatus(item?.core_activity_approval_status, item?.submission)
                            .text
                        }}
                      </BaseTag>
                    </span>
                  </FlexTableCell>

                  <FlexTableCell label="action" :hide-label="index > 0">
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end">
                      <BaseDropdownItem
                        v-if="item?.core_activity_approval_status === 0"
                        title="Approve"
                        text="Approve the evidence"
                        rounded="sm"
                        :disabled="!item?.submission"
                        @click="selectStudent(item, 'approve')"
                      />

                      <BaseDropdownItem
                        v-else
                        title="Disapprove"
                        text="Disapprove the evidence"
                        rounded="sm"
                        :disabled="!item?.submission"
                        @click="selectStudent(item, 'disapprove')"
                      />
                    </BaseDropdown>
                  </FlexTableCell>
                </template>
              </FlexTableRow>
            </TransitionGroup>
          </div>

          <div v-if="studentList && studentList?.data.length !== 0" class="mt-4">
            <BasePagination
              :total-items="studentList?.total ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <div>
      <TairoModal :open="isModalEvidenceOpen" size="lg" @close="isModalEvidenceOpen = false">
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
                    Evidence
                  </BaseHeading>

                  <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                    Customize user access and permissions for each segment
                  </BaseText>
                </div>
              </div>
            </div>

            <BaseButtonClose
              @click="isModalEvidenceOpen = false"
              class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
            />
          </div>
        </template>

        <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-80 lg:overflow-auto lg:max-h-none">
          <div>
            <div>
              <img :src="getImageUrl(selectedEvidence)" class="w-full" />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="p-4 md:p-6">
            <div class="flex gap-x-2">
              <BaseButton @click="isModalEvidenceOpen = false"> Cancel </BaseButton>
            </div>
          </div>
        </template>
      </TairoModal>
    </div>

    <BaseModal
      :isOpen="isModalApproveEvidence"
      title="Approve Evidence"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="() => approveTaskEvidence(1)"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveEvidence = false"
    >
      Are you sure you want to approve this evidence?
    </BaseModal>

    <BaseModal
      :isOpen="isModalRejectEvidence"
      title="Reject Evidence"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Reject'"
      :primaryButtonAction="() => approveTaskEvidence(0)"
      :cancelButtonText="'Cancel'"
      @close="isModalRejectEvidence = false"
    >
      Are you sure you want to reject this evidence?
    </BaseModal>
  </div>
</template>
