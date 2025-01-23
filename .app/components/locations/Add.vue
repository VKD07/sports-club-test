<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import countriesData from '../../countries.json'

const { isOpen } = defineProps(['isOpen'])
const emits = defineEmits(['close'])

const zodSchema = z.object({
  school: z.string().min(1, 'School name is required'),
  location: z.string().min(1, 'Location name is required'),
  level: z.string().min(1, 'Academic level is required'),
  noOfStudents: z
    .string()
    .regex(/^\d+$/, { message: 'Total students must be a valid number' })
    .refine(
      (value) => {
        const intValue = parseInt(value, 10)
        return intValue >= 1 && intValue <= 10000
      },
      {
        message: 'Total students must be between 1 and 10000',
      },
    ),
  joiningYear: z.string().min(1, 'Joining year is required'),
  joiningTerm: z.string().min(1, 'Academic term is required'),
  secondarySlots: z
    .string()
    .regex(/^\d+$/, { message: 'Secondary slots must be a valid number' })
    .refine(
      (value) => {
        const intValue = parseInt(value, 10)
        return intValue >= 1 && intValue <= 20
      },
      {
        message: 'Secondary slots must be a number between 1 and 20',
      },
    ),
  address: z.string().min(1, 'Address is required'),
  termTemplate: z.string().min(1, 'Term template is required'),
  region: z.string().min(1, 'Region is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  school: '',
  location: '',
  level: '',
  noOfStudents: '',
  joiningYear: '',
  joiningTerm: '',
  secondarySlots: '',
  address: '',
  termTemplate: '',
  region: '',
  country: '',
  city: '',
  timeZone: '',
}))

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  values,
  errors,
  resetForm,
  setValues,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const router = useRouter()
const success = ref(false)

const school = ref([])
const nextTerms = ref([])
const schoolsList = ref([])
const termTemplates = ref([])
const terms = ref(['1st Term', '2nd Term', '3rd Term'])

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const startYear = currentYear
  return Array.from({ length: 4 }, (_, i) => (startYear + i).toString())
})

const currentTerms = computed(() => {
  const terms = nextTerms.value.map((t) => `${t}${getSuffix(t)} Term`)
  return terms
})

const getTermTemplates = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/term_template')

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    termTemplates.value = data.value?.template_data
    nextTerms.value = data.value?.template_data[0]?.next_terms
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getTermTemplates()

const getAllSchools = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/all-school')

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    schoolsList.value = data.value.School
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getAllSchools()

const schoolNames = computed(() => schoolsList.value.map((school) => school.school_name))

