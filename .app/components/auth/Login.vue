<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const zodSchema = z.object({
  email: z.string().min(1, 'Email is required').email({ message: 'Please enter a valid email' }),
  password: z.string().min(1, "Password can't be empty"),
  rememberMe: z.boolean(),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  email: '',
  password: '',
  rememberMe: false,
}))

const emit = defineEmits(['forgotPasswordClicked'])

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

const auth = useAuthStore()
const router = useRouter()

const showPasswordField = ref(true)

const isModalError = ref(false)
const modalContent = ref('')
const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'error') {
    isModalError.value = true
  }
}

const onSubmitLogin = handleSubmit(async (values) => {
  try {
    const { data, error } = await auth.login(
      values.email,
      values.password,
      values.rememberMe.toString(),
    )

    if (error.value) {
      openModal('error', error.value?.data.error)
      return
    }

    if (auth.token) {
      router.push('/2factor')
    }
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
})
</script>

<template>
  <div>
    <div>
      <BaseHeading
        as="h4"
        size="xl"
        lead="relaxed"
        weight="medium"
        class="mt-5 text-primary-300 dark:text-primary-200"
      >
        Welcome to
      </BaseHeading>
      <BaseHeading
        as="h2"
        size="3xl"
        lead="relaxed"
        weight="medium"
        class="text-primary-500 dark:text-primary-300"
      >
        EStars’ Esports Club
      </BaseHeading>

      <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-400 mb-6 mt-6">
        To get access to our esports educational platform, please login using your username and
        password
      </BaseParagraph>
    </div>

    <!--Form section-->
    <form method="POST" @submit.prevent="onSubmitLogin" class="mt-6" novalidate>
      <div class="mt-5">
        <div>
          <div class="space-y-4 relative">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
              <BaseInput
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="email"
                label="Username"
                placeholder="Email address"
                autocomplete="email"
                :classes="{
                  input: 'h-12',
                }"
                @update:model-value="handleChange"
                @blur="handleBlur"
                @keydown.enter.prevent="onSubmitLogin"
              />
            </Field>

            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="password">
              <BaseInput
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                :type="showPasswordField ? 'password' : 'text'"
                label="Password"
                placeholder="Password"
                @update:model-value="handleChange"
                @blur="handleBlur"
                @keydown.enter.prevent="onSubmitLogin"
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

          <div class="mt-6 flex items-center justify-between">
            <!-- <Field v-slot="{ field, handleChange, handleBlur }" name="rememberMe">
              <BaseCheckbox
                :model-value="field.value"
                :disabled="isSubmitting"
                shape="rounded"
                label="Remember me"
                color="primary"
                @update:model-value="handleChange"
                @blur="handleBlur"
                :classes="{
                  label: 'text-sm',
                }"
              />
            </Field> -->

            <div class="text-xs leading-5">
              <NuxtLink
                class="text-primary-600 hover:text-primary-500 dark:text-primary-200 font-sans font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline cursor-pointer"
                @click.prevent="emit('forgotPasswordClicked')"
              >
                Forgot your password?
              </NuxtLink>
            </div>
          </div>

          <!--Submit-->
          <div class="mt-5">
            <div class="block w-full rounded-md shadow-sm">
              <BaseButton
                :disabled="isSubmitting"
                :loading="isSubmitting"
                type="submit"
                color="primary"
                class="!h-11 w-full"
              >
                Sign in
              </BaseButton>
            </div>
          </div>

          <BaseParagraph
            size="xs"
            class="text-muted-600 !text-[10px] dark:text-muted-400 mb-6 mt-4 italic"
          >
            By logging into the platform, you are agreeing to abide by EStars' code of conduct.
          </BaseParagraph>
        </div>
      </div>
    </form>

    <BaseModal
      :isOpen="isModalError"
      :title="'Login Failed'"
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
  </div>
</template>
