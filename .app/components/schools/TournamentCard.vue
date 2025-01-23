<template>
  <BaseCard shape="curved" class="p-4 shadow-md pb-16">
    <div>
      <img :src="tournament.image" alt="image" class="rounded-lg" />
    </div>

    <div class="flex items-center justify-between mt-4">
      <div class="leading-none">
        <h4 class="text-primary-500 dark:text-muted-100 font-sans text-sm font-medium">{{ tournament.name }}</h4>
        <p class="text-muted-600 dark:text-muted-400 font-sans text-xs">{{ tournament.theme }}</p>
      </div>

      <div class="flex gap-4 items-center">
        <div>
          <BaseTag shape="full" variant="pastel" color="success" size="sm" class="capitalize">{{ tournament.remainingTime }}</BaseTag>
        </div>

        <div>
          <BaseDropdown flavor="context" label="Dropdown" orientation="end" shape="smooth">
            <BaseDropdownItem to="/tournaments/manage" title="View" text="View tournament" shape="smooth" />

            <BaseDropdownItem
              v-if="tournament.status === 'resume'"
              title="Pause"
              text="Pause tournament"
              shape="smooth"
              @click="selectTournament(tournament, 'pause')"
            />

            <BaseDropdownItem
              v-if="tournament.status === 'pause'"
              title="Resume"
              text="Resume tournament"
              shape="smooth"
              @click="selectTournament(tournament, 'resume')"
            />
          </BaseDropdown>
        </div>
      </div>
    </div>

    <div class="mt-1">
      <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">{{ tournament.date }}</h4>
    </div>

    <div class="flex gap-4 items-center justify-between mt-4">
      <div class="flex gap-2 flex-wrap">
        <BaseTag rounded="md" size="md">
          Location
          <span class="text-primary-500 text-sm font-medium">{{ tournament.location }}</span>
        </BaseTag>
      </div>

      <div class="flex gap-1">
        <template v-for="icon in tournament.icons">
          <Icon :name="icon" class="text-muted-400 block w-5 h-5" />
        </template>
      </div>
    </div>

    <div
      class="bg-primary-50/50 dark:bg-muted-700 absolute bottom-0 left-0 w-full h-12 px-4 flex justify-between items-center gap-6 border-t border-muted-200 rounded-b-lg"
    >
      <h4 class="text-primary-500 dark:text-muted-100 font-sans text-xs font-medium">{{ tournament.participants }} People participation</h4>

      <BaseAvatarGroup size="xs" :avatars="tournament.avatars" />
    </div>
  </BaseCard>

  <BaseModal
    :isOpen="isModalPauseTournament"
    title="Pause Tournament"
    :icon="'ph:warning-octagon-bold'"
    iconColor="warning"
    :showCancelButton="true"
    :showPrimaryButton="true"
    primaryButtonColor="primary"
    :primaryButtonText="'Pause'"
    :primaryButtonAction="pauseTournament"
    :cancelButtonText="'Cancel'"
    @close="isModalPauseTournament = false"
  >
    Are you sure you want to pause this tournament?
  </BaseModal>

  <BaseModal
    :isOpen="isModalResumeTournament"
    title="Resume Tournament"
    :icon="'ph:warning-octagon-bold'"
    iconColor="warning"
    :showCancelButton="true"
    :showPrimaryButton="true"
    primaryButtonColor="primary"
    :primaryButtonText="'Resume'"
    :primaryButtonAction="resumeTournament"
    :cancelButtonText="'Cancel'"
    @close="isModalResumeTournament = false"
  >
    Are you sure you want to resume this tournament?
  </BaseModal>
</template>

<script setup>
const { tournament } = defineProps(['tournament'])

const isModalPauseTournament = ref(false)
const isModalResumeTournament = ref(false)

const selectedTournament = ref(null)

const selectTournament = (tournament, modal) => {
  selectedTournament.value = tournament
  modal === 'pause' ? (isModalPauseTournament.value = true) : (isModalResumeTournament.value = true)
}

const pauseTournament = () => {
  isModalPauseTournament.value = false
}

const resumeTournament = () => {
  isModalResumeTournament.value = false
}
</script>
