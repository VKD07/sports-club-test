<script setup lang="ts">
const tournamentList = [
  {
    name: 'Tournament 1',
    theme: 'Theme 1',
    remainingTime: '5 days more',
    date: '22/04/2024 - 29/04/2024',
    completion: '46',
    icons: ['material-symbols:android', 'ic:baseline-apple', 'quill:desktop', 'tabler:brand-xbox'],
    position: 1,
    image: '/img/apps/1.jpg',
    status: 'pause',
  },
  {
    name: 'Tournament 2',
    theme: 'Theme 2',
    remainingTime: '3 days more',
    date: '22/04/2024 - 29/04/2024',
    completion: '55',
    icons: ['material-symbols:android', 'ic:baseline-apple', 'quill:desktop', 'tabler:brand-xbox'],
    position: 2,
    image: '/img/apps/4.jpg',
    status: 'pause',
  },
  {
    name: 'Tournament 3',
    theme: 'Theme 3',
    remainingTime: '4 days more',
    date: '22/04/2024 - 29/04/2024',
    completion: '36',
    icons: ['material-symbols:android', 'ic:baseline-apple', 'quill:desktop', 'tabler:brand-xbox'],
    position: 3,
    image: '/img/apps/3.jpg',
    status: 'resume',
  },
]
</script>

<template>
  <BasePlaceholderPage
    title="There are no active tournaments at this time. "
    subtitle="Check back soon"
  >
    <template #image>
      <img class="block dark:hidden" src="/img/placeholders/PH 3.png" alt="Placeholder image" />

      <img class="hidden dark:block" src="/img/placeholders/PH 3.png" alt="Placeholder image" />
    </template>
  </BasePlaceholderPage>
  <!-- <BaseCard class="p-6 pb-10 mt-6">
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading tag="h2" size="md" weight="medium" lead="normal" class="uppercase tracking-wider text-primary-500 dark:text-muted-100">
          Tournament
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400"> Customize user access and permissions for each segment </BaseText>
      </div>
    </div>

    <div>
      <div class="ltablet:grid-cols-3 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-full"
        >
          <StudentsTournamentCard v-for="(tournament, index) in tournamentList" :key="index" :tournament="tournament" />
        </TransitionGroup>
      </div>
    </div>
  </BaseCard>

  <StudentsTournamentHistory /> -->
</template>
