<script setup>
definePageMeta({
  title: 'Information Hub',
  middleware: ['auth'],
})
</script>

<template>
  <TairoContentWrapper>
    <div class="flex gap-4 lg:items-center justify-between py-4 my-2 flex-col lg:flex-row">
      <div>
        <BaseHeading
          tag="h2"
          size="md"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
        >
          Academic Resources Directory
        </BaseHeading>

        <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
          Browse and access a comprehensive collection of esports educational resources at ease.
        </BaseText>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton color="primary" class="w-full sm:w-32" to="/information-hub/add-post">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add New</span>
        </BaseButton>
      </div>
    </div>

    <BaseTabSlider
      v-slot="{ activeValue }"
      model-value="active"
      :tabs="[
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Deactivated', value: 'deactivated' },
      ]"
    >
      <div v-if="activeValue === 'active'">
        <informationHubActive />
      </div>

      <div v-else-if="activeValue === 'draft'">
        <informationHubDraft />
      </div>

      <div v-else-if="activeValue === 'deactivated'">
        <informationHubDeactivated />
      </div>
    </BaseTabSlider>
  </TairoContentWrapper>
</template>
