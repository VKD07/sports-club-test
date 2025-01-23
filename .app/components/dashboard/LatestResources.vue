<script setup lang="ts">
const posts = [
  {
    id: 0,
    postName: 'How to Navigate the Education Game Application',
    category: 'User Guide',
    image: '/img/school/ga-banner-1.jpg',
    date: '5th March 2024',
    totalRead: 85,
  },
  {
    id: 1,
    postName: 'The Importance of Educational Gaming',
    category: 'Benefits',
    image: '/img/school/ga-banner-2.jpg',
    date: '8th March 2024',
    totalRead: 102,
  },
  {
    id: 2,
    postName: 'Tips for Maximizing Learning in Gaming',
    category: 'Strategies',
    image: '/img/school/ga-banner-3.jpg',
    date: '12th March 2024',
    totalRead: 76,
  },
  {
    id: 3,
    postName: 'Understanding Gamification in Education',
    category: 'Concepts',
    image: '/img/school/ga-banner-4.jpg',
    date: '15th March 2024',
    totalRead: 93,
  },
  {
    id: 4,
    postName: 'Student Success Stories in Educational Gaming',
    category: 'Inspiration',
    image: '/img/school/ga-banner-5.jpg',
    date: '18th March 2024',
    totalRead: 64,
  },
]
</script>

<template>
  <div class="mb-2 space-y-4">
    <div class="flex items-center gap-2 -mb-2">
      <div class="w-16"></div>
      <div class="flex-1"></div>
      <div class="w-20">
        <span class="text-primary-500 dark:text-primary-50 text-xs font-medium"
          >Total Reads</span
        >
      </div>
      <div class="w-8"></div>
    </div>

    <div v-for="post in posts" :key="post.id" class="flex items-center gap-2">
      <div class="w-20">
        <img
          :src="post.image"
          :alt="post.postName"
          class="h-16 w-20 rounded-lg object-cover"
        />
      </div>
      <div class="flex-1 pe-1">
        <h5
          class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium leading-none"
        >
          {{ post.category }}
        </h5>

        <h4
          class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium my-1 leading-tight"
        >
          {{ post.postName }}
        </h4>
        <p class="text-muted-600 dark:text-muted-400 text-[0.6rem]">
          {{ post.date }}
        </p>
      </div>
      <!-- <div class="flex-1 pe-1">
        <BaseHeading
          as="h4"
          size="sm"
          weight="medium"
          lead="tight"
          class="text-muted-700 dark:text-muted-100"
        >
          <span>{{ post.postName }} </span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-500 dark:text-muted-400">
            {{ post.category }}
          </span>
        </BaseParagraph>
      </div> -->
      <div class="w-20">
        <span class="text-muted-400 font-sans text-xs">
          <BaseTag
            shape="full"
            variant="solid"
            color="primary"
            class="w-14 text-center !py-1"
          >
            {{ post.totalRead }}</BaseTag
          >
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
