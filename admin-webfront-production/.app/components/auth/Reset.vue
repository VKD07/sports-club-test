<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const zodSchema = z.object({
  email: z.string().min(1, 'Email is required').email({ message: 'Please enter a valid email' }),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  email: '',
}))

const emit = defineEmits(['signInClicked'])

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

const toaster = useToaster()

const success = ref(false)
const isModalError = ref(false)
const modalContent = ref('')

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'error') {
    isModalError.value = true
  }
}

const onSubmitRecover = handleSubmit(async (values) => {
  try {
    const formData = new FormData()
    formData.append('email', values.email)

    const { error } = await useAuthFetch<any>('/api/admin-guest/request-password-reset', {
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
  } catch (error) {
    success.value = false
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
})
</script>

<template>
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
            Password changed!
          </BaseHeading>
        </div>

        <div class="mt-4">
          <div class="mb-4 space-y-4">
            <BaseMessage class="p-6 !bg-primary-300 dark:!bg-muted-700" :closable="false">
              <div class="flex gap-2 justify-between">
                <p class="text-base text-white dark:text-muted-200 flex-auto">
                  An email has been sent to you with instructions on how to reset your password.
                </p>
                <Icon
                  name="heroicons-outline:hand-thumb-up"
                  class="text-primary-500 dark:text-muted-400 block h-10 w-10 flex-none"
                />
              </div>

              <small class="block pt-2 text-muted-100 dark:text-muted-300">
                If you don't receive an email, please check your spam folder. If you still don't
                receive an email, that means you don't have an account.
              </small>
            </BaseMessage>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="">
        <div>
          <BaseHeading
            as="h2"
            size="3xl"
            lead="relaxed"
            weight="medium"
            class="mt-8 text-primary-500 dark:text-primary-300"
          >
            Recover Password
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-400 mb-6 mt-6">
            Enter your registered email ID to receive password reset instructions.
          </BaseParagraph>
        </div>

        <form method="POST" action="" @submit.prevent="onSubmitRecover" class="" novalidate>
          <div class="mb-4 space-y-4">
            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
              <BaseInput
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="email"
                label="Email address"
                placeholder="Email address"
                autocomplete="email"
                :classes="{
                  input: 'h-12',
                }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <div class="mb-6">
            <BaseButton
              :disabled="isSubmitting"
              :loading="isSubmitting"
              type="submit"
              color="primary"
              class="!h-12 w-full"
            >
              Reset Password
            </BaseButton>
          </div>

          <!--No account link-->
          <p class="text-muted-400 mt-4 flex justify-between font-sans text-sm leading-5">
            <span>False alert?</span>
            <NuxtLink
              class="text-primary-600 hover:text-primary-500 dark:text-primary-200 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline cursor-pointer"
              @click.prevent="emit('signInClicked')"
            >
              Sign in
            </NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </Transition>

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
</template>
