<template>
  <BaseCard class="mt-12">
    <div class="p-8">
      <Stepper />

      <!-- STEP 3 -->
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
              DATA REVIEW AND VALIDATION
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400 max-w-lg">
              Student data upload has been processed and validated. Below you'll find a detailed
              breakdown of the results.
            </BaseText>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="bg-primary-400 text-white px-6 py-2 rounded-full"> Step-3 </span>
          </div>
        </div>

        <div class="mt-4 flex gap-6 max-w-4xl">
          <div class="flex gap-1.5">
            <div class="bg-yellow-200 text-muted-800 rounded py-3 px-6">Total Entries:</div>
            <div class="bg-yellow-200 text-muted-800 rounded py-3 px-4 font-bold">
              {{ uploadedData.value?.list?.length }}
            </div>
          </div>

          <div class="flex gap-2">
            <div class="bg-green-200 text-muted-800 rounded py-3 px-6">Successful Entries:</div>
            <div class="bg-green-200 text-muted-800 rounded py-3 px-4 font-bold">
              {{ uploadedData.value?.true }}
            </div>
          </div>

          <div class="flex gap-2">
            <div class="bg-red-200 text-muted-800 rounded py-3 px-6">Entries with Errors:</div>
            <div class="bg-red-200 text-muted-800 rounded py-3 px-4 font-bold">
              {{ uploadedData.value?.false }}
            </div>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex gap-4 justify-between items-center">
            <div></div>

            <div class="flex align-middle gap-3">
              <span class="nui-switch-thin-single-label me-2 text-muted-400">Show Errors Only</span>
              <BaseSwitchThin v-model="isShowAll" label="" color="primary" />
              <span class="nui-switch-thin-single-label text-muted-400">Show All</span>
            </div>
          </div>

          <div class="mt-6 max-h-[600px] overflow-y-scroll">
            <TairoTable rounded="none">
              <template #header>
                <TairoTableHeading uppercase class="px-2 ps-4 py-4 bg-primary-50">
                  First name
                </TairoTableHeading>
                <TairoTableHeading uppercase class="px-2 py-4 bg-primary-50">
                  Last name
                </TairoTableHeading>
                <TairoTableHeading uppercase class="px-2 py-4 bg-primary-50">
                  Email
                </TairoTableHeading>
                <!-- <TairoTableHeading uppercase class="px-2 py-4 bg-primary-50">
                  Phone
                </TairoTableHeading> -->
                <TairoTableHeading uppercase class="px-2 py-4 bg-primary-50">
                  Level
                </TairoTableHeading>
                <TairoTableHeading uppercase class="px-2 pe-4 py-4 bg-primary-50">
                  Validation
                </TairoTableHeading>
              </template>

              <TairoTableRow
                v-for="(student, index) in isShowAll
                  ? uploadedData.value?.list
                  : errorEntries.value"
                :key="index"
                :class="getClass(student.status)"
              >
                <TairoTableCell class="px-2 ps-4">{{ student.first_name }}</TairoTableCell>
                <TairoTableCell class="px-2">{{ student.last_name }}</TairoTableCell>
                <TairoTableCell class="px-2">{{ student.email }}</TairoTableCell>
                <!-- <TairoTableCell class="px-2">{{ student.phone_number }}</TairoTableCell> -->
                <TairoTableCell class="px-2">{{ student.level }}</TairoTableCell>
                <TairoTableCell v-if="student.status === 'true'" class="px-2 pe-4">
                  <BaseList>
                    <BaseListItem class="!mt-1">
                      <Icon
                        name="material-symbols:check-circle-outline"
                        class="text-primary-500 dark:text-primary-100 w-5 h-5"
                      />
                      <p>Validated</p>
                    </BaseListItem>
                  </BaseList>
                </TairoTableCell>
                <TairoTableCell v-else class="px-2 pe-4 w-96">
                  <ul>
                    <li
                      v-for="(reason, index) in flattenValidationErrors(student.validation)"
                      :key="index"
                    >
                      - {{ reason }}
                    </li>
                  </ul>
                </TairoTableCell>
              </TairoTableRow>
            </TairoTable>
          </div>

          <div
            v-if="errorEntries.value.length > 0"
            class="w-full bg-muted-100 dark:bg-muted-700 flex gap-4 justify-center align-middle mt-6 rounded-lg p-6"
          >
            <BaseText size="md" class="text-muted-600 dark:text-muted-400 py-2">
              Identify the student details with errors and reupload them.
            </BaseText>

            <BaseButton
              class="!border-primary-500 dark:!border-primary-100 !text-primary-500 dark:!text-primary-100 !border-2"
              @click="downloadFunc"
            >
              <Icon name="material-symbols:download-rounded" class="h-4 w-4" />
              <span>Download Errors (CSV)</span>
            </BaseButton>
          </div>
        </div>

        <div>
          <div class="flex gap-8 items-center justify-between py-8 pb-4">
            <div class="flex items-center gap-4">
              <BaseButton
                class="!border-primary-500 dark:!border-primary-100 !text-primary-500 dark:!text-primary-100 !border-2"
                @click="prevStep"
              >
                Reupload Data
              </BaseButton>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-8">
              <BaseButton class="w-24" @click="isModalCancel = true">Cancel</BaseButton>

              <BaseButton
                type="submit"
                color="primary"
                :disabled="!uploadedData.value?.true"
                @click="isModalNextStep = true"
              >
                Next
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>

  <BaseModal
    v-if="isModalNextStep"
    iconColor="warning"
    primaryButtonColor="primary"
    :isOpen="isModalNextStep"
    :title="'Confirm Next Step'"
    :icon="'ph:warning-octagon-bold'"
    :showCancelButton="true"
    :showPrimaryButton="true"
    :primaryButtonText="'Next'"
    :primaryButtonAction="nextStep"
    :cancelButtonText="'Cancel'"
    @close="isModalNextStep = false"
  >
    This will only create accounts for
    <span class="font-bold text-primary-500 dark:text-muted-200">
      {{ uploadedData.value?.true }} students
    </span>
    with valid data. Are you sure you want to proceed?
  </BaseModal>

  <BaseModal
    v-if="isModalCancel"
    iconColor="warning"
    primaryButtonColor="primary"
    :isOpen="isModalCancel"
    :title="'Confirm Cancel'"
    :icon="'ph:warning-octagon-bold'"
    :showCancelButton="true"
    :showPrimaryButton="true"
    :primaryButtonText="'Yes'"
    :primaryButtonAction="goToAllStudents"
    :cancelButtonText="'No'"
    @close="isModalCancel = false"
  >
    {{ `Are you sure you want to cancel account creation?` }}
  </BaseModal>
