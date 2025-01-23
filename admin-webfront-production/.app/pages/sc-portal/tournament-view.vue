<script setup lang="ts">
import { ref } from 'vue'
import { refDebounced } from '@vueuse/core'

definePageMeta({
  title: 'Tournament View',
  middleware: ['auth'],
})

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
</script>

<template>
  <!-- OVERALL PROGRESS -->

  <BaseCard class="mb-2 p-2 pb-6">
    <div class="mx-12 p-4 mb-6">
      <div class="flex items-center">
        <div class="flex items-center text-primary-500 relative">
          <div
            class="rounded-full transition duration-500 ease-in-out h-9 w-9 py-3 border-2 border-success-500 bg-success-500 text-white flex items-center justify-center text-xs"
          >
            5%
          </div>
          <div
            class="absolute top-0 -ml-12 text-center mt-10 w-32 text-sm font-medium text-muted-800 dark:text-muted-300"
          >
            Introduction for the game
          </div>
        </div>
        <div
          class="flex-auto border-t-4 transition duration-500 ease-in-out border-success-500"
        ></div>
        <div class="flex items-center text-white relative">
          <div
            class="rounded-full transition duration-500 ease-in-out h-9 w-9 py-3 border-2 border-success-500 bg-success-500 text-white flex items-center justify-center text-xs"
          >
            10%
          </div>
          <div
            class="absolute top-0 -ml-12 text-center mt-10 w-32 text-sm font-medium text-muted-800 dark:text-muted-300"
          >
            Skills & Learning
          </div>
        </div>
        <div
          class="flex-auto border-t-4 transition duration-500 ease-in-out border-success-500"
        ></div>

        <div class="flex items-center text-muted-500 relative">
          <div
            class="rounded-full transition duration-500 ease-in-out h-9 w-9 py-3 border-2 border-lime-400 bg-lime-400 text-white flex items-center justify-center text-xs"
          >
            15%
          </div>
          <div
            class="absolute top-0 -ml-12 text-center mt-10 w-32 text-sm font-medium text-muted-800 dark:text-muted-300"
          >
            Scoring & Direction
          </div>
        </div>
        <div
          class="flex-auto border-t-4 transition duration-500 ease-in-out border-muted-300"
        ></div>
        <div class="flex items-center text-muted-500 relative">
          <div
            class="rounded-full transition duration-500 ease-in-out h-9 w-9 py-3 border-2 border-muted-300 bg-transparent text-muted-600 flex items-center justify-center text-xs"
          >
            20%
          </div>
          <div
            class="absolute top-0 -ml-12 text-center mt-10 w-32 text-sm font-medium text-muted-800 dark:text-muted-300"
          >
            Gaming Consoles
          </div>
        </div>
        <div
          class="flex-auto border-t-4 transition duration-500 ease-in-out border-muted-300"
        ></div>
        <div class="flex items-center text-muted-500 relative">
          <div
            class="rounded-full transition duration-500 ease-in-out h-9 w-9 py-3 border-2 border-muted-300 bg-transparent text-muted-600 flex items-center justify-center text-xs"
          >
            100%
          </div>
          <div
            class="absolute top-0 -ml-12 text-center mt-10 w-32 text-sm font-medium text-muted-800 dark:text-muted-300"
          >
            Core Activity
          </div>
        </div>
      </div>
    </div>
  </BaseCard>

  <!-- MAIN BANNER -->
  <div class="rounded-md relative">
    <img
      src="/img/school/angry-2.jpg"
      class="absolute inset-0 object-cover h-full w-full rounded-md"
    />
    <div
      class="bg-gradient-to-r from-muted-900 to-transparent w-full h-full absolute inset-0 rounded-md"
    ></div>
    <div
      class="relative px-8 py-12 flex flex-col-reverse gap-6 md:flex-row justify-between"
    >
      <div class="md:basis-5/12">
        <BaseHeading
          tag="h3"
          size="2xl"
          weight="medium"
          lead="none"
          class="text-white"
        >
          Tournament title
        </BaseHeading>
        <div class="my-6 flex gap-2">
          <div
            class="bg-primary-500 rounded-full flex gap-2 items-center px-4 py-1.5"
          >
            <Icon name="ph:game-controller" class="w-5 h-5 text-white" />
            <span class="text-white text-sm">Gaming Education</span>
          </div>

          <div
            class="bg-primary-300 rounded-full flex gap-2 items-center px-4 py-1"
          >
            <Icon name="ph:game-controller" class="w-5 h-5 text-white" />
            <span class="text-white text-sm">Core Skills Development</span>
          </div>
        </div>
        <p class="text-sm text-white">
          Creativity allows players to think outside the box, develop innovative
          strategies, and find unique solutions to challenges presented in the
          game. It enables players to approach situations from different
          perspectives, leading to unexpected and inventive gameplay experiences
        </p>
        <div class="mt-4 flex items-center gap-4">
          <BaseTag
            color="warning"
            shape="curved"
            size="md"
            class="capitalize text-sm"
          >
            Basic
          </BaseTag>

          <BaseCard class="gap-4 p-1 px-2">
            <div>
              <p
                class="text-sm text-primary-500 dark:text-muted-200 font-medium text-center"
              >
                Puzzle game
              </p>
            </div>
          </BaseCard>

          <BaseCard
            class="flex justify-between gap-4 p-1 px-2 items-center w-fit"
          >
            <div class="flex gap-1">
              <Icon
                name="material-symbols:android"
                class="text-muted-400 block w-5 h-5"
              />
              <Icon
                name="ic:baseline-apple"
                class="text-muted-400 block w-5 h-5"
              />
              <Icon name="quill:desktop" class="text-muted-400 block w-5 h-5" />
              <Icon
                name="tabler:brand-xbox"
                class="text-muted-400 block w-5 h-5"
              />
            </div>
          </BaseCard>
        </div>
      </div>
      <div class="">
        <div class="">
          <div class="text-center flex items-center flex-col -mt-4">
            <h4
              class="text-white bg-primary-500 rounded-full text-lg font-medium leading-none w-12 h-12 flex items-center justify-center p-4"
            >
              15
            </h4>
            <p class="text-white text-sm mt-2">Score<br />Achieved</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- INTRODUCTION -->
  <BaseCard rounded="md" class="p-6 mt-6">
    <!-- HEADER -->
    <div class="flex gap-4 items-center">
      <div>
        <div class="flex items-center gap-2 bg-amber-400 p-3 rounded-md">
          <Icon name="ph:pencil-simple-line" class="text-white w-6 h-6" />
          <span class="text-white text-sm">Active</span>
        </div>
      </div>
      <div class="flex-1">
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="none"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Introduction for the game
        </BaseHeading>
      </div>
      <div>
        <div class="flex gap-4 items-center">
          <p class="text-muted-800 dark:text-muted-100">
            Score for this section
          </p>
          <span
            class="text-base font-medium text-primary-500 w-12 h-12 flex items-center justify-center bg-primary-50/50 dark:bg-muted-50 rounded-full"
            >5%</span
          >
        </div>
      </div>
      <div>
        <Icon
          name="octicon:chevron-down-24"
          class="text-primary-500 dark:text-white w-10 h-10 cursor-pointer"
        />
      </div>
    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-12 gap-6 mt-4">
      <div class="col-span-12 md:col-span-8">
        <BaseCard
          class="p-6 divide-y divide-muted-300 dark:divide-muted-600 flex flex-col"
        >
          <div class="flex gap-4 justify-between items-center pb-3">
            <div class="flex gap-4 items-center">
              <p class="text-muted-800 dark:text-muted-100 font-medium">
                Game :
              </p>
              <span class="text-primary-500 dark:text-primary-200 font-bold">
                Angry Birds
              </span>
            </div>
            <div class="flex gap-4 items-center">
              <p class="text-muted-800 dark:text-muted-100 font-medium">
                Difficulty Level :
              </p>
              <BaseTag
                color="warning"
                shape="curved"
                size="md"
                class="capitalize text-sm"
              >
                Basic
              </BaseTag>
            </div>
          </div>
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              Description :
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <p>
                Creativity allows players to think outside the box, develop
                innovative strategies, and find unique solutions to challenges
                presented in the game. It enables players to approach situations
                from different perspectives, leading to unexpected and inventive
                gameplay experiences
              </p>
            </div>
          </div>
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              Impact on student education :
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <p>
                Creativity allows players to think outside the box, develop
                innovative strategies, and find unique solutions to challenges
                presented in the game. It enables players to approach situations
                from different perspectives, leading to unexpected and inventive
                gameplay experiences
              </p>
            </div>
          </div>
          <div class="py-4">
            <div class="flex gap-4 items-center">
              <p class="text-muted-800 dark:text-muted-100 font-medium">
                Age Appropriate :
              </p>
              <span
                class="bg-primary-50 text-primary-800 px-4 py-1 rounded-md text-sm"
                >Age 7+</span
              >
            </div>
          </div>
          <div class="pt-4">
            <div class="flex gap-4 items-center justify-end">
              <BaseButton
                type="button"
                color="primary"
                class="!w-40"
                size="sm"
                disabled
              >
                Completed
              </BaseButton>
              <BaseButton type="button" color="primary" class="!w-40" size="sm">
                Complete
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
      <div class="col-span-12 md:col-span-4">
        <img
          src="/img/school/angry-2.jpg"
          class="object-cover h-full w-full rounded-xl"
        />
      </div>
    </div>
  </BaseCard>

  <!-- SKILLS AND LEARNING -->
  <BaseCard rounded="md" class="p-6 mt-6">
    <!-- HEADER -->
    <div class="flex gap-4 items-center">
      <div>
        <div class="flex items-center gap-2 bg-lime-400 p-3 rounded-md">
          <Icon name="charm:circle-tick" class="text-white w-6 h-6" />
          <span class="text-white text-sm">Completed</span>
        </div>
      </div>
      <div class="flex-1">
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="none"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Skills and learning
        </BaseHeading>
      </div>
      <div>
        <div class="flex gap-4 items-center">
          <p class="text-muted-800 dark:text-muted-100">
            Score for this section
          </p>
          <span
            class="text-base font-medium text-primary-500 w-12 h-12 flex items-center justify-center bg-primary-50/50 dark:bg-muted-50 rounded-full"
            >5%</span
          >
        </div>
      </div>
      <div>
        <Icon
          name="octicon:chevron-down-24"
          class="text-primary-500 dark:text-white w-10 h-10 cursor-pointer"
        />
      </div>
    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-12 gap-6 mt-4">
      <div class="col-span-12 md:col-span-4">
        <img
          src="/img/school/angry-3.jpg"
          class="object-cover h-full w-full rounded-xl"
        />
      </div>
      <div class="col-span-12 md:col-span-8">
        <BaseCard
          class="p-6 divide-y divide-muted-300 dark:divide-muted-600 flex flex-col"
        >
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              Introduction :
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <p>
                Creativity allows players to think outside the box, develop
                innovative strategies, and find unique solutions to challenges
                presented in the game. It enables players to approach situations
                from different perspectives, leading to unexpected and inventive
                gameplay experiences
              </p>
            </div>
          </div>
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              List of skills :
            </p>
            <div class="mt-2 flex gap-4 flex-wrap">
              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 ps-4 pe-8 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ri:align-item-bottom-line"
                  class="text-primary-500 w-6 h-5 dark:text-muted-200"
                />
                <span class="text-sm text-primary-500 dark:text-muted-200"
                  >Communication</span
                >

                <Icon
                  name="material-symbols-light:open-in-new"
                  class="text-muted-400 w-4 h-4 absolute top-1 right-1"
                />
              </NuxtLink>

              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 ps-4 pe-8 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ri:align-item-bottom-line"
                  class="text-primary-500 w-6 h-5 dark:text-muted-200"
                />
                <span class="text-sm text-primary-500 dark:text-muted-200"
                  >Creative</span
                >

                <Icon
                  name="material-symbols-light:open-in-new"
                  class="text-muted-400 w-4 h-4 absolute top-1 right-1"
                />
              </NuxtLink>

              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 ps-4 pe-8 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ri:align-item-bottom-line"
                  class="text-primary-500 w-6 h-5 dark:text-muted-200"
                />
                <span class="text-sm text-primary-500 dark:text-muted-200"
                  >Critical Thinking</span
                >

                <Icon
                  name="material-symbols-light:open-in-new"
                  class="text-muted-400 w-4 h-4 absolute top-1 right-1"
                />
              </NuxtLink>

              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 ps-4 pe-8 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ri:align-item-bottom-line"
                  class="text-primary-500 w-6 h-5 dark:text-muted-200"
                />
                <span class="text-sm text-primary-500 dark:text-muted-200"
                  >Critical Thinking</span
                >

                <Icon
                  name="material-symbols-light:open-in-new"
                  class="text-muted-400 w-4 h-4 absolute top-1 right-1"
                />
              </NuxtLink>

              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 ps-4 pe-8 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ri:align-item-bottom-line"
                  class="text-primary-500 w-6 h-5 dark:text-muted-200"
                />
                <span class="text-sm text-primary-500 dark:text-muted-200"
                  >Critical Thinking</span
                >

                <Icon
                  name="material-symbols-light:open-in-new"
                  class="text-muted-400 w-4 h-4 absolute top-1 right-1"
                />
              </NuxtLink>

              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 ps-4 pe-8 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ri:align-item-bottom-line"
                  class="text-primary-500 w-6 h-5 dark:text-muted-200"
                />
                <span class="text-sm text-primary-500 dark:text-muted-200"
                  >Critical Thinking</span
                >

                <Icon
                  name="material-symbols-light:open-in-new"
                  class="text-muted-400 w-4 h-4 absolute top-1 right-1"
                />
              </NuxtLink>
            </div>
          </div>

          <div class="pt-4">
            <div class="flex gap-4 items-center justify-end">
              <BaseButton type="button" color="primary" class="!w-40" size="sm">
                Complete
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </BaseCard>

  <!-- SCORING AND DIRECTION -->
  <BaseCard rounded="md" class="p-6 mt-6">
    <!-- HEADER -->
    <div class="flex gap-4 items-center">
      <div>
        <div class="flex items-center gap-2 bg-amber-400 p-3 rounded-md">
          <Icon name="ph:pencil-simple-line" class="text-white w-6 h-6" />
          <span class="text-white text-sm">Active</span>
        </div>
      </div>
      <div class="flex-1">
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="none"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Scoring and direction
        </BaseHeading>
      </div>
      <div>
        <div class="flex gap-4 items-center">
          <p class="text-muted-800 dark:text-muted-100">
            Score for this section
          </p>
          <span
            class="text-base font-medium text-primary-500 w-12 h-12 flex items-center justify-center bg-primary-50/50 dark:bg-muted-50 rounded-full"
            >5%</span
          >
        </div>
      </div>
      <div>
        <Icon
          name="octicon:chevron-down-24"
          class="text-primary-500 dark:text-white w-10 h-10 cursor-pointer"
        />
      </div>
    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-12 gap-6 mt-4">
      <div class="col-span-12 md:col-span-8">
        <BaseCard
          class="p-6 divide-y divide-muted-300 dark:divide-muted-600 flex flex-col"
        >
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              Introduction :
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <p class="text-muted-600 dark:text-muted-200 text-sm">
                Creativity allows players to think outside the box, develop
                innovative strategies, and find unique solutions to challenges
                presented in the game. It enables players to approach situations
                from different perspectives, leading to unexpected and inventive
                gameplay experiences
              </p>
            </div>
          </div>
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              How to complete the task?
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <ul>
                <li>
                  For you to qualify for this task, you will have to complete
                  all subsections. To complete each subsections, you will have
                  to read all content, and videso and press "complete Button".
                  Then only it will be caculated as your score.
                </li>
                <li>
                  Final task will be open if you have completed all other
                  subsections (Introduction for the game, Skills and leanring,
                  Scoring, Consoles).
                </li>
                <li>
                  To get access to Q&A section, you will have to complete Final
                  task section.
                </li>

                <li>
                  Once you complete all sub sections, you final score will be
                  calculated and you can view under your performance. Your
                  progress in visible on your top.
                </li>
              </ul>
            </div>
          </div>
          <div class="py-4">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              Achievements :
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <p>
                By completing learning activities, you can earn badges and
                become eligible for the certificate and the tournament.
              </p>
              <ul>
                <li>
                  For each completed learning activity, you will receive a
                  bronze badge.
                </li>
                <li>
                  For every 5 completed learning activities, you will receive a
                  silver badge.
                </li>
                <li>
                  For every 10 learning activities, you will receive a gold
                  medal.
                </li>
                <li>
                  If you complete 40 learning activities, you will receive a
                  platinum badge.
                </li>
                <li>
                  To be eligible for the certificate, you need to complete a
                  minimum of 40 learning activities and have an average score of
                  80%.
                </li>
                <li>
                  To be eligible for the tournament, you need to complete a
                  minimum of 40 learning activities and have an average score of
                  90%.
                </li>
              </ul>
            </div>
          </div>
        </BaseCard>
      </div>
      <div class="col-span-12 md:col-span-4">
        <div class="flex flex-col h-full">
          <div class="mb-6">
            <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
              Scoring Table :
            </p>
            <div class="space-y-1">
              <!-- HEADING ROW -->
              <div
                class="bg-muted-100 dark:bg-muted-600 flex gap-2 px-4 py-1.5 border border-muted-300"
              >
                <div
                  class="flex-1 text-sm font-medium text-primary-500 dark:text-white"
                >
                  Activities
                </div>
                <div
                  class="w-14 text-sm font-medium text-primary-500 dark:text-white"
                >
                  Score
                </div>
              </div>
              <!-- ROW -->
              <div class="flex gap-2 px-4 py-1.5 border border-muted-300">
                <div class="flex-1 text-sm text-muted-600 dark:text-muted-400">
                  Introduction for the game
                </div>
                <div class="w-14 text-sm text-muted-600 dark:text-muted-400">
                  5%
                </div>
              </div>
              <!-- ROW -->
              <div class="flex gap-2 px-4 py-1.5 border border-muted-300">
                <div class="flex-1 text-sm text-muted-600 dark:text-muted-400">
                  Skills and Learning
                </div>
                <div class="w-14 text-sm text-muted-600 dark:text-muted-400">
                  5%
                </div>
              </div>
              <!-- ROW -->
              <div class="flex gap-2 px-4 py-1.5 border border-muted-300">
                <div class="flex-1 text-sm text-muted-600 dark:text-muted-400">
                  Scoring and Direction
                </div>
                <div class="w-14 text-sm text-muted-600 dark:text-muted-400">
                  5%
                </div>
              </div>
              <!-- ROW -->
              <div class="flex gap-2 px-4 py-1.5 border border-muted-300">
                <div class="flex-1 text-sm text-muted-600 dark:text-muted-400">
                  Gaming Console
                </div>
                <div class="w-14 text-sm text-muted-600 dark:text-muted-400">
                  5%
                </div>
              </div>
              <!-- ROW -->
              <div class="flex gap-2 px-4 py-1.5 border border-muted-300">
                <div class="flex-1 text-sm text-muted-600 dark:text-muted-400">
                  Core Activity
                </div>
                <div class="w-14 text-sm text-muted-600 dark:text-muted-400">
                  40%
                </div>
              </div>
              <!-- TOTAL ROW -->
              <div
                class="bg-primary-50 dark:bg-muted-700 flex gap-2 px-4 py-1.5 border border-muted-300"
              >
                <div
                  class="flex-1 text-sm font-bold text-primary-500 dark:text-white"
                >
                  Total
                </div>
                <div
                  class="w-14 text-sm font-bold text-primary-500 dark:text-white"
                >
                  100%
                </div>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <img
              src="/img/school/angry-1.jpg"
              class="object-cover h-full w-full rounded-xl"
            />
          </div>

          <div class="mt-6">
            <div class="flex gap-4 items-center justify-end">
              <BaseButton
                type="button"
                color="primary"
                class="!w-full"
                size="sm"
              >
                Complete
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>

  <!-- GAMING CONSOLES -->
  <BaseCard rounded="md" class="p-6 mt-6">
    <!-- HEADER -->
    <div class="flex gap-4 items-center">
      <div>
        <div class="flex items-center gap-2 bg-amber-400 p-3 rounded-md">
          <Icon name="ph:pencil-simple-line" class="text-white w-6 h-6" />
          <span class="text-white text-sm">Active</span>
        </div>
      </div>
      <div class="flex-1">
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="none"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Gaming consoles
        </BaseHeading>
      </div>
      <div>
        <div class="flex gap-4 items-center">
          <p class="text-muted-800 dark:text-muted-100">
            Score for this section
          </p>
          <span
            class="text-base font-medium text-primary-500 w-12 h-12 flex items-center justify-center bg-primary-50/50 dark:bg-muted-50 rounded-full"
            >5%</span
          >
        </div>
      </div>
      <div>
        <Icon
          name="octicon:chevron-down-24"
          class="text-primary-500 dark:text-white w-10 h-10 cursor-pointer"
        />
      </div>
    </div>

    <!-- CONTENT -->
    <div
      class="grid grid-cols-12 gap-6 mt-4 bg-primary-500 dark:bg-muted-900 rounded-lg"
    >
      <div class="col-span-12 md:col-span-4">
        <img src="/img/school/angry-5.png" class="object-cover h-full w-full" />
      </div>
      <div class="col-span-12 md:col-span-8">
        <div
          class="p-6 divide-y-2 divide-muted-300 dark:divide-muted-600 flex flex-col"
        >
          <div class="py-4">
            <p class="text-muted-100 dark:text-muted-100 font-medium mb-1">
              Introduction :
            </p>
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:text-muted-100 prose-li:dark:text-muted-300 prose-p:text-sm prose-p:text-muted-300 prose-p:dark:text-muted-300"
            >
              <p>
                Creativity allows players to think outside the box, develop
                innovative strategies, and find unique solutions to challenges
                presented in the game. It enables players to approach situations
                from different perspectives, leading to unexpected and inventive
                gameplay experiences
              </p>
            </div>
          </div>
          <div class="py-4">
            <p class="text-muted-100 dark:text-muted-100 font-medium mb-1">
              List of Consoles :
            </p>
            <div class="mt-2 flex gap-4 flex-wrap">
              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 px-4 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="mdi:sony-playstation"
                  class="text-muted-900 w-8 h-8 dark:text-muted-200"
                />
                <span class="text-base text-muted-800 dark:text-muted-200"
                  >PlayStation</span
                >

                <Icon
                  name="ph:download-simple"
                  class="text-muted-400 w-5 h-5 ms-2"
                />
              </NuxtLink>
              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 px-4 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="ic:baseline-apple"
                  class="text-muted-900 w-8 h-8 dark:text-muted-200"
                />
                <span class="text-base text-muted-800 dark:text-muted-200"
                  >Apple</span
                >

                <Icon
                  name="ph:download-simple"
                  class="text-muted-400 w-5 h-5 ms-2"
                />
              </NuxtLink>
              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 px-4 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="material-symbols:android"
                  class="text-muted-900 w-8 h-8 dark:text-muted-200"
                />
                <span class="text-base text-muted-800 dark:text-muted-200"
                  >Android</span
                >

                <Icon
                  name="ph:download-simple"
                  class="text-muted-400 w-5 h-5 ms-2"
                />
              </NuxtLink>
              <NuxtLink
                to="#"
                target="_blank"
                class="relative inline-flex items-center gap-2 bg-muted-100 hover:bg-muted-200 dark:bg-muted-600 hover:dark:bg-muted-700 transition-all duration-300 px-4 py-3 border border-muted-300 rounded-md"
              >
                <Icon
                  name="tabler:brand-xbox"
                  class="text-muted-900 w-8 h-8 dark:text-muted-200"
                />
                <span class="text-base text-muted-800 dark:text-muted-200"
                  >Xbox</span
                >

                <Icon
                  name="ph:download-simple"
                  class="text-muted-400 w-5 h-5 ms-2"
                />
              </NuxtLink>
            </div>
          </div>

          <div class="pt-4">
            <div class="flex gap-4 items-center justify-end">
              <BaseButton
                type="button"
                color="primary"
                class="!w-40 !bg-primary-300 hover:!bg-primary-400"
                size="sm"
              >
                Complete
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>

  <!-- CORE ACTIVITY -->
  <BaseCard rounded="md" class="p-6 mt-6">
    <!-- HEADER -->
    <div class="flex gap-4 items-center">
      <div>
        <div class="flex items-center gap-2 bg-danger-600 p-3 rounded-md">
          <Icon name="ph:pencil-simple-line" class="text-white w-6 h-6" />
          <span class="text-white text-sm">Inactive</span>
        </div>
      </div>
      <div class="flex-1">
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="none"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Core activity
        </BaseHeading>
      </div>
      <div>
        <div
          class="flex gap-2 px-4 py-2 rounded-full bg-primary-50/80 dark:bg-muted-700 text-primary-500 dark:text-primary-100"
        >
          <Icon name="material-symbols:av-timer" class="w-6 h-6" />
          <span class="font-medium text-primary-500 dark:text-white"
            >72 hours</span
          >
        </div>
      </div>
      <div>
        <div class="flex gap-4 items-center">
          <p class="text-muted-800 dark:text-muted-100">
            Score for this section
          </p>
          <span
            class="text-base font-medium text-primary-500 w-12 h-12 flex items-center justify-center bg-primary-50/50 dark:bg-muted-50 rounded-full"
            >40%</span
          >
        </div>
      </div>
      <div>
        <Icon
          name="octicon:chevron-down-24"
          class="text-primary-500 dark:text-white w-10 h-10 cursor-pointer"
        />
      </div>
    </div>

    <!-- CONTENT FIRST -->
    <div class="mt-4 bg-muted-50 dark:bg-muted-900 rounded-lg p-4">
      <div
        class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
      >
        <ul>
          <li>
            This is the core acitivity where you will need to perform a
            <strong>major activity</strong> regards to this task
          </li>
          <li>
            You have <strong>72 hours</strong> to perform this core acitivity,
            it will start once you press start button.
          </li>
          <li>
            Instruction of this core acitivity (how to perform) will be
            explained <strong>once you press start button</strong> in the form
            of descriptions and explainer view. Make sure you go through all
            instrcutions we have given
          </li>
          <li>
            As the submission, you will be asked to
            <strong>provide an evidence,</strong> More informations are within
            the core acitivity section once you open. (you will need to submit
            within 72 hours timeline)
          </li>
          <li>
            Once you submit the evidence, we will do a
            <strong>manual review of your work</strong> and release your
            <strong>score in 2 hours.</strong>
          </li>
        </ul>
      </div>
      <div class="flex justify-end mt-4">
        <BaseButton type="button" color="primary" class="!w-40" size="sm">
          Start Now
        </BaseButton>
      </div>
    </div>

    <!-- CONTENT SECOND -->
    <div class="grid grid-cols-12 gap-6 mt-4 dark:bg-muted-900 rounded-lg p-4">
      <div class="col-span-12 md:col-span-6">
        <div>
          <p class="text-muted-800 dark:text-muted-100 font-medium mb-2">
            Video Title
          </p>
        </div>

        <div>
          <video class="w-full" controls>
            <source
              src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        <div class="mt-6">
          <div class="flex gap-4 items-center">
            <p class="text-muted-800 dark:text-muted-100 font-medium">
              Upload your evidence :
            </p>
            <div>
              <BaseParagraph
                size="xs"
                lead="tight"
                class="text-muted-500 dark:text-muted-400 pb-2"
              >
                <span>Size: 100px x 100px</span>
              </BaseParagraph>

              <div>
                <BaseButton color="primary">
                  <Icon
                    name="icon-park-outline:upload-picture"
                    class="me-1 size-4"
                  />
                  <span>Add Media</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 md:col-span-6">
        <div>
          <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
            Activity Instruction :
          </p>

          <div
            class="bg-muted-100 dark:bg-muted-600 px-4 py-3 border border-muted-300 rounded-md"
          >
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <h4>Reach a score of 2500 in Endless blocks mode</h4>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <p class="text-muted-800 dark:text-muted-100 font-medium mb-1">
            Direction to submit your work :
          </p>

          <div
            class="bg-muted-100 dark:bg-muted-600 px-4 py-3 border border-muted-300 rounded-md"
          >
            <div
              class="prose max-w-full prose-strong:text-primary-500 marker:text-primary-500 prose-li:text-sm prose-li:dark:text-muted-300 prose-p:text-sm prose-p:dark:text-muted-300"
            >
              <p>
                For this particular activity, it is necessary that you upload a
                screenshot as part of the submission process. This screenshot
                should clearly demonstrate your progress or completion of the
                task. This requirement ensures that the evaluators can
                accurately assess your work. Therefore, please make sure to
                follow the instructions and include the screenshot as requested.
                Make sure you upload within 72 hours.
              </p>
            </div>
          </div>

          <div class="mt-6">
            <div class="flex gap-4 items-center justify-end">
              <BaseButton type="button" color="primary" class="!w-40" size="sm">
                Complete
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>

  <div class="flex justify-end gap-2 pt-8 pb-12">
    <BaseButton
      type="submit"
      color="primary"
      class="!bg-lime-400 !text-muted-700 hover:!bg-lime-300"
    >
      Submit & Complete Activity
    </BaseButton>
  </div>
</template>
