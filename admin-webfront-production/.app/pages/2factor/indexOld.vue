<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  title: 'Login',
  middleware: ['two-factor'],
})

const codeLength = ref(5)
const input = ref<Array<number | undefined>>([])
const inputElements = ref<HTMLInputElement[]>([])

function paste(event: ClipboardEvent) {
  const pasted = event.clipboardData
    ?.getData('text')
    ?.replace(/\D/g, '')
    ?.substring(0, codeLength.value)

  if (pasted) {
    input.value = pasted.split('').map(Number)
    return validatePin.value
  }
}

function type(event: KeyboardEvent, index: number) {
  if (event.code === 'ArrowRight') {
    event.stopPropagation()
    event.preventDefault()
    nextTick(() => {
      focusField(Math.min(codeLength.value, index + 1))
    })
    return
  }
  if (event.code === 'ArrowLeft') {
    event.stopPropagation()
    event.preventDefault()
    nextTick(() => {
      focusField(Math.max(0, index - 1))
    })
    return
  }
  if (event.code === 'Backspace') {
    event.stopPropagation()
    event.preventDefault()
    input.value[index - 1] = undefined
    nextTick(() => {
      focusField(Math.max(0, index - 1))
    })
    return
  }
  if (event.code == 'a' && event.ctrlKey) {
    event.stopPropagation()
    event.preventDefault()
    return
  }
  const key = event.key.replace(/\D/g, '')
  if (key !== '') {
    input.value[index - 1] = Number(key)
  }
  nextTick(() => {
    focusField(Math.min(codeLength.value, index + 1))
  })
}

function focusField(n: any) {
  if (!n || n > codeLength.value) {
    n = 1
  }
  inputElements.value[n].focus()
}

const validatePin = computed(() => {
  return input.value.join('').length === 5
})

const router = useRouter()
const auth = useAuthStore()
const modalContent = ref('')
const isModalError = ref(false)
const isHomeLoading = ref(false)
const isModalSuccess = ref(false)

const openModal = (type: string, content: string) => {
  modalContent.value = content
  if (type === 'success') {
    isModalSuccess.value = true
  } else if (type === 'error') {
    isModalError.value = true
  }
}

const goToDashboard = (lastLogin: string) => {
  if (lastLogin) {
    router.push({ name: 'dashboard' })
  } else {
    router.push({ name: 'dashboard', query: { isFirstLogin: 'true' } })
  }
}

const countdown = ref(0)
let timer

const sendOtp = async () => {
  input.value = []
  if (countdown.value === 0) {
    const formData = new FormData()
    formData.append('id', auth.user?.index)

    const { data, error } = await useAuthFetch<any>('/api/admin-guest/send-otp', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      openModal('error', `${error.value?.data.message}`)
      return
    }

    startCountdown()
  }
}

const startCountdown = () => {
  countdown.value = 120 // 2 minutes in seconds
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

setTimeout(async () => {
  if (auth.token) {
    await sendOtp()
  }
}, 1500)

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const validateOtp = async () => {
  const auth = useAuthStore()
  const otp = input.value.join('')
  isHomeLoading.value = true

  const formData = new FormData()
  formData.append('id', auth.user?.index)
  formData.append('otp', otp)

  const { data, error } = await useAuthFetch<any>('/api/admin-guest/verify-otp', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  })

  if (error.value) {
    isHomeLoading.value = false
    openModal(
      'error',
      error.value?.data.message === 'OTP Un-Verified'
        ? 'The entered OTP is incorrect. Please try again.'
        : `${error.value?.data.message}`,
    )
    return
  }

  if (data.value.otp) {
    await auth.setTwoFactor(data.value.otp)
    showSuccessToast('Success', 'Login Success!')
    goToDashboard(auth?.lastAttempt)
  } else {
    isHomeLoading.value = false
    openModal('error', 'The entered OTP is incorrect. Please try again.')
  }
}

const verifyOtp = () => {
  if (validatePin.value) {
    validateOtp()
  }
}

const errorAction = () => {
  clearInterval(timer)
  countdown.value = 0
  sendOtp()
  input.value = []
  isModalError.value = false
}
</script>

<template>
  <div class="dark:bg-muted-800 flex min-h-screen bg-white">
    <div class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-5/12 lg:flex-none">
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

        <div>
          <div>
            <BaseHeading
              as="h2"
              size="3xl"
              lead="relaxed"
              weight="medium"
              class="mt-6 text-primary-500 dark:text-primary-300"
            >
              Enter your code
            </BaseHeading>

            <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-400 mb-6 mt-6">
              Your OTP has been sent to your email. Check and verify.
              <br /><br />
              If you have not received your OTP please check your Junk/Spam.
            </BaseParagraph>
          </div>

          <form class="mt-6" novalidate>
            <div class="mt-5">
              <div>
                <div class="flex w-full gap-3">
                  <input
                    type="text"
                    v-for="i in codeLength"
                    :name="'pin' + i"
                    :key="'pin' + i"
                    maxlength="1"
                    class="dark:bg-muted-800 unselectable nui-focus inline w-12 select-none rounded-lg bg-white py-5 text-center text-xl font-bold transition-all border border-muted-400"
                    @paste.prevent="(event) => paste(event)"
                    @keydown="(event) => type(event, i)"
                    :value="input[i - 1] !== undefined ? input[i - 1] : '-'"
                    :ref="
                      (el) => {
                        inputElements[i] = el as HTMLInputElement
                      }
                    "
                    placeholder="0"
                    :disabled="input.length < i - 1"
                    v-focus="i === 1"
                    @keydown.enter.prevent="verifyOtp"
                  />
                </div>

                <div class="mt-8">
                  <div class="block w-full rounded-md">
                    <BaseButton
                      v-if="!isHomeLoading"
                      color="primary"
                      @click="validateOtp"
                      :disabled="!validatePin"
                    >
                      Take me to Dashboard
                    </BaseButton>

                    <BaseButton v-else color="primary" :disabled="isHomeLoading">
                      <div v-if="isHomeLoading" class="spinner-container">
                        <div class="spinner"></div>
                        <p
                          class="spinner-label tracking-wider text-primary-500 dark:text-muted-100"
                        >
                          Loading...
                        </p>
                      </div>
                    </BaseButton>
                  </div>

                  <div class="mt-6 flex items-center justify-between">
                    <BaseText size="sm" class="text-muted-400">Didn't receive the code?</BaseText>
                    <button
                      ref="sendButton"
                      type="button"
                      :disabled="countdown > 0"
                      class="text-primary-500 font-sans text-sm"
                      :class="countdown == 0 && 'underline-offset-4 hover:underline'"
                      @click="sendOtp"
                    >
                      <span v-if="countdown > 0">{{ formatTime(countdown) }} remaining</span>
                      <span v-else>Send it again</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
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
      :primaryButtonAction="errorAction"
      :cancelButtonText="'Cancel'"
      @close="isModalError = false"
    >
      {{ modalContent }}
    </BaseModal>
  </div>
</template>

<style scoped>
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-label {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  font-size: 14px;
}
</style>
