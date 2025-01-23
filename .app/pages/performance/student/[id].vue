<script setup>
definePageMeta({
  title: 'Individual Performance',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const student = ref(null)
const summary = ref(null)
const resultList = ref(null)
const queryStudent = ref(null)
const isModalHasEvidence = ref(false)
const isModalPerformanceView = ref(false)

onMounted(() => {
  const studentData = localStorage.getItem('selectStudent')

  const qStudent = localStorage.getItem('queryStudent')
  queryStudent.value = JSON.parse(qStudent)

  if (studentData) {
    student.value = JSON.parse(studentData)
  }
})

const induvidualPerformance = ref([])

const sorting = ref({
  column: 'status',
  direction: 'asc',
})

const perPage = ref(20)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school_id: student.value?.school_id,
    location_id: student.value?.location_ids,
    student_id: student.value?.student_id,
    year: student.value?.year,
    term: student.value?.term,
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

const fetchStudentAcademyResults = async () => {
  try {
    const { data, error } = await schoolWriteApi('/api/school-guest/results/academy', {
      query,
      watch: false,
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    resultList.value = data.value
    summary.value = data.value?.result?.summary
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

watch(student, async () => {
  induvidualPerformance.value = [
    {
      label: 'Student Performance',
      hideLabel: false,
      to: {
        name: 'student_performance',
        query: {
          student: JSON.stringify(queryStudent.value),
        },
      },
    },
    {
      label: student.value?.student_name || '',
      hideLabel: false,
    },
  ]

  if (student.value) {
    await fetchStudentAcademyResults()
  }
})

watch([page], async () => {
  await fetchStudentAcademyResults()
})

watch([sorting], async () => {
  if (page.value === 1) {
    await fetchStudentAcademyResults()
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

const downloadFunc = async () => {
  const query = {
    school_id: student.value?.school_id,
    location_id: student.value?.location_ids,
    student_id: student.value?.student_id,
    year: student.value?.year,
    term: student.value?.term,
  }

  const { data, error } = await useSchoolReadService('/api/school/academy-student-results/export', {
    query,
  })

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
      `student_performance_${student.value.school_name}_${student.value.location_name}_${
        student.value?.student_name
      }_${student.value?.year_text}_${student.value?.term_text}_export_${Date()}.csv`,
    )
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
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
    case '1':
      return 'success'
    case '0':
      return 'danger'
    default:
      break
  }
}

const lastActivity = (section) => {
  switch (section) {
    case 'introduction':
      return 'Game Introduction'
    case 'core_activity':
      return 'Core Activity'
    case 'knowledge_qa':
      return 'Q&A'
    default:
      return '-'
      break
  }
}

const selectedTask = ref({})
const performance = ref({})

const getTaskDetails = async () => {
  try {
    const body = {
      school_id: student.value?.school_id,
      location_id: student.value?.location_ids,
      student_id: student.value?.student_id,
      year: student.value?.year,
      term: student.value?.term,
    }

    const { data, error } = await schoolWriteApi(
      `/api/school-guest/results/academy/${selectedTask.value?.task_id}`,
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

    performance.value = data.value?.result
  } catch (error) {
    showErrorToast('Oops!', error.message)
    performance.value = {}
  }
}

const selectTask = async (task) => {
  selectedTask.value = task
  await getTaskDetails()

  isModalPerformanceView.value = true
}

const getTotalScore = () => {
  const sectionScores = performance.value.section_scores
  const scoresArray = Array.isArray(sectionScores) ? sectionScores : Object.values(sectionScores)
  const totalScore = scoresArray.reduce((acc, curr) => acc + parseFloat(curr.score), 0)

  return totalScore.toFixed(2)
}

const approveStudentTaskPerformance = async (status) => {
  try {
    const body = {
      school_id: student.value?.school_id,
      location_id: student.value?.location_ids,
      student_id: student.value?.student_id,
      task_id: selectedTask.value?.task_id,
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

    if (status === 1) {
      showSuccessToast('Success', 'Evidence has been approved!')
    } else {
      showSuccessToast('Success', 'Evidence has been disapproved!')
    }

    await getTaskDetails()
    await fetchStudentAcademyResults()
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

// onBeforeUnmount(() => {
//   localStorage.removeItem('selectStudent')
//   localStorage.removeItem('queryStudent')
// })
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="induvidualPerformance">
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
            {{ student?.student_name }} Overall Results
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Review the comprehensive academic performance of each tasks performed.
          </BaseText>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            class="w-full sm:w-32"
            :disabled="
              !resultList || (resultList?.result?.data && resultList?.result?.data.length === 0)
            "
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
                    <Icon name="ph:student" class="text-primary-100 mx-auto h-8 w-8" />

                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      {{ student?.student_name }}
                    </h4>

                    <p class="text-muted-300 font-sans text-sm">
                      {{ student?.year_text }} - {{ student?.term_text }}
                    </p>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="material-symbols:readiness-score-outline-sharp"
                      class="text-primary-100 mx-auto h-8 w-8"
                    />

                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      {{ student?.avg_score ? parseFloat(student?.avg_score).toFixed(2) : 0 }}
                    </h4>

                    <p class="text-muted-300 font-sans text-sm">Avg Score</p>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <Icon
                      name="material-symbols-light:hourglass-bottom"
                      class="text-primary-100 mx-auto h-8 w-8"
                    />

                    <h4 class="text-muted-100 font-sans text-xl font-semibold">
                      <span v-if="student?.avg_time_spent.d">{{ student?.avg_time_spent.d }}d</span>
                      {{ student?.avg_time_spent.h }}h {{ student?.avg_time_spent.m }}m
                    </h4>

                    <p class="text-muted-300 font-sans text-sm">Avg Time Taken</p>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-col p-4 text-center sm:py-0">
                    <div class="flex items-center justify-center gap-4">
                      <div>
                        <img src="/img/badges/Badge 1.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center text-muted-100">
                          {{ summary?.badges_count?.platinum ?? '0' }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 2.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center text-muted-100">
                          {{ summary?.badges_count?.gold ?? '0' }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 4.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center text-muted-100">
                          {{ summary?.badges_count?.silver ?? '0' }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 3.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center text-muted-100">
                          {{ summary?.badges_count?.bronze ?? '0' }}
                        </div>
                      </div>
                    </div>

                    <p class="text-muted-300 font-sans text-sm">Badges Earned</p>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>

        <!-- List -->
        <div>
          <div v-if="resultList?.result?.data.length === 0">
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
                v-for="(item, index) in resultList?.result?.data"
                :key="index"
                shape="rounded"
                spaced
              >
                <template #start>
                  <FlexTableStart
                    label="Task"
                    sortingBy="name"
                    :sort="true"
                    :hide-label="index > 0"
                    :title="item.task_name"
                    :subtitle="item.game"
                    :picture="getImageUrl(item.thumbnail)"
                    :initials="getInitialLettersFromFullName(item.task_name)"
                    @sort-column="columnSort"
                  />
                </template>

                <template #end>
                  <FlexTableCell
                    label="Time Taken"
                    sortingBy="total_time_spent"
                    :sort="true"
                    :hide-label="index > 0"
                    class="w-full sm:w-40 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item?.total_time_spent }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Score"
                    sortingBy="score"
                    :sort="true"
                    :hide-label="index > 0"
                    class="w-full sm:w-28 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ item?.score ? parseFloat(item?.score).toFixed(2) : 0 }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Last Activity"
                    :hide-label="index > 0"
                    class="w-full sm:w-40 lg:!justify-start"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      {{ lastActivity(item.last_active_section) }}
                    </span>
                  </FlexTableCell>

                  <FlexTableCell
                    label="Status"
                    sortingBy="status"
                    :sort="true"
                    :hide-label="index > 0"
                    class="w-full sm:w-36 lg:!justify-start"
                    @sort-column="columnSort"
                  >
                    <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                      <BaseTag
                        :color="statusColor(item.status)"
                        shape="full"
                        size="sm"
                        class="capitalize"
                      >
                        {{ statusText(item.status) }}
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
                      v-if="item.satisfaction == null"
                    >
                      {{ item.satisfaction == null ? 'Not Rated' : '' }}
                    </span>

                    <span class="" v-else-if="item.satisfaction === 1">
                      <Icon name="bi:hand-thumbs-up" class="text-success-500 mx-auto h-6 w-6" />
                    </span>

                    <span class="" v-else-if="item.satisfaction === 0">
                      <Icon name="bi:hand-thumbs-down" class="text-danger-500 mx-auto h-6 w-6" />
                    </span>
                  </FlexTableCell>

                  <FlexTableCell label="action" :hide-label="index > 0">
                    <BaseButtonAction
                      :color="
                        item.status === 'pending' || item.status === 'inactive'
                          ? 'muted'
                          : 'primary'
                      "
                      :disabled="item.status === 'pending' || item.status === 'inactive'"
                      @click="selectTask(item)"
                    >
                      <span>View</span>
                    </BaseButtonAction>
                  </FlexTableCell>
                </template>
              </FlexTableRow>
            </TransitionGroup>
          </div>

          <div v-if="resultList && resultList?.result?.data.length !== 0" class="mt-4">
            <BasePagination
              :total-items="resultList?.result?.total ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>

        <div>
          <TairoModal
            v-if="isModalPerformanceView"
            size="3xl"
            :open="isModalPerformanceView"
            @close="isModalPerformanceView = false"
          >
            <template #header>
              <div class="relative">
                <div class="p-6 pe-16">
                  <div class="flex gap-4 lg:items-center flex-col lg:flex-row max-w-2xl">
                    <div>
                      <BaseHeading
                        tag="h2"
                        size="lg"
                        weight="medium"
                        lead="normal"
                        class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                      >
                        Task Results
                      </BaseHeading>

                      <BaseText size="sm" class="text-muted-600 dark:text-muted-400"></BaseText>
                    </div>
                  </div>
                </div>

                <BaseButtonClose
                  @click="isModalPerformanceView = false"
                  class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
                />
              </div>
            </template>

            <!-- Body -->
            <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-12rem)]">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 lg:col-span-12">
                  <BaseCard class="p-6 py-2 !bg-primary-500" color="primary">
                    <div
                      class="xs:divide-y divide-muted-200 dark:divide-muted-700 flex w-full flex-col items-center sm:flex-row sm:divide-x"
                    >
                      <div class="flex-1">
                        <div class="flex flex-col p-4 text-center sm:py-0">
                          <Icon
                            name="material-symbols:task-outline"
                            class="text-primary-100 mx-auto h-8 w-8"
                          />

                          <h4 class="text-muted-100 font-sans text-lg font-semibold">
                            {{ selectedTask?.task_name }}
                          </h4>

                          <p class="text-muted-300 font-sans text-sm">Task Name</p>
                        </div>
                      </div>

                      <div class="flex-1">
                        <div class="flex flex-col p-4 text-center sm:py-0">
                          <Icon
                            name="material-symbols:videogame-asset-outline"
                            class="text-primary-100 mx-auto h-8 w-8"
                          />

                          <h4 class="text-muted-100 font-sans text-lg font-semibold">
                            {{ selectedTask?.game }}
                          </h4>

                          <p class="text-muted-300 font-sans text-sm">Game</p>
                        </div>
                      </div>

                      <div class="flex-1">
                        <div class="flex flex-col p-4 text-center sm:py-0">
                          <Icon
                            name="material-symbols:calendar-today-outline"
                            class="text-primary-100 mx-auto h-8 w-8"
                          />

                          <h4 class="text-muted-100 font-sans text-lg font-semibold">
                            {{ student?.year_text }}
                          </h4>

                          <p class="text-muted-300 font-sans text-sm">Academic Year</p>
                        </div>
                      </div>

                      <div class="flex-1">
                        <div class="flex flex-col p-4 text-center sm:py-0">
                          <Icon
                            name="material-symbols:transition-slide-outline"
                            class="text-primary-100 mx-auto h-8 w-8"
                          />

                          <h4 class="text-muted-100 font-sans text-lg font-semibold">
                            {{ student?.term_text }}
                          </h4>

                          <p class="text-muted-300 font-sans text-sm">Academic Term</p>
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                </div>

                <div class="col-span-12 lg:col-span-5 mt-2 space-y-4">
                  <BaseCard class="p-2">
                    <div class="my-4">
                      <BaseHeading
                        tag="h2"
                        size="sm"
                        weight="medium"
                        lead="normal"
                        class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                      >
                        Score by sections
                      </BaseHeading>
                    </div>

                    <TairoTable rounded="none">
                      <template #header>
                        <TairoTableHeading uppercase class="w-3/4 px-2 ps-4 py-4 bg-primary-50">
                          Name
                        </TairoTableHeading>

                        <TairoTableHeading uppercase class="w-1/4 px-2 py-4 bg-primary-50">
                          Score
                        </TairoTableHeading>
                      </template>

                      <TairoTableRow
                        v-for="(section, index) in performance.section_scores"
                        :key="index"
                      >
                        <TairoTableCell class="px-2 ps-4 !text-base">
                          {{ section.name }}
                        </TairoTableCell>

                        <TairoTableCell
                          v-if="section.status === 'incomplete'"
                          class="px-2 !text-base text-danger-500"
                        >
                          <BaseTag color="danger" shape="full" size="sm" class="capitalize !py-0">
                            Incomplete
                          </BaseTag>
                        </TairoTableCell>

                        <TairoTableCell v-else class="px-2 !text-base">
                          {{ section.score }}
                        </TairoTableCell>
                      </TairoTableRow>

                      <TairoTableRow class="bg-success-100">
                        <TairoTableCell class="px-2 ps-4 !text-base">
                          <span class="text-primary-500 font-bold">Total</span>
                        </TairoTableCell>

                        <TairoTableCell class="px-2 !text-base">
                          <span class="text-primary-500 font-bold">{{ getTotalScore() }}</span>
                        </TairoTableCell>
                      </TairoTableRow>
                    </TairoTable>
                  </BaseCard>

                  <BaseCard class="p-2">
                    <div class="my-4 flex justify-between items-center">
                      <BaseHeading
                        tag="h2"
                        size="sm"
                        weight="medium"
                        lead="normal"
                        class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                      >
                        Core activity Evidence
                      </BaseHeading>

                      <div>
                        <BaseTag
                          v-if="performance.section_scores?.core_activity?.status === 'incomplete'"
                          color="danger"
                          shape="full"
                          size="md"
                          class="capitalize"
                        >
                          Incomplete
                        </BaseTag>

                        <BaseTag
                          v-else
                          :color="
                            approvalStatus(performance.submissions.core_activity_approval_status)
                          "
                          shape="full"
                          size="md"
                          class="capitalize"
                        >
                          {{
                            performance.submissions.core_activity_approval_status === '1'
                              ? 'Approved'
                              : 'Disapproved'
                          }}
                        </BaseTag>
                      </div>

                      <BaseDropdown
                        v-if="performance.submissions.core_activity"
                        flavor="context"
                        label="Dropdown"
                        placement="bottom-end"
                      >
                        <BaseDropdownItem
                          v-if="performance.submissions.core_activity_approval_status === '0'"
                          title="Approve"
                          text="Approve the evidence"
                          rounded="sm"
                          :disabled="
                            !performance.submissions.core_activity ||
                            (!performance.submissions.core_activity &&
                              !performance.submissions.core_activity?.evidence)
                          "
                          @click="approveStudentTaskPerformance(1)"
                        />

                        <BaseDropdownItem
                          v-else
                          title="Disapprove"
                          text="Disapprove the evidence"
                          rounded="sm"
                          :disabled="
                            !performance.submissions.core_activity ||
                            (!performance.submissions.core_activity &&
                              !performance.submissions.core_activity?.evidence)
                          "
                          @click="approveStudentTaskPerformance(0)"
                        />
                      </BaseDropdown>
                    </div>

                    <div class="mt-4 flex gap-4 items-center">
                      <div
                        v-if="performance.section_scores?.core_activity?.status === 'completed'"
                        class="flex-1 border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3 cursor-pointer"
                        @click="isModalHasEvidence = true"
                      >
                        <div class="flex items-center gap-2">
                          <div class="shrink-0">
                            <img
                              class="size-14 rounded-md object-cover object-center w-16"
                              :src="
                                performance.submissions.core_activity
                                  ? getImageUrl(
                                      JSON.parse(performance.submissions.core_activity?.evidence)
                                        ?.url,
                                    )
                                  : ''
                              "
                              alt="Image preview"
                            />
                          </div>

                          <div class="font-sans">
                            <span
                              class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                            >
                              {{
                                performance.submissions.core_activity
                                  ? JSON.parse(performance.submissions.core_activity?.evidence)
                                      ?.name
                                  : ''
                              }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="performance.section_scores?.core_activity?.status === 'incomplete'"
                        class="flex-1 border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3 cursor-pointer"
                      >
                        <div class="items-center gap-2">
                          <div class="flex gap-4 items-center justify-center">
                            <Icon
                              name="material-symbols:warning-outline"
                              class="text-danger-500 w-10 h-10"
                            />

                            <p class="text-danger-500 dark:text-danger-200 text-sm">
                              No evidence uploaded.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                </div>

                <div class="col-span-12 lg:col-span-7 mt-2">
                  <BaseCard class="p-2">
                    <div class="my-4">
                      <BaseHeading
                        tag="h2"
                        size="sm"
                        weight="medium"
                        lead="normal"
                        class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                      >
                        Question and Answer
                      </BaseHeading>
                    </div>

                    <TairoTable rounded="none">
                      <template #header>
                        <TairoTableHeading uppercase class="w-3/4 px-2 ps-4 py-4 bg-primary-50">
                          Question
                        </TairoTableHeading>

                        <TairoTableHeading uppercase class="w-1/4 px-2 py-4 bg-primary-50">
                          Answer
                        </TairoTableHeading>
                      </template>

                      <TairoTableRow
                        v-for="(qa, index) in performance.submissions.knowledge_qa"
                        :key="index"
                      >
                        <TairoTableCell class="px-2 ps-4 !text-base !whitespace-normal">
                          {{ qa.question }}
                        </TairoTableCell>

                        <TairoTableCell class="px-2 pe-4 !text-base !whitespace-normal">
                          <div class="sm:w-56 space-y-1">
                            <template v-if="qa.given_answer != qa.correct_answer">
                              <div
                                v-if="
                                  performance.section_scores?.knowledge_qa?.status === 'incomplete'
                                "
                                class="flex gap-2 items-start"
                              >
                                <Icon
                                  :name="'gridicons:cross-circle'"
                                  class="w-5 h-5 text-danger-500"
                                />
                                <p class="flex-1 text-danger-500 dark:text-danger-200 text-sm">
                                  Incomplete
                                </p>
                              </div>

                              <div v-else class="flex gap-2 items-start">
                                <Icon
                                  :name="'gridicons:cross-circle'"
                                  class="w-5 h-5 mt-1 text-danger-500"
                                />
                                <p class="flex-1">{{ qa['answer_' + qa.given_answer] }}</p>
                              </div>

                              <div class="flex gap-2 items-start">
                                <Icon
                                  :name="'material-symbols:check-circle'"
                                  class="w-5 h-5 mt-1 text-lime-500"
                                />
                                <p class="flex-1">{{ qa['answer_' + qa.correct_answer] }}</p>
                              </div>
                            </template>

                            <template v-else>
                              <div class="flex gap-2 items-start">
                                <Icon
                                  :name="'material-symbols:check-circle'"
                                  class="w-5 h-5 mt-1 text-lime-500"
                                />
                                <p class="flex-1">{{ qa['answer_' + qa.correct_answer] }}</p>
                              </div>
                            </template>
                          </div>
                        </TairoTableCell>
                      </TairoTableRow>
                    </TairoTable>
                  </BaseCard>
                </div>
              </div>
            </div>
          </TairoModal>
        </div>

        <div>
          <TairoModal
            v-if="isModalHasEvidence"
            size="lg"
            :open="isModalHasEvidence"
            @close="isModalHasEvidence = false"
          >
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
                  class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
                  @click="isModalHasEvidence = false"
                />
              </div>
            </template>

            <div
              class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-80 lg:overflow-auto lg:max-h-none"
            >
              <div>
                <div>
                  <img
                    :src="
                      getImageUrl(JSON.parse(performance.submissions.core_activity.evidence)?.url)
                    "
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <template #footer>
              <div class="p-4 md:p-6">
                <div class="flex gap-x-2">
                  <BaseButton @click="isModalHasEvidence = false"> Cancel </BaseButton>
                </div>
              </div>
            </template>
          </TairoModal>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
