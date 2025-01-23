<script setup lang="ts">
const schools = [
  {
    id: 0,
    location: 'New York',
    school: 'Mathematics Academy',
    image: '/img/avatars/16.svg',
    avgScore: 67,
    badges: [5, 4, 3, 20],
    timeSpend: '1d 10h 20m',
  },
  {
    id: 1,
    location: 'Los Angeles',
    school: 'Science High School',
    image: '/img/avatars/22.svg',
    avgScore: 75,
    badges: [10, 8, 6, 30],
    timeSpend: '1d 10h 20m',
  },
  {
    id: 2,
    location: 'Chicago',
    school: 'Art School',
    image: '/img/avatars/9.svg',
    avgScore: 80,
    badges: [3, 2, 1, 15],
    timeSpend: '1d 10h 20m',
  },
  {
    id: 3,
    location: 'Houston',
    school: 'Language Institute',
    image: '/img/avatars/14.svg',
    avgScore: 92,
    badges: [8, 6, 4, 25],
    timeSpend: '1d 10h 20m',
  },
  {
    id: 4,
    location: 'Miami',
    school: 'Music Academy',
    image: '/img/avatars/4.svg',
    avgScore: 88,
    badges: [6, 5, 4, 18],
    timeSpend: '1d 10h 20m',
  },
]
</script>

<template>
  <div class="mb-2 space-y-4">
    <div class="flex items-center gap-2 -mb-2">
      <div class="w-16">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">School</span>
      </div>
      <div class="flex-1"></div>
      <div class="w-16">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Avg Score</span>
      </div>
      <div class="w-24">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Time Spend</span>
      </div>
      <!-- <div class="w-28">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium">Badges</span>
      </div> -->
      <div class="w-8"></div>
    </div>

    <div v-for="school in schools" :key="school.id" class="flex items-center gap-2">
      <div class="w-16">
        <img :src="school.image" :alt="school.location" class="h-12 w-16 rounded-lg object-cover" />
      </div>

      <div class="flex-1 pe-1">
        <BaseHeading
          as="h4"
          size="sm"
          weight="medium"
          lead="tight"
          class="text-muted-700 dark:text-muted-100"
        >
          <span>{{ school.location }} </span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-500 dark:text-muted-400">
            {{ school.school }}
          </span>
        </BaseParagraph>
      </div>
      <div class="w-16">
        <span class="text-muted-400 font-sans text-xs">
          <BaseTag shape="full" variant="solid" color="primary" class="w-10 text-center !py-1">
            {{ school.avgScore }}</BaseTag
          >
        </span>
      </div>
      <div class="w-24">
        <span class="text-muted-500 dark:text-muted-400 font-sans text-xs">
          {{ school.timeSpend }}
        </span>
      </div>
      <!-- <div class="w-28">
        <span class="text-muted-500 dark:text-muted-400 font-sans text-xs">
          <div class="flex items-center gap-2">
            <div>
              <img src="/img/badges/Badge 1.png" class="w-5" />
              <div class="text-xs font-bold mt-1 text-center">
                {{ school.badges[0] }}
              </div>
            </div>

            <div>
              <img src="/img/badges/Badge 2.png" class="w-5" />
              <div class="text-xs font-bold mt-1 text-center">
                {{ school.badges[1] }}
              </div>
            </div>

            <div>
              <img src="/img/badges/Badge 3.png" class="w-5" />
              <div class="text-xs font-bold mt-1 text-center">
                {{ school.badges[2] }}
              </div>
            </div>

            <div>
              <img src="/img/badges/Badge 4.png" class="w-5" />
              <div class="text-xs font-bold mt-1 text-center">
                {{ school.badges[3] }}
              </div>
            </div>
          </div>
        </span>
      </div> -->
      <div class="w-8">
        <BaseButtonIcon shape="curved" muted class="scale-75">
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </BaseButtonIcon>
      </div>
    </div>
  </div>
</template>
