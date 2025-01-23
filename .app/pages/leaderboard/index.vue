<script setup lang="ts">
definePageMeta({
  name: 'leaderboard',
  title: 'Term Leaderboard',
  middleware: ['auth'],
})
</script>

<template>
  <TairoContentWrapper>
    <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Performance Ranking
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          View and manage the ranking of all students across each school, categorized by year and
          term.
        </BaseText>
      </div>
    </div>

    <div class="px-8 pt-6 pb-4">
      <BaseTabSlider
        v-slot="{ activeValue }"
        model-value="task"
        :tabs="[
          { label: 'Task', value: 'task' },
          { label: 'Tournament', value: 'tournament' },
        ]"
      >
        <div v-if="activeValue === 'task'" class="">
          <LeaderboardTask />
        </div>

        <div v-else-if="activeValue === 'tournament'" class="">
          <LeaderboardTournament />
        </div>
      </BaseTabSlider>
    </div>
  </TairoContentWrapper>
</template>
