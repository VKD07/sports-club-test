<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  layout: 'empty',
  title: 'Reset Password',
  middleware: ['guest'],
})

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-=_+{};':"\\|,.<>?/]).*$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  )

const zodSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, "Confirm password can't be empty"),
  })
  .superRefine((data, ctx) => {
    if (data.password) {
      if (data.password !== data.confirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirm'],
        })
      }
    }
  })

type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)

const initialValues = computed<FormInput>(() => ({
  password: '',
  confirm: '',
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

const router = useRouter()
const route = useRoute()
const email = route.query.email as string
const token = route.query.token as string

const toaster = useToaster()
const success = ref(false)

const showPasswordField = ref(true)
const showConfirmPasswordField = ref(true)

const isModalError = ref(false)
const modalContent = ref('')

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'error') {
    isModalError.value = true
  }
}

function getQueryParamValue(key: string): string | null {
  const router = useRouter()
  const value = router.currentRoute.value.query[key]
  return typeof value === 'string' ? value : null
}

watchEffect(() => {
  const timestampQueryParam = getQueryParamValue('timestamp')
  if (timestampQueryParam === null) {
    return
  }

  const timestampFromUrl = parseInt(timestampQueryParam, 10)
  if (isNaN(timestampFromUrl)) {
    return
  }

  const currentTime = Date.now()
  const differenceInMilliseconds = currentTime - timestampFromUrl
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60)

  const isExpired = differenceInHours > 24

  if (isExpired) {
    openModal(
      'error',
      'Sorry, your password reset link has expired. Please request a new password reset link.',
    )
  }
})

const goToLogin = () => {
  router.push('/')
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('token', token)
    formData.append('password', values.password)
    formData.append('password_confirmation', values.confirm)

    const { data, error } = await useAuthFetch<any>('/api/admin-guest/password-reset', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      openModal('error', error.value?.data.error.message)
      return
    }

    success.value = true
    setTimeout(() => {
      goToLogin()
    }, 4000)
  } catch (error) {
    success.value = false
    showErrorToast('Oops!', error)
  }
})
</script>

<template>
  <div class="dark:bg-muted-800 flex min-h-screen bg-white">
    <div class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-2/5 lg:flex-none">
      <div class="dark:bg-muted-800 relative mx-auto w-full max-w-sm bg-white">
        <div class="flex w-full items-center justify-between">
          <div class="w-36">
            <NuxtLink to="/">
              <img
                src="/img/logos/logo-esports-color.png"
                class="max-w-full object-contain"
                alt=""
              />
            </NuxtLink>
          </div>

          <BaseThemeToggle />
        </div>

        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="scale-0 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition-all duration-75 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-0 opacity-0"
        >
          <div v-if="success">
            <div>
              <div>
                <BaseHeading
                  as="h2"
                  size="3xl"
                  lead="relaxed"
                  weight="medium"
                  class="mt-8 text-primary-500 dark:text-primary-300"
                >
                  Reset Password!
                </BaseHeading>
              </div>

              <div class="mt-4">
                <div class="mb-4 space-y-4">
                  <BaseCard color="success" rounded="md" class="p-6 max-w-md mx-auto mt-6 mb-8">
                    <div class="p-4 !pt-0 md:p-6">
                      <div class="mx-auto w-full max-w-xs text-center">
                        <div class="mb-3">
                          <Icon
                            name="clarity:success-standard-line"
                            class="block h-16 w-16 text-success-500"
                          />
                        </div>

                        <p class="text-success-600 dark:text-muted-400 text-lg leading-5">
                          Password reset successful.
                        </p>

                        <div class="mt-6 flex items-center justify-center gap-2">
                          <BaseButton type="submit" color="primary" to="/"> Login </BaseButton>
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <div>
              <div>
                <BaseHeading
                  as="h2"
                  size="3xl"
                  lead="relaxed"
                  weight="medium"
                  class="text-primary-500 dark:text-primary-300 mt-6"
                >
                  Reset Your Password
                </BaseHeading>

                <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-400 mb-6 mt-6">
                  Enter a new password below to change your password (Password must contains
                  Uppercase, Lowercase, Symbols)
                </BaseParagraph>
              </div>

              <form method="POST" @submit.prevent="onSubmit" class="mt-6" novalidate>
                <div class="mt-5">
                  <div>
                    <div class="space-y-4 relative">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="password"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          :type="showPasswordField ? 'password' : 'text'"
                          label="New Password"
                          placeholder="Password"
                          autocomplete="current-password"
                          :classes="{
                            input: 'h-12',
                          }"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                          @keydown.enter.prevent="onSubmit"
                        >
                          <template #action>
                            <button
                              class="leading-0 text-muted-400 peer-focus-within:text-primary-500 absolute end-0 top-0 flex h-10 w-10 items-center justify-center text-center text-xl"
                              @click.prevent="showPasswordField = !showPasswordField"
                            >
                              <Icon
                                :name="
                                  showPasswordField ? 'mdi:eye-off-outline' : 'mdi:eye-outline'
                                "
                                class="h-5 w-5"
                              />
                            </button>
                          </template>
                        </BaseInput>
                      </Field>

                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="confirm"
                      >
                        <BaseInput
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          :type="showConfirmPasswordField ? 'password' : 'text'"
                          label="Confirm Password"
                          placeholder="Password"
                          autocomplete="current-password"
                          :classes="{
                            input: 'h-12',
                          }"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                          @keydown.enter.prevent="onSubmit"
                        >
                          <template #action>
                            <button
                              class="leading-0 text-muted-400 peer-focus-within:text-primary-500 absolute end-0 top-0 flex h-10 w-10 items-center justify-center text-center text-xl"
                              @click.prevent="showConfirmPasswordField = !showConfirmPasswordField"
                            >
                              <Icon
                                :name="
                                  showConfirmPasswordField
                                    ? 'mdi:eye-off-outline'
                                    : 'mdi:eye-outline'
                                "
                                class="h-5 w-5"
                              />
                            </button>
                          </template>
                        </BaseInput>
                      </Field>
                    </div>

                    <div class="mt-6">
                      <div class="block w-full rounded-md shadow-sm">
                        <BaseButton
                          :disabled="isSubmitting"
                          :loading="isSubmitting"
                          type="submit"
                          color="primary"
                          class="!h-11 w-full"
                        >
                          Submit
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>

      <ul class="flex gap-4 md:gap-6 justify-center mt-auto absolute bottom-6 w-full left-0">
        <li>
          <AuthAbout />
        </li>
        <li>
          <AuthHelp />
        </li>
        <li>
          <AuthSafety />
        </li>
        <li>
          <AuthTerms />
        </li>
      </ul>
    </div>

    <div
      class="bg-muted-100 dark:bg-muted-900 relative hidden w-0 flex-1 items-center justify-center lg:flex lg:w-7/12"
    >
      <AuthBanner />
    </div>

    <BaseModal
      :isOpen="isModalError"
      :title="'Login Failed'"
      :icon="'ph:warning-octagon-bold'"
      iconColor="error"
      :showCancelButton="false"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="'Ok'"
      :primaryButtonAction="() => goToLogin()"
      :cancelButtonText="'Cancel'"
      @close="isModalError = false"
    >
      {{ modalContent }}
    </BaseModal>
  </div>
</template>
