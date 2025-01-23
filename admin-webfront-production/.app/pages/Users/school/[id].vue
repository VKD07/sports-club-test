<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Manage School User',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

const demoBreadcrumbOne = [
  {
    label: 'School Users',
    hideLabel: false,
    to: { name: 'users', query: { fromSchool: 'true' } },
  },
  {
    label: 'Edit',
    hideLabel: false,
  },
]

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const selectedUser = ref(null)

const fetchUser = async () => {
  const { data, pending, error, refresh } = await useApiFetch(`/api/admin/school-admin/${id}`)
  selectedUser.value = data.value.user
}
await fetchUser()

const zodSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .refine((value) => isAlphabetical(value), {
      message: 'Please provide a valid first name',
    }),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .refine((value) => isAlphabetical(value), {
      message: 'Please provide a valid last name',
    }),
  email: z.string().min(1, 'Email is required').email({ message: 'Please enter a valid email' }),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((value) => isPhoneNumber(value), {
      message: 'Please provide a valid phone number',
    }),
  designation: z
    .string()
    .min(1, 'Designation is required')
    .refine((value) => isAlphanumeric(value), {
      message: 'Please provide a valid designation',
    }),
  organization: z
    .string()
    .min(1, 'Organization is required')
    .refine((value) => isAlphanumeric(value), {
      message: 'Please provide a valid organization',
    }),
  location: z
    .string()
    .min(1, 'Location is required')
    .refine((value) => isAlphanumeric(value), {
      message: 'Please provide a valid location',
    }),
  role: z.string().min(1, 'User role is required'),
  picture: z.string().optional(),
  whatsappNumber: z
    .string()
    .min(1, 'Whatsapp number is required')
    .refine((value) => isPhoneNumber(value), {
      message: 'Please enter a valid WhatsApp number',
    }),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  firstName: selectedUser.value?.first_name || '',
  lastName: selectedUser.value?.last_name || '',
  email: selectedUser.value?.email || '',
  phone: selectedUser.value?.phone_number || '',
  picture: selectedUser.value?.school_admin_profile?.profile_picture || '',
  designation: selectedUser.value?.school_admin_profile?.designation || '',
  organization: selectedUser.value?.school || '',
  location: selectedUser.value?.location || '',
  role: selectedUser.value?.role || '',
  whatsappNumber: selectedUser.value?.school_admin_profile?.whatsapp_no || '',
}))

const auth = useAuthStore()
const success = ref(false)

const schoolUserRoles = ref([])
schoolUserRoles.value = await getSchoolUserRoles()

const userRoles = computed(() => schoolUserRoles.value.filter((role) => role !== 'Student'))

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  values,
  errors,
  resetForm,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const actionStatus = ref('')

const isModalHoldUser = ref(false)
const isModalResumeUser = ref(false)
const isModalDeleteUser = ref(false)
const isModalApproveUser = ref(false)
const isModalSuspendUser = ref(false)
const isModalReleaseUser = ref(false)

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('id', id)
    formData.append('first_name', values.firstName)
    formData.append('last_name', values.lastName)
    formData.append('phone_number', values.phone)
    formData.append('role', values.role)
    formData.append('designation', values.designation)
    formData.append('whatsapp_no', values.whatsappNumber)
    formData.append('profile_picture', values.picture ?? '')

    const { error } = await useApiFetch('/api/admin/edit-school-admin-account', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      showErrorToast('Oops!', `${error.value?.data.message}`)
      return
    }

    showSuccessToast('Success', 'User updated successfully!')
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    if (auth.user?.index === id) {
      await syncProfileData()
    }
    await fetchUser()
  }
})

const adminAvatar = computed(() => {
  return getInitialLetters(initialValues.value?.firstName, initialValues.value?.lastName)
})

const isModalAvatarOpen = ref(false)
const openAvatarModal = () => {
  isModalAvatarOpen.value = true
}

const avatarSrc = ref(selectedUser.value?.school_admin_profile?.profile_picture || '')
const handleAvatarClick = (srcAttribute) => {
  initialValues.value.picture = srcAttribute
  avatarSrc.value = srcAttribute
  setFieldValue('picture', srcAttribute)
  isModalAvatarOpen.value = false
}

const selectUser = (action) => {
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

    await fetchUser()

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'User has been deleted!')
    } else {
      showSuccessToast('Success', 'User status has been updated!')
    }

    actionStatus.value = ''
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

