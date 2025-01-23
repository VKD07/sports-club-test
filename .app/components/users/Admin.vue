<script setup>
import { refDebounced } from '@vueuse/core'
import { endOfYear, format } from 'date-fns'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { datePresets, masks } from '../../constants'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const filter = ref('')
const debounced = refDebounced(filter, 500)

const role = ref('')
const status = ref('')
const datePreset = ref('')
const actionStatus = ref('')

const dateEnd = ref(null)
const dateStart = ref(null)
const selectedUser = ref(null)

const isModalHoldUser = ref(false)
const isModalResumeUser = ref(false)
const isModalDeleteUser = ref(false)
const isModalApproveUser = ref(false)
const isModalSuspendUser = ref(false)
const isModalReleaseUser = ref(false)

const userRoles = ref([])
userRoles.value = await getAdminUserRoles()

const handleSelectedValue = (dropdownId, value) => {
  if (dropdownId === 1) {
    role.value = value
  } else if (dropdownId === 2) {
    status.value = value
  } else if (dropdownId === 3) {
    datePreset.value = value
  }
}

const sorting = ref({
  column: 'created_at',
  direction: 'desc',
})

const perPage = ref(15)
const page = computed(() => parseInt(route.query.page ?? '1'))

const query = computed(() => {
  const nonEmptyProperties = {
    search: debounced.value,
    role: role.value,
    status: status.value,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    perPage: perPage.value,
    page: page.value,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
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

const { data, pending, error, refresh } = await useAdminReadService(
  '/api/admin/all-admin-account',
  {
    query,
  },
)

if (error.value) {
  showErrorToast('Oops!', error.value.data?.message)
}

const selectUser = (user, action) => {
  selectedUser.value = user

  const statusActionMap = {
    Approve: 'active',
    Suspend: 'suspended',
    Release: 'active',
    Resume: 'active',
    Hold: 'on hold',
    Delete: 'deleted',
  }

  if (action === 'Approve') {
    isModalApproveUser.value = true
  } else if (action === 'Suspend') {
    isModalSuspendUser.value = true
  } else if (action === 'Release') {
    isModalReleaseUser.value = true
  } else if (action === 'Resume') {
    isModalResumeUser.value = true
  } else if (action === 'Hold') {
    isModalHoldUser.value = true
  } else if (action === 'Delete') {
    isModalDeleteUser.value = true
  }

  if (statusActionMap[action]) {
    actionStatus.value = statusActionMap[action]
  }
}

const changeUserStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('id', selectedUser.value?.id ?? '')
    formData.append('status', actionStatus.value)

    const { error } = await useApiFetch('/api/admin/user-account-status', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalHoldUser.value = false
    isModalResumeUser.value = false
    isModalDeleteUser.value = false
    isModalApproveUser.value = false
    isModalSuspendUser.value = false
    isModalReleaseUser.value = false

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    refresh()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'User has been deleted!')
    } else {
      showSuccessToast('Success', 'User status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  } finally {
    setTimeout(() => {
      selectedUser.value = null
    }, 1000)
  }
}

const downloadFunc = async () => {
  const query = {
    search: debounced.value,
    role: role.value,
    status: status.value,
    startDate: dateStart.value ? format(new Date(dateStart.value), 'yyyy-MM-dd') : undefined,
    endDate: dateEnd.value ? format(new Date(dateEnd.value), 'yyyy-MM-dd') : undefined,
    sortBy: sorting.value.column,
    sortOrder: sorting.value.direction,
  }

  if ((datePreset.value === 'Custom day' && dateStart.value) || datePreset.value === 'Today') {
    nonEmptyProperties.dateRange = datePreset.value
    nonEmptyProperties.startDate = dateStart.value
      ? format(new Date(dateStart.value), 'yyyy-MM-dd')
      : undefined
  }

  const { data, error } = await useAdminReadService('/api/admin/all-admin-account/export', {
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
    link.setAttribute('download', `users_admin_export_${Date()}.csv`)
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const goToAddUser = (user) => {
  router.push({ name: 'add-user', query: { type: user } })
}

const columnSort = (column) => {
  sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  sorting.value = { ...sorting.value, column }
}

watch(datePreset, () => setDateValues(dateStart, dateEnd, datePreset))

watch([filter, role, status, dateStart, dateEnd, sorting, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
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

const authStatus = (status) => {
  switch (status) {
    case 'login-success':
      return 'LoggedIn'
    case 'validation-success':
      return 'Validated'
    case 'otp-success':
      return 'Verified'
    case 'login-fail':
      return 'Login failed'
    case 'logout':
      return 'Logout'
    case 'otp-fail':
      return 'Otp failed'
    default:
      break
  }
}

const activeStatus = ref(['Draft', 'Active', 'On Hold', 'Suspended'])

onMounted(() => {
  router.push({
    query: {
      page: undefined,
    },
  })
})
</script>

<template>
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
          Admin Users Directory
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          View and manage the complete list of all admin users in the system.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton class="w-full sm:w-32" @click="downloadFunc">
          <Icon name="ph:export-light" class="h-4 w-4" />
          <span>Export</span>
        </BaseButton>

        <BaseButton color="primary" class="w-full sm:w-32" @click="goToAddUser('admin')">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add User</span>
        </BaseButton>
      </div>
    </div>

    <!-- filters -->
    <div class="relative">
      <BaseCard class="ptablet:py-8 ptablet:px-4 mb-10 py-4 px-4">
        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:w-auto sm:grow">
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              placeholder="Search User Name"
              autocomplete="off"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <CustomDropdown
              :options="userRoles"
              placeholder="Select User Role"
              @selected-value="handleSelectedValue(1, $event)"
            />
          </div>

          <div class="ptablet:col-span-6 w-full flex-1 px-2 py-2 sm:w-auto relative">
            <CustomDropdown
              :options="activeStatus"
              placeholder="Select Status"
              @selected-value="handleSelectedValue(2, $event)"
            />
          </div>
        </div>

        <div
          class="ptablet:grid ptablet:grid-cols-12 flex w-full flex-col items-center py-2 sm:flex-row sm:py-0"
        >
          <div
            class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:grow sm:ps-2 relative"
          >
            <CustomDropdown
              :options="datePresets"
              placeholder="Choose Date Preset"
              @selected-value="handleSelectedValue(3, $event)"
            />
          </div>

          <div class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:grow sm:ps-2">
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
                      placeholder="Start Date"
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

          <div class="ptablet:ps-2 ptablet:col-span-6 w-full py-2 pe-2 ps-2 sm:grow sm:ps-2">
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
                      placeholder="End Date"
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

    <div>
      <div v-if="!pending && data?.Internal_Admin?.data.data.length === 0">
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
            v-for="(item, index) in data?.Internal_Admin.data.data"
            :key="index"
            shape="rounded"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Admin User"
                sortingBy="first_name"
                :sort="true"
                :hide-label="index > 0"
                :title="`${item.first_name} ${item.last_name}`"
                :subtitle="item.role"
                :avatar="item.admin_profile?.profile_picture"
                :initials="getInitialLetters(item.first_name, item.last_name)"
                @sort-column="columnSort"
              />
            </template>

            <template #end>
              <FlexTableCell
                label="Email"
                :hide-label="index > 0"
                class="w-full sm:w-60 lg:!justify-start"
              >
                <span class="text-muted-600 dark:text-muted-400 font-sans text-xs break-words">
                  {{ item.email }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Departments"
                :hide-label="index > 0"
                class="w-full sm:w-60 lg:!justify-start"
              >
                <div class="flex flex-wrap gap-y-2">
                  <BaseTag
                    v-for="(dep, index) in JSON.parse(item.department)"
                    :key="index"
                    color="primary"
                    shape="full"
                    size="sm"
                    class="capitalize text-xs mr-1"
                  >
                    {{ dep }}
                  </BaseTag>
                </div>
              </FlexTableCell>

              <FlexTableCell
                label="UR-Status"
                sortingBy="status"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <BaseTag
                  :color="statusColor(item.status)"
                  shape="full"
                  size="sm"
                  class="capitalize text-xs"
                >
                  {{ item.status }}
                </BaseTag>
              </FlexTableCell>

              <FlexTableCell
                label="Last Login"
                sortingBy="last_attempt"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-xs">
                  {{
                    item.last_attempt !== null
                      ? formatDateAgo(new Date(item.last_attempt))
                      : 'Never'
                  }}
                </span>
              </FlexTableCell>

              <FlexTableCell
                label="Created"
                sortingBy="created_at"
                :sort="true"
                :hide-label="index > 0"
                class="w-full sm:w-28 lg:!justify-start"
                @sort-column="columnSort"
              >
                <span class="text-muted-500 dark:text-muted-400 font-sans text-xs">
                  {{ formatDate(new Date(item.created_at)) }}
                </span>
              </FlexTableCell>

              <FlexTableCell label="action" :hide-label="index > 0">
                <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
                  <BaseDropdownItem
                    :to="`/users/admin/${item.id}`"
                    title="Manage"
                    text="Manage Account"
                    shape="smooth"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'draft'"
                    :title="createActionMenu(item.status, 'Account', 'Active')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Active')?.title"
                    shape="smooth"
                    @click="() => selectUser(item, 'Approve')"
                  />

                  <!-- <BaseDropdownItem
                    v-if="item.status === 'active'"
                    :title="createActionMenu(item.status, 'Account', 'Hold')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Hold')?.title"
                    shape="smooth"
                    @click="() => selectUser(item, 'Hold')"
                  /> -->

                  <BaseDropdownItem
                    v-if="item.status === 'active'"
                    :title="createActionMenu(item.status, 'Account', 'Suspend')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Suspend')?.title"
                    shape="smooth"
                    :disabled="auth.user?.index === item.id"
                    @click="() => selectUser(item, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'on hold'"
                    :title="createActionMenu(item.status, 'Account', 'Release')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Release')?.title"
                    shape="smooth"
                    @click="() => selectUser(item, 'Release')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'on hold'"
                    :title="createActionMenu(item.status, 'Account', 'Suspend')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Suspend')?.title"
                    shape="smooth"
                    :disabled="auth.user?.index === item.id"
                    @click="() => selectUser(item, 'Suspend')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'suspended'"
                    :title="createActionMenu(item.status, 'Account', 'Resume')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Resume')?.title"
                    shape="smooth"
                    @click="() => selectUser(item, 'Resume')"
                  />

                  <BaseDropdownItem
                    v-if="item.status === 'draft' || item.status === 'suspended'"
                    :title="createActionMenu(item.status, 'Account', 'Delete')?.buttonText"
                    :text="createActionMenu(item.status, 'Account', 'Delete')?.title"
                    shape="smooth"
                    :disabled="auth.user?.index === item.id"
                    @click="() => selectUser(item, 'Delete')"
                  />
                </BaseDropdown>
              </FlexTableCell>
            </template>
          </FlexTableRow>
        </TransitionGroup>
      </div>

      <div v-if="data?.Internal_Admin?.data.data.length !== 0" class="mt-4">
        <BasePagination
          :total-items="data?.Internal_Admin?.data?.total ?? 0"
          :item-per-page="perPage"
          :current-page="page"
          shape="curved"
        />
      </div>
    </div>

    <BaseModal
      v-if="isModalApproveUser"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalApproveUser"
      :title="'Approve User'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Approve'"
      :primaryButtonAction="changeUserStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalApproveUser = false"
    >
      {{ `Are you sure you want to approve this user account?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalSuspendUser"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalSuspendUser"
      :title="'Suspend User'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Suspend'"
      :primaryButtonAction="changeUserStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalSuspendUser = false"
    >
      Are you sure you want to suspend
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedUser.first_name }} {{ selectedUser.last_name }}</span
      >
      user account?
    </BaseModal>

    <BaseModal
      v-if="isModalReleaseUser"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalReleaseUser"
      :title="'Release User'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Release'"
      :primaryButtonAction="changeUserStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalReleaseUser = false"
    >
      {{ `Are you sure you want to release this user account from hold?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalResumeUser"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalResumeUser"
      :title="'Resume User'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Resume'"
      :primaryButtonAction="changeUserStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalResumeUser = false"
    >
      {{ `Are you sure you want to resume this user account?` }}
    </BaseModal>

    <BaseModal
      v-if="isModalHoldUser"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalHoldUser"
      :title="'Place on Hold'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Hold'"
      :primaryButtonAction="changeUserStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalHoldUser = false"
    >
      Are you sure you want to place
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedUser.first_name }} {{ selectedUser.last_name }}
      </span>
      user account on hold?
    </BaseModal>

    <BaseModal
      v-if="isModalDeleteUser"
      iconColor="warning"
      primaryButtonColor="primary"
      :isOpen="isModalDeleteUser"
      :title="'Delete User'"
      :icon="'ph:warning-octagon-bold'"
      :showCancelButton="true"
      :showPrimaryButton="true"
      :primaryButtonText="'Delete'"
      :primaryButtonAction="changeUserStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalDeleteUser = false"
    >
      Do you want to proceed to delete
      <span class="font-bold text-primary-500 dark:text-muted-200">
        {{ selectedUser.first_name }} {{ selectedUser.last_name }}
      </span>
      user account?
    </BaseModal>
  </TairoContentWrapper>
</template>
