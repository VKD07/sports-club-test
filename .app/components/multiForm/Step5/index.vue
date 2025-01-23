<template>
  <BaseCard class="mt-12">
    <div class="p-8">
      <Stepper2 v-if="isSuccess" />
      <Stepper v-else />

      <!-- STEP 5 -->
      <div>
        <div class="flex gap-8 items-center justify-between py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              STUDENTS ACCOUNT CREATION
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Student accounts are being created.
            </BaseText>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="bg-primary-400 text-white px-6 py-2 rounded-full"> Step-5 </span>
          </div>
        </div>

        <div v-if="isProcessing">
          <div>
            <div class="p-6 max-w-xl mx-auto mt-6 mb-8">
              <div class="p-4 !pt-0 md:p-6">
                <div class="mx-auto w-full text-center">
                  <div class="mb-3">
                    <div class="lds-spinner">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>

                  <div class="text-primary-500 dark:text-muted-200 text-xl text-center mt-3 mb-4">
                    Creating <strong>{{ successfulEntries.value.length }}</strong> Student Accounts
                  </div>

                  <p class="text-muted-700 dark:text-muted-300 text-lg leading-5 mt-4">
                    This operation may take approximately
                    <span class="font-bold text-lg text-primary-500 dark:text-muted-200">
                      {{ maxMinutes }}
                    </span>
                    minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="w-full bg-muted-100 dark:bg-muted-700 flex gap-4 justify-start align-middle mt-6 rounded-lg p-6 px-10"
          >
            <BaseList>
              <BaseListItem class="!mt-1">
                <Icon
                  name="ph:warning-circle"
                  class="text-danger-500 dark:text-danger-400 w-6 h-6"
                />
                <p class="text-muted-800 dark:text-muted-300">
                  Please do not refresh the page or minimize other browser activity.
                </p>
              </BaseListItem>

              <BaseListItem class="!mt-1">
                <Icon
                  name="ph:warning-circle"
                  class="text-danger-500 dark:text-danger-400 w-6 h-6"
                />
                <p class="text-muted-800 dark:text-muted-300">
                  Avoid canceling the operation unless absolutely necessary.
                </p>
              </BaseListItem>

              <BaseListItem class="!mt-1">
                <Icon
                  name="ph:warning-circle"
                  class="text-danger-500 dark:text-danger-400 w-6 h-6"
                />
                <p class="text-muted-800 dark:text-muted-300">Keep this browser window open.</p>
              </BaseListItem>

              <BaseListItem class="!mt-1">
                <Icon
                  name="ph:warning-circle"
                  class="text-danger-500 dark:text-danger-400 w-6 h-6"
                />
                <p class="text-muted-800 dark:text-muted-300">
                  For a smooth creation process, maintain a stable internet connection.
                </p>
              </BaseListItem>
            </BaseList>
          </div>
        </div>

        <div v-else>
          <div v-if="isSuccess">
            <BaseCard color="success" rounded="md" class="p-6 max-w-lg mx-auto mt-6 mb-8">
              <div class="p-4 !pt-0 md:p-6">
                <div class="mx-auto w-full text-center">
                  <div class="mb-3">
                    <Icon
                      name="clarity:success-standard-line"
                      class="block h-16 w-16 text-success-500"
                    />
                  </div>

                  <p class="text-success-600 dark:text-muted-300 text-lg leading-5">
                    Student accounts created successfully!
                  </p>

                  <p
                    v-if="btnAction === 'active'"
                    class="text-muted-700 dark:text-muted-300 text-base leading-5 mt-4"
                  >
                    Your
                    <span class="font-bold text-lg text-primary-500 dark:text-muted-200">
                      {{ successfulEntries.value.length }}
                    </span>
                    student accounts have been created and are now active!
                  </p>

                  <p v-else class="text-muted-700 dark:text-muted-300 text-base leading-5 mt-4">
                    <span class="font-bold text-lg text-primary-500 dark:text-muted-200">
                      {{ successfulEntries.value.length }}
                    </span>
                    student accounts have been created but remain in draft status. You can activate
                    them later.
                  </p>
                </div>
              </div>
            </BaseCard>
          </div>

          <div v-if="isFailed">
            <BaseCard color="danger" rounded="md" class="p-6 max-w-lg mx-auto mt-6 mb-8">
              <div class="p-4 !pt-0 md:p-6">
                <div class="mx-auto w-full text-center">
                  <div class="mb-3">
                    <Icon
                      name="clarity:error-standard-line"
                      class="block h-16 w-16 text-danger-500"
                    />
                  </div>

                  <p class="text-danger-600 dark:text-muted-300 text-lg leading-5">
                    Student accounts create failed!
                  </p>

                  <p class="text-muted-700 dark:text-muted-300 text-base leading-5 mt-4">
                    Student accounts creation failed. Please try again later.
                  </p>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>

        <div>
          <div class="flex gap-8 items-center justify-between py-8 pb-4">
            <div class="flex items-center gap-4"></div>
            <div class="flex items-center gap-2 pt-8 pb-8">
              <BaseButton class="w-24" :disabled="isProcessing && !isFailed" @click="goToDashboard">
                Close
              </BaseButton>

              <BaseButton
                type="submit"
                color="primary"
                :disabled="isProcessing && !isFailed"
                @click="goToAllStudents"
              >
                View Student Profiles
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import Stepper from './Stepper.vue'
import Stepper2 from './Stepper2.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const emit = defineEmits(['next', 'prev'])
const btnAction = inject('btnAction')
const uploadedData = inject('uploadedData')
const errorEntries = inject('errorEntries')
const successfulEntries = inject('successfulEntries')
const selectedSchoolData = inject('selectedSchoolData')

