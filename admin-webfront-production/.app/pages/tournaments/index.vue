<script setup lang="ts">
definePageMeta({
  title: 'All Tournaments',
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
          All Tournaments
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Customize user access and permissions for each segment
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton color="primary" class="w-full sm:w-32" to="/tournaments/add">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add New</span>
        </BaseButton>
      </div>
    </div>

    <BaseCard class="!min-h-[600px]">
      <div class="px-8 pt-8 pb-4">
        <BaseTabSlider
          v-slot="{ activeValue }"
          model-value="term"
          :tabs="[
            { label: 'End of Term', value: 'term' },
            { label: 'End of Year', value: 'year' },
          ]"
        >
          <div v-if="activeValue === 'term'" class="">
            <TournamentsTerm />
          </div>

          <div v-else-if="activeValue === 'year'" class="">
            <TournamentsYear />
          </div>
        </BaseTabSlider>
      </div>
    </BaseCard>
  </TairoContentWrapper>
</template>
