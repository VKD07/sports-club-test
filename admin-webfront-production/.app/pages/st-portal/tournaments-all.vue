<script setup lang="ts">
import { ref } from 'vue'
import { refDebounced } from '@vueuse/core'

definePageMeta({
  title: 'Student Tournaments',
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

const tournamentValue = ref({
  id: 1,
  name: 'End of Term Tournament',
  icon: 'ph:game-controller',
})

const tournaments = [
  {
    id: 1,
    name: 'End of Term Tournament',
    icon: 'ph:game-controller',
  },
  {
    id: 2,
    name: 'End of Year Tournament',
    icon: 'ph:airplane-duotone',
  },
]

const activePosts = ref('all')
</script>

<template>
  <!-- MAIN BANNER -->
  <div class="rounded-3xl relative">
    <img
      src="/img/school/ga-banner-2.jpg"
      class="absolute inset-0 object-cover h-full w-full rounded-3xl"
    />
    <div
      class="bg-gradient-to-r from-muted-900 to-transparent w-full h-full absolute inset-0 rounded-3xl"
    ></div>
    <div class="relative px-8 py-12 flex flex-col-reverse gap-6 md:flex-row justify-between">
      <div class="md:basis-96">
        <BaseHeading tag="h3" size="4xl" weight="medium" lead="none" class="text-primary-200">
          Esport Tournament
        </BaseHeading>
        <div class="my-6">
          <BaseListbox
            v-model="tournamentValue"
            :items="tournaments"
            placeholder="Select"
            class="color-dropdown"
            :properties="{
              value: 'id',
              label: 'name',
              icon: 'icon',
            }"
          />
        </div>
        <p class="text-sm text-white">
          Creativity allows players to think outside the box, develop innovative strategies, and
          find unique solutions to challenges presented in the game. It enables players to approach
          situations from different perspectives, leading to unexpected and inventive gameplay
          experiences
        </p>
      </div>
      <div class="">
        <div class="grid grid-cols-2 w-fit divide-x bg-primary-500 rounded-lg px-8 py-2">
          <div class="text-center pe-8">
            <h4 class="text-white text-lg font-medium leading-none">1st</h4>
            <p class="text-white text-sm">Year</p>
          </div>
          <div class="text-center ps-8">
            <h4 class="text-white text-lg font-medium leading-none">1st</h4>
            <p class="text-white text-sm">Year</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MAIN CONTENT -->
  <div class="mt-12">
    <div class="mb-6">
      <div class="flex gap-2 sm:justify-center">
        <BaseButtonAction
          :color="activePosts === 'all' ? 'primary' : 'default'"
          @click="activePosts = 'all'"
          class="tab-button"
        >
          All
        </BaseButtonAction>
        <BaseButtonAction
          :color="activePosts === 'mandatory' ? 'primary' : 'default'"
          @click="activePosts = 'mandatory'"
          class="tab-button"
        >
          Mandatory
        </BaseButtonAction>
        <BaseButtonAction
          :color="activePosts === 'seasonal' ? 'primary' : 'default'"
          @click="activePosts = 'seasonal'"
          class="tab-button"
        >
          Seasonal
        </BaseButtonAction>
      </div>
    </div>

    <!-- FILTER TAG -->
    <div class="flex justify-end mb-4">
      <div class="mt-2 flex flex-wrap gap-2">
        <span
          class="text-muted-500 dark:text-muted-400 bg-muted-200 dark:bg-muted-700/40 inline-flex h-6 items-center justify-center rounded-full ps-3 pe-2 font-sans text-xs font-medium"
        >
          Pending
          <BaseButtonClose class="!text-muted-500 !h-4 !w-4 p-[1px] ms-1" rounded="none" />
        </span>
        <span
          class="text-muted-500 dark:text-muted-400 bg-muted-200 dark:bg-muted-700/40 inline-flex h-6 items-center justify-center rounded-full ps-3 pe-2 font-sans text-xs font-medium"
        >
          Expert
          <BaseButtonClose class="!text-muted-500 !h-4 !w-4 p-[1px] ms-1" rounded="none" />
        </span>
        <span
          class="text-muted-500 dark:text-muted-400 bg-muted-200 dark:bg-muted-700/40 inline-flex h-6 items-center justify-center rounded-full ps-3 pe-2 font-sans text-xs font-medium"
        >
          Apple
          <BaseButtonClose class="!text-muted-500 !h-4 !w-4 p-[1px] ms-1" rounded="none" />
        </span>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-6">
      <!-- SIDEBAR -->
      <div class="col-span-12 md:col-span-3">
        <!-- SIDEBAR BANNER -->
        <div class="rounded-xl relative">
          <img
            src="/img/school/ga-banner-3.jpg"
            class="absolute inset-0 object-cover h-full w-full rounded-xl"
          />
          <div
            class="bg-gradient-to-t from-muted-900 to-transparent w-full h-full absolute inset-0 rounded-xl"
          ></div>
          <div class="relative px-6 py-8 flex flex-col-reverse gap-6 md:flex-row justify-between">
            <div class="absolute top-8 left-6">
              <p class="text-white text-base text-center">Tournaments</p>
            </div>
            <div class="absolute top-6 right-6">
              <div
                class="bg-primary-400 text-white h-12 w-12 rounded-full flex items-center justify-center text-lg font-medium shadow-sm"
              >
                3
              </div>
            </div>
            <div class="pt-32">
              <div class="flex gap-4 items-center mb-2">
                <Icon name="ph:flag-thin" class="text-white w-6 h-6" />
                <h4 class="text-white font-medium text-lg">All End of Term</h4>
              </div>
              <p class="text-sm text-white">
                Creativity allows players to think outside the box, develop innovative strategies,
                and find unique solutions to challenges presented in the game.
              </p>
            </div>
          </div>
        </div>

        <!-- SIDEBAR SEARCH -->
        <div class="mt-6">
          <BaseInput shape="smooth" icon="lucide:search" placeholder="Tournament Search" />
        </div>

        <!-- SIDEBAR FILTERS -->
        <div class="space-y-10 mt-6">
          <!-- Filter group -->
          <div class="relative">
            <!-- Title -->
            <div class="mb-4 p-2 rounded-md flex items-center gap-4 bg-white dark:bg-muted-700">
              <Icon name="carbon:task-complete" class="w-5 h-5" />
              <BaseHeading
                as="h3"
                size="md"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-white flex-1"
              >
                <span>Completion</span>
              </BaseHeading>
              <div class="flex items-center justify-center">
                <Icon name="octicon:chevron-down-24" class="w-6 h-6" />
              </div>
            </div>
            <!-- Checkboxes -->
            <div class="flex flex-col gap-4 ps-2">
              <div class="flex items-center justify-between">
                <BaseCheckbox value="all" label="All" shape="rounded" />
                <BaseTag color="primary" shape="full" class="text-xs" size="sm"> 28 </BaseTag>
              </div>
              <div class="flex items-center justify-between">
                <BaseCheckbox value="all" label="Pending" shape="rounded" />
                <BaseTag color="primary" shape="full" class="text-xs" size="sm"> 28 </BaseTag>
              </div>
              <div class="flex items-center justify-between">
                <BaseCheckbox value="all" label="Completed" shape="rounded" />
                <BaseTag color="primary" shape="full" class="text-xs" size="sm"> 28 </BaseTag>
              </div>
            </div>
          </div>

          <!-- Filter group -->
          <div class="relative">
            <!-- Title -->
            <div class="mb-4 p-2 rounded-md flex items-center gap-4 bg-white dark:bg-muted-700">
              <Icon name="carbon:task-complete" class="w-5 h-5" />
              <BaseHeading
                as="h3"
                size="md"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-white flex-1"
              >
                <span>Difficulty</span>
              </BaseHeading>
              <div class="flex items-center justify-center">
                <Icon name="octicon:chevron-down-24" class="w-6 h-6" />
              </div>
            </div>
            <!-- Checkboxes -->
            <div class="flex flex-col gap-4 ps-2">
              <div class="flex items-center justify-between">
                <BaseCheckbox value="all" label="Basic" shape="rounded" />
                <BaseTag color="primary" shape="full" class="text-xs" size="sm"> 28 </BaseTag>
              </div>
              <div class="flex items-center justify-between">
                <BaseCheckbox value="all" label="Advanced" shape="rounded" />
                <BaseTag color="primary" shape="full" class="text-xs" size="sm"> 28 </BaseTag>
              </div>
              <div class="flex items-center justify-between">
                <BaseCheckbox value="all" label="Expert" shape="rounded" />
                <BaseTag color="primary" shape="full" class="text-xs" size="sm"> 28 </BaseTag>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 md:col-span-9">
        <div>
          <div v-if="!pending && data?.data.length === 0">
            <BasePlaceholderPage
              title="No matching results"
              subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
            >
              <template #image>
                <img
                  class="block dark:hidden"
                  src="/img/illustrations/placeholders/flat/placeholder-search-7.svg"
                  alt="Placeholder image"
                />
                <img
                  class="hidden dark:block"
                  src="/img/illustrations/placeholders/flat/placeholder-search-7-dark.svg"
                  alt="Placeholder image"
                />
              </template>
            </BasePlaceholderPage>
          </div>
          <div v-else>
            <div class="ltablet:grid-cols-3 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TransitionGroup
                enter-active-class="transform-gpu"
                enter-from-class="opacity-0 -translate-x-full"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="absolute transform-gpu"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-full"
              >
                <BaseCard shape="curved" class="p-2 shadow-md pb-16">
                  <BaseCard class="mb-2 flex justify-between gap-4 p-1 px-2 items-center">
                    <div>
                      <p class="text-xs text-primary-500 dark:text-muted-100">Puzzle game</p>
                    </div>

                    <div class="flex gap-1">
                      <Icon name="material-symbols:android" class="text-muted-400 block w-4 h-4" />
                      <Icon name="ic:baseline-apple" class="text-muted-400 block w-4 h-4" />
                      <Icon name="quill:desktop" class="text-muted-400 block w-4 h-4" />
                      <Icon name="tabler:brand-xbox" class="text-muted-400 block w-4 h-4" />
                    </div>
                  </BaseCard>
                  <div class="h-32 relative">
                    <div class="absolute top-2 right-2">
                      <BaseTag
                        :color="difficultyColor('Basic')"
                        shape="curved"
                        size="sm"
                        class="capitalize"
                      >
                        Basic
                      </BaseTag>
                    </div>
                    <img
                      src="/img/school/ga-banner-1.jpg"
                      alt="image"
                      class="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <div class="mt-4">
                    <p class="text-xs text-muted-400">End of term / Seasonal</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="leading-none">
                      <h4
                        class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                      >
                        Tournamet name
                      </h4>
                    </div>
                    <div class="flex gap-4 items-center">
                      <BaseTag
                        shape="curved"
                        size="sm"
                        class="!bg-primary-50 !text-primary-500 !border-none"
                      >
                        Age 7+
                      </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 flex-wrap">
                      <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 justify-between items-center">
                      <div
                        class="flex-1 text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                      >
                        22/04/2024 - 29/04/2024
                      </div>
                      <div>
                        <BaseTag color="success" shape="curved" size="sm" class="capitalize">
                          5 Days more
                        </BaseTag>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-5 items-center">
                      <BaseProgress
                        title="Default progress bar"
                        size="xs"
                        :value="50"
                        color="primary"
                      />
                      <span class="text-muted-800 dark:text-muted-100 block text-xs"> 50% </span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <BaseButton
                      type="button"
                      color="primary"
                      class="w-full !rounded-full !text-sm"
                      size="sm"
                    >
                      Resume
                    </BaseButton>
                  </div>
                  <div
                    class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
                  >
                    <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                      4567 Students playing
                    </h4>

                    <div>
                      <BaseAvatar size="xxs" class="border-2 border-white">
                        <img src="/img/avatars/15.svg" rounded="full" alt="" class="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/14.svg" rounded="full" alt="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/13.svg" rounded="full" alt="" />
                      </BaseAvatar>
                    </div>
                  </div>
                </BaseCard>
                <BaseCard shape="curved" class="p-2 shadow-md pb-16">
                  <BaseCard class="mb-2 flex justify-between gap-4 p-1 px-2 items-center">
                    <div>
                      <p class="text-xs text-primary-500 dark:text-muted-100">Puzzle game</p>
                    </div>

                    <div class="flex gap-1">
                      <Icon name="material-symbols:android" class="text-muted-400 block w-4 h-4" />
                      <Icon name="ic:baseline-apple" class="text-muted-400 block w-4 h-4" />
                      <Icon name="quill:desktop" class="text-muted-400 block w-4 h-4" />
                      <Icon name="tabler:brand-xbox" class="text-muted-400 block w-4 h-4" />
                    </div>
                  </BaseCard>
                  <div class="h-32 relative">
                    <div class="absolute top-2 right-2">
                      <BaseTag
                        :color="difficultyColor('Advanced')"
                        shape="curved"
                        size="sm"
                        class="capitalize"
                      >
                        Advanced
                      </BaseTag>
                    </div>
                    <img
                      src="/img/school/ga-banner-1.jpg"
                      alt="image"
                      class="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <div class="mt-4">
                    <p class="text-xs text-muted-400">End of term / Seasonal</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="leading-none">
                      <h4
                        class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                      >
                        Tournamet name
                      </h4>
                    </div>
                    <div class="flex gap-4 items-center">
                      <BaseTag
                        shape="curved"
                        size="sm"
                        class="!bg-primary-50 !text-primary-500 !border-none"
                      >
                        Age 7+
                      </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 flex-wrap">
                      <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 justify-between items-center">
                      <div
                        class="flex-1 text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                      >
                        22/04/2024 - 29/04/2024
                      </div>
                      <div>
                        <BaseTag color="success" shape="curved" size="sm" class="capitalize">
                          5 Days more
                        </BaseTag>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-5 items-center">
                      <BaseProgress
                        title="Default progress bar"
                        size="xs"
                        :value="50"
                        color="primary"
                      />
                      <span class="text-muted-800 dark:text-muted-100 block text-xs"> 50% </span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <BaseButton
                      type="button"
                      color="primary"
                      class="w-full !rounded-full !text-sm"
                      size="sm"
                    >
                      Resume
                    </BaseButton>
                  </div>
                  <div
                    class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
                  >
                    <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                      4567 Students playing
                    </h4>

                    <div>
                      <BaseAvatar size="xxs" class="border-2 border-white">
                        <img src="/img/avatars/15.svg" rounded="full" alt="" class="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/14.svg" rounded="full" alt="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/13.svg" rounded="full" alt="" />
                      </BaseAvatar>
                    </div>
                  </div>
                </BaseCard>
                <BaseCard shape="curved" class="p-2 shadow-md pb-16">
                  <BaseCard class="mb-2 flex justify-between gap-4 p-1 px-2 items-center">
                    <div>
                      <p class="text-xs text-primary-500 dark:text-muted-100">Puzzle game</p>
                    </div>

                    <div class="flex gap-1">
                      <Icon name="material-symbols:android" class="text-muted-400 block w-4 h-4" />
                      <Icon name="ic:baseline-apple" class="text-muted-400 block w-4 h-4" />
                      <Icon name="quill:desktop" class="text-muted-400 block w-4 h-4" />
                      <Icon name="tabler:brand-xbox" class="text-muted-400 block w-4 h-4" />
                    </div>
                  </BaseCard>
                  <div class="h-32 relative">
                    <div class="absolute top-2 right-2">
                      <BaseTag
                        :color="difficultyColor('Expert')"
                        shape="curved"
                        size="sm"
                        class="capitalize"
                      >
                        Expert
                      </BaseTag>
                    </div>
                    <img
                      src="/img/school/ga-banner-1.jpg"
                      alt="image"
                      class="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <div class="mt-4">
                    <p class="text-xs text-muted-400">End of term / Seasonal</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="leading-none">
                      <h4
                        class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                      >
                        Tournamet name
                      </h4>
                    </div>
                    <div class="flex gap-4 items-center">
                      <BaseTag
                        shape="curved"
                        size="sm"
                        class="!bg-primary-50 !text-primary-500 !border-none"
                      >
                        Age 7+
                      </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 flex-wrap">
                      <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 justify-between items-center">
                      <div
                        class="flex-1 text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                      >
                        22/04/2024 - 29/04/2024
                      </div>
                      <div>
                        <BaseTag color="success" shape="curved" size="sm" class="capitalize">
                          5 Days more
                        </BaseTag>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-5 items-center">
                      <BaseProgress
                        title="Default progress bar"
                        size="xs"
                        :value="50"
                        color="primary"
                      />
                      <span class="text-muted-800 dark:text-muted-100 block text-xs"> 50% </span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <BaseButton
                      type="button"
                      color="primary"
                      class="w-full !rounded-full !text-sm"
                      size="sm"
                    >
                      Resume
                    </BaseButton>
                  </div>
                  <div
                    class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
                  >
                    <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                      4567 Students playing
                    </h4>

                    <div>
                      <BaseAvatar size="xxs" class="border-2 border-white">
                        <img src="/img/avatars/15.svg" rounded="full" alt="" class="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/14.svg" rounded="full" alt="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/13.svg" rounded="full" alt="" />
                      </BaseAvatar>
                    </div>
                  </div>
                </BaseCard>
                <BaseCard shape="curved" class="p-2 shadow-md pb-16">
                  <BaseCard class="mb-2 flex justify-between gap-4 p-1 px-2 items-center">
                    <div>
                      <p class="text-xs text-primary-500 dark:text-muted-100">Puzzle game</p>
                    </div>

                    <div class="flex gap-1">
                      <Icon name="material-symbols:android" class="text-muted-400 block w-4 h-4" />
                      <Icon name="ic:baseline-apple" class="text-muted-400 block w-4 h-4" />
                      <Icon name="quill:desktop" class="text-muted-400 block w-4 h-4" />
                      <Icon name="tabler:brand-xbox" class="text-muted-400 block w-4 h-4" />
                    </div>
                  </BaseCard>
                  <div class="h-32 relative">
                    <div class="absolute top-2 right-2">
                      <BaseTag
                        :color="difficultyColor('Basic')"
                        shape="curved"
                        size="sm"
                        class="capitalize"
                      >
                        Basic
                      </BaseTag>
                    </div>
                    <img
                      src="/img/school/ga-banner-1.jpg"
                      alt="image"
                      class="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <div class="mt-4">
                    <p class="text-xs text-muted-400">End of term / Seasonal</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="leading-none">
                      <h4
                        class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                      >
                        Tournamet name
                      </h4>
                    </div>
                    <div class="flex gap-4 items-center">
                      <BaseTag
                        shape="curved"
                        size="sm"
                        class="!bg-primary-50 !text-primary-500 !border-none"
                      >
                        Age 7+
                      </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 flex-wrap">
                      <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 justify-between items-center">
                      <div
                        class="flex-1 text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                      >
                        22/04/2024 - 29/04/2024
                      </div>
                      <div>
                        <BaseTag color="success" shape="curved" size="sm" class="capitalize">
                          5 Days more
                        </BaseTag>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-5 items-center">
                      <BaseProgress
                        title="Default progress bar"
                        size="xs"
                        :value="50"
                        color="primary"
                      />
                      <span class="text-muted-800 dark:text-muted-100 block text-xs"> 50% </span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <BaseButton
                      type="button"
                      color="primary"
                      class="w-full !rounded-full !text-sm"
                      size="sm"
                    >
                      Resume
                    </BaseButton>
                  </div>
                  <div
                    class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
                  >
                    <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                      4567 Students playing
                    </h4>

                    <div>
                      <BaseAvatar size="xxs" class="border-2 border-white">
                        <img src="/img/avatars/15.svg" rounded="full" alt="" class="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/14.svg" rounded="full" alt="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/13.svg" rounded="full" alt="" />
                      </BaseAvatar>
                    </div>
                  </div>
                </BaseCard>
                <BaseCard shape="curved" class="p-2 shadow-md pb-16">
                  <BaseCard class="mb-2 flex justify-between gap-4 p-1 px-2 items-center">
                    <div>
                      <p class="text-xs text-primary-500 dark:text-muted-100">Puzzle game</p>
                    </div>

                    <div class="flex gap-1">
                      <Icon name="material-symbols:android" class="text-muted-400 block w-4 h-4" />
                      <Icon name="ic:baseline-apple" class="text-muted-400 block w-4 h-4" />
                      <Icon name="quill:desktop" class="text-muted-400 block w-4 h-4" />
                      <Icon name="tabler:brand-xbox" class="text-muted-400 block w-4 h-4" />
                    </div>
                  </BaseCard>
                  <div class="h-32 relative">
                    <div class="absolute top-2 right-2">
                      <BaseTag
                        :color="difficultyColor('Basic')"
                        shape="curved"
                        size="sm"
                        class="capitalize"
                      >
                        Basic
                      </BaseTag>
                    </div>
                    <img
                      src="/img/school/ga-banner-1.jpg"
                      alt="image"
                      class="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <div class="mt-4">
                    <p class="text-xs text-muted-400">End of term / Seasonal</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="leading-none">
                      <h4
                        class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                      >
                        Tournamet name
                      </h4>
                    </div>
                    <div class="flex gap-4 items-center">
                      <BaseTag
                        shape="curved"
                        size="sm"
                        class="!bg-primary-50 !text-primary-500 !border-none"
                      >
                        Age 7+
                      </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 flex-wrap">
                      <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 justify-between items-center">
                      <div
                        class="flex-1 text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                      >
                        22/04/2024 - 29/04/2024
                      </div>
                      <div>
                        <BaseTag color="success" shape="curved" size="sm" class="capitalize">
                          5 Days more
                        </BaseTag>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-5 items-center">
                      <BaseProgress
                        title="Default progress bar"
                        size="xs"
                        :value="50"
                        color="primary"
                      />
                      <span class="text-muted-800 dark:text-muted-100 block text-xs"> 50% </span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <BaseButton
                      type="button"
                      color="primary"
                      class="w-full !rounded-full !text-sm"
                      size="sm"
                    >
                      Resume
                    </BaseButton>
                  </div>
                  <div
                    class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
                  >
                    <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                      4567 Students playing
                    </h4>

                    <div>
                      <BaseAvatar size="xxs" class="border-2 border-white">
                        <img src="/img/avatars/15.svg" rounded="full" alt="" class="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/14.svg" rounded="full" alt="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/13.svg" rounded="full" alt="" />
                      </BaseAvatar>
                    </div>
                  </div>
                </BaseCard>
                <BaseCard shape="curved" class="p-2 shadow-md pb-16">
                  <BaseCard class="mb-2 flex justify-between gap-4 p-1 px-2 items-center">
                    <div>
                      <p class="text-xs text-primary-500 dark:text-muted-100">Puzzle game</p>
                    </div>

                    <div class="flex gap-1">
                      <Icon name="material-symbols:android" class="text-muted-400 block w-4 h-4" />
                      <Icon name="ic:baseline-apple" class="text-muted-400 block w-4 h-4" />
                      <Icon name="quill:desktop" class="text-muted-400 block w-4 h-4" />
                      <Icon name="tabler:brand-xbox" class="text-muted-400 block w-4 h-4" />
                    </div>
                  </BaseCard>
                  <div class="h-32 relative">
                    <div class="absolute top-2 right-2">
                      <BaseTag
                        :color="difficultyColor('Basic')"
                        shape="curved"
                        size="sm"
                        class="capitalize"
                      >
                        Basic
                      </BaseTag>
                    </div>
                    <img
                      src="/img/school/ga-banner-1.jpg"
                      alt="image"
                      class="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <div class="mt-4">
                    <p class="text-xs text-muted-400">End of term / Seasonal</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="leading-none">
                      <h4
                        class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                      >
                        Tournamet name
                      </h4>
                    </div>
                    <div class="flex gap-4 items-center">
                      <BaseTag
                        shape="curved"
                        size="sm"
                        class="!bg-primary-50 !text-primary-500 !border-none"
                      >
                        Age 7+
                      </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 flex-wrap">
                      <BaseTag rounded="md" size="sm"> Label one</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label two </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label three</BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                      <BaseTag rounded="md" size="sm"> Label </BaseTag>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-2 justify-between items-center">
                      <div
                        class="flex-1 text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                      >
                        22/04/2024 - 29/04/2024
                      </div>
                      <div>
                        <BaseTag color="success" shape="curved" size="sm" class="capitalize">
                          5 Days more
                        </BaseTag>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-5 items-center">
                      <BaseProgress
                        title="Default progress bar"
                        size="xs"
                        :value="50"
                        color="primary"
                      />
                      <span class="text-muted-800 dark:text-muted-100 block text-xs"> 50% </span>
                    </div>
                  </div>
                  <div class="mt-4">
                    <BaseButton
                      type="button"
                      color="primary"
                      class="w-full !rounded-full !text-sm"
                      size="sm"
                    >
                      Resume
                    </BaseButton>
                  </div>
                  <div
                    class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
                  >
                    <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">
                      4567 Students playing
                    </h4>

                    <div>
                      <BaseAvatar size="xxs" class="border-2 border-white">
                        <img src="/img/avatars/15.svg" rounded="full" alt="" class="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/14.svg" rounded="full" alt="" />
                      </BaseAvatar>
                      <BaseAvatar size="xxs" class="-ms-2 border-2 border-white">
                        <img src="/img/avatars/13.svg" rounded="full" alt="" />
                      </BaseAvatar>
                    </div>
                  </div>
                </BaseCard>
              </TransitionGroup>
            </div>
            <div class="mt-6">
              <BasePagination
                :total-items="data?.total ?? 0"
                :item-per-page="perPage"
                :current-page="page"
                shape="curved"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
