<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Add Single Student',
  middleware: ['auth'],
})

const addStudentBreadcrumb = [
  {
    label: 'Students',
    hideLabel: false,
    to: '/students',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const isAlphabetical = (value: string) => /^[A-Za-z]+$/.test(value)
const isAlphabeticalWithSpaces = (value: string) => /^[A-Za-z\s]+$/.test(value)
const isPhoneNumber = (value: string) => /^\+?\d{10,}$/.test(value)

const zodSchema = z.object({
  school: z.string().min(1, 'School is required'),

  location: z.string().min(1, 'Location is required'),

  level: z.string().min(1, 'Level is required'),

  grade: z.string(),

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
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  school: '',
  location: '',
  level: '',
  grade: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
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

const locations = ref<any[]>([])
const schoolsList = ref<AllSchool[]>([])
schoolsList.value = await getSchoolList()

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const toaster = useToaster()
const success = ref(false)

const level = ref(['Primary', 'Secondary'])
const grades = ref(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])

const selectedSchoolId = ref('')

const getSchoolIdByName = (schools: AllSchool[], schoolName: string): string | null => {
  const lowercaseSchoolName = schoolName.toLowerCase()
  for (const school of schools) {
    const lowercaseCurrentSchoolName = school.school_name.toLowerCase()
    if (lowercaseCurrentSchoolName === lowercaseSchoolName) {
      return school.id
    }
  }
  return null
}

watch(
  () => values.school,
  async (value) => {
    if (value) {
      locations.value = await getSchoolLocationsByNameStudent(schoolsList.value, value)
      console.log(locations.value)
      selectedSchoolId.value = await getSchoolIdByName(schoolsList.value, value)
      setFieldValue('location', locations.value[0])
    }
  },
)

const selectedLocationId = ref('')

const getLocationId = async (locationName: string): string | null => {
  const { data, error } = await useSchoolReadService(`/api/school/${selectedSchoolId.value}`)
  const locations: string[] = data.value.Location
  console.log(locations)
  const locationId = locations.filter((loc) => loc.location_name === locationName)
  console.log(locationId)
  return locationId[0].id
}

watch(
  () => values.location,
  async (value) => {
    if (value) {
      selectedLocationId.value = await getLocationId(value)
      console.log(selectedLocationId.value)
    }
  },
)

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()

    formData.append('school', values.school)
    formData.append('location', values.location)
    formData.append('level', values.level.toLowerCase())
    formData.append('grade', values.grade)
    formData.append('first_name', values.firstName)
    formData.append('last_name', values.lastName)
    formData.append('email', values.email)
    formData.append('phone_number', values.phone)
    formData.append('school_id', selectedSchoolId.value)
    formData.append('location_id', selectedLocationId.value)

    const { error } = await useApiFetch('/api/admin/create-school-student-account', {
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

    showSuccessToast('Success', 'Student created successfully!')
    resetForm()

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (error) {
    success.value = false
    showErrorToast('Oops!', `${error.message}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

// watch(
//   () => values.school,
//   async (value) => {
//     if (value) {
//       locations.value = await getSchoolLocationsByName(schoolsList.value, value)
//       setFieldValue('location', locations.value[0])
//     }
//   },
// )
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addStudentBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

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
              New Student Registration
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Enter the minimum required details to create a new student account.
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
              <TairoFormGroup
                label="School Details "
                sublabel="Select the appropriate school and location to add the student."
              >
                <div class="grid grid-cols-12 gap-6">
                  <div class="col-span-12 sm:col-span-6 relative">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="school">
                      <BaseAutocomplete
                        label="School"
                        :items="schoolNames"
                        placeholder="Search a school"
                        icon="heroicons:building-library"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        :class="errorMessage ? 'error-border' : ''"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="location"
                    >
                      <BaseListbox
                        label="Location"
                        :items="locations"
                        placeholder="Select location"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="values.school === '' || isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="level">
                      <BaseListbox
                        label="Level"
                        :items="level"
                        placeholder="Select level"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="grade">
                      <BaseListbox
                        label="Grade"
                        :items="grades"
                        placeholder="Select grade"
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

              <TairoFormGroup
                label="Student Account Details"
                sublabel="Add the student's key account details for student user creation."
              >
                <div class="grid grid-cols-12 gap-6">
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
                </div>
              </TairoFormGroup>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-12">
              <BaseButton class="w-24" to="/students">Cancel</BaseButton>

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
                  name="heroicons:building-library"
                  class="text-muted-200 dark:text-muted-300 h-4 w-4"
                />
                <span class="text-muted-200 dark:text-muted-300 text-sm">
                  {{ values.school ? values.school : 'School name' }}
                </span>
              </div>
              <div class="flex items-end gap-2">
                <Icon name="heroicons:map-pin" class="text-muted-200 dark:text-muted-300 h-4 w-4" />
                <span class="text-muted-200 dark:text-muted-300 text-sm">
                  {{ values.location ? values.location : 'Location' }}
                </span>
              </div>
              <div class="flex items-end gap-2">
                <Icon
                  name="carbon:skill-level"
                  class="text-muted-200 dark:text-muted-300 h-4 w-4"
                />
                <span class="text-muted-200 dark:text-muted-300 text-sm">
                  {{ values.level ? values.level : 'Level' }}
                </span>
              </div>
              <div class="flex items-end gap-2">
                <Icon name="cil:school" class="text-muted-200 dark:text-muted-300 h-4 w-4" />
                <span class="text-muted-200 dark:text-muted-300 text-sm">
                  {{ values.grade ? values.grade : 'Grade' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </form>
  </div>
</template>
