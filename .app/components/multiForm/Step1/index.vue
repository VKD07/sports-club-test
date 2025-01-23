<template>
  <BaseCard>
    <div class="p-8">
      <Stepper />

      <!-- STEP 1 -->
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
              PREPARE THE STUDENT DETAILS AND DATA SHEET
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400 max-w-lg">
              Review the following data validation rules and instructions before preparing your
              student data sheet.
            </BaseText>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="bg-primary-400 text-white px-6 py-2 rounded-full"> Step-1 </span>
          </div>
        </div>

        <div class="mt-6">
          <TairoTable rounded="none">
            <template #header>
              <TairoTableHeading uppercase class="!w-2/12 px-2 ps-4 py-4 bg-primary-50">
                Data Fields
              </TairoTableHeading>
              <TairoTableHeading uppercase class="!w-4/12 px-2 py-4 bg-primary-50">
                Validation
              </TairoTableHeading>
              <TairoTableHeading uppercase class="!w-3/12 px-2 py-4 bg-primary-50">
                Example
              </TairoTableHeading>
              <TairoTableHeading uppercase class="!w-3/12 px-2 pe-4 py-4 bg-primary-50">
                Instructions
              </TairoTableHeading>
            </template>

            <TairoTableRow>
              <TairoTableCell class="px-2 ps-4 !text-base !w-2/12"> First name </TairoTableCell>
              <TairoTableCell class="px-2 !text-base !whitespace-normal">
                <BaseList>
                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>First name is required</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Should contain 3 minimum letters</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>No numbers included</p>
                  </BaseListItem>
                </BaseList>
              </TairoTableCell>
              <TairoTableCell class="px-2 !text-base"> Partheepan </TairoTableCell>
              <TairoTableCell class="px-2 pe-4 !text-base !whitespace-normal">
                Make sure the first letter is in capital
              </TairoTableCell>
            </TairoTableRow>

            <TairoTableRow>
              <TairoTableCell class="px-2 ps-4 !text-base"> Last name </TairoTableCell>
              <TairoTableCell class="px-2 !text-base !whitespace-normal">
                <BaseList>
                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Last name is required</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Should contain 3 minimum letters</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>No numbers included</p>
                  </BaseListItem>
                </BaseList>
              </TairoTableCell>
              <TairoTableCell class="px-2 !text-base"> Jesuthasan </TairoTableCell>
              <TairoTableCell class="px-2 pe-4 !text-base !whitespace-normal">
                Make sure the first letter is in capital
              </TairoTableCell>
            </TairoTableRow>

            <TairoTableRow>
              <TairoTableCell class="px-2 ps-4 !text-base"> Official Email </TairoTableCell>
              <TairoTableCell class="px-2 !text-base !whitespace-normal">
                <BaseList>
                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Email is required</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Include email extension</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Include @ sign</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5 block"
                    />
                    <p>No duplicated emails within the data sheet</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Email ID should not be exist on the platform</p>
                  </BaseListItem>
                </BaseList>
              </TairoTableCell>
              <TairoTableCell class="px-2 !text-base"> student@school.com </TairoTableCell>
              <TairoTableCell class="px-2 pe-4 !text-base !whitespace-normal">
                Try to use a validated email address
              </TairoTableCell>
            </TairoTableRow>

            <TairoTableRow>
              <TairoTableCell class="px-2 ps-4 !text-base"> Academic Level </TairoTableCell>
              <TairoTableCell class="px-2 !text-base !whitespace-normal">
                <BaseList>
                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Academic level is required</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>No numbers included</p>
                  </BaseListItem>

                  <BaseListItem class="!mt-1">
                    <Icon
                      name="material-symbols:check-circle-outline"
                      class="text-primary-500 dark:text-primary-100 w-5 h-5"
                    />
                    <p>Data value should be equal</p>
                  </BaseListItem>
                </BaseList>
              </TairoTableCell>
              <TairoTableCell class="px-2 !text-base">primary</TairoTableCell>
              <TairoTableCell class="px-2 pe-4 !text-base !whitespace-normal">
                All letters must be in lowercase
              </TairoTableCell>
            </TairoTableRow>
          </TairoTable>
        </div>

        <div>
          <div class="flex gap-8 items-center justify-between py-8 pb-4">
            <div class="">
              <BaseText size="md" class="text-muted-600 dark:text-muted-400 mb-4">
                Download below student details template
              </BaseText>

              <BaseButton
                class="!border-primary-500 dark:!border-primary-100 !text-primary-500 dark:!text-primary-100 !border-2"
                @click="downloadCsv"
                download="student_creation_template.csv"
              >
                <Icon name="material-symbols:download-rounded" class="h-4 w-4" />
                <span>Download CSV</span>
              </BaseButton>
            </div>

            <div class="flex items-center gap-2 pt-8 pb-8">
              <BaseButton class="w-24" to="/students">Cancel</BaseButton>

              <BaseButton type="submit" color="primary" class="w-24" @click="nextStep">
                Next
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
const emit = defineEmits(['next'])

const csvUrl = '/student_creation_template.csv'

const nextStep = () => {
  emit('next')
}

const downloadCsv = () => {
  const link = document.createElement('a')
  link.href = csvUrl
  link.click()
}
</script>
