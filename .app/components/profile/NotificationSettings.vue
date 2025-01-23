<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const router = useRouter()
const auth = useAuthStore()

const userNotifications = ref(null)

const getNotification = async () => {
  try {
    const { data, error } = await useNotificationService('/api/admin/notification-settings')

    if (error.value) {
      throw new Error(error.value.data?.message)
    }

    userNotifications.value = data.value?.notification_settings
  } catch (error) {
    showErrorToast('Oops!', `${error}`)
  }
}
await getNotification()

const zodSchema = z.object({
  two_factor: z.boolean(),
  email: z.boolean(),
  school_update: z.boolean(),
  support_update: z.boolean(),
  account_update: z.boolean(),
  student_update: z.boolean(),
  knowledge_hub_update: z.boolean(),
})

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed(() => ({
  two_factor: true,
  email: userNotifications.value?.email || false,
  school_update: userNotifications.value?.school_update || false,
  support_update: userNotifications.value?.support_update || false,
  account_update: userNotifications.value?.account_update || false,
  student_update: userNotifications.value?.student_update || false,
  knowledge_hub_update: userNotifications.value?.knowledge_hub_update || false,
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
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

watch(
  () => values.email,
  (value) => {
    if (!value) {
      setFieldValue('school_update', false)
      setFieldValue('support_update', false)
      setFieldValue('account_update', false)
      setFieldValue('student_update', false)
      setFieldValue('knowledge_hub_update', false)
    }
  },
)

const onSubmit = handleSubmit(async (values) => {
  try {
    success.value = false
    const params = {
      email: values.email,
      school_update: values.school_update,
      support_update: values.support_update,
      account_update: values.account_update,
      student_update: values.student_update,
      knowledge_hub_update: values.knowledge_hub_update,
    }

    const { error } = await useNotificationService('/api/admin/notification-settings', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    success.value = true
    showSuccessToast('Success', 'Notification settings has been updated!')

    await getNotification()

    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (error) {
    success.value = false
    showErrorToast('Oops!', `${error}`)
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
</script>

<template>
  <BaseCard>
    <form method="POST" class="w-full" @submit.prevent="onSubmit">
      <div class="p-4">
        <div class="mx-auto max-w-lg space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            Your settings has been saved!
          </BaseMessage>

          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them before submitting
          </BaseMessage>

          <TairoFormGroup label="2 Factor Auth" sublabel="Two factor authentication">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="two_factor">
                  <BaseSwitchThin
                    :model-value="field.value"
                    label="Enabled"
                    sublabel="Toggle 2 factor authentication"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    disabled
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="Notifications" sublabel="Configure how you receive notifications">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="email">
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Enabled by email"
                    sublabel="Receive emails notifications from the app"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div v-show="values.email" class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="account_update">
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Account Update"
                    sublabel="Enable account update emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div v-show="values.email" class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="school_update">
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="School Update"
                    sublabel="Enable school update emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div v-show="values.email" class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="student_update">
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Student Update"
                    sublabel="Enable student update emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div v-show="values.email" class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="support_update">
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Support Updates"
                    sublabel="Enable support update emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div v-show="values.email" class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="knowledge_hub_update">
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Posts Updates"
                    sublabel="Enable posts update emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
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
  </BaseCard>
</template>