const getTemplateIdFromName = (name, objsArr) => {
  const template = termTemplates.value.find((item) => item?.template.name === name)
  return template ? template?.template.id : null
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('school_id', school.value)
    formData.append('location_name', values.location)
    formData.append('location_level', values.level.toLowerCase())
    formData.append('location_address', values.address)
    formData.append('location_no_of_students', values.noOfStudents)
    formData.append('joining_year', values.joiningYear)
    formData.append('joining_term', values.joiningTerm.charAt(0))
    formData.append('no_of_slots', values.secondarySlots)
    formData.append('region', values.region)
    formData.append('country', values.country)
    formData.append('city', values.city)
    formData.append('time_zone', values.timeZone)
    formData.append('template_id', getTemplateIdFromName(values.termTemplate))

    const { error } = await useApiFetch('/api/admin/school/add-location', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    closeModal()
    showSuccessToast('Success', `${values.location} location has been created successfully!`)
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const closeModal = () => {
  emits('close')
}

const isTermDisabled = computed(() => values.joiningYear !== '' && values.termTemplate !== '')

watch(
  () => values.school,
  async (value) => {
    if (value) {
      school.value = await getSchoolIdByName(schoolsList.value, value)
    }
  },
)

watch(
  () => values.joiningYear,
  async (value) => {
    if (values.joiningYear && values.termTemplate) {
      if (value == currentYear) {
        setFieldValue('joiningTerm', '')
      }
    }
  },
)

// Countries and Time zones
const countries = countriesData?.countries
const timeZones = ['Asia/Dubai', 'Africa/Lagos', 'Europe/London']

// Group countries by region
const groupedByRegion = countries.reduce((acc, country) => {
  const region = country.region
  if (!acc[region]) {
    acc[region] = []
  }
  acc[region].push(country)
  return acc
}, {})

const cities = ref([])
const regions = Object.keys(groupedByRegion)

const clearSchool = () => {
  setFieldValue('school', '')
}

const iscCountryDisabled = computed(() => values.region !== '')
const isCitiesDisabled = computed(() => values.region !== '' && values.country !== '')
const isTimeZonesDisabled = computed(
  () => values.region !== '' && values.country !== '' && values.city !== '',
)

watch(
  () => values.region,
  () => {
    setFieldValue('country', groupedByRegion[values.region][0]?.name)
  },
)

watch(
  () => values.country,
  () => {
    const selectedCountry = groupedByRegion[values.region]?.find(
      (country) => country.name == values.country,
    )

    cities.value = selectedCountry.cities?.length > 0 ? selectedCountry.cities : []
    setFieldValue('city', selectedCountry.cities[0])
  },
)
</script>

<template>
  <TairoModal :open="isOpen" size="2xl" @close="closeModal">
    <template #header>
      <div class="relative">
        <div class="p-6 pe-16">
          <div class="gap-4 lg:items-center flex-col">
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Create New Location
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Enter the required details to add a new school location. Ensure all information is
              complete before saving.
            </BaseText>
          </div>
        </div>

        <BaseButtonClose
          @click="closeModal"
          class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
        />
      </div>
    </template>

    <div class="p-4 md:py-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-12rem)]">
      <div class="grid grid-cols-12 gap-x-6 gap-y-4">
        <div class="col-span-12 sm:col-span-6 relative">
          <BaseButtonClose
            v-if="values.school"
            size="sm"
            rounded="sm"
            color="muted"
            class="close-btn-auto"
            @click="clearSchool"
          />
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="school">
            <BaseAutocomplete
              label="School Name"
              :items="schoolNames"
              placeholder="Search a school"
              icon="heroicons:building-library"
              :model-value="[field.value]"
              :error="errorMessage"
              :disabled="isSubmitting"
              :class="errorMessage ? 'error-border' : ''"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="location">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              icon="material-symbols:location-on-outline"
              label="Location Name"
              placeholder="Type Name"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6 relative">
          <label class="nui-label pb-2 text-[0.825rem] w-full">Academic Level</label>

          <div class="grid grid-cols-2 gap-6 md:max-w-lg md:grid-cols-4 mt-1">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="level">
              <BaseRadio
                id="Primary"
                label="Primary"
                value="primary"
                color="primary"
                :classes="{
                  label: 'relative top-0.5 text-xs',
                }"
                :model-value="field.value"
                :disabled="isSubmitting"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />

              <BaseRadio
                id="Secondary"
                label="Secondary"
                value="secondary"
                color="primary"
                :classes="{
                  label: 'relative top-0.5 text-xs',
                }"
                :model-value="field.value"
                :disabled="isSubmitting"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />

              <span class="custom-error-msg absolute bottom-0">
                {{ errors.level ? errors.level : '' }}</span
              >
            </Field>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="noOfStudents">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              icon="ph:users-four-light"
              label="Total Students"
              placeholder="Number of students"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="termTemplate">
            <BaseListbox
              label="Term Template"
              :items="termTemplates.map((t) => t.template.name)"
              placeholder="Select Term Template"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="joiningYear">
            <BaseListbox
              label="Joining Year"
              :items="years"
              placeholder="Select Year"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="joiningTerm">
            <BaseListbox
              label="Academic Term"
              :items="values.joiningYear == currentYear ? currentTerms : terms"
              placeholder="Select Term"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="!isTermDisabled"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="secondarySlots">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              icon="material-symbols-light:event-seat-outline"
              label="Secondary Slots"
              placeholder="Number of Users"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="address">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              icon="material-symbols:location-on-outline"
              label="Address"
              placeholder="Type Address"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <!-- New Fields -->

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="region">
            <BaseListbox
              label="Region"
              :items="regions"
              placeholder="Select Region"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="country">
            <BaseListbox
              label="Country"
              :items="groupedByRegion[values.region]?.map((c) => c.name) ?? []"
              placeholder="Select Country"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="!iscCountryDisabled"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="city">
            <BaseListbox
              label="City"
              :items="cities"
              placeholder="Select City"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="!isCitiesDisabled"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="timeZone">
            <BaseListbox
              label="Time Zone"
              :items="timeZones"
              placeholder="Select Time Zone"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="!isTimeZonesDisabled"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="p-4 md:p-6">
        <div class="flex gap-x-2">
          <BaseButton @click="closeModal"> Cancel </BaseButton>

          <BaseButton
            color="primary"
            :disabled="isSubmitting"
            :loading="isSubmitting"
            variant="solid"
            @click.prevent="onSubmit"
          >
            Add Location
          </BaseButton>
        </div>
      </div>
    </template>
  </TairoModal>
</template>

<style scoped>
.close-btn-auto {
  position: absolute;
  right: 8px !important;
  z-index: 9;
  top: 32px !important;
  width: 25px;
  height: 25px;
  padding: 6px;
}
</style>
