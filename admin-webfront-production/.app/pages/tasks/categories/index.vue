<script setup>
definePageMeta({
  name: 'categories',
  title: 'Category Management',
  middleware: ['auth'],
})

const route = useRoute()
const fromGame = route.query.fromGame
const fromSkill = route.query.fromSkill
const fromSegment = route.query.fromSegment

const isFromGame = ref(false)
const isFromSkill = ref(false)
const isFromSegment = ref(false)
const activeTab = ref('segments')

const tabs = [
  { label: 'Segments', value: 'segments' },
  { label: 'Core skills', value: 'coreskills' },
  { label: 'Games', value: 'games' },
]

onMounted(() => {
  isFromGame.value = fromGame !== null && fromGame === 'true'
  isFromSkill.value = fromSkill !== null && fromSkill === 'true'
  isFromSegment.value = fromSegment !== null && fromSegment === 'true'

  if (isFromSegment.value) {
    activeTab.value = 'segments'
  }

  if (isFromSkill.value) {
    activeTab.value = 'coreskills'
  }

  if (isFromGame.value) {
    activeTab.value = 'games'
  }

  window.history.replaceState({}, document.title, '/tasks/categories')
})
</script>

<template>
  <TairoContentWrapper>
    <BaseCard class="!min-h-[600px]">
      <div class="px-8 pt-8 pb-4">
        <BaseTabSlider
          v-slot="{ activeValue }"
          :model-value="activeTab"
          :tabs="tabs"
          @update:model-value="(value) => (activeTab = value)"
        >
          <div v-if="activeValue === 'segments'">
            <CategoriesSegments />
          </div>

          <div v-else-if="activeValue === 'coreskills'">
            <CategoriesSkills />
          </div>

          <div v-else-if="activeValue === 'games'">
            <CategoriesGames />
          </div>
        </BaseTabSlider>
      </div>
    </BaseCard>
  </TairoContentWrapper>
</template>
