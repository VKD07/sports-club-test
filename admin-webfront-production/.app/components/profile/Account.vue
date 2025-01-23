<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const segmentName = 'My Account'
const pageName = 'My Profile'
const { _delete, _export, create, update, view, approve } = await usePermissionChecker(
  segmentName,
  pageName,
)

const router = useRouter()
const auth = useAuthStore()

watchEffect(() => {
  if (!view && auth.isLoggedIn) {
    showErrorToast('Oops!', "Sorry, You don't have View permission for this page! ")
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }
})

const zodSchema = z.object({
  avatar: z.string().optional(),
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
  department: z.array(z.string()).min(1, 'At least one user department is required'),
  organization: z
    .string()
    .min(1, 'Organization is required')
    .refine((value) => isAlphanumeric(value), {
      message: 'Please provide a valid organization',
    }),
  role: z.string(),
  whatsappNumber: z
    .string()
    .min(1, 'Whatsapp number is required')
    .refine((value) => isPhoneNumber(value), {
      message: 'Please enter a valid WhatsApp number',
    }),
})

type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)

const initialValues = computed<FormInput>(() => ({
  avatar: auth.user?.profile?.profile_picture || '',
  firstName: auth.user?.first_name || '',
  lastName: auth.user?.last_name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone_number || '',
  designation: auth.user?.profile?.designation || '',
  department: JSON.parse(auth.user?.department) || [],
  organization: auth.user?.profile?.organization || '',
  role: auth.user?.role || '',
  whatsappNumber: auth.user?.profile?.whatsapp_no || '',
}))

const adminAvatar = computed(() => {
  return getInitialLetters(initialValues.value?.firstName, initialValues.value?.lastName)
})

// const departmentList = ref([])
// departmentList.value = await getDepartmentAndTasks('admin')

const departmentList = ref([])
departmentList.value = await getDepartmentList()
const departmentNames = computed(() => departmentList.value.map((department) => department.name))

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

