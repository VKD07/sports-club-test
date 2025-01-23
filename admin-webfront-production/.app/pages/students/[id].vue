<script setup>
definePageMeta({
  title: 'Manage Student Account',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const avatar = ref('')
const schoolId = ref('')
const locationId = ref('')
const actionStatus = ref('')

const summary = ref({})
const activeTerm = ref({})
const selectedStudent = ref({})

const fetchStudent = async () => {
  const { data, error } = await useAdminReadService(`/api/admin/student-user/${id}`)

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong fetch in student data, please try again!')
  }

  selectedStudent.value = data.value?.user
  avatar.value = selectedStudent.value?.student_profile?.profile_picture
  schoolId.value = selectedStudent.value?.school_id
  locationId.value = selectedStudent.value?.location_id
}
await fetchStudent()

const getStudentPerformanceSummary = async () => {
  const query = {
    school_id: schoolId.value,
    location_id: locationId.value,
  }

  const { data, error } = await schoolWriteApi(
    `/api/school-guest/student/${id}/performance-summary`,
    {
      query,
    },
  )

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch performance summary, please try again!')
  }

  summary.value = data.value?.summary
  activeTerm.value = data.value?.active_term
}
await getStudentPerformanceSummary()

const studentAvatar = ref(avatar.value)

const resetStudent = async () => {
  await fetchStudent()
  await getStudentPerformanceSummary()
  studentAvatar.value = avatar.value
}

