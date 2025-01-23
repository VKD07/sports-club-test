<script setup lang="ts">
import { ref } from 'vue'
import { refDebounced } from '@vueuse/core'

definePageMeta({
  title: 'Knowledge Center Single',
  middleware: ['auth'],
})

const addKnowledgeCenterBreadcrumb = [
  {
    label: 'Knowledge Center',
    hideLabel: false,
    to: '/sc-school/knowledge-center',
  },
  {
    label: 'Technical',
    hideLabel: false,
    to: '/sc-school/knowledge-center',
  },
  {
    label: 'Authentication',
    hideLabel: false,
  },
]

const difficultyColor = (itemStatus: string) => {
  switch (itemStatus) {
    case 'Expert':
      return 'success'
    case 'Basic':
      return 'warning'
    case 'Advanced':
      return 'danger'
    default:
      break
  }
}

const tournamentValue = ref({
  id: 1,
  name: 'End of Term Tournament',
  icon: 'ph:game-controller',
})

const activePosts = ref('all')
</script>

<template>
  <BaseCard class="pb-12">
    <!-- MAIN BANNER -->
    <div class="rounded-xl relative">
      <img
        src="/img/school/ga-banner-5.jpg"
        class="absolute inset-0 object-cover object-right h-full w-full rounded-xl"
      />
      <div
        class="bg-gradient-to-r from-muted-900 from-0% to-transparent to-70% w-full h-full absolute inset-0 rounded-xl"
      ></div>

      <div class="relative px-8 py-12 flex flex-col-reverse gap-6 md:flex-row justify-between">
        <div class="md:w-2/5">
          <div class="flex flex-col gap-6">
            <BaseBreadcrumb :items="addKnowledgeCenterBreadcrumb" class="breadcrumb-light">
              /
            </BaseBreadcrumb>
          </div>
          <BaseHeading
            tag="h3"
            size="4xl"
            weight="medium"
            lead="none"
            class="text-primary-200 mb-6 mt-6"
          >
            How to login to the user portal using login details?
          </BaseHeading>
          <p class="text-sm text-white">
            Creativity allows players to think outside the box, develop innovative strategies, and
            find unique solutions to challenges presented in the game. It enables players to
            approach situations from different perspectives, leading to unexpected and inventive
            gameplay experiences
          </p>

          <div
            class="flex items-center justify-between sm:justify-start bg-muted-100 w-fit py-1 px-4 mt-12"
          >
            <div class="text-muted-400 mt-3 flex items-center gap-1 text-left text-sm sm:mt-0">
              <Icon name="material-symbols:account-circle-full" class="h-3 w-3" />
              <span>John Doe</span>
            </div>
            <div class="hidden px-2 sm:block">
              <span>&middot;</span>
            </div>
            <div class="text-muted-400 mt-3 flex items-center gap-1 text-left text-sm sm:mt-0">
              <Icon name="material-symbols:calendar-month-outline" class="h-3 w-3" />
              <span>22 February 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="mt-12">
      <div class="grid grid-cols-12 gap-6 ms-4">
        <div class="col-span-12 md:col-span-8">
          <BaseCard class="p-6">
            <div class="prose prose-post">
              <h3>Introduction :</h3>

              <p>
                Creativity allows players to think <strong>outside the box,</strong> develop
                innovative strategies, and find unique solutions to challenges presented in the
                game. <em>It enables players</em> to approach situations from different
                perspectives, leading to unexpected and
                <a href="#">inventive gameplay experiences</a>
              </p>

              <h4>How to complete the task?</h4>

              <ul>
                <li>
                  For you to qualify for this task, you will have to complete all subsections. To
                  complete each subsections, you will have to read all content, and videso and press
                  "complete Button". Then only it will be caculated as your score.
                </li>
                <li>
                  Final task will be open if you have completed all other subsections (Introduction
                  for the game, Skills and leanring, Scoring, Consoles).
                </li>
                <li>To get access to Q&A section, you will have to complete Final task section.</li>

                <li>
                  Once you complete all sub sections, you final score will be calculated and you can
                  view under your performance. Your progress in visible on your top.
                </li>
              </ul>

              <h5>How to complete the task?</h5>

              <ol>
                <li>
                  For you to qualify for this task, you will have to complete all subsections. To
                  complete each subsections, you will have to read all content, and videso and press
                  "complete Button". Then only it will be caculated as your score.
                </li>
                <li>
                  Final task will be open if you have completed all other subsections (Introduction
                  for the game, Skills and leanring, Scoring, Consoles).
                </li>
                <li>To get access to Q&A section, you will have to complete Final task section.</li>

                <li>
                  Once you complete all sub sections, you final score will be calculated and you can
                  view under your performance. Your progress in visible on your top.
                </li>
              </ol>

              <img src="/img/school/ga-banner-5.jpg" />

              <p>
                Creativity allows players to think outside the box, develop innovative strategies,
                and find unique solutions to challenges presented in the game. It enables players to
                approach situations from different perspectives, leading to unexpected and inventive
                gameplay experiences
              </p>
            </div>
          </BaseCard>

          <BaseCard class="p-6 mt-4">
            <div class="my-4 flex items-center gap-4">
              <BaseHeading
                as="h3"
                size="md"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-white flex-1"
              >
                <span>Attachments</span>
              </BaseHeading>
            </div>

            <div class="flex gap-2">
              <a
                href="#"
                download=""
                class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
              >
                <Icon name="material-symbols:download-rounded" class="w-5 h-5 text-muted-800" />
                <p class="text-muted-800 text-xs">Filename.ext</p>
              </a>

              <a
                href="#"
                download=""
                class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
              >
                <Icon name="material-symbols:download-rounded" class="w-5 h-5 text-muted-800" />
                <p class="text-muted-800 text-xs">Filename.ext</p>
              </a>

              <a
                href="#"
                download=""
                class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
              >
                <Icon name="material-symbols:download-rounded" class="w-5 h-5 text-muted-800" />
                <p class="text-muted-800 text-xs">Filename.ext</p>
              </a>

              <a
                href="#"
                download=""
                class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
              >
                <Icon name="material-symbols:download-rounded" class="w-5 h-5 text-muted-800" />
                <p class="text-muted-800 text-xs">Filename.ext</p>
              </a>
            </div>
          </BaseCard>

          <!-- NEXT / PREV -->
          <div class="flex justify-between gap-2 mt-6">
            <BaseButton
              color="default"
              class="!bg-primary-50 hover:!bg-primary-100 !text-primary-500"
            >
              <span>Previous</span>
              <Icon
                name="mdi:chevron-left-circle-outline"
                class="-ms-1 w-5 h-5 text-primary-500 dark:text-muted-100"
              />
            </BaseButton>

            <BaseButton
              color="default"
              class="!bg-primary-50 hover:!bg-primary-100 !text-primary-500"
            >
              <Icon
                name="mdi:chevron-right-circle-outline"
                class="-ms-1 w-5 h-5 text-primary-500 hover:text-muted-100"
              />
              <span>Next</span>
            </BaseButton>
          </div>
        </div>

        <!-- SIDEBAR -->
        <div class="col-span-12 md:col-span-4">
          <div class="relative">
            <!-- Title -->
            <div class="my-4 flex items-center gap-4">
              <BaseHeading
                as="h3"
                size="md"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-white flex-1"
              >
                <span>Related Resources</span>
              </BaseHeading>
            </div>

            <div class="space-y-2">
              <div class="flex gap-2">
                <div class="w-24 relative">
                  <img
                    src="/img/school/ga-banner-2.jpg"
                    alt="image"
                    class="rounded-lg w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                    Secondary Category
                  </h5>

                  <h4
                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium my-1 leading-tight"
                  >
                    How to login to the user portal?
                  </h4>
                  <p class="text-muted-600 dark:text-muted-400 text-[0.6rem]">5th March 2024</p>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="w-24 relative">
                  <img
                    src="/img/school/ga-banner-1.jpg"
                    alt="image"
                    class="rounded-lg w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                    Secondary Category
                  </h5>

                  <h4
                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium my-1 leading-tight"
                  >
                    How to login to the user portal?
                  </h4>
                  <p class="text-muted-600 dark:text-muted-400 text-[0.6rem]">5th March 2024</p>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="w-24 relative">
                  <img
                    src="/img/school/ga-banner-6.jpg"
                    alt="image"
                    class="rounded-lg w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                    Secondary Category
                  </h5>

                  <h4
                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium my-1 leading-tight"
                  >
                    How to login to the user portal?
                  </h4>
                  <p class="text-muted-600 dark:text-muted-400 text-[0.6rem]">5th March 2024</p>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="w-24 relative">
                  <img
                    src="/img/school/ga-banner-2.jpg"
                    alt="image"
                    class="rounded-lg w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                    Secondary Category
                  </h5>

                  <h4
                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium my-1 leading-tight"
                  >
                    How to login to the user portal?
                  </h4>
                  <p class="text-muted-600 dark:text-muted-400 text-[0.6rem]">5th March 2024</p>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="w-24 relative">
                  <img
                    src="/img/school/ga-banner-6.jpg"
                    alt="image"
                    class="rounded-lg w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                    Secondary Category
                  </h5>

                  <h4
                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium my-1 leading-tight"
                  >
                    How to login to the user portal?
                  </h4>
                  <p class="text-muted-600 dark:text-muted-400 text-[0.6rem]">5th March 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
