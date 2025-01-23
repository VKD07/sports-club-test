<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import countriesData from '../../countries.json'

definePageMeta({
  title: 'Add School',
  middleware: ['auth'],
})

const addSchoolBreadcrumb = [
  {
    label: 'Schools',
    hideLabel: false,
    to: '/schools',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const zodSchema = z.object({
  school: z
    .string()
    .min(1, 'School name is required')
    .regex(/^[A-Za-z\s]+$/, 'School name must contain only letters and spaces'),
  schoolType: z.string().min(1, 'School type is required'),
  schoolLogo: z.string().min(1, 'School logo is required'),
  theme: z.string().min(1, 'Platform theme is required'),
  colorCode: z.string().min(1, 'Colour variant is required'),
  email: z
    .string()
    .min(1, 'Primary Email is required')
    .email({ message: 'Please enter a valid email' }),

  location: z.array(
    z.object({
      name: z.string().min(1, 'Location name is required'),
      level: z.string().min(1, 'Academic level is required'),
      noOfStudents: z
        .string()
        .min(1, 'Number of students is required')
        .refine(
          (value) => {
            const intValue = parseInt(value)
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
        .min(1, 'Secondary slots is required')
        .refine(
          (value) => {
            const intValue = parseInt(value)
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
    }),
  ),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  school: '',
  schoolType: '',
  schoolLogo: '',
  theme: 'Purple',
  colorCode: '#6D28D9',
  email: '',
  location: [
    {
      name: '',
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
    },
  ],
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

const locationsLength = computed(() => values.location?.length)

const router = useRouter()
const success = ref(false)

const colors = ref([])
colors.value = await getSchoolColors()

const newSchool = ref(null)

const code = ref('#6D28D9')
const nextTerms = ref([])
const termTemplates = ref([])
const variant = ref('variant_2')
const themeColor = ref('Purple')
const variantNumber = ref('500')
const terms = ref(['1st Term', '2nd Term', '3rd Term'])
const colorsVariation = ref(['#A21CAF', '#6D28D9', '#7E22CE'])
const desiredOrder = ['Purple', 'Blue', 'Green', 'Orange', 'Red']

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const startYear = currentYear
  return Array.from({ length: 4 }, (_, i) => (startYear + i).toString())
})

const currentTerms = computed(() => {
  const terms = nextTerms.value.map((t) => `${t}${getSuffix(t)} Term`)
  return terms
})

const modalContent = ref('')
const isModalError = ref(false)
const isModalSuccess = ref(false)

const openModal = (type, content) => {
  modalContent.value = content

  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const uniqueColor = Array.from(new Set(colors.value.map((col) => col.color)))

uniqueColor.sort((a, b) => {
  return desiredOrder.indexOf(a) - desiredOrder.indexOf(b)
})

const filterColors = (predicate) => {
  return colors.value.filter(predicate)
}

watch(themeColor, () => {
  colorsVariation.value = filterColors(
    (item) => item.color === themeColor.value && item.number === '500',
  ).map((item) => item.code)

  setFieldValue('colorCode', colorsVariation.value[1])
})

watch(
  () => values.colorCode,
  async (value) => {
    if (value) {
      const filteredColor = filterColors((item) => item.code === value && item.number === '500')[0]

      if (filteredColor) {
        code.value = value
        variantNumber.value = filteredColor.number
        variant.value = filteredColor.variation
      }
    }
  },
)

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

const getTemplateIdFromName = (name, objsArr) => {
  const template = termTemplates.value.find((item) => item?.template.name === name)
  return template ? template?.template.id : null
}

const onSubmit = handleSubmit(async (values) => {
  try {
    success.value = false

    const requestBody = {
      school_name: values.school,
      school_type: values.schoolType,
      schoolLogo: values.schoolLogo,
      color: values.theme,
      color_variant: variant.value,
      color_code: code.value,
      color_index: variantNumber.value,
      primary_contact_person_email: values.email,
      location: values.location.map((loc) => ({
        location_name: loc.name,
        location_level: loc.level.toLowerCase(),
        location_no_of_students: loc.noOfStudents,
        location_address: loc.address,
        no_of_slots: loc.secondarySlots,
        joining_year: loc.joiningYear,
        joining_term: loc.joiningTerm.charAt(0),
        region: loc.region,
        country: loc.country,
        city: loc.city,
        time_zone: loc.timeZone,
        template_id: getTemplateIdFromName(loc.termTemplate),
      })),
    }

    const { data, error } = await useApiFetch('/api/admin/school/create', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    newSchool.value = data.value?.data
    openModal(
      'success',
      `<span class="font-bold text-primary-500 dark:text-muted-200">${values.school}</span> account has been created successfully!`,
    )

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 2000)

    code.value = ''
    variant.value = ''
    variantNumber.value = ''
  } catch (error) {
    success.value = false
    openModal('error', `${error}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const schoolLocations = ref([
  {
    name: '',
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
  },
])

const addLocation = () => {
  const newLocation = {
    name: '',
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
  }

  schoolLocations.value.push(newLocation)
}

const removeLocation = (index) => {
  if (values.location) {
    const updatedLocations = [...values.location]
    updatedLocations.splice(index, 1)
    schoolLocations.value = updatedLocations
    setFieldValue('location', schoolLocations.value)
  }
}

const goToSchool = () => {
  isModalSuccess.value = false
  router.push(`/schools/${newSchool.value?.id}`)
}

const goToAllSchools = () => {
  isModalSuccess.value = false
  isCancelModalOpen.value = false
  router.push('/schools')
}

const isCancelModalOpen = ref(false)
const cancelCreate = () => {
  if (meta.value.dirty) {
    isCancelModalOpen.value = true
  } else {
    router.push('/schools')
  }
}

const imageName = ref('')
const fileFolder = ref('')
const uploadField = ref('')
const isMediaModalOpen = ref(false)

const addBanner = (field, folder) => {
  uploadField.value = field
  fileFolder.value = folder
  isMediaModalOpen.value = true
}

const addImage = (image) => {
  imageName.value = image.split('/').pop()
  isMediaModalOpen.value = false
  setFieldValue(uploadField.value, image)
  uploadField.value = ''
  fileFolder.value = ''
}

const removeBanner = (field) => {
  setFieldValue(field, '')
}

const isTermDisabled = computed(
  () =>
    values.location[locationsLength.value - 1].joiningYear !== '' &&
    values.location[locationsLength.value - 1].termTemplate !== '',
)

watch(
  () => values.joiningYear,
  async (value) => {
    if (values.joiningYear && values.termTemplate) {
      if (value == currentYear) {
        setFieldValue(`location[${locationsLength.value - 1}].joiningTerm`, '')
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

const iscCountryDisabled = computed(() => values.location[locationsLength.value - 1].region !== '')
const isCitiesDisabled = computed(
  () =>
    values.location[locationsLength.value - 1].region !== '' &&
    values.location[locationsLength.value - 1].country !== '',
)
const isTimeZonesDisabled = computed(
  () =>
    values.location[locationsLength.value - 1].region !== '' &&
    values.location[locationsLength.value - 1].country !== '' &&
    values.location[locationsLength.value - 1].city !== '',
)

watch(
  () => values.location[locationsLength.value - 1].region,
  () => {
    setFieldValue(
      `location[${locationsLength.value - 1}].country`,
      groupedByRegion[values.location[locationsLength.value - 1].region][0]?.name,
    )
  },
)

watch(
  () => values.location[locationsLength.value - 1].country,
  () => {
    const selectedCountry = groupedByRegion[
      values.location[locationsLength.value - 1].region
    ]?.find((country) => country.name == values.location[locationsLength.value - 1].country)

    cities.value = selectedCountry.cities?.length > 0 ? selectedCountry.cities : []
    setFieldValue(`location[${locationsLength.value - 1}].city`, selectedCountry.cities[0])
  },
)
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addSchoolBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <BaseCard class="!min-h-[600px]">
        <div class="flex items-center justify-between px-8 py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="sm"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Create a New School Account
            </BaseHeading>

            <BaseText size="xs" class="text-muted-600 dark:text-muted-400">
              Enter required details to set up a new school. Complete all fields and save to
              finalize.
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

        <div class="">
          <div class="px-8">
            <div class="max-w-3xl space-y-12 py-8">
              <TairoFormGroup
                label="School Details"
                sublabel="Provide accurate details for the core school organization account to ensure smooth operation and efficiency."
              >
                <div class="grid grid-cols-12 gap-6">
                  <div class="col-span-12 sm:col-span-6">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="school">
                      <BaseInput
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        icon="ph:user"
                        label="School Name"
                        placeholder="Type School Name"
                        autocomplete="off"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div
                    class="col-span-12 sm:col-span-4 lg:flex flex-col justify-between gap-3 items-center"
                  >
                    <div class="flex justify-between gap-4 items-center">
                      <label class="nui-label pb-2 text-[0.825rem] min-w-fit"> School Type </label>

                      <div class="grid-cols-2 grid gap-4 w-full">
                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="schoolType"
                        >
                          <BaseRadioHeadless
                            value="private"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          >
                            <BaseCard
                              shape="rounded"
                              class="text-muted-400 peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-500 relative border-2 px-2 py-4 grayscale peer-checked:grayscale-0"
                            >
                              <div class="flex w-full flex-col items-center gap-2 text-center">
                                <Icon
                                  name="ph:house-simple-duotone"
                                  class="child mx-auto h-5 w-5"
                                />

                                <div>
                                  <BaseHeading as="h4" size="sm" weight="medium" lead="none">
                                    Private
                                  </BaseHeading>
                                </div>

                                <div class="child text-muted-300 absolute right-2 top-2 ms-auto">
                                  <div class="h-2 w-2 rounded-full bg-current"></div>
                                </div>
                              </div>
                            </BaseCard>
                          </BaseRadioHeadless>
                        </Field>

                        <Field
                          v-slot="{ field, errorMessage, handleChange, handleBlur }"
                          name="schoolType"
                        >
                          <BaseRadioHeadless
                            value="state"
                            :model-value="field.value"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="handleChange"
                            @blur="handleBlur"
                          >
                            <BaseCard
                              shape="rounded"
                              class="text-muted-400 peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-500 relative border-2 px-2 py-4 grayscale peer-checked:grayscale-0"
                            >
                              <div class="flex w-full flex-col items-center gap-2 text-center">
                                <Icon
                                  name="heroicons:building-library"
                                  class="child mx-auto h-5 w-5"
                                />

                                <div>
                                  <BaseHeading as="h4" size="sm" weight="medium" lead="none">
                                    State
                                  </BaseHeading>
                                </div>

                                <div class="child text-muted-300 absolute right-2 top-2 ms-auto">
                                  <div class="h-2 w-2 rounded-full bg-current"></div>
                                </div>
                              </div>
                            </BaseCard>
                          </BaseRadioHeadless>
                        </Field>
                      </div>
                    </div>

                    <span class="custom-error-msg w-full ml-[146px]">
                      {{ errors?.schoolType }}
                    </span>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <label class="nui-label pb-2 text-[0.825rem] w-full">School Logo</label>

                    <BaseParagraph
                      size="xs"
                      lead="tight"
                      class="text-muted-500 dark:text-muted-400 pb-2"
                    >
                      <span>Size: 100px x 100px</span>
                    </BaseParagraph>

                    <div v-if="!values.schoolLogo">
                      <BaseButton color="primary" @click="addBanner('schoolLogo', 'school_logo')">
                        <Icon name="icon-park-outline:upload-picture" class="me-1 size-4" />
                        <span>Upload Logo</span>
                      </BaseButton>
                    </div>

                    <div v-else>
                      <div
                        class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3 w-full"
                      >
                        <div class="flex items-center gap-2">
                          <div class="shrink-0">
                            <img
                              class="size-14 rounded-md object-cover object-center w-16"
                              :src="getImageUrl(values.schoolLogo)"
                              alt="Image preview"
                            />
                          </div>

                          <div class="font-sans">
                            <span
                              class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm break-all"
                            >
                              {{ imageName ?? '' }}
                            </span>
                          </div>
                        </div>

                        <div class="flex gap-2">
                          <button
                            class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                            type="button"
                            tooltip="Remove"
                            @click.prevent="removeBanner('schoolLogo')"
                          >
                            <Icon name="lucide:x" class="size-4" />
                            <span class="sr-only">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="col-span-12 sm:col-span-12">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="schoolLogo"
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
                  </div>

                  <div class="col-span-12 sm:col-span-3">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="theme">
                      <BaseListbox
                        label="Platform Theme"
                        :items="uniqueColor"
                        placeholder="Select Colour"
                        v-model="themeColor"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>

                  <div class="col-span-12 sm:col-span-3">
                    <label class="nui-label text-[0.825rem]">Colour Variant</label>

                    <div class="flex items-center gap-3 mt-2 mb-5">
                      <Field
                        v-for="(variation, index) in colorsVariation"
                        :key="index"
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="colorCode"
                      >
                        <BaseRadioHeadless
                          name="colorCode"
                          :value="variation"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          :bgColor="variation"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        >
                          <div
                            :class="'peer-checked:ring-2 h-6 w-6 rounded-full border-2 transition-colors duration-300'"
                            :style="{ backgroundColor: variation }"
                          />
                        </BaseRadioHeadless>
                      </Field>
                    </div>

                    <span class="custom-error-msg">
                      {{ errors?.colorCode }}
                    </span>
                  </div>

                  <div class="col-span-12 sm:col-span-6">
                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
                      <BaseInput
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="email"
                        icon="mdi-light:email"
                        label="Primary Email"
                        placeholder="Type Email"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                </div>
              </TairoFormGroup>

              <TairoFormGroup
                label="Location Details"
                sublabel="Enter details for all locations under the school organization. Ensure at least one location is created for proper setup."
              >
                <div class="grid grid-cols-12 gap-6">
                  <div class="col-span-12 sm:col-span-12">
                    <label class="nui-label pb-2 text-[0.825rem] w-full">School Locations</label>

                    <TairoFormGroup>
                      <div v-for="(location, index) in schoolLocations" :key="index">
                        <div class="p-8 bg-muted-100 dark:bg-muted-700 rounded my-2">
                          <label
                            class="nui-label pb-2 text-[0.825rem] lg:mb-2 min-w-fit text-primary-500 font-bold"
                          >
                            Location {{ index + 1 }}
                          </label>

                          <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].name`"
                              >
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
                              <label class="nui-label pb-2 text-[0.825rem] w-full">
                                Academic Level
                              </label>

                              <div class="grid grid-cols-2 gap-6 md:max-w-lg md:grid-cols-4 mt-1">
                                <Field
                                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                  :name="`location[${index}].level`"
                                >
                                  <BaseRadio
                                    :id="`Primary${index}`"
                                    label="Primary"
                                    value="Primary"
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
                                    :id="`Secondary${index}`"
                                    label="Secondary"
                                    value="Secondary"
                                    color="primary"
                                    :classes="{
                                      label: 'relative top-0.5 text-xs',
                                    }"
                                    :model-value="field.value"
                                    :disabled="isSubmitting"
                                    @update:model-value="handleChange"
                                    @blur="handleBlur"
                                  />

                                  <span class="custom-error-msg absolute bottom-0 mt-2">
                                    {{ errorMessage }}
                                  </span>
                                </Field>
                              </div>
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].noOfStudents`"
                              >
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

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].termTemplate`"
                              >
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

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].joiningYear`"
                              >
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

                              <span class="custom-error-msg"> {{ errors?.joiningYear }}</span>
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].joiningTerm`"
                              >
                                <BaseListbox
                                  label="Academic Term"
                                  :items="
                                    values.location[index].joiningYear == currentYear
                                      ? currentTerms
                                      : terms
                                  "
                                  placeholder="Select Term"
                                  :model-value="field.value"
                                  :error="errorMessage"
                                  :disabled="!isTermDisabled"
                                  @update:model-value="handleChange"
                                  @blur="handleBlur"
                                />
                              </Field>

                              <span class="custom-error-msg"> {{ errors?.joiningTerm }}</span>
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].secondarySlots`"
                              >
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
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].address`"
                              >
                                <BaseInput
                                  :model-value="field.value"
                                  :error="errorMessage"
                                  :disabled="isSubmitting"
                                  type="text"
                                  icon="material-symbols:location-on-outline"
                                  label="Address"
                                  placeholder="Address"
                                  @update:model-value="handleChange"
                                  @blur="handleBlur"
                                />
                              </Field>
                            </div>

                            <!-- New Fields -->
                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].region`"
                              >
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

                              <span class="custom-error-msg"> {{ errors?.region }}</span>
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].country`"
                              >
                                <BaseListbox
                                  label="Country"
                                  :items="
                                    values.location[index].region
                                      ? groupedByRegion[values.location[index].region]?.map(
                                          (c) => c.name,
                                        )
                                      : []
                                  "
                                  placeholder="Select Country"
                                  :model-value="field.value"
                                  :error="errorMessage"
                                  :disabled="!iscCountryDisabled"
                                  @update:model-value="handleChange"
                                  @blur="handleBlur"
                                />
                              </Field>

                              <span class="custom-error-msg"> {{ errors?.country }}</span>
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].city`"
                              >
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
                              <Field
                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                :name="`location[${index}].timeZone`"
                              >
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

                              <span class="custom-error-msg"> {{ errors?.timeZone }}</span>
                            </div>

                            <div class="col-span-12 sm:col-span-12 flex justify-end items-end">
                              <BaseButton
                                v-if="schoolLocations.length > 1"
                                color="primary"
                                class="w-24"
                                @click="removeLocation(index)"
                              >
                                Remove
                              </BaseButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TairoFormGroup>

                    <div class="flex items-center gap-2 mt-4">
                      <BaseButton class="w-full sm:w-40 text-primary-500" @click="addLocation">
                        <Icon name="lucide:plus" class="h-4 w-4" />
                        <span>Add Location</span>
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </TairoFormGroup>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-12">
              <BaseButton class="w-24" @click="cancelCreate">Cancel</BaseButton>

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
        </div>
      </BaseCard>
    </form>

    <BaseModal
      :isOpen="isModalSuccess"
      :title="'Operation Success'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="success"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'View'"
      :primaryButtonAction="goToSchool"
      :cancelButtonText="'All Schools'"
      @close="goToAllSchools"
    >
      <span v-html="modalContent"></span>
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

    <BaseModal
      :isOpen="isCancelModalOpen"
      :title="'Cancel Operation'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="error"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Yes'"
      :primaryButtonAction="goToAllSchools"
      :cancelButtonText="'No'"
      @close="isCancelModalOpen = false"
    >
      Are you sure you want to cancel creating this school?
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
