<script setup>
const {
  school_id,
  school_name,
  school_admin,
  total_student,
  active_student,
  primary_student,
  secondary_student,
} = defineProps([
  'school_id',
  'school_name',
  'school_admin',
  'total_student',
  'active_student',
  'primary_student',
  'secondary_student',
])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const actionStatus = ref('')
const locations = ref(null)
const selectedLocation = ref(null)

const isModalAddLocation = ref(false)
const isModalManageLocation = ref(false)

const isModalHoldLocation = ref(false)
const isModalResumeLocation = ref(false)
const isModalDeleteLocation = ref(false)
const isModalApproveLocation = ref(false)
const isModalSuspendLocation = ref(false)
const isModalReleaseLocation = ref(false)

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const firstName = ref(school_admin?.first_name)
const lastName = ref(school_admin?.last_name)
const email = ref(school_admin?.email)
const phoneNumber = ref(school_admin?.phone_number)

const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    school_id: school_id,
    perPage: perPage.value,
    page: page.value,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
  }

  const filteredProperties = Object.fromEntries(
    Object.entries(nonEmptyProperties).filter(([_, value]) => value != null && value !== ''),
  )

  return filteredProperties
})

const getSchoolLocations = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/school-location', {
      query,
    })

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    locations.value = data.value?.location_data.data
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getSchoolLocations()

const manageLocation = (location) => {
  selectedLocation.value = location
  isModalManageLocation.value = true
}

