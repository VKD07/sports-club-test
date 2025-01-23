<script setup>
definePageMeta({
  title: 'Manage School',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const locations = ref([])

const summary = ref({})
const activeTerm = ref({})
const schoolAdmin = ref({})
const selectedSchool = ref({})

const fetchSchool = async () => {
  const { data, error } = await useAdminReadService(`/api/admin/school/${id}`)

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong fetch in school data, please try again!')
  }

  locations.value = data.value?.Location
  selectedSchool.value = data.value?.School
  schoolAdmin.value = data.value?.School_Admin
}
await fetchSchool()

const colors = ref([])
const colorsVariation = ref([])
const desiredOrder = ['Purple', 'Blue', 'Green', 'Orange', 'Red']

const avatar = ref(selectedSchool.value.schoolLogo)
const code = ref(selectedSchool.value?.color_code)
const variant = ref(selectedSchool.value?.color_variant)
const themeColor = ref(selectedSchool.value?.color)
const variantNumber = ref(selectedSchool.value?.color_index)

const shouldEnableUpdateButton = computed(() => {
  return (
    avatar.value !== selectedSchool.value.schoolLogo ||
    code.value !== selectedSchool.value?.color_code ||
    variant.value !== selectedSchool.value?.color_variant ||
    themeColor.value !== selectedSchool.value?.color ||
    variantNumber.value !== selectedSchool.value?.color_index
  )
})

colors.value = await getSchoolColors()
const uniqueColor = Array.from(new Set(colors.value.map((col) => col.color)))
uniqueColor.sort((a, b) => {
  return desiredOrder.indexOf(a) - desiredOrder.indexOf(b)
})

const resetValues = () => {
  avatar.value = selectedSchool.value?.schoolLogo
  code.value = selectedSchool.value?.color_code
  variant.value = selectedSchool.value?.color_variant
  themeColor.value = selectedSchool.value?.color
  variantNumber.value = selectedSchool.value?.color_index
}

const filterColors = (color) => {
  return colors.value.filter(color)
}

colorsVariation.value = filterColors(
  (item) => item.color === themeColor.value && item.number === '500',
).map((item) => item.code)

watch(themeColor, () => {
  colorsVariation.value = filterColors(
    (item) => item.color === themeColor.value && item.number === '500',
  ).map((item) => item.code)
})

watch(
  () => code.value,
  async (value) => {
    if (value) {
      const filteredColor = filterColors((item) => item.code === value && item.number === '500')[0]

      if (filteredColor) {
        variantNumber.value = filteredColor.number
        variant.value = filteredColor.variation
      }
    }
  },
)

const getSchoolPerformanceSummary = async () => {
  const query = {
    school_id: id,
  }

  const { data, error } = await schoolWriteApi('/api/school-guest/school/performance-summary', {
    query,
  })

  if (error.value) {
    showErrorToast('Oops!', 'Something went wrong in fetch performance summary, please try again!')
  }

  summary.value = data.value?.summary
  activeTerm.value = data.value?.active_term
}
await getSchoolPerformanceSummary()

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
  avatar.value = image
  uploadField.value = ''
  fileFolder.value = ''
}

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

const activeTab = ref('schoolProfile')

const sections = ref([
  {
    title: 'Total Locations',
    number: locations.value?.length.toString(),
    icon: 'material-symbols:location-on-outline',
    cardClass: '!bg-teal-500/10 !border-teal-500',
    iconBoxClass: 'bg-teal-500 text-white dark:border-teal-500',
  },
  {
    title: 'Total Active Students',
    number: selectedSchool.value?.no_of_student.toString(),
    icon: 'ph:users-four',
    cardClass: '!bg-amber-500/10 !border-amber-500',
    iconBoxClass: 'bg-amber-500 text-white dark:border-amber-500',
  },
  {
    title: 'Total Users',
    number: selectedSchool.value?.no_of_users.toString(),
    icon: 'ph:users',
    cardClass: '!bg-indigo-500/10 !border-indigo-500',
    iconBoxClass: 'bg-indigo-500 text-white dark:border-indigo-500',
  },
])

const goToAllSchools = () => {
  router.push('/schools')
}

const resetSchool = async () => {
  await fetchSchool()
  await getSchoolPerformanceSummary()
}

