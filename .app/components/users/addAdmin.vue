<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const isAlphabeticalWithSpaces = (value: string) => /^[A-Za-z\s]+$/.test(value)

const zodSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .refine((value) => isAlphabeticalWithSpaces(value), {
      message: 'Please provide a valid first name',
    }),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .refine((value) => isAlphabeticalWithSpaces(value), {
      message: 'Please provide a valid last name',
    }),
  email: z.string().min(1, 'Email is required').email({ message: 'Please enter a valid email' }),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || isPhoneNumber(value), {
      message: 'Please provide a valid phone number',
    }),
  department: z.array(z.string()).min(1, 'At least one user department is required'),
  role: z.string().min(1, 'User role is required'),
})

type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: [],
  role: '',
}))

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

const router = useRouter()
const auth = useAuthStore()

const userRoles = ref<string[]>([])
userRoles.value = await getAdminUserRoles()

const loggedUserRole = ref(auth.user?.role)
const availableRoles = computed(() => {
  if (loggedUserRole.value === 'Super Admin') {
    return userRoles.value
  } else if (loggedUserRole.value === 'Main Admin') {
    return userRoles.value.filter((role) => role !== 'Super Admin')
  } else {
    return userRoles.value.filter((role) => role === loggedUserRole.value)
  }
})

// const departmentList = ref([])
// departmentList.value = await getDepartmentAndTasks('admin')

const departmentList = ref([])
departmentList.value = await getDepartmentList()
const departmentNames = computed(() => departmentList.value.map((department) => department.name))

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

const goToUsers = () => {
  router.push('/users')
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('first_name', values.firstName)
    formData.append('last_name', values.lastName)
    formData.append('email', values.email)
    formData.append('phone_number', values.phone)
    formData.append('account_type', 'Internal')

    for (const [index, dep] of values.department.entries()) {
      formData.append(`department[${index}]`, dep)
    }

    formData.append('role', values.role)

    const { error } = await useApiFetch<any>('/api/admin/create-internal-admin-account', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      const errorData = error.value?.data

      if (errorData?.error?.errors) {
        const errors = errorData.error.errors
        const errorMessages = Object.keys(errors)
          .map((key) => errors[key].join(' '))
          .join(' | ')

        throw new Error(errorMessages)
      } else {
        throw new Error(errorData.message || 'An error occurred')
      }
    }

    resetForm()
    openModal('success', 'User created successfully!')
  } catch (error) {
    openModal('error', `${error.message}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard class="!min-h-[600px]">
      <div class="flex items-center justify-between px-8 py-8 pb-4">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Admin User Registration
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Create a new admin user account by entering essential details.
          </BaseText>

          <BaseMessage
            class="mt-10"
            v-if="fieldsWithErrors"
            type="danger"
            @close="() => setErrors({})"
          >
            This form has {{ fieldsWithErrors }} errors, please check them before submitting
          </BaseMessage>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <div class="px-8 flex-1">
          <div class="max-w-2xl space-y-12 py-8">
            <TairoFormGroup label="Account Details" sublabel="Add personal details below">
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
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="lastName">
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
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
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
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="phone">
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="tel"
                      icon="mdi-light:phone"
                      label="Phone Number"
                      placeholder="Phone number"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="department"
                  >
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

                <div class="col-span-12 sm:col-span-6">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="role">
                    <BaseListbox
                      label="User Role"
                      :items="availableRoles"
                      placeholder="Select a user role"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
            </TairoFormGroup>
          </div>

          <div class="flex items-center gap-2 pt-8 pb-12">
            <BaseButton class="w-24" to="/users">Cancel</BaseButton>
            <BaseButton
              type="submit"
              color="primary"
              class="w-24"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              Create
            </BaseButton>
          </div>
        </div>

        <div
          class="hidden xl:flex h-full flex-col bg-primary-600 dark:bg-muted-900 drop-shadow-md p-6 py-12 rounded-md mx-8 2xl:mx-auto w-full max-w-sm !mr-8 mt-[-75px]"
        >
          <div class="mb-4 flex items-center">
            <div class="flex-1">
              <BaseHeading as="h3" size="lg" weight="medium" lead="relaxed" class="text-white">
                <span>
                  {{ values.firstName ? values.firstName : 'first name' }}
                  <br />
                  {{ values.lastName ? values.lastName : 'last name' }}
                </span>
              </BaseHeading>

              <BaseParagraph lead="none">
                <span class="text-muted-200 text-sm">{{
                  values.role ? values.role : 'user role'
                }}</span>
              </BaseParagraph>
            </div>

            <div class="flex-1 shrink-0 flex justify-end">
              <div class="ms-auto">
                <div
                  class="border-white border h-14 w-14 rounded-full text-muted-100 p-2 flex items-center justify-center text-lg font-medium"
                >
                  {{ values.firstName ? values.firstName.charAt(0).toUpperCase() : 'F'
                  }}{{ values.lastName ? values.lastName.charAt(0).toUpperCase() : 'L' }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4 space-y-2 font-sans">
            <div class="flex items-end gap-2">
              <Icon
                name="heroicons:building-library"
                class="text-muted-200 dark:text-muted-300 h-4 w-4"
              />
              <span class="text-muted-200 dark:text-muted-300 text-sm">{{
                values.department.length !== 0 ? values.department.join(', ') : 'Department'
              }}</span>
            </div>

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
        </div>
      </div>
    </BaseCard>
  </form>

  <BaseModal
    :isOpen="isModalSuccess"
    :title="'Operation Success'"
    :icon="'ph:warning-octagon-bold'"
    iconColor="success"
    :showCancelButton="false"
    :showPrimaryButton="true"
    primaryButtonColor="primary"
    :primaryButtonText="'Ok'"
    :primaryButtonAction="goToUsers"
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