const success = ref(false)
const isModalSuccess = ref(false)
const isModalError = ref(false)
const modalContent = ref('')

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('id', auth.user?.index ?? '')
    formData.append('first_name', values.firstName)
    formData.append('last_name', values.lastName)
    formData.append('role', values.role)
    formData.append('phone_number', values.phone)
    formData.append('whatsapp_no', values.whatsappNumber)
    formData.append('profile_picture', values?.avatar ?? '')
    formData.append('designation', values.designation)

    for (const [index, dep] of values.department.entries()) {
      formData.append(`department[${index}]`, dep)
    }

    formData.append('organization', values.organization)

    const { data, error } = await useApiFetch<any>('/api/admin/edit-internal-admin-account', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      openModal('error', 'An error occurred. Please try again.')
      return
    }

    const updatedProfile = data.value.Internal_Admin.account

    if (auth.user) {
      if (auth.user.profile) {
        auth.user.profile.profile_picture = updatedProfile?.admin_profile?.profile_picture
        auth.user.profile.designation = updatedProfile?.admin_profile?.designation
        auth.user.profile.organization = updatedProfile?.admin_profile?.organization
        auth.user.profile.whatsapp_no = updatedProfile?.admin_profile?.whatsapp_no
      }
      auth.user.first_name = updatedProfile?.first_name
      auth.user.last_name = updatedProfile?.last_name
      auth.user.phone_number = updatedProfile?.phone_number
      auth.user.department = updatedProfile?.department
    }

    openModal('success', 'Your profile has been updated!')

    success.value = true
    await syncProfileData()
  } catch (error) {
    success.value = false
    openModal('error', 'Something went wrong, please try again!')
    return
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const isModalAvatarOpen = ref(false)

const openAvatarModal = () => {
  isModalAvatarOpen.value = true
}

const handleAvatarClick = (srcAttribute: string) => {
  initialValues.value.avatar = srcAttribute
  setFieldValue('avatar', srcAttribute)
  isModalAvatarOpen.value = false
}
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading
            tag="h2"
            size="sm"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider"
          >
            General info
          </BaseHeading>

          <BaseText size="xs" class="text-muted-400">
            Edit your account's general information
          </BaseText>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton class="w-24" :disabled="!meta.dirty" @click="resetForm">Reset</BaseButton>

          <BaseButton
            v-if="update"
            type="submit"
            color="primary"
            class="w-24"
            :disabled="!meta.dirty"
            :loading="isSubmitting"
            >Update</BaseButton
          >
        </div>
      </div>

      <div class="p-4">
        <div class="mx-auto max-w-[46rem] space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            Your profile has been updated!
          </BaseMessage>
          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them before submitting
          </BaseMessage>

          <!-- user avatar  -->
          <TairoFormGroup>
            <div class="relative flex flex-col items-center justify-center gap-2">
              <div class="relative h-24 w-24">
                <img
                  v-if="values.avatar"
                  :src="values.avatar"
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
              <div class="text-primary-500 dark:text-primary-100 font-bold text-lg">
                {{ auth.user?.first_name }}
                {{ auth.user?.last_name }}
              </div>
              <div class="text-primary-500 dark:text-primary-100 font-bold text-md -mt-1">
                User ID: {{ auth.user?.user_id }}
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="Personal Details" sublabel="Others deserve to know you more">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="firstName">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="icon-park-outline:edit-name"
                    label="First name"
                    placeholder="First name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="lastName">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="icon-park-outline:edit-name"
                    label="Last name"
                    placeholder="Last name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    type="email"
                    icon="material-symbols:mail-outline-rounded"
                    label="Office email address"
                    disabled
                    placeholder="Office email address"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="phone">
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="tel"
                    icon="material-symbols:call"
                    label="Phone number"
                    placeholder="Phone number"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup
            label="Professional Details"
            sublabel="This can help you to win some opportunities"
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
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="department">
                  <BaseAutocomplete
                    label="User Department"
                    placeholder="Search user department"
                    :items="departmentNames"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    rounded="md"
                    multiple
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
                    :disabled="isSubmitting"
                    type="text"
                    icon="octicon:organization-24"
                    placeholder="Organization"
                    label="Organization"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="role">
                  <BaseInput
                    :model-value="field.value"
                    type="text"
                    icon="carbon:user-role"
                    label="User role"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    disabled
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup
            label="Additional Details"
            sublabel="This can help you to link additional information"
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
                    type="text"
                    icon="ic:outline-whatsapp"
                    label="Whatsapp number"
                    placeholder="Whatsapp number"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <div class="flex items-center gap-2 pb-8">
            <BaseButton class="w-24" :disabled="!meta.dirty" @click="resetForm">Reset</BaseButton>

            <BaseButton
              v-if="update"
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
      </div>
    </BaseCard>
  </form>

  <AvatarPopup
    :isOpen="isModalAvatarOpen"
    @close="isModalAvatarOpen = false"
    @handleAvatarClick="handleAvatarClick"
  />

  <BaseModal
    :isOpen="isModalSuccess"
    :title="'Operation Success'"
    :icon="'ph:warning-octagon-bold'"
    iconColor="success"
    :showCancelButton="false"
    :showPrimaryButton="true"
    primaryButtonColor="primary"
    :primaryButtonText="'Ok'"
    :primaryButtonAction="() => (isModalSuccess = false)"
    :cancelButtonText="'Cancel'"
    @close="isModalSuccess = false"
  >
    {{ modalContent }}
  </BaseModal>

  <BaseModal
    :isOpen="isModalError"
    :title="'Operation Failed'"
    :icon="'ph:warning-octagon-bold'"
    iconColor="error"
    :showCancelButton="false"
    :showPrimaryButton="true"
    primaryButtonColor="primary"
    :primaryButtonText="'Ok'"
    :primaryButtonAction="() => (isModalError = false)"
    :cancelButtonText="'Cancel'"
    @close="isModalError = false"
  >
    {{ modalContent }}
  </BaseModal>
</template>