</template>

<script setup>
import Stepper from './Stepper.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const emit = defineEmits(['next', 'prev'])
const uploadedData = inject('uploadedData')
const errorEntries = inject('errorEntries')
const successfulEntries = inject('successfulEntries')
const selectedSchoolData = inject('selectedSchoolData')

errorEntries.value = uploadedData.value?.list.filter((s) => s.status === 'false')
successfulEntries.value = uploadedData.value?.list.filter((s) => s.status === 'true')

const isShowAll = ref(!errorEntries.value.length > 0)
const isModalCancel = ref(false)
const isModalNextStep = ref(false)

const prevStep = () => {
  emit('prev')
}

const nextStep = () => {
  emit('next')
}

const getClass = (status) => {
  return status === 'true' ? 'bg-teal-100 dark:bg-teal-900' : 'bg-red-100 dark:bg-red-900'
}

const goToAllStudents = () => {
  router.push({ name: 'students' })
}

const downloadFunc = async () => {
  const query = {
    failedListId: uploadedData.value?.failed_list,
  }

  const { data, error } = await useAdminReadService('/api/admin/school-student-bulk-failed-list', {
    query,
  })

  if (error.value) {
    throw new Error(error.value?.data?.message)
  }

  const responseData = data?.value

  if (responseData) {
    const url = window.URL.createObjectURL(new Blob([responseData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `student_details_with_errors_${Date()}.csv`)
    document.body.appendChild(link)
    link.click()
  } else {
    console.error('Received null data in the response.')
  }
}

const flattenValidationErrors = (validation) => {
  if (!validation) return []

  return Object.values(validation).flat()
}
</script>
