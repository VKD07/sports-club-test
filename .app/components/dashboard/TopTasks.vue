<script setup lang="ts">
const tasks = [
  {
    id: 0,
    taskName: 'Complete Math Homework',
    category: 'Mathematics',
    image: '/img/avatars/16.svg',
    avgScore: 67,
    completionRate: 85,
  },
  {
    id: 1,
    taskName: 'Write Essay',
    category: 'English',
    image: '/img/avatars/22.svg',
    avgScore: 75,
    completionRate: 90,
  },
  {
    id: 2,
    taskName: 'Study Science',
    category: 'Science',
    image: '/img/avatars/9.svg',
    avgScore: 80,
    completionRate: 75,
  },
  {
    id: 3,
    taskName: 'Practice Coding',
    category: 'Computer Science',
    image: '/img/avatars/14.svg',
    avgScore: 92,
    completionRate: 80,
  },
  {
    id: 4,
    taskName: 'Read History Book',
    category: 'History',
    image: '/img/avatars/4.svg',
    avgScore: 88,
    completionRate: 70,
  },
]
</script>

<template>
  <div class="mb-2 space-y-4">
    <div class="flex items-center gap-2 -mb-2">
      <div class="w-16">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Task</span>
      </div>
      <div class="flex-1"></div>
      <div class="w-28">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium"
          >Feedback Metrics</span
        >
      </div>
      <div class="w-20">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Drop-off Rate</span>
      </div>
      <div class="w-8"></div>
    </div>

    <div v-for="task in tasks" :key="task.id" class="flex items-center gap-2">
      <div class="w-16">
        <img :src="task.image" :alt="task.taskName" class="h-12 w-16 rounded-lg object-cover" />
      </div>

      <div class="flex-1 pe-1">
        <BaseHeading
          as="h4"
          size="sm"
          weight="medium"
          lead="tight"
          class="text-muted-700 dark:text-muted-100"
        >
          <span>{{ task.taskName }} </span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-500 dark:text-muted-400">
            {{ task.category }}
          </span>
        </BaseParagraph>
      </div>
      <div class="w-28">
        <span class="text-muted-400 font-sans text-xs">
          <BaseTag shape="full" variant="solid" color="primary" class="w-10 text-center !py-1">
            {{ task.avgScore }}</BaseTag
          >
        </span>
      </div>
      <div class="w-20">
        <span class="text-muted-500 dark:text-muted-400 font-sans text-xs">
          {{ task.completionRate }}%
        </span>
      </div>
      <div class="w-8">
        <BaseButtonIcon shape="curved" muted class="scale-75">
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </BaseButtonIcon>
      </div>
    </div>
  </div>
</template>