const isFailed = ref(false)
const isSuccess = ref(false)
const isProcessing = ref(false)

const maxMinutes = computed(() => {
  const divisionResult = successfulEntries.value.length / 60
  return Math.ceil(divisionResult)
})

const prevStep = () => {
  emit('prev')
}

const goToAllStudents = () => {
  router.push({
    name: 'students',
    query: {
      school: selectedSchoolData.value?.school_name,
      location: selectedSchoolData.value?.location_name,
    },
  })
}

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}

const createAccounts = async () => {
  try {
    isProcessing.value = true

    const formData = new FormData()
    formData.append('school_name', selectedSchoolData.value?.school_name)
    formData.append('school_id', selectedSchoolData.value?.school_id)
    formData.append('location_name', selectedSchoolData.value?.location_name)
    formData.append('location_id', selectedSchoolData.value?.location_id)
    formData.append('time_zone', selectedSchoolData.value?.time_zone)
    formData.append('status', btnAction.value)
    formData.append('failedList', uploadedData.value?.failed_list)
    // Serialize the successfulEntries array as JSON
    formData.append('data', JSON.stringify(successfulEntries.value))

    const { data, error } = await useApiFetch('/api/admin/school-student-bulk-account-create', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      console.log(error.value)
      throw new Error(error.value?.message)
    }

    isFailed.value = false
    isSuccess.value = true
    isProcessing.value = false

    console.log(data.value)
    if (btnAction.value === 'active') {
      showSuccessToast(
        'Success',
        `Your ${successfulEntries.value.length} student accounts have been created and are now active! `,
      )
    } else {
      showSuccessToast(
        'Success',
        `${successfulEntries.value.length} student accounts have been created but remain in draft status. You can activate them later.`,
      )
    }
  } catch (error) {
    isFailed.value = true
    isSuccess.value = false
    isProcessing.value = false
    // showErrorToast('Oops!', `${error}`)
    console.log(error)
  }
}

onMounted(() => {
  isProcessing.value = true

  setTimeout(() => {
    createAccounts()
  }, 1000)
})
</script>
