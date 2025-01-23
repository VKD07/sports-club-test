<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-=_+{};':"\\|,.<>?/]).*$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  )

const zodSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword) {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        })
      }
    }
  })

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)

const initialValues = computed<FormInput>(() => ({
  currentPassword: 'Password',
  newPassword: '',
  confirmPassword: '',
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

const success = ref(false)
const showPasswordField = ref(true)
const showConfirmPasswordField = ref(true)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const auth = useAuthStore()

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
    formData.append('profile_id', auth.user?.index ?? '')
    formData.append('password', values.newPassword)
    formData.append('password_confirmation', values.confirmPassword)

    const { data, error } = await useApiFetch<any>('/api/admin/user-password-reset', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      openModal('error', error.value?.data.message)
      return
    }

    resetForm()
    success.value = true
  } catch (error) {
    success.value = false
    openModal('error', 'Something went wrong, please try again!')
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
</script>

<template>
  <BaseCard>
    <form method="POST" action="" class="w-full" @submit.prevent="onSubmit">
      <div class="p-4">
        <div class="mx-auto max-w-lg space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            Your password has been updated!
          </BaseMessage>

          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them before submitting
          </BaseMessage>

          <TairoFormGroup label="Change Password" sublabel="For an improved account security">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="currentPassword"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    type="password"
                    icon="ph:lock-duotone"
                    label="Old password"
                    placeholder="Old password"
                    autocomplete="current-password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    disabled
                  />
                </Field>
              </div>

              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="newPassword"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :type="showPasswordField ? 'password' : 'text'"
                    icon="ph:lock-duotone"
                    label="New password"
                    placeholder="New password"
                    autocomplete="new-password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  >
                    <template #action>
                      <button
                        class="leading-0 text-muted-400 peer-focus-within:text-primary-500 absolute end-0 top-0 flex h-10 w-10 items-center justify-center text-center text-xl"
                        @click.prevent="showPasswordField = !showPasswordField"
                      >
                        <Icon
                          :name="showPasswordField ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                          class="h-5 w-5"
                        />
                      </button>
                    </template>
                  </BaseInput>
                </Field>
              </div>

              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="confirmPassword"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :type="showConfirmPasswordField ? 'password' : 'text'"
                    label="Repeat new password"
                    placeholder="Repeat new password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  >
                    <template #action>
                      <button
                        class="leading-0 text-muted-400 peer-focus-within:text-primary-500 absolute end-0 top-0 flex h-10 w-10 items-center justify-center text-center text-xl"
                        @click.prevent="showConfirmPasswordField = !showConfirmPasswordField"
                      >
                        <Icon
                          :name="
                            showConfirmPasswordField ? 'mdi:eye-off-outline' : 'mdi:eye-outline'
                          "
                          class="h-5 w-5"
                        />
                      </button>
                    </template>
                  </BaseInput>
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <div class="flex items-center justify-start">
            <div class="flex items-center gap-2">
              <BaseButton class="w-24" :disabled="!meta.dirty" @click="resetForm">Reset</BaseButton>

              <BaseButton
                type="submit"
                color="primary"
                class="w-24"
                :disabled="!meta.dirty"
                :loading="isSubmitting"
              >
                Save
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
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
  </BaseCard>
</template>
