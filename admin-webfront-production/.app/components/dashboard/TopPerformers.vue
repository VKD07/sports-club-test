<script setup lang="ts">
const students = [
  {
    id: 0,
    firstName: 'Hermann',
    image: '/img/avatars/16.svg',
    school: 'Springfield Elementary',
    score: 85,
    time: '1d 2h 30m',
  },
  {
    id: 1,
    firstName: 'Alice',
    image: '/img/avatars/22.svg',
    school: 'Ridgemont High School',
    score: 92,
    time: '2d 4h 15m',
  },
  {
    id: 2,
    firstName: 'John',
    image: '/img/avatars/9.svg',
    school: 'Hogwarts School of Witchcraft and Wizardry',
    score: 78,
    time: '1d 18h 10m',
  },
  {
    id: 3,
    firstName: 'Emily',
    image: '/img/avatars/14.svg',
    school: 'Xavier Institute for Higher Learning',
    score: 96,
    time: '3d 6h 45m',
  },
  {
    id: 4,
    firstName: 'Michael',
    image: '/img/avatars/4.svg',
    school: 'Sunnydale High School',
    score: 70,
    time: '1d 10h 20m',
  },
]
</script>

<template>
  <div class="mb-2 space-y-4">
    <div class="flex items-center gap-2 -mb-2">
      <div class="w-10">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Student</span>
      </div>
      <div class="flex-1"></div>
      <div class="w-16">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Avg Score</span>
      </div>
      <div class="w-20">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Time Spend</span>
      </div>
      <div class="w-8"></div>
    </div>

    <div v-for="student in students" :key="student.id" class="flex items-center gap-2">
      <div class="w-10">
        <BaseAvatar
          :src="student.image"
          shape="straight"
          mask="blob"
          class="bg-primary-100 dark:bg-primary-500/20 text-primary-500"
        />
      </div>

      <div class="flex-1 pe-1">
        <BaseHeading
          as="h4"
          size="sm"
          weight="medium"
          lead="tight"
          class="text-muted-700 dark:text-muted-100"
        >
          <span>{{ student.firstName }} </span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-500 dark:text-muted-400">
            {{ student.school }}
          </span>
        </BaseParagraph>
      </div>
      <div class="w-16">
        <span class="text-muted-400 font-sans text-xs">
          <BaseTag shape="full" variant="solid" color="primary" class="w-10 text-center !py-1">
            {{ student.score }}</BaseTag
          >
        </span>
      </div>
      <div class="w-20">
        <span class="text-muted-500 dark:text-muted-400 font-sans text-xs">
          {{ student.time }}
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
