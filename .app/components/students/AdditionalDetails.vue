<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import '~/assets/css/vcalendar.css'
import { masks } from '../../constants'

const student = inject('student')
const emits = defineEmits(['reset'])

const zodSchema = z.object({
  email: z.string().min(1, 'Email is required').email({ message: 'Please enter a valid email' }),
  birthDay: z.string().min(1, 'Birth day is required'),
  accommodation: z.string().min(1, 'Accommodation is required'),
  favGames: z.array(z.string()).min(1, 'Favorite games selection is required'),
  otherGames: z.string().min(1, 'Other games is required'),
  favConsoles: z.array(z.string()).min(1, 'Please select a at least one console'),
  whatsappNumber: z
    .string()
    .min(1, 'Whatsapp number is required')
    .refine((value) => isPhoneNumber(value), {
      message: 'Please enter a valid WhatsApp number',
    }),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  email: student?.student_profile?.parent_email || '',
  accommodation: student?.student_profile?.accommodation || '',
  whatsappNumber: student?.student_profile?.whatsapp_no || '',
  birthDay: student?.student_profile?.date_of_birth_day || '',
  favGames: student?.student_profile?.favorite_game
    ? JSON.parse(student?.student_profile?.favorite_game)
    : [],
  otherGames: student?.student_profile?.prefer_game || '',
  favConsoles: student?.student_profile?.console_game
    ? JSON.parse(student?.student_profile?.console_game)
    : [],
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

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('id', student?.id)
    formData.append('first_name', student?.first_name)
    formData.append('last_name', student?.last_name)
    formData.append('phone_number', student?.phone_number)
    formData.append('profile_picture', student?.student_profile?.profile_picture)
    formData.append('parent_email', values.email)
    formData.append('whatsapp_no', values.whatsappNumber)
    formData.append('school_id', student?.school_id)
    formData.append('location_id', student?.location_id)
    formData.append('date_of_birth_day', values.birthDay)
    formData.append('accommodation', values.accommodation)
    formData.append('favorite_game', JSON.stringify(values.favGames))
    formData.append('prefer_game', values.otherGames)
    formData.append('console_game', JSON.stringify(values.favConsoles))

    const { error } = await useApiFetch('/api/admin/school-student-profile', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      const errorData = error.value?.data

      if (errorData?.error?.errors) {
        console.log(errorData?.error?.errors)

        const errors = errorData.error.errors
        const errorMessages = Object.keys(errors)
          .map((key) => errors[key].join(' '))
          .join(' | ')

        throw new Error(errorMessages)
      } else {
        throw new Error(errorData.message || 'An error occurred')
      }
    }

    emits('reset')

    showSuccessToast(
      'Success',
      `${student?.first_name} ${student?.last_name}'s additional details have been updated successfully!`,
    )
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
})

const dob = ref(values.birthDay || '')

const favoriteGames = ref([])
favoriteGames.value = await getEstarsGames()

watch(dob, (value) => {
  setFieldValue('birthDay', value.toString())
})

const consoles = [
  {
    name: 'Xbox',
    icon: 'tabler:brand-xbox',
  },
  {
    name: 'PlayStation',
    icon: 'ri:playstation-line',
  },
  {
    name: 'Microsoft',
    icon: 'streamline:computer-logo-windows-2-os-system-microsoft',
  },
  {
    name: 'Android',
    icon: 'uil:android-alt',
  },
  {
    name: 'Apple',
    icon: 'mingcute:apple-line',
  },
]
</script>

<template>
  <BaseCard class="p-6 pb-10 mt-8">
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Student Additional Details
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Manage and update student's additional details.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton class="w-24" :disabled="!meta.dirty" @click="resetForm"> Reset </BaseButton>

        <BaseButton
          type="submit"
          color="primary"
          class="w-24"
          :disabled="!meta.dirty"
          @click="onSubmit"
        >
          Update
        </BaseButton>
      </div>
    </div>

    <div class="max-w-4xl p-4">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 sm:col-span-6 relative">
          <label class="nui-label pb-2 text-[0.825rem] w-full">Accommodation</label>

          <div class="flex gap-4">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="accommodation">
              <BaseRadio
                id="Home"
                label="Home"
                value="Home"
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
                id="Boarding"
                label="Boarding"
                value="Boarding"
                color="primary"
                :classes="{
                  label: 'relative top-0.5 text-xs',
                }"
                :model-value="field.value"
                :disabled="isSubmitting"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />

              <span class="custom-error-msg absolute top-[60px]"> {{ errorMessage }}</span>
            </Field>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              type="email"
              icon="mdi-light:email"
              label="Parent Email"
              placeholder="Email Address"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="whatsappNumber">
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="tel"
              icon="ic:baseline-whatsapp"
              label="WhatsApp Number"
              placeholder="Parent WhatsApp Number"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-6">
          <DatePicker
            v-model="dob"
            :masks="masks"
            :max-date="new Date()"
            mode="date"
            hide-time-header
            trim-weeks
          >
            <template #default="{ togglePopover, inputValue }">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="birthDay">
                <BaseInput
                  placeholder="dd/mm/yyyy"
                  label="Date of Birth"
                  autocomplete="off"
                  icon="material-symbols:calendar-month-outline"
                  :value="inputValue"
                  type="text"
                  @click="togglePopover"
                />
              </Field>
            </template>
          </DatePicker>
        </div>

        <div class="col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="favGames">
            <BaseAutocomplete
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="favoriteGames"
              rounded="md"
              icon="mdi:puzzle-heart-outline"
              placeholder="Search and add games"
              label="What are your favourite games?"
              multiple
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="otherGames">
            <BaseTextarea
              label="Are there any other games you enjoy playing?"
              rounded="md"
              placeholder="Add games by typing"
              :model-value="field.value"
              :error="errorMessage"
              :rows="8"
              :disabled="isSubmitting"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="col-span-12 sm:col-span-12">
          <label class="nui-label pb-2 text-[0.825rem] w-full">
            Gaming consoles that you hold to play games?
          </label>

          <div class="grid gap-x-6 gap-y-2 sm:grid-cols-3 !mt-1">
            <div v-for="console in consoles" :key="console.name" class="relative">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="favConsoles">
                <BaseCheckboxHeadless
                  :value="console.name"
                  :name="console.name"
                  :model-value="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                >
                  <BaseCard
                    rounded="sm"
                    class="peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-800 border-2 p-3 opacity-60 peer-checked:opacity-100"
                  >
                    <div class="flex w-full items-center gap-2">
                      <Icon
                        :name="console.icon"
                        class="h-5 w-5 text-muted-600 dark:text-muted-400"
                      />

                      <div>
                        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                          {{ console.name }}
                        </BaseText>
                      </div>

                      <div class="child text-muted-600 ms-auto bg-red-500">
                        <div class="size-3 rounded-full bg-current" />
                      </div>
                    </div>
                  </BaseCard>
                </BaseCheckboxHeadless>
              </Field>
            </div>

            <span class="custom-error-msg col-span-3">
              {{ errors?.favConsoles ? errors?.favConsoles : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
