<script setup lang="ts">
import { ref } from 'vue'
import { refDebounced } from '@vueuse/core'

definePageMeta({
  title: 'Notifications',
  middleware: ['auth'],
})

const notifications = ref()

notifications.value = [
  {
    id: 1,
    user: {
      name: 'Melany L.',
      src: '/img/avatars/25.svg',
      text: 'ML',
    },
    date: 'Mar 2, 2023',
    time: '11:28 am',
    status: 0,
    target: {
      type: 'project',
      name: 'Delivery App',
      url: '/layouts/projects/details/delivery-app-project',
      text: 'made some changes to the',
    },
  },
  {
    id: 2,
    user: {
      name: 'Kendra W.',
      src: '/img/avatars/10.svg',
      text: 'KW',
    },
    date: 'Feb 28, 2023',
    time: '2:14 pm',
    status: 0,
    target: {
      type: 'project',
      name: 'Delivery App',
      url: '/layouts/projects/details/delivery-app-project',
      text: 'left a comment on a task, in the',
    },
  },
  {
    id: 3,
    user: {
      name: 'Hermann M.',
      src: '/img/avatars/16.svg',
      text: 'HM',
    },
    date: 'Feb 28, 2023',
    time: '5:29 pm',
    status: 1,
    target: {
      type: 'project',
      name: 'Resume management app',
      url: '/layouts/projects/details/resume-management-mobile-app',
      text: 'Invited 3 persons to the',
    },
  },
  {
    id: 4,
    user: {
      name: 'John B.',
      src: '/img/avatars/8.svg',
      text: 'JB',
    },
    date: 'Feb 28, 2023',
    time: '6:12 pm',
    status: 1,
    target: {
      type: 'project',
      name: 'Delivery App',
      url: '/layouts/projects/details/delivery-app-project',
      text: 'Changed the status of a task, in the',
    },
  },
  {
    id: 5,
    user: {
      name: 'Clarissa M.',
      src: '/img/avatars/5.svg',
      text: 'JB',
    },
    date: 'Feb 27, 2023',
    time: '9:47 am',
    status: 1,
    target: {
      type: 'project',
      name: 'Delivery App',
      url: '/layouts/projects/details/delivery-app-project',
      text: 'Uploaded 3 new files, in the',
    },
  },
  {
    id: 6,
    user: {
      name: 'Betty D.',
      src: '/img/avatars/24.svg',
      text: 'BD',
    },
    date: 'Feb 26, 2023',
    time: '10:19 am',
    status: 1,
    target: {
      type: 'project',
      name: 'Resume management app',
      url: '/layouts/projects/details/resume-management-mobile-app',
      text: 'mentionned you in a comment, in the',
    },
  },
  {
    id: 7,
    user: {
      name: 'Howard C.',
      src: '/img/avatars/20.svg',
      text: 'HC',
    },
    date: 'Feb 25, 2023',
    time: '11:27 am',
    status: 0,
    target: {
      type: 'project',
      name: 'Delivery App',
      url: '/layouts/projects/details/delivery-app-project',
      text: 'left a comment on a task, in the',
    },
  },
  {
    id: 8,
    user: {
      name: 'John B.',
      src: '/img/avatars/8.svg',
      text: 'JB',
    },
    date: 'Feb 25, 2023',
    time: '3:19 pm',
    status: 1,
    target: {
      type: 'project',
      name: 'Delivery App',
      url: '/layouts/projects/details/delivery-app-project',
      text: 'Changed the status of a task, in the',
    },
  },
]
</script>

<template>
  <BaseTabs
    class="tab-number"
    model-value="all"
    :tabs="[
      { label: 'All', value: 'all', icon: '5' },
      { label: 'Admin', value: 'admin', icon: '20' },
      { label: 'School', value: 'school', icon: '3' },
      { label: 'Student', value: 'student' },
      { label: 'Task', value: 'task' },
      { label: 'Tournament', value: 'tournament' },
    ]"
  >
    <template #tab="{ activeValue }">
      <div v-if="activeValue === 'all'" class="">
        <div class="flex items-center justify-between py-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              ALL Notifications
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Customise user access and permissions for each segment
            </BaseText>
          </div>
        </div>
        <div class="min-h-screen overflow-hidden">
          <div class="w-full max-w-4xl pt-8">
            <div v-if="notifications.length === 0"></div>
            <div v-else class="">
              <div
                v-for="item in notifications"
                :key="item.id"
                class="ltablet:after:start-[104px] after:border-muted-300 dark:after:border-muted-800 relative flex items-center gap-4 after:absolute after:start-[8px] after:top-3 after:h-full after:w-px after:border-e-2 after:content-[''] lg:after:start-[104px] [&:not(:first-child)]:pt-3"
              >
                <div class="ltablet:block hidden w-24 text-right lg:block">
                  <BaseText size="xs" class="text-muted-400">
                    {{ item.date }}
                  </BaseText>
                </div>
                <div class="dark:bg-muted-800 relative z-10 h-4 w-4 shrink-0 rounded-full bg-white">
                  <div
                    class="h-4 w-4 rounded-full border-2 border-current"
                    :class="getRandomColor()"
                  ></div>
                </div>

                <BaseCard class="p-4">
                  <div class="flex w-full items-center gap-4">
                    <div class="">
                      <Icon
                        name="ph:check-circle-duotone"
                        class="w-5 h-5"
                        :class="
                          item.status === 0
                            ? 'text-primary-500'
                            : 'text-muted-300 dark:bg-muted-700/50'
                        "
                      />
                    </div>
                    <BaseAvatar :src="item.user.src" size="sm" />
                    <div>
                      <BaseText size="sm" lead="tight">
                        <span class="text-muted-800 dark:text-muted-100"
                          >{{ item.user.name }}&nbsp;</span
                        >
                        <span class="text-muted-500 dark:text-muted-400"
                          >{{ item.target.text }}&nbsp;</span
                        >
                        <NuxtLink
                          :to="item.target.url"
                          class="text-primary-500 underline-offset-4 hover:underline"
                          >{{ item.target.name }}</NuxtLink
                        >
                        <span class="text-muted-500 dark:text-muted-400"
                          >&nbsp;{{ item.target.type }}</span
                        >
                      </BaseText>
                      <BaseText size="xs" class="text-muted-400">
                        <span class="ltablet:hidden lg:hidden">{{ item.date }}</span>
                        <span class="ltablet:hidden px-2 lg:hidden">&middot;</span>
                        <span>{{ item.time }}</span>
                      </BaseText>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </div>
          </div>
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
      <div v-else-if="activeValue === 'admin'" class="">Same as all</div>
      <div v-else-if="activeValue === 'school'" class="">Same as all</div>
      <div v-else-if="activeValue === 'student'" class="">Same as all</div>
      <div v-else-if="activeValue === 'task'" class="">Same as all</div>
      <div v-else-if="activeValue === 'tournament'" class="">Same as all</div>
    </template>
  </BaseTabs>
</template>