const updateSchool = async () => {
  try {
    const formData = new FormData()
    formData.append('schoolLogo', avatar.value)
    formData.append('color', themeColor.value)
    formData.append('color_variant', variant.value)
    formData.append('color_code', code.value)
    formData.append('color_index', variantNumber.value)

    const { error } = await useApiFetch(`/api/admin/school/update/${id}`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    resetSchool()
    showSuccessToast('Success', 'School updated successfully!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}

const actionStatus = ref('')

const isModalHoldSchool = ref(false)
const isModalResumeSchool = ref(false)
const isModalDeleteSchool = ref(false)
const isModalApproveSchool = ref(false)
const isModalSuspendSchool = ref(false)
const isModalReleaseSchool = ref(false)

const selectSchool = (action) => {
  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'delete',
  }

  if (action === 'Approve') {
    isModalApproveSchool.value = true
  } else if (action === 'Suspend') {
    isModalSuspendSchool.value = true
  } else if (action === 'Release') {
    isModalReleaseSchool.value = true
  } else if (action === 'Resume') {
    isModalResumeSchool.value = true
  } else if (action === 'Hold') {
    isModalHoldSchool.value = true
  } else if (action === 'Delete') {
    isModalDeleteSchool.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeSchoolStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('school_id', selectedSchool.value?.id ?? '')
    formData.append('status', actionStatus.value)

    const { error } = await useApiFetch('/api/admin/school/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldSchool.value = false
    isModalResumeSchool.value = false
    isModalDeleteSchool.value = false
    isModalApproveSchool.value = false
    isModalSuspendSchool.value = false
    isModalReleaseSchool.value = false

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    resetSchool()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'School has been deleted!')
    } else {
      showSuccessToast('Success', 'School status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

provide('timeZone', locations.value[0]?.time_zone)
provide('school', selectedSchool.value)
provide('locations', locations.value)
</script>

<template>
  <div>
    <div class="ltablet:flex-row relative flex w-full flex-col lg:flex-row gap-6">
      <div class="ltablet:flex-row relative z-10 flex w-full flex-col gap-6 lg:flex-row">
        <div class="grid grid-cols-12 gap-4 w-full">
          <div class="col-span-12 lg:col-span-6">
            <BaseCard class="p-6 !h-full">
              <div class="flex gap-6">
                <div class="w-auto">
                  <div class="relative">
                    <BaseAvatar
                      :src="getImageUrl(avatar)"
                      size="3xl"
                      alt="avatar"
                      class="avatar-contain ltablet:mx-0 mx-auto lg:mx-0 h-full"
                    />

                    <div class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Change Logo">
                        <BaseButtonIcon
                          size="sm"
                          shape="full"
                          @click="addBanner('schoolLogo', 'school_logo')"
                        >
                          <Icon
                            name="material-symbols:add-photo-alternate-outline"
                            class="h-4 w-4"
                          />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>

                  <div v-if="locations.length > 0">
                    <h4 class="text-primary-500 dark:text-white font-bold text-center">
                      {{ locations[0]?.academic_year
                      }}<sup>{{ getSuffix(locations[0]?.academic_year) }}</sup> Year
                    </h4>

                    <h4 class="text-primary-500 dark:text-white font-bold text-center">
                      {{ locations[0]?.academic_term
                      }}<sup>{{ getSuffix(locations[0]?.academic_term) }}</sup> Term
                    </h4>
                  </div>

                  <div class="text-center mt-4">
                    <BaseTag
                      :color="statusColor(selectedSchool?.status)"
                      shape="full"
                      size="md"
                      class="capitalize"
                    >
                      {{ selectedSchool?.status }}
                    </BaseTag>
                  </div>
                </div>

                <div class="w-full">
                  <h3 class="text-primary-500 dark:text-white font-bold text-lg">
                    {{ selectedSchool?.school_name }}
                  </h3>

                  <div class="flex gap-4 items-center mt-6">
                    <Icon name="heroicons:building-library" class="h-5 w-5 text-primary-400" />
                    <p class="nui-label">School Type</p>

                    <span class="bg-primary-500 text-white px-4 py-1 rounded-full capitalize">
                      {{ selectedSchool?.school_type }}
                    </span>
                  </div>

                  <div class="flex gap-4 items-center mt-6">
                    <Icon
                      name="material-symbols:school-outline-rounded"
                      class="h-5 w-5 text-primary-400"
                    />
                    <p class="nui-label">School ID</p>

                    <span class="bg-primary-500 text-white px-4 py-1 rounded-full">
                      {{ selectedSchool?.school_id }}
                    </span>
                  </div>

                  <div class="flex gap-4 items-center mt-4">
                    <Icon name="material-symbols:invert-colors" class="h-5 w-5 text-primary-400" />
                    <p class="nui-label">Platform Theme</p>

                    <BaseListbox
                      :items="uniqueColor"
                      v-model="themeColor"
                      placeholder="Select"
                      class="w-32"
                    />
                  </div>

                  <div class="flex gap-4 items-center mt-4">
                    <Icon name="ic:outline-color-lens" class="h-5 w-5 text-primary-400" />
                    <p class="nui-label">Colour Variant</p>

                    <BaseRadioHeadless
                      v-for="(variation, index) in colorsVariation"
                      :key="index"
                      name="colorCode"
                      v-model="code"
                      :value="variation"
                      :bgColor="variation"
                    >
                      <div
                        :class="'peer-checked:ring-2 h-6 w-6 rounded-full border-2 transition-colors duration-300'"
                        :style="{ backgroundColor: variation }"
                      ></div>
                    </BaseRadioHeadless>
                  </div>
                  <div class="mt-6">
                    <div class="flex flex-row items-center gap-4 my-6 lg:my-0 lg:items-start">
                      <BaseDropdown
                        label="Actions"
                        orientation="end"
                        size="lg"
                        class="add-dropdown small-dropdown"
                      >
                        <BaseDropdownItem
                          v-if="selectedSchool?.status === 'draft'"
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Active')?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Approve')"
                        />

                        <!-- <BaseDropdownItem
                          v-if="selectedSchool?.status === 'active'"
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Hold')?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Hold')"
                        /> -->

                        <BaseDropdownItem
                          v-if="selectedSchool?.status === 'active'"
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Suspend')
                              ?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Suspend')"
                        />

                        <BaseDropdownItem
                          v-if="selectedSchool?.status === 'on hold'"
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Release')
                              ?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Release')"
                        />

                        <BaseDropdownItem
                          v-if="selectedSchool?.status === 'on hold'"
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Suspend')
                              ?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Suspend')"
                        />

                        <BaseDropdownItem
                          v-if="selectedSchool?.status === 'suspended'"
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Resume')?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Resume')"
                        />

                        <BaseDropdownItem
                          v-if="
                            selectedSchool?.status === 'draft' ||
                            selectedSchool?.status === 'suspended'
                          "
                          :title="
                            createActionMenu(selectedSchool?.status, 'School', 'Delete')?.buttonText
                          "
                          color="default"
                          rounded="sm"
                          @click="() => selectSchool('Delete')"
                        />
                      </BaseDropdown>

                      <BaseButton
                        type="submit"
                        color="primary"
                        class="w-24"
                        :disabled="!shouldEnableUpdateButton"
                        @click="updateSchool"
                      >
                        Update
                      </BaseButton>

                      <BaseButton
                        class="w-24"
                        :disabled="!shouldEnableUpdateButton"
                        @click="resetValues"
                      >
                        Reset
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          <div class="col-span-12 lg:col-span-3 space-y-9">
            <StatCard
              v-for="(section, index) in sections"
              :key="index"
              :title="section.title"
              :number="section.number"
              :icon="section.icon"
              :cardClass="section.cardClass"
              :iconBoxClass="section.iconBoxClass"
            />
          </div>

          <div class="col-span-12 lg:col-span-3">
            <BaseCard class="p-3 !h-full space-y-4" color="primary">
              <div>
                <p class="nui-label text-sm">Task Overview</p>

                <BaseCard class="p-3 px-4 !border-primary-500">
                  <div class="flex items-center justify-between">
                    <div>
                      <BaseHeading
                        tag="h3"
                        size="lg"
                        weight="bold"
                        lead="none"
                        class="text-primary-500 dark:text-white mb-1"
                      >
                        {{ summary?.overall_avg_score ?? 0 }}%
                      </BaseHeading>

                      <BaseParagraph size="xs" class="text-muted-500 !text-xs">
                        Overall Avg Score
                      </BaseParagraph>
                    </div>

                    <div>
                      <BaseHeading
                        tag="h3"
                        size="lg"
                        weight="bold"
                        lead="none"
                        class="text-primary-500 dark:text-white mb-1"
                      >
                        {{ summary?.completion_rate ?? 0 }}%
                      </BaseHeading>

                      <BaseParagraph size="xs" class="text-muted-500 !text-xs">
                        Task Completion Rate
                      </BaseParagraph>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <div>
                <p class="nui-label text-sm">Total Badges</p>

                <BaseCard class="p-2 px-4 !border-primary-500">
                  <div class="flex items-center justify-center gap-4">
                    <div>
                      <img src="/img/badges/Badge 1.png" class="w-8" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ summary?.badges_count.platinum ?? 0 }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 2.png" class="w-8" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ summary?.badges_count.gold ?? 0 }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 4.png" class="w-8" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ summary?.badges_count.silver ?? 0 }}
                      </div>
                    </div>

                    <div>
                      <img src="/img/badges/Badge 3.png" class="w-8" />
                      <div class="text-xs font-bold mt-1 text-center">
                        {{ summary?.badges_count.bronze ?? 0 }}
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <div class="flex gap-2 items-center">
                <p class="nui-label text-sm">Total Trophies</p>

                <BaseCard class="p-2 px-4 !border-primary-500">
                  <div class="flex items-center justify-center gap-4">
                    <div class="flex items-center gap-4">
                      <img src="/img/trophy/trophy-1.png" class="w-12" />
                      <div class="text-base font-bold mt-1 text-center">
                        {{ summary?.trophies ?? 0 }}
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div
        class="ltablet:bottom-[-70px] absolute bottom-[-48px] start-0 flex items-end gap-2 lg:bottom-[-70px]"
      >
        <!-- school profile -->
        <button
          type="button"
          class="inline-flex items-center justify-center border-b-2 px-4 py-3 font-sans text-sm"
          :class="
            activeTab === 'schoolProfile'
              ? 'border-primary-500 text-muted-800 dark:text-muted-100'
              : 'border-transparent text-muted-400'
          "
          @click="activeTab = 'schoolProfile'"
        >
          <span>School profile</span>
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
          <span>Task & Calendars</span>
        </button>

        <!-- tournaments -->
        <button
          type="button"
          class="inline-flex items-center justify-center border-b-2 px-4 py-3 font-sans text-sm"
          :class="
            activeTab === 'tournaments'
              ? 'border-primary-500 text-muted-800 dark:text-muted-100'
              : 'border-transparent text-muted-400'
          "
          @click="activeTab = 'tournaments'"
        >
          <span>Tournaments</span>
        </button>
      </div>
    </div>

    <!-- content -->
    <div class="w-full">
      <div v-if="activeTab === 'schoolProfile'" class="mt-28">
        <SchoolsPrimaryContact
          :school_id="id"
          :school_name="selectedSchool?.school_name"
          :school_admin="schoolAdmin"
          :total_student="selectedSchool?.all_student_expected"
          :active_student="selectedSchool?.no_of_student"
          :primary_student="selectedSchool?.primary_student_count"
          :secondary_student="selectedSchool?.secondary_student_count"
        />
      </div>

      <div v-else-if="activeTab === 'taskCalendars'" class="mt-28">
        <SchoolsTaskCalendars :schoolId="id" :schoolName="selectedSchool?.school_name" />
      </div>

      <div v-else-if="activeTab === 'tournaments'" class="mt-28">
        <SchoolsTournament />
      </div>
    </div>

    <BaseModal
      v-if="isModalApproveSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveSchool"
      :title="'Approve School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveSchool = false"
    >
      Are you sure you want to approve this
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span
      >?
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendSchool"
      :title="'Suspend School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendSchool = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school account?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseSchool"
      :title="'Release School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseSchool = false"
    >
      Are you sure you want to release
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school?
    </BaseModal>

    <BaseModal
      v-if="isModalResumeSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeSchool"
      :title="'Resume School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeSchool = false"
    >
      Are you sure you want to resume activities of
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school?
    </BaseModal>

    <BaseModal
      v-if="isModalHoldSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldSchool"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldSchool = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedSchool?.school_name
      }}</span>
      school account on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteSchool"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteSchool"
      :title="'Delete School'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeSchoolStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteSchool = false"
    >
      {{ `Do you want to proceed to delete this school?` }}
    </BaseModal>

    <MediaPopup
      v-if="isMediaModalOpen"
      :isOpen="isMediaModalOpen"
      :folder="fileFolder"
      @addImage="addImage"
      @close="isMediaModalOpen = false"
    />
  </div>
</template>
