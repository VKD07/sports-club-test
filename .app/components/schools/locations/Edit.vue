<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import countriesData from '../../../countries.json'

const emits = defineEmits(['close'])
const { isOpen, schoolId, locationId } = defineProps(['isOpen', 'schoolId', 'locationId'])

const actionStatus = ref('')
const nextTerms = ref([])
const termTemplates = ref([])
const selectedSchool = ref(null)
const selectedLocation = ref(null)

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
    case 'delete':
      return 'muted'
    default:
      break
  }
}

const zodSchema = z.object({
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

const getLocation = async () => {
  try {
    const { data, error } = await useAdminReadService(
      `/api/admin/location-data/${schoolId}/${locationId}`,
    )

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    selectedSchool.value = data.value?.School
    selectedLocation.value = data.value?.Location[0]
  } catch (error) {
    showErrorToast('Oops!', error.message)
    return null
  }
}
await getLocation()

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

const getNameFromId = (id) => {
  const template = termTemplates.value.find((item) => item?.template.id === id)
  return template ? template?.template.name : null
}

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  school: selectedSchool.value?.school_name || '',
  location: selectedLocation.value?.location_name || '',
  level: selectedLocation.value?.location_level || '',
  noOfStudents: selectedLocation.value?.location_no_of_students.toString() || '',
  joiningYear: selectedLocation.value?.joining_year.toString() || '',
  joiningTerm:
    `${selectedLocation.value?.joining_term}${getSuffix(
      selectedLocation.value?.joining_term,
    )} Term` || '',
  secondarySlots: selectedLocation.value?.no_of_slots.toString() || '',
  address: selectedLocation.value?.location_address || '',
  termTemplate: getNameFromId(selectedLocation.value?.template_id) || '',
  region: selectedLocation.value?.region || '',
  country: selectedLocation.value?.country || '',
  city: selectedLocation.value?.city || '',
  timeZone: selectedLocation.value?.time_zone || '',
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

const terms = ref(['1st Term', '2nd Term', '3rd Term'])

const isModalHoldLocation = ref(false)
const isModalResumeLocation = ref(false)
const isModalDeleteLocation = ref(false)
const isModalApproveLocation = ref(false)
const isModalSuspendLocation = ref(false)
const isModalReleaseLocation = ref(false)

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const startYear = currentYear
  return Array.from({ length: 4 }, (_, i) => (startYear + i).toString())
})

const currentTerms = computed(() => {
  const terms = nextTerms.value.map((t) => `${t}${getSuffix(t)} Term`)
  return terms
})

const getTemplateIdFromName = (name, objsArr) => {
  const template = termTemplates.value.find((item) => item?.template.name === name)
  return template ? template?.template.id : null
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('location_id', locationId)
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

    const { error } = await useApiFetch('/api/admin/school/edit-location', {
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
  }
})

const selectLocation = (action) => {
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

const closeModal = () => {
  emits('close')
}

const isTermDisabled = computed(() => values.joiningYear !== '' && values.termTemplate !== '')

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
const selectedCountry = groupedByRegion[values.region]?.find(
  (country) => country.name == values.country,
)
cities.value = selectedCountry.cities?.length > 0 ? selectedCountry.cities : []

const regions = Object.keys(groupedByRegion)

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

const changeLocationStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('status', actionStatus.value)
    formData.append('location_id', locationId)
    formData.append('school_id', schoolId)

    const { error } = await useApiFetch('/api/admin/school/location/status-change', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    if (actionStatus.value === 'deleted') {
      showSuccessToast('Success', 'Location has been deleted!')
    } else {
      showSuccessToast('Success', 'Location status has been updated!')
    }

    actionStatus.value = ''
    closeModal()
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}
</script>

<template>
  <div>
    <TairoModal :open="isOpen" size="2xl" @close="closeModal">
      <template #header>
        <div class="relative">
          <div class="p-6 pe-16 flex justify-between gap-4">
            <div class="gap-4 lg:items-center flex-col">
              <BaseHeading
                tag="h2"
                size="md"
                weight="medium"
                lead="normal"
                class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
              >
                Manage Location - {{ selectedLocation?.location_name }}
              </BaseHeading>

              <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                Update the details for this location. Make sure to save any changes you make.
              </BaseText>
            </div>

            <div class="gap-2 flex">
              <div class="flex gap-2 items-center mr-6 text-sm">
                Status
                <BaseTag
                  :color="statusColor(selectedLocation?.status)"
                  shape="full"
                  size="md"
                  class="capitalize"
                >
                  {{ selectedLocation?.status }}
                </BaseTag>
              </div>

              <BaseDropdown
                label="Actions"
                orientation="end"
                size="md"
                class="add-dropdown small-dropdown"
              >
                <BaseDropdownItem
                  v-if="selectedLocation?.status === 'draft'"
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Active')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Approve')"
                />

                <!-- <BaseDropdownItem
                  v-if="selectedLocation?.status === 'active'"
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Hold')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Hold')"
                /> -->

                <BaseDropdownItem
                  v-if="selectedLocation?.status === 'active'"
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Suspend')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Suspend')"
                />

                <BaseDropdownItem
                  v-if="selectedLocation?.status === 'on hold'"
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Release')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Release')"
                />

                <BaseDropdownItem
                  v-if="selectedLocation?.status === 'on hold'"
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Suspend')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Suspend')"
                />

                <BaseDropdownItem
                  v-if="selectedLocation?.status === 'suspended'"
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Resume')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Resume')"
                />

                <BaseDropdownItem
                  v-if="
                    selectedLocation?.status === 'draft' || selectedLocation?.status === 'suspended'
                  "
                  :title="
                    createActionMenu(selectedLocation?.status, 'Location', 'Delete')?.buttonText
                  "
                  color="default"
                  rounded="sm"
                  @click="() => selectLocation('Delete')"
                />
              </BaseDropdown>
            </div>
          </div>

          <BaseButtonClose
            @click="closeModal"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>

      <div class="p-4 md:pt-0 md:p-6">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 sm:col-span-6">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="location">
              <BaseInput
                :model-value="field.value"
                :error="errorMessage"
                disabled
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
                  disabled
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
                  disabled
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

          <div class="col-span-12 sm:col-span-6">
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

          <div class="col-span-12 sm:col-span-6">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="joiningYear">
              <BaseListbox
                label="Joining Year"
                :items="years"
                placeholder="Select Year"
                :model-value="field.value"
                :error="errorMessage"
                disabled
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <div class="col-span-12 sm:col-span-6">
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
              :disabled="!meta.dirty"
              :loading="isSubmitting"
              variant="solid"
              @click.prevent="onSubmit"
            >
              Update Location
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

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
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
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
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
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
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
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
      <span class="font-bold text-primary-500 dark:text-muted-200">{{
        selectedLocation?.location_name
      }}</span>
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
