<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  title: 'Knowledge center',
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

const titles = ref([
  'Exploring the World of Adventure Games',
  'Solving Puzzles in Puzzle Games',
  'Mastering Strategy in Strategy Games',
  'Simulating Reality: Simulation Games',
  'Embarking on Epic Journeys in RPGs',
  'Racing to Victory in Racing Games',
  'Scoring Goals in Sports Games',
  'Jumping and Running in Platformer Games',
  'Taking Action in Action-Packed Games',
  'Learning and Fun with Educational Games',
])

const segmentValue = ref({
  id: 1,
  name: 'Gaming Education',
  icon: 'ph:game-controller',
})

const segments = [
  {
    id: 1,
    name: 'Gaming Education',
    icon: 'ph:game-controller',
  },
  {
    id: 2,
    name: 'Webinars',
    icon: 'ph:airplane-duotone',
  },
  {
    id: 3,
    name: 'BTECs Tasks',
    icon: 'mdi:smoke-detector-outline',
  },
]

const people = [
  {
    src: '/img/avatars/19.svg',
  },
  {
    src: '/img/avatars/16.svg',
  },
  {
    src: '/img/avatars/3.svg',
  },
  {
    src: '/img/avatars/22.svg',
  },
  {
    src: '/img/avatars/2.svg',
  },
]

const activePosts = ref('adventure-games')
</script>

<template>
  <BaseCard class="px-4 pt-4 pb-12">
    <!-- MAIN BANNER -->
    <div class="rounded-lg relative py-6">
      <div
        class="bg-gradient-to-r from-primary-400 to-pink-600 w-full h-full absolute inset-0 rounded-xl"
      ></div>
      <div class="relative px-8 py-12">
        <div class="">
          <BaseHeading
            tag="h3"
            size="3xl"
            weight="medium"
            lead="none"
            class="text-white text-center"
          >
            Welocome to our knowledge center
          </BaseHeading>

          <div class="max-w-lg my-6 mx-auto">
            <!-- SEARCH -->
            <BaseAutocomplete
              :items="titles"
              icon="lucide:search"
              size="lg"
              rounded="md"
              placeholder="Try type your questions"
              clearable
            />
          </div>

          <p class="text-sm text-white text-center mx-auto max-w-lg">
            Creativity allows players to think outside the box, develop
            innovative strategies, and find unique solutions to
          </p>

          <div class="flex gap-2 sm:justify-center flex-wrap mt-6 lg:px-6">
            <BaseButtonAction
              :color="activePosts === 'adventure-games' ? 'primary' : 'default'"
              @click="activePosts = 'adventure-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Adventure Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="activePosts === 'puzzle-games' ? 'primary' : 'default'"
              @click="activePosts = 'puzzle-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Puzzle Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="activePosts === 'strategy-games' ? 'primary' : 'default'"
              @click="activePosts = 'strategy-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Strategy Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="
                activePosts === 'simulation-games' ? 'primary' : 'default'
              "
              @click="activePosts = 'simulation-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Simulation Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="activePosts === 'rpgs' ? 'primary' : 'default'"
              @click="activePosts = 'rpgs'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Role-Playing Games (RPGs) </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="activePosts === 'racing-games' ? 'primary' : 'default'"
              @click="activePosts = 'racing-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Racing Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="activePosts === 'sports-games' ? 'primary' : 'default'"
              @click="activePosts = 'sports-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Sports Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="
                activePosts === 'platformer-games' ? 'primary' : 'default'
              "
              @click="activePosts = 'platformer-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Platformer Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="activePosts === 'action-games' ? 'primary' : 'default'"
              @click="activePosts = 'action-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Action Games </span>
            </BaseButtonAction>

            <BaseButtonAction
              :color="
                activePosts === 'educational-games' ? 'primary' : 'default'
              "
              @click="activePosts = 'educational-games'"
              class="py-5 px-4"
            >
              <Icon name="heroicons:academic-cap" class="w-5 h-5 me-2" />
              <span> Educational Games </span>
            </BaseButtonAction>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="mt-12">
      <div class="grid grid-cols-12 gap-6">
        <!-- SIDEBAR -->
        <div class="col-span-12 md:col-span-3">
          <!-- SIDEBAR FILTERS -->
          <BaseCard class="px-4 py-6">
            <!-- Filter group -->
            <div class="relative">
              <!-- Title -->
              <div
                class="mb-4 p-2 flex items-center gap-4 "
              >
                <BaseHeading
                  as="h3"
                  size="md"
                  weight="medium"
                  lead="tight"
                  class="text-muted-800 dark:text-white flex-1"
                >
                  <span>Subcategory</span>
                </BaseHeading>
              </div>
              <!-- Checkboxes -->
              <div class="flex flex-col gap-4 ps-2">
                <div class="flex items-center justify-between">
                  <BaseCheckbox
                    value="adventure"
                    label="Adventure"
                    shape="rounded"
                  />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >12</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="puzzle" label="Puzzle" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >16</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox
                    value="strategy"
                    label="Strategy"
                    shape="rounded"
                  />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >8</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox
                    value="simulation"
                    label="Simulation"
                    shape="rounded"
                  />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >10</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="rpg" label="RPG" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >14</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="racing" label="Racing" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >9</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="sports" label="Sports" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >18</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox
                    value="platformer"
                    label="Platformer"
                    shape="rounded"
                  />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >11</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="action" label="Action" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >13</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox
                    value="educational"
                    label="Educational"
                    shape="rounded"
                  />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >7</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox
                    value="multiplayer"
                    label="Multiplayer"
                    shape="rounded"
                  />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >22</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="arcade" label="Arcade" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >20</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="horror" label="Horror" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >5</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="music" label="Music" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >6</BaseTag
                  >
                </div>
                <div class="flex items-center justify-between">
                  <BaseCheckbox value="party" label="Party" shape="rounded" />
                  <BaseTag
                    color="primary"
                    shape="full"
                    class="text-xs"
                    size="sm"
                    >3</BaseTag
                  >
                </div>
              </div>
            </div>
          </BaseCard>
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
              <div
                class="ltablet:grid-cols-3 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <TransitionGroup
                  enter-active-class="transform-gpu"
                  enter-from-class="opacity-0 -translate-x-full"
                  enter-to-class="opacity-100 translate-x-0"
                  leave-active-class="absolute transform-gpu"
                  leave-from-class="opacity-100 translate-x-0"
                  leave-to-class="opacity-0 -translate-x-full"
                >
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-1.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-4.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-5.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-6.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-3.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-1.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-2.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-2.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
                    </div>
                  </BaseCard>
                  <BaseCard shape="curved" class="p-2 shadow-md">
                    <div class="h-32 relative">
                      <div class="absolute top-2 right-2">
                        <BaseTag
                          color="warning"
                          shape="curved"
                          size="sm"
                          class="capitalize"
                        >
                          Technical
                        </BaseTag>
                      </div>
                      <img
                        src="/img/school/ga-banner-2.jpg"
                        alt="image"
                        class="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h5
                          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium"
                        >
                          Secondary Category
                        </h5>
                      </div>
                      <div class="flex gap-4 items-center">
                        <p
                          class="text-muted-600 dark:text-muted-400 text-[0.6rem]"
                        >
                          5th March 2024
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <div class="leading-none">
                        <h4
                          class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          How to login to the user portal?
                        </h4>
                      </div>
                    </div>
                    <div class="mt-4">
                      <BaseButton
                        type="button"
                        color="primary"
                        class="w-fit !text-sm mb-1"
                        size="sm"
                      >
                        Read more
                      </BaseButton>
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
  </BaseCard>
</template>
