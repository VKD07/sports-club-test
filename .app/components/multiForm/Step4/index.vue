<template>
  <BaseCard class="mt-12">
    <div class="p-8">
      <Stepper />

      <!-- STEP 4 -->
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
              STUDENT ACCOUNT STATUS
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400 max-w-lg">
              Set Account Activation Status for New Student Accounts
            </BaseText>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="bg-primary-400 text-white px-6 py-2 rounded-full"> Step-4 </span>
          </div>
        </div>

        <div>
          <BaseCard class="mt-6 p-12 max-w-lg mx-auto">
            <div
              class="bg-primary-500 text-muted-100 text-2xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto"
            >
              {{ successfulEntries.value.length ?? 0 }}
            </div>

            <div
              class="text-primary-500 dark:text-muted-200 text-xl text-center font-bold mt-3 mb-4"
            >
              Account Status
            </div>

            <p class="text-center text-muted-800 dark:text-muted-300">
              Choose how you would like to handle the status of newly created student accounts:
            </p>

            <div class="mt-8">
              <fieldset class="">
                <div class="flex gap-4 justify-center">
                  <BaseRadioHeadless v-model="actionStatus" value="draft">
                    <div
                      class="rounded-full bg-muted-200 peer-checked:!bg-warning-500 peer-checked:[&_.child]:!text-muted-100 relative py-2 ps-2 pe-6 flex items-center gap-2"
                    >
                      <Icon
                        name="material-symbols:check-circle-outline"
                        class="text-muted-50 w-10 h-10"
                      />

                      <p class="child text-muted-600">Draft All</p>
                    </div>
                  </BaseRadioHeadless>

                  <BaseRadioHeadless v-model="actionStatus" value="active">
                    <div
                      class="rounded-full bg-muted-200 peer-checked:!bg-success-500 peer-checked:[&_.child]:!text-muted-100 relative py-2 ps-2 pe-6 flex items-center gap-2"
                    >
                      <Icon
                        name="material-symbols:check-circle-outline"
                        class="text-muted-50 w-10 h-10"
                      />

                      <p class="child text-muted-600">Activate All</p>
                    </div>
                  </BaseRadioHeadless>
                </div>
              </fieldset>
            </div>
          </BaseCard>
        </div>

        <div>
          <div class="flex gap-8 items-center justify-between py-8 pb-4">
            <div class="flex items-center gap-4">
              <BaseButton
                class="!border-primary-500 dark:!border-primary-100 !text-primary-500 dark:!text-primary-100 !border-2"
                @click="prevStep"
              >
                Back
              </BaseButton>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-8">
              <BaseButton class="w-24" to="/students">Cancel</BaseButton>

              <BaseButton type="submit" color="primary" :disabled="!actionStatus" @click="nextStep">
                Create Accounts
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

const emit = defineEmits(['next', 'prev'])
const btnAction = inject('btnAction')
const uploadedData = inject('uploadedData')
const errorEntries = inject('errorEntries')
const successfulEntries = inject('successfulEntries')
const selectedSchoolData = inject('selectedSchoolData')

const actionStatus = ref('')
btnAction.value = actionStatus.value

const prevStep = () => {
  emit('prev')
}

const nextStep = () => {
  emit('next')
}

watch(actionStatus, (value) => {
  btnAction.value = value
})
</script>