const selectLocation = (location, action) => {
  selectedLocation.value = location

  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'deleted',
  }

  if (action === 'Approve') {
    isModalApproveLocation.value = true
  } else if (action === 'Suspend') {
    isModalSuspendLocation.value = true
  } else if (action === 'Release') {
    isModalReleaseLocation.value = true
  } else if (action === 'Resume') {
    isModalResumeLocation.value = true
  } else if (action === 'Hold') {
    isModalHoldLocation.value = true
  } else if (action === 'Delete') {
    isModalDeleteLocation.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeLocationStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('status', actionStatus.value)
    formData.append('location_id', selectedLocation.value?.id)
    formData.append('school_id', selectedLocation.value?.school_id)

    const { error } = await useApiFetch('/api/admin/school/location/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldLocation.value = false
    isModalResumeLocation.value = false
    isModalDeleteLocation.value = false
    isModalApproveLocation.value = false
    isModalSuspendLocation.value = false
    isModalReleaseLocation.value = false

    selectedLocation.value = null

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    await getSchoolLocations()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'Location has been deleted!')
    } else {
      showSuccessToast('Success', 'Location status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

const addLocation = async () => {
  await getSchoolLocations()
  isModalAddLocation.value = false
}

const updateLocation = async () => {
  await getSchoolLocations()
  isModalManageLocation.value = false
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

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'ASC' ? 'DESC' : 'ASC'
  sorting.value = { ...sorting.value, column }
}

watch(query, async () => {
  await getSchoolLocations()
})

const viewUserProfile = () => {
  router.push(`/users/school/${school_admin?.id}`)
}

const viewSchoolUsers = () => {
  router.push({ name: 'users', query: { fromSchool: 'true', school: school_name } })
}

const viewAllStudents = () => {
  router.push({ name: 'students', query: { school: school_name } })
}
</script>

<template>
  <div>
    <BaseCard class="p-6 pb-10">
      <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Primary contact
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Details about the school’s primary contact. Update the super admin if needed.
          </BaseText>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            class="!border-primary-500 !text-primary-500 dark:!text-muted-100 !border-2 w-24 lg:w-full"
            :disabled="!school_admin"
            @click="viewUserProfile"
          >
            View Profile
          </BaseButton>
        </div>
      </div>

      <div class="max-w-3xl p-4">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 sm:col-span-6">
            <BaseInput
              type="text"
              v-model="firstName"
              icon="mdi-light:account"
              label="First name"
              placeholder="First name"
              disabled
            />
          </div>

          <div class="col-span-12 sm:col-span-6">
            <BaseInput
              type="text"
              v-model="lastName"
              icon="mdi-light:account"
              label="Last name"
              placeholder="Last name"
              disabled
            />
          </div>

          <div class="col-span-12 sm:col-span-6">
            <BaseInput
              type="email"
              v-model="email"
              icon="mdi-light:email"
              label="Official email"
              placeholder="Official email"
              disabled
            />
          </div>

          <div class="col-span-12 sm:col-span-6">
            <BaseInput
              type="tel"
              v-model="phoneNumber"
              icon="mdi-light:phone"
              label="Phone"
              placeholder="Phone"
              disabled
            />
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="p-6 pb-10 mt-6">
      <div class="flex gap-6 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            List of School Locations
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            View and manage all locations associated with the school organization. Create new
            locations or update existing ones as needed.
          </BaseText>
        </div>

        <div class="flex gap-2">
          <div class="flex items-center gap-2 max-w-max">
            <BaseButton color="primary" @click="isModalAddLocation = true" class="w-32">
              Add New
            </BaseButton>

            <BaseButton
              class="!border-primary-500 !text-primary-500 dark:!text-muted-100 !border-2 w-32"
              @click="viewSchoolUsers"
            >
              View Users
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="space-y-2 pt-10">
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-full"
        >
          <FlexTableRow v-for="(location, index) in locations" :key="index" shape="rounded" spaced>
            <template #start>
              <FlexTableStart
                label="Location"
                sortingBy="location_name"
                :hide-label="index > 0"
                :title="location.location_name"
                :subtitle="location.location_id"
                :sort="true"
                @sort-column="columnSort"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Academic Level"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm capitalize">
                  {{ location.location_level }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Academic Year / Term"
                :hide-label="index > 0"
                class="w-full sm:w-44 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  {{
                    location.academic_year && location.academic_term
                      ? `${location.academic_year} / ${location.academic_term}${getSuffix(
                          location.academic_term,
                        )} Term`
                      : '-/- '
                  }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Active Students"
                :hide-label="index > 0"
                class="w-full sm:w-40 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag shape="full" variant="solid" color="primary" class="w-16 text-center">
                    {{ location.active_student ?? '0' }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Slots"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                  <BaseTag shape="full" variant="solid" color="primary" class="w-16 text-center">
                    {{ location.no_of_slots }}
                  </BaseTag>
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="LN-Status"
                sortingBy="status"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <BaseTag
                  :color="statusColor(location.status)"
                  shape="full"
                  size="sm"
                  class="capitalize"
                >
                  {{ location.status }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    @click="manageLocation(location)"
                    title="Manage"
                    text="Manage location"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'draft'"
                    :title="createActionMenu(location.status, 'Location', 'Active')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Active')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Approve')"
                  />

                  <!-- <BaseDropdownItem
                    v-if="location.status === 'active'"
                    :title="createActionMenu(location.status, 'Location', 'Hold')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Hold')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="location.status === 'active'"
                    :title="createActionMenu(location.status, 'Location', 'Suspend')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'on hold'"
                    :title="createActionMenu(location.status, 'Location', 'Release')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Release')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'on hold'"
                    :title="createActionMenu(location.status, 'Location', 'Suspend')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Suspend')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'suspended'"
                    :title="createActionMenu(location.status, 'Location', 'Resume')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Resume')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Resume')"
                  />

                  <BaseDropdownItem
                    v-if="location.status === 'draft' || location.status === 'suspended'"
                    :title="createActionMenu(location.status, 'Location', 'Delete')?.buttonText"
                    :text="createActionMenu(location.status, 'Location', 'Delete')?.title"
                    shape="smooth"
                    @click="() => selectLocation(location, 'Delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>
    </BaseCard>

    <BaseCard class="p-6 pb-10 mt-6">
      <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Overview of Student's Accounts
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Review key statistics for student accounts across all school locations.
          </BaseText>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            class="!border-primary-500 !text-primary-500 dark:!text-muted-100 !border-2 w-auto"
            @click="viewAllStudents"
          >
            View All Students
          </BaseButton>

          <BaseDropdown
            label="Add New"
            button-color="primary"
            orientation="end"
            size="md"
            class="add-dropdown"
          >
            <BaseDropdownItem
              to="/students/add"
              title="Single Student"
              color="default"
              rounded="sm"
            />

            <BaseDropdownItem
              to="/students/add-bulk"
              title="Bulk Student"
              color="default"
              rounded="sm"
            />
          </BaseDropdown>
        </div>
      </div>

      <BaseCard class="p-6">
        <div
          class="xs:divide-y divide-muted-200 dark:divide-muted-700 flex w-full flex-col items-center sm:flex-row sm:divide-x"
        >
          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon name="ph:student" class="text-primary-500 mx-auto h-8 w-8" />
              <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                {{ total_student }}
              </h4>

              <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">Total Students</p>
            </div>
          </div>

          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon
                name="material-symbols:interactive-space-outline"
                class="text-primary-500 mx-auto h-8 w-8"
              />
              <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                {{ active_student }}
              </h4>

              <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">
                Total Active Students
              </p>
            </div>
          </div>

          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon name="ph:briefcase-duotone" class="text-primary-500 mx-auto h-8 w-8" />
              <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                {{ primary_student }}
              </h4>

              <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">Primary Level</p>
            </div>
          </div>

          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon name="ph:ticket-duotone" class="text-primary-500 mx-auto h-8 w-8" />
              <h4 class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold">
                {{ secondary_student }}
              </h4>

              <p class="text-muted-600 dark:text-muted-400 font-sans text-sm">Secondary Level</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </BaseCard>

    <SchoolsLocationsAdd
      v-if="isModalAddLocation"
      :isOpen="isModalAddLocation"
      :schoolId="school_id"
      @close="addLocation"
    />

    <SchoolsLocationsEdit
      v-if="isModalManageLocation"
      :isOpen="isModalManageLocation"
      :schoolId="selectedLocation?.school_id"
      :locationId="selectedLocation?.id"
      @close="updateLocation"
    />

    <BaseModal
      v-if="isModalApproveLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveLocation"
      :title="'Approve Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveLocation = false"
    >
      Are you sure you want to approve this
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedLocation?.location_name }}
      </span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendLocation"
      :title="'Suspend Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendLocation = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedLocation?.location_name }}
      </span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseLocation"
      :title="'Release Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseLocation = false"
    >
      Are you sure you want to release
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedLocation?.location_name }}
      </span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalResumeLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeLocation"
      :title="'Resume Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeLocation = false"
    >
      Are you sure you want to resume all activities of
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
      location?
    </BaseModal>

    <BaseModal
      v-if="isModalHoldLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldLocation"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldLocation = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedLocation?.location_name }}
      </span>
      location on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteLocation"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteLocation"
      :title="'Delete Location'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeLocationStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteLocation = false"
    >
      {{ `Do you want to proceed to delete this location?` }}
    </BaseModal>
  </div>
</template>
