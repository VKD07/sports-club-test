<script setup lang="ts">
definePageMeta({
  title: 'Tournament Performance',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const segmentName = 'Performance'
const pageName = 'Tournament Performance View'
const { _delete, _export, create, update, view, approve } = await usePermissionChecker(
  segmentName,
  pageName,
)

watchEffect(() => {
  if (!view && auth.isLoggedIn) {
    showErrorToast('Oops!', "Sorry, You don't have View permission for this page! ")
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }
})

const isModalEvidenceOpen = ref(false)
</script>

<template>
  <TairoContentWrapper>
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Student Individual Performance
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Customize user access and permissions for each segment
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton v-if="_export" class="w-full sm:w-32"
          ><Icon name="ph:export-light" class="h-4 w-4" /> <span>Export</span></BaseButton
        >
      </div>
    </div>

    <div class="pt-4 pb-4">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-12">
          <BaseCard class="p-6 !bg-primary-500" color="primary">
            <div
              class="xs:divide-y divide-muted-200 dark:divide-muted-700 flex w-full flex-col items-center sm:flex-row sm:divide-x"
            >
              <div class="flex-1">
                <div class="flex flex-col p-4 text-center sm:py-0">
                  <Icon name="ph:student" class="text-primary-100 mx-auto h-8 w-8" />
                  <h4 class="text-muted-100 font-sans text-xl font-semibold">Sangeethan</h4>
                  <p class="text-muted-300 font-sans text-sm">Student Name</p>
                </div>
              </div>

              <div class="flex-1">
                <div class="flex flex-col p-4 text-center sm:py-0">
                  <Icon name="ph:device-tablet-speaker" class="text-primary-100 mx-auto h-8 w-8" />
                  <h4 class="text-muted-100 font-sans text-xl font-semibold">Math quizz</h4>
                  <p class="text-muted-300 font-sans text-sm">Tournament Name</p>
                </div>
              </div>

              <div class="flex-1">
                <div class="flex flex-col p-4 text-center sm:py-0">
                  <Icon
                    name="material-symbols:calendar-today-outline"
                    class="text-primary-100 mx-auto h-8 w-8"
                  />
                  <h4 class="text-muted-100 font-sans text-xl font-semibold">1st Year</h4>
                  <p class="text-muted-300 font-sans text-sm">Year</p>
                </div>
              </div>

              <div class="flex-1">
                <div class="flex flex-col p-4 text-center sm:py-0">
                  <Icon
                    name="material-symbols:branding-watermark-outline"
                    class="text-primary-100 mx-auto h-8 w-8"
                  />
                  <h4 class="text-muted-100 font-sans text-xl font-semibold">2nd Term</h4>
                  <p class="text-muted-300 font-sans text-sm">Term</p>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-span-12 lg:col-span-6 mt-4 space-y-6">
          <BaseCard class="p-6">
            <div class="my-4">
              <BaseHeading
                tag="h2"
                size="sm"
                weight="medium"
                lead="normal"
                class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
              >
                Section Scores
              </BaseHeading>
            </div>

            <TairoTable rounded="none">
              <template #header>
                <TairoTableHeading uppercase class="w-3/4 px-2 ps-4 py-4 bg-primary-50"
                  >Name</TairoTableHeading
                >

                <TairoTableHeading uppercase class="w-1/4 px-2 py-4 bg-primary-50">
                  Score
                </TairoTableHeading>
              </template>

              <TairoTableRow>
                <TairoTableCell class="px-2 ps-4 !text-base">
                  Introduction of the game
                </TairoTableCell>
                <TairoTableCell class="px-2 !text-base"> 5 </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow>
                <TairoTableCell class="px-2 ps-4 !text-base"> Skills and learning </TairoTableCell>
                <TairoTableCell class="px-2 !text-base"> 5 </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow>
                <TairoTableCell class="px-2 ps-4 !text-base">
                  Scoring and direction
                </TairoTableCell>
                <TairoTableCell class="px-2 !text-base"> 5 </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow>
                <TairoTableCell class="px-2 ps-4 !text-base"> Gaming consoles </TairoTableCell>
                <TairoTableCell class="px-2 !text-base"> 5 </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow>
                <TairoTableCell class="px-2 ps-4 !text-base"> Core Activity </TairoTableCell>
                <TairoTableCell class="px-2 !text-base">
                  <div class="flex gap-2 items-center">
                    <BaseInput value="80%" :disabled="!update" class="!w-16 !h-9" />
                    <BaseButton
                      v-if="update"
                      color="primary"
                      variant="solid"
                      size="sm"
                      class="!h-9"
                    >
                      update
                    </BaseButton>
                  </div>
                </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow class="bg-success-100">
                <TairoTableCell class="px-2 ps-4 !text-base">
                  <span class="text-primary-500 font-bold">Total</span>
                </TairoTableCell>

                <TairoTableCell class="px-2 !text-base">
                  <span class="text-primary-500 font-bold">100</span>
                </TairoTableCell>
              </TairoTableRow>
            </TairoTable>
          </BaseCard>
        </div>

        <div class="col-span-12 lg:col-span-6 mt-4">
          <BaseCard class="p-6">
            <div class="my-4">
              <BaseHeading
                tag="h2"
                size="sm"
                weight="medium"
                lead="normal"
                class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
              >
                Submitted Evidence
              </BaseHeading>
            </div>

            <div class="mt-4 flex gap-4 items-center">
              <div
                class="flex-1 border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3 cursor-pointer"
                @click="isModalEvidenceOpen = true"
              >
                <div class="flex items-center gap-2">
                  <div class="shrink-0">
                    <img
                      class="size-14 rounded-md object-cover object-center w-16"
                      src="/img/apps/2.png"
                      alt="Image preview"
                    />
                  </div>

                  <div class="font-sans">
                    <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                      File name.jpg
                    </span>

                    <span class="text-muted-400 block text-xs"> File type </span>
                  </div>
                </div>
              </div>

              <div>
                <BaseButton v-if="approve" color="primary" variant="solid"> Approve </BaseButton>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <div>
        <TairoModal :open="isModalEvidenceOpen" size="lg" @close="isModalEvidenceOpen = false">
          <template #header>
            <div class="relative">
              <div class="p-6 pe-16">
                <div class="flex gap-4 lg:items-center justify-between flex-col lg:flex-row">
                  <div>
                    <BaseHeading
                      tag="h2"
                      size="md"
                      weight="medium"
                      lead="normal"
                      class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                    >
                      Evidence
                    </BaseHeading>
                    <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
                      Customize user access and permissions for each segment
                    </BaseText>
                  </div>
                </div>
              </div>

              <BaseButtonClose
                @click="isModalEvidenceOpen = false"
                class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
              />
            </div>
          </template>

          <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-80 lg:overflow-auto lg:max-h-none">
            <div>
              <div>
                <img src="/img/apps/7.png" class="w-full" />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="p-4 md:p-6">
              <div class="flex gap-x-2">
                <BaseButton @click="isModalEvidenceOpen = false"> Cancel </BaseButton>
              </div>
            </div>
          </template>
        </TairoModal>
      </div>
    </div>
  </TairoContentWrapper>
</template>