const updateStudent = async () => {
  try {
    const formData = new FormData()
    formData.append('id', id)
    formData.append('avatar', studentAvatar.value)

    const { error } = await useApiFetch(`/api/admin/student-profile-pic-Update`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    await fetchStudent()
    showSuccessToast('Success', 'Student avatar has been updated successfully!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const isModalAvatar = ref(false)
const isModalHoldStudent = ref(false)
const isModalResumeStudent = ref(false)
const isModalDeleteStudent = ref(false)
const isModalApproveStudent = ref(false)
const isModalSuspendStudent = ref(false)
const isModalReleaseStudent = ref(false)

const openAvatarModal = () => {
  isModalAvatar.value = true
}

const handleAvatarClick = (newAvatar) => {
  selectedStudent.value.student_profile.profile_picture = newAvatar
  studentAvatar.value = newAvatar
  isModalAvatar.value = false
}

const defaultAvatar = computed(() => {
  return getInitialLetters(selectedStudent.value?.first_name, selectedStudent.value?.last_name)
})

const statusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'suspended':
      return 'danger'
    case 'draft':
      return 'warning'
    case 'on hold':
      return 'info'
    default:
      break
  }
}

const selectStudent = (action) => {
  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'deleted',
  }

  if (action === 'Approve') {
    isModalApproveStudent.value = true
  } else if (action === 'Suspend') {
    isModalSuspendStudent.value = true
  } else if (action === 'Release') {
    isModalReleaseStudent.value = true
  } else if (action === 'Resume') {
    isModalResumeStudent.value = true
  } else if (action === 'Hold') {
    isModalHoldStudent.value = true
  } else if (action === 'Delete') {
    isModalDeleteStudent.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeStudentStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('id', selectedStudent.value?.id ?? '')
    formData.append('status', actionStatus.value)

    const { error } = await useApiFetch('/api/admin/user-account-status', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldStudent.value = false
    isModalResumeStudent.value = false
    isModalDeleteStudent.value = false
    isModalApproveStudent.value = false
    isModalSuspendStudent.value = false
    isModalReleaseStudent.value = false

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    await fetchStudent()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'Student has been deleted!')
    } else {
      showSuccessToast('Success', 'Student status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

const activeTab = ref('studentProfile')
provide('student', selectedStudent.value)
</script>

<template>
  <div>
    <div class="ltablet:flex-row relative flex w-full flex-col lg:flex-row gap-6">
      <div class="ltablet:flex-row relative z-10 flex w-full flex-col gap-6 lg:flex-row">
        <div class="grid grid-cols-12 gap-4 w-full">
          <div class="col-span-12 lg:col-span-6">
            <BaseCard class="p-6 flex gap-6 !h-full">
              <div class="w-auto">
                <div class="relative h-24 w-24">
                  <img
                    v-if="studentAvatar"
                    :src="studentAvatar"
                    alt="Avatar"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"
                  />

                  <div
                    v-else
                    class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 h-24 w-24 p-6 rounded-full object-cover object-center flex items-center justify-center text-4xl nui-weight-bold"
                  >
                    <span>{{ defaultAvatar }}</span>
                  </div>

                  <div class="absolute bottom-0 end-0 z-20">
                    <div class="relative" data-nui-tooltip="Change Avatar">
                      <BaseButtonIcon size="sm" shape="full" @click="openAvatarModal">
                        <Icon name="lucide:plus" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>

                <h4 class="text-primary-500 dark:text-white font-bold text-center">
                  Grade {{ selectedStudent?.grade }}
                </h4>

                <div class="text-center mt-4">
                  <BaseTag
                    :color="statusColor(selectedStudent?.status)"
                    shape="full"
                    size="md"
                    class="capitalize"
                  >
                    {{ selectedStudent?.status }}
                  </BaseTag>
                </div>
              </div>

              <div class="w-grow">
                <h3 class="text-primary-500 dark:text-white font-bold text-lg">
                  {{ selectedStudent?.first_name }} {{ selectedStudent?.last_name }}
                </h3>

                <div class="flex gap-4 items-center mt-6">
                  <Icon name="ph:identification-badge-light" class="h-5 w-5 text-primary-400" />
                  <p class="nui-label">Student ID</p>

                  <span class="bg-primary-100 text-muted-800 px-4 py-1 rounded-full">
                    {{ selectedStudent?.user_id }}
                  </span>
                </div>

                <div class="flex gap-4 items-center mt-4">
                  <Icon name="carbon:skill-level" class="h-5 w-5 text-primary-400" />
                  <p class="nui-label">Academic Level</p>

                  <span class="bg-primary-100 text-muted-800 px-4 py-1 rounded-full capitalize">
                    {{ selectedStudent?.level }}
                  </span>
                </div>

                <div class="flex gap-4 items-center mt-4">
                  <Icon
                    name="material-symbols:mail-outline-rounded"
                    class="h-5 w-5 text-primary-400"
                  />
                  <p class="nui-label">{{ selectedStudent?.email }}</p>
                </div>

                <div class="flex gap-4 items-center mt-4">
                  <Icon name="material-symbols:call" class="h-5 w-5 text-primary-400" />
                  <p class="nui-label">
                    {{
                      selectedStudent?.phone_number
                        ? selectedStudent?.phone_number
                        : 'No Phone Number Added'
                    }}
                  </p>
                </div>

                <div class="flex gap-4 items-center mt-4">
                  <Icon name="icon-park-solid:airplane" class="h-5 w-5 text-primary-400" />
                  <p class="nui-label">Country:</p>

                  <p class="nui-label">{{ selectedStudent?.location?.country }}</p>
                </div>

                <div class="mt-6">
                  <div class="flex flex-row items-center gap-4 my-6 lg:my-0 lg:items-start">
                    <BaseDropdown
                      label="Actions"
                      orientation="end"
                      size="md"
                      class="add-dropdown small-dropdown"
                    >
                      <BaseDropdownItem
                        v-if="selectedStudent?.status === 'draft'"
                        :title="
                          createActionMenu(selectedStudent?.status, 'Student', 'Active')?.buttonText
                        "
                        color="default"
                        rounded="sm"
                        @click="() => selectStudent('Approve')"
                      />

                      <!-- <BaseDropdownItem
            v-if="selectedStudent?.status === 'active'"
            :title="createActionMenu(selectedStudent?.status, 'Student', 'Hold')?.buttonText"
            color="default"
            rounded="sm"
            @click="() => selectStudent('Hold')"
          /> -->

                      <BaseDropdownItem
                        v-if="selectedStudent?.status === 'active'"
                        :title="
                          createActionMenu(selectedStudent?.status, 'Student', 'Suspend')
                            ?.buttonText
                        "
                        color="default"
                        rounded="sm"
                        @click="() => selectStudent('Suspend')"
                      />

                      <BaseDropdownItem
                        v-if="selectedStudent?.status === 'on hold'"
                        :title="
                          createActionMenu(selectedStudent?.status, 'Student', 'Release')
                            ?.buttonText
                        "
                        color="default"
                        rounded="sm"
                        @click="() => selectStudent('Release')"
                      />

                      <BaseDropdownItem
                        v-if="selectedStudent?.status === 'on hold'"
                        :title="
                          createActionMenu(selectedStudent?.status, 'Student', 'Suspend')
                            ?.buttonText
                        "
                        color="default"
                        rounded="sm"
                        @click="() => selectStudent('Suspend')"
                      />

                      <BaseDropdownItem
                        v-if="selectedStudent?.status === 'suspended'"
                        :title="
                          createActionMenu(selectedStudent?.status, 'Student', 'Resume')?.buttonText
                        "
                        color="default"
                        rounded="sm"
                        @click="() => selectStudent('Resume')"
                      />

                      <BaseDropdownItem
                        v-if="
                          selectedStudent?.status === 'draft' ||
                          selectedStudent?.status === 'suspended'
                        "
                        :title="
                          createActionMenu(selectedStudent?.status, 'Student', 'Delete')?.buttonText
                        "
                        color="default"
                        rounded="sm"
                        @click="() => selectStudent('Delete')"
                      />
                    </BaseDropdown>

                    <BaseButton
                      type="submit"
                      color="primary"
                      class="w-24 lg:w-full"
                      :disabled="avatar === studentAvatar"
                      @click="updateStudent"
                    >
                      Update
                    </BaseButton>

                    <BaseButton
                      class="lg:w-full w-24"
                      :disabled="avatar === studentAvatar"
                      @click="resetStudent"
                    >
                      Reset
                    </BaseButton>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          <div class="col-span-12 lg:col-span-2">
            <BaseCard class="p-4 !h-full flex items-center !bg-primary-500">
              <div
                class="xs:divide-y divide-muted-200 dark:divide-muted-100 flex w-full flex-col items-center sm:divide-y"
              >
                <div class="flex-1 pb-4 w-full">
                  <div class="flex flex-col p-4 text-center sm:p-0">
                    <h4 class="text-white dark:text-muted-100 font-sans text-2xl font-semibold">
                      {{ summary?.highest_score ?? 0 }}
                    </h4>

                    <p class="text-muted-100 dark:text-muted-200 font-sans text-sm">
                      Highest Score
                    </p>
                  </div>
                </div>

                <div class="flex-1 py-4 w-full">
                  <div class="flex flex-col p-4 text-center sm:p-0">
                    <h4 class="text-white dark:text-muted-100 font-sans text-2xl font-semibold">
                      {{ summary?.lowest_score ?? 0 }}
                    </h4>

                    <p class="text-muted-100 dark:text-muted-200 font-sans text-sm">Lowest Score</p>
                  </div>
                </div>

                <div class="flex-1 pt-4 w-full">
                  <div class="flex flex-col p-4 text-center sm:p-0">
                    <h4 class="text-white dark:text-muted-100 font-sans text-2xl font-semibold">
                      {{ activeTerm?.engagement_rate ?? 0 }}%
                    </h4>

                    <p class="text-muted-100 dark:text-muted-200 font-sans text-sm">
                      Term Engagement Rate
                    </p>
                  </div>
                </div>

                <div class="flex-1 pt-4 w-full">
                  <div class="flex flex-col p-4 text-center sm:p-0">
                    <h4 class="text-white dark:text-muted-100 font-sans text-2xl font-semibold">
                      {{ summary?.engagement_rate ?? 0 }}%
                    </h4>

                    <p class="text-muted-100 dark:text-muted-200 font-sans text-sm">
                      All Time Engagement Rate
                    </p>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          <div class="col-span-12 lg:col-span-4">
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-12 md:col-span-6">
                <BaseCard class="py-2 px-4 !bg-teal-500/10 !border-teal-500">
                  <div class="mb-1 flex items-center justify-between">
                    <BaseHeading
                      as="h5"
                      size="xs"
                      weight="medium"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400"
                    >
                      <span>Total Tasks Performed</span>
                    </BaseHeading>

                    <BaseIconBox
                      size="xs"
                      class="bg-teal-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-teal-500 dark:border-2"
                      shape="full"
                    >
                      <Icon name="material-symbols:location-on-outline" class="h-5 w-5" />
                    </BaseIconBox>
                  </div>

                  <div class="mb-2">
                    <BaseHeading
                      as="h4"
                      size="xl"
                      weight="bold"
                      lead="tight"
                      class="text-muted-800 dark:text-white"
                    >
                      <span> {{ summary?.total_tasks_performed ?? 0 }} </span>
                    </BaseHeading>
                  </div>
                </BaseCard>
              </div>

              <div class="col-span-12 md:col-span-6">
                <BaseCard class="py-2 px-4 !bg-amber-500/10 !border-amber-500">
                  <div class="mb-1 flex items-center justify-between">
                    <BaseHeading
                      as="h5"
                      size="xs"
                      weight="medium"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400"
                    >
                      <span>Total Task Completed</span>
                    </BaseHeading>

                    <BaseIconBox
                      size="xs"
                      class="bg-amber-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-amber-500 dark:border-2"
                      shape="full"
                    >
                      <Icon name="ph:users-four" class="h-5 w-5" />
                    </BaseIconBox>
                  </div>

                  <div class="mb-2">
                    <BaseHeading
                      as="h4"
                      size="xl"
                      weight="bold"
                      lead="tight"
                      class="text-muted-800 dark:text-white"
                    >
                      <span>{{ summary?.total_tasks_completed ?? 0 }}</span>
                    </BaseHeading>
                  </div>
                </BaseCard>
              </div>

              <div class="col-span-12 md:col-span-6">
                <BaseCard class="py-2 px-4 !bg-indigo-500/10 !border-indigo-500">
                  <div class="mb-1 flex items-center justify-between">
                    <BaseHeading
                      as="h5"
                      size="xs"
                      weight="medium"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400"
                    >
                      <span>Task Completion Rate</span>
                    </BaseHeading>

                    <BaseIconBox
                      size="xs"
                      class="bg-indigo-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-indigo-500 dark:border-2"
                      shape="full"
                    >
                      <Icon name="ph:users" class="h-5 w-5" />
                    </BaseIconBox>
                  </div>

                  <div class="mb-2">
                    <BaseHeading
                      as="h4"
                      size="xl"
                      weight="bold"
                      lead="tight"
                      class="text-muted-800 dark:text-white"
                    >
                      <span>{{ summary?.completion_rate ?? 0 }}%</span>
                    </BaseHeading>
                  </div>
                </BaseCard>
              </div>

              <div class="col-span-12 md:col-span-6">
                <BaseCard class="py-2 px-4 !bg-indigo-500/10 !border-indigo-500">
                  <div class="mb-1 flex items-center justify-between">
                    <BaseHeading
                      as="h5"
                      size="xs"
                      weight="medium"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400"
                    >
                      <span>Total Time Spend</span>
                    </BaseHeading>

                    <BaseIconBox
                      size="xs"
                      class="bg-indigo-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-indigo-500 dark:border-2"
                      shape="full"
                    >
                      <Icon name="ph:users" class="h-5 w-5" />
                    </BaseIconBox>
                  </div>

                  <div class="mb-2">
                    <BaseHeading
                      as="h4"
                      size="xl"
                      weight="bold"
                      lead="tight"
                      class="text-muted-800 dark:text-white"
                    >
                      <span>
                        {{ summary?.time_spent.d }}d {{ summary?.time_spent.h }}h
                        {{ summary?.time_spent.m }}m
                      </span>
                    </BaseHeading>
                  </div>
                </BaseCard>
              </div>
            </div>

            <BaseCard class="p-4 space-y-4 mt-2" color="primary">
              <div class="flex gap-2 justify-between">
                <div>
                  <p class="nui-label text-sm mb-4">Badges Earned</p>

                  <BaseCard class="p-3 px-4 !border-primary-500">
                    <div class="flex items-center justify-center gap-4">
                      <div>
                        <img src="/img/badges/Badge 1.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ summary?.badges_count?.platinum ?? 0 }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 2.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ summary?.badges_count?.gold ?? 0 }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 4.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ summary?.badges_count?.silver ?? 0 }}
                        </div>
                      </div>

                      <div>
                        <img src="/img/badges/Badge 3.png" class="w-8" />
                        <div class="text-xs font-bold mt-1 text-center">
                          {{ summary?.badges_count?.bronze ?? 0 }}
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                </div>

                <div>
                  <p class="nui-label text-sm mb-4">Trophies Earned</p>

                  <BaseCard class="p-3 px-4 !border-primary-500">
                    <div class="flex items-center justify-center gap-4">
                      <div>
                        <img src="/img/trophy/trophy-1.png" class="w-12" />
                        <div class="text-base font-bold mt-1 text-center">
                          {{ summary?.trophies ?? '0' }}
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div
        class="ltablet:bottom-[-70px] absolute bottom-[-48px] start-0 flex items-end gap-2 lg:bottom-[-70px]"
      >
        <!-- student profile -->
        <button
          type="button"
          class="inline-flex items-center justify-center border-b-2 px-4 py-3 font-sans text-sm"
          :class="
            activeTab === 'studentProfile'
              ? 'border-primary-500 text-muted-800 dark:text-muted-100'
              : 'border-transparent text-muted-400'
          "
          @click="activeTab = 'studentProfile'"
        >
          <span>Student Profile</span>
        </button>

        <!-- task & calendar -->
        <button
          type="button"
          class="inline-flex items-center justify-center border-b-2 px-4 py-3 font-sans text-sm"
          :class="
            activeTab === 'taskCalendars'
              ? 'border-primary-500 text-muted-800 dark:text-muted-100'
              : 'border-transparent text-muted-400'
          "
          @click="activeTab = 'taskCalendars'"
        >
          <span>Task & Calendar</span>
        </button>

        <!-- tournaments -->
        <button
          type="button"
          class="inline-flex items-center justify-center border-b-2 px-4 py-3 font-sans text-sm"
          :class="
            activeTab === 'tournament'
              ? 'border-primary-500 text-muted-800 dark:text-muted-100'
              : 'border-transparent text-muted-400'
          "
          @click="activeTab = 'tournament'"
        >
          <span>Tournaments</span>
        </button>
      </div>
    </div>

    <!-- content -->
    <div class="w-full">
      <div v-if="activeTab === 'studentProfile'" class="mt-28">
        <StudentsPrimaryContact @reset="resetStudent" />
        <StudentsAdditionalDetails @reset="resetStudent" />
      </div>

      <div v-else-if="activeTab === 'taskCalendars'" class="mt-28">
        <StudentsActiveCalendar />
        <StudentsCalendarHistory />
      </div>

      <div v-else-if="activeTab === 'tournament'" class="mt-28">
        <StudentsTournament />
      </div>
    </div>

    <StudentAvatarPopup
      v-if="isModalAvatar"
      :isOpen="isModalAvatar"
      @close="isModalAvatar = false"
      @handleAvatarClick="handleAvatarClick"
    />

    <BaseModal
      v-if="isModalApproveStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveStudent"
      :title="'Approve Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveStudent = false"
    >
      {{ `Are you sure you want to approve this student account?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendStudent"
      :title="'Suspend Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendStudent = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200"
        >{{ selectedStudent.first_name }} {{ selectedStudent.last_name }}</span
      >
      student account
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseStudent"
      :title="'Release Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseStudent = false"
    >
      {{ `Are you sure you want to release this student account from hold?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalResumeStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeStudent"
      :title="'Resume Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeStudent = false"
    >
      {{ `Are you sure you want to resume this student account?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalHoldStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldStudent"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldStudent = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200"
        >{{ selectedStudent.first_name }} {{ selectedStudent.last_name }}</span
      >
      student account on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteStudent"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteStudent"
      :title="'Delete Student'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeStudentStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteStudent = false"
    >
      Do you want to proceed to delete
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedStudent.first_name }} {{ selectedStudent.last_name }}
      </span>
      student account?
    </BaseModal>
  </div>
</template>