const deleteUser = async () => {
  try {
    const { error } = await useApiFetch(
      `/api/admin/user-account-delete/${selectedUser.value?.id}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      },
    )

    isModalDeleteUser.value = false

    if (error.value) {
      throw new Error(error.value?.message)
    }

    showSuccessToast('Success', 'User has been deleted!')
    router.push({ name: 'users', query: { fromSchool: 'true' } })
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
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
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
      <BaseBreadcrumb :items="demoBreadcrumbOne">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <BaseCard class="!min-h-[600px]">
      <div class="px-8 pt-8 pb-4">
        <div class="flex gap-20 justify-between">
          <div class="items-center">
            <div>
              <BaseHeading
                tag="h2"
                size="md"
                weight="medium"
                lead="normal"
                class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
              >
                {{ values.firstName }} {{ values.lastName }} Account Details
              </BaseHeading>

              <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                Oversee and update school staff information, including personal, professional, and
                additional details.
              </BaseText>
            </div>
          </div>

          <div class="flex gap-2 items-center">
            <div class="flex gap-2 w-32 items-center mr-6 text-sm">
              Status
              <BaseTag
                :color="statusColor(selectedUser?.status)"
                shape="full"
                size="md"
                class="capitalize"
              >
                {{ selectedUser?.status }}
              </BaseTag>
            </div>

            <BaseDropdown
              label="Actions"
              orientation="end"
              size="md"
              class="w-24 add-dropdown small-dropdown"
            >
              <BaseDropdownItem
                v-if="selectedUser?.status === 'draft'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Active')?.buttonText"
                color="default"
                rounded="sm"
                @click="() => selectUser('Approve')"
              />

              <!-- <BaseDropdownItem
                v-if="selectedUser?.status === 'active'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Hold')?.buttonText"
                color="default"
                rounded="sm"
                @click="() => selectUser('Hold')"
              /> -->

              <BaseDropdownItem
                v-if="selectedUser?.status === 'active'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Suspend')?.buttonText"
                color="default"
                rounded="sm"
                :disabled="auth.user?.index === id"
                @click="() => selectUser('Suspend')"
              />

              <BaseDropdownItem
                v-if="selectedUser?.status === 'on hold'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Release')?.buttonText"
                color="default"
                rounded="sm"
                @click="() => selectUser('Release')"
              />

              <BaseDropdownItem
                v-if="selectedUser?.status === 'on hold'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Suspend')?.buttonText"
                color="default"
                rounded="sm"
                :disabled="auth.user?.index === id"
                @click="() => selectUser('Suspend')"
              />

              <BaseDropdownItem
                v-if="selectedUser?.status === 'suspended'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Resume')?.buttonText"
                color="default"
                rounded="sm"
                @click="() => selectUser('Resume')"
              />

              <BaseDropdownItem
                v-if="selectedUser?.status === 'draft' || selectedUser?.status === 'suspended'"
                :title="createActionMenu(selectedUser?.status, 'Account', 'Delete')?.buttonText"
                color="default"
                rounded="sm"
                :disabled="auth.user?.index === id"
                @click="() => selectUser('Delete')"
              />
            </BaseDropdown>

            <BaseButton class="w-24" :disabled="!meta.dirty" @click="resetForm">Reset</BaseButton>
          </div>
        </div>

        <form method="POST" action="" class="w-full pt-4 pb-16" @submit.prevent="onSubmit">
          <div class="flex justify-between items-center">
            <div class="pe-8 flex-1">
              <div class="max-w-2xl space-y-12 py-8">
                <BaseMessage v-if="success" @close="success = false">
                  User profile has been updated!
                </BaseMessage>

                <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
                  This form has {{ fieldsWithErrors }} errors, please check them before submitting
                </BaseMessage>

                <TairoFormGroup
                  label="Personal Details"
                  sublabel="Edit or view the user's personal information."
                >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="firstName"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          icon="ph:user"
                          label="First Name"
                          placeholder="First Name"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="lastName"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          icon="ph:user"
                          label="Last Name"
                          placeholder="Last Name"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="email"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          disabled
                          type="email"
                          icon="mdi-light:email"
                          label="Official Email"
                          placeholder="Official email"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="phone"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="tel"
                          icon="mdi-light:phone"
                          label="Phone Number"
                          placeholder="Phone number"
                          :classes="{
                            label: '!text-muted-700 dark:!text-muted-400',
                          }"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>
                </TairoFormGroup>

                <TairoFormGroup
                  label="Professional Details"
                  sublabel="Update or review the user's professional background and role-related information."
                >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="designation"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          icon="ph:suitcase-simple-light"
                          label="Designation"
                          placeholder="Designation"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="organization"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          disabled
                          type="text"
                          icon="octicon:organization-24"
                          label="Organization"
                          placeholder="Organization"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="location"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          disabled
                          type="text"
                          label="Location"
                          placeholder="Organization"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12">
                      <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="role">
                        <BaseListbox
                          label="User Role"
                          :items="userRoles"
                          placeholder="Select a user role"
                          label-style="!text-blue-500"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>

                  <div class="col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="picture"
                    >
                      <BaseInput
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="hidden"
                        autocomplete="off"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                </TairoFormGroup>

                <TairoFormGroup
                  label="Additional Details"
                  sublabel="Manage any other relevant information related to the user."
                >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="whatsappNumber"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="tel"
                          icon="ph:whatsapp-logo-light"
                          label="Whatsapp number"
                          placeholder="Whatsapp number"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>
                </TairoFormGroup>
              </div>

              <div class="flex items-center gap-2 pb-12">
                <BaseButton class="w-24" :to="{ name: 'users', query: { fromSchool: 'true' } }"
                  >Cancel</BaseButton
                >

                <BaseButton
                  type="submit"
                  color="primary"
                  class="w-24"
                  :disabled="!meta.dirty"
                  :loading="isSubmitting"
                >
                  Update
                </BaseButton>
              </div>
            </div>

            <div
              class="hidden xl:flex h-full flex-col bg-primary-600 dark:bg-muted-900 drop-shadow-md p-6 py-12 rounded-md mx-8 2xl:mx-auto w-full max-w-sm !mr-8 mt-[-240px]"
            >
              <!-- user avatar  -->
              <TairoFormGroup>
                <div class="relative flex flex-col items-center justify-center gap-4">
                  <div class="relative h-24 w-24">
                    <img
                      v-if="values.picture"
                      :src="values.picture"
                      alt="Avatar"
                      class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"
                    />

                    <div
                      v-else
                      class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 h-24 w-24 p-6 rounded-full object-cover object-center flex items-center justify-center text-4xl nui-weight-bold"
                    >
                      <span>{{ adminAvatar }}</span>
                    </div>

                    <div class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Change Avatar">
                        <BaseButtonIcon size="sm" shape="full" @click="openAvatarModal">
                          <Icon name="lucide:plus" class="h-4 w-4" />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>
                  <div class="text-white text-sm">User ID: {{ selectedUser?.user_id }}</div>
                </div>
              </TairoFormGroup>

              <div class="my-4 flex items-center">
                <div class="flex-1">
                  <BaseHeading as="h3" size="lg" weight="medium" lead="relaxed" class="text-white">
                    <span>
                      {{ values.firstName ? values.firstName : 'first name' }}
                      {{ values.lastName ? values.lastName : 'last name' }}
                    </span>
                  </BaseHeading>
                </div>
              </div>

              <div class="mb-4 space-y-2 font-sans">
                <div class="flex items-end gap-2">
                  <Icon name="mdi-light:email" class="text-muted-200 dark:text-muted-300 h-4 w-4" />
                  <span class="text-muted-200 dark:text-muted-300 text-sm">{{
                    values.email ? values.email : 'user@email.com'
                  }}</span>
                </div>

                <div class="flex items-end gap-2">
                  <Icon name="mdi-light:phone" class="text-muted-200 dark:text-muted-300 h-4 w-4" />
                  <span class="text-muted-200 dark:text-muted-300 text-sm">
                    {{ values.phone ? values.phone : '+94 712345678' }}
                  </span>
                </div>
              </div>

              <div class="border-muted-200 dark:border-muted-700 mt-auto border-t pt-3 space-y-2">
                <div class="flex items-end gap-2">
                  <Icon
                    name="ph:suitcase-simple-light"
                    class="text-muted-200 dark:text-muted-300 h-4 w-4"
                  />
                  <span class="text-muted-200 dark:text-muted-300 text-sm">
                    {{ values.designation ? values.designation : 'Designation' }}
                  </span>
                </div>

                <div class="flex items-end gap-2">
                  <Icon
                    name="octicon:organization-24"
                    class="text-muted-200 dark:text-muted-300 h-4 w-4"
                  />
                  <span class="text-muted-200 dark:text-muted-300 text-sm">
                    {{ values.organization ? values.organization : 'Organization' }}
                  </span>
                </div>

                <div class="flex items-end gap-2">
                  <Icon
                    name="carbon:user-role"
                    class="text-muted-200 dark:text-muted-300 h-4 w-4"
                  />
                  <span class="text-muted-200 dark:text-muted-300 text-sm">
                    {{ values.role ? values.role : 'User role' }}
                  </span>
                </div>

                <div class="flex items-end gap-2">
                  <Icon
                    name="ph:whatsapp-logo-light"
                    class="text-muted-200 dark:text-muted-300 h-4 w-4"
                  />
                  <span class="text-muted-200 dark:text-muted-300 text-sm">
                    {{ values.whatsappNumber ? values.whatsappNumber : '+44 123456789' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </BaseCard>

    <AvatarPopup
      :isOpen="isModalAvatarOpen"
      @close="isModalAvatarOpen = false"
      @handleAvatarClick="handleAvatarClick"
    />

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
      {{
        `Are you sure you want to suspend ${selectedUser.first_name} ${selectedUser.last_name} user account?`
      }}
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
      {{
        `Are you sure you want to place ${selectedUser.first_name} ${selectedUser.last_name} user account on hold?`
      }}
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
      {{
        `Do you want to proceed to delete ${selectedUser.first_name} ${selectedUser.last_name} user account?`
      }}
    </BaseModal>
  </div>
</template>
