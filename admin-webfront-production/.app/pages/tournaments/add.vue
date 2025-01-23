<script setup lang="ts">
definePageMeta({
  title: 'Add Tournament',
  middleware: ['auth'],
})

const addTournamentBreadcrumb = [
  {
    label: 'Tournaments',
    hideLabel: false,
    to: '/tournaments',
  },
  {
    label: 'Add New',
    hideLabel: false,
  },
]

const field = reactive({
  schoolName: '',
  numberOfStudents: 0,
})

const tournamentType = ['Learderboard', 'Knockout']
const tournamentTheme = ['Mandantrry', 'Seasonal']
const difficulty = ['Basic', 'Advanced', 'Expert']

const eligibleSchools = ['All Schools', 'School 1', 'School 2', 'School 3']
const exceptionSchools = ['School 1', 'School 2', 'School 3']
const eligibiltyCriteria = ['All students', 'Term performance']
const term = ['1st Term', '2nd Term', '3rd Term']

const termCalendar = ['EECA-1', 'EECA-2', 'EECA-3']
const games = ['Game 1', 'Game 2', 'Game 3', 'Game 4']
const age = [7, 8, 9, 10, 11, 12, 13, 14]
const skills = ['Skill 1', 'Skill 2', 'Skill 3']

const consoles = [
  {
    name: 'Android',
    subText: '(Mobile/Tablet)',
    icon: 'material-symbols:android',
  },
  {
    name: 'Apple',
    subText: '(Mobile/Tablet)',
    icon: 'ic:baseline-apple',
  },
  {
    name: 'PC/Laptop',
    subText: '(Microsoft)',
    icon: 'quill:desktop',
  },
  {
    name: 'Xbox',
    subText: '',
    icon: 'tabler:brand-xbox',
  },
  {
    name: 'Play station',
    subText: '',
    icon: 'mdi:sony-playstation',
  },
]

const toaster = useToaster()

const success = ref(false)
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addTournamentBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form
      method="POST"
      action=""
      class="w-full pb-16"
      @submit.prevent="onSubmit"
    >
      <div class="flex items-center justify-between px-8 py-8 pb-4">
        <div>
          <BaseHeading
            tag="h2"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Create a tournament
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Customise user access and permissions for each segment
          </BaseText>

          <BaseMessage
            class="mt-10"
            v-if="fieldsWithErrors"
            type="danger"
            @close="() => setErrors({})"
          >
            This form has {{ fieldsWithErrors }} errors, please check them
            before submitting
          </BaseMessage>
        </div>
      </div>

      <!-- TOURNAMENT DETAILS -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8">
          <TairoFormGroup label="Tournament details">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-6">
                <BaseListbox
                  label="Tournament type"
                  :items="tournamentType"
                  placeholder="Select type"
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <BaseListbox
                  label="Tournament theme"
                  :items="tournamentTheme"
                  placeholder="Select theme"
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <BaseInput
                  type="text"
                  icon="iconoir:tournament"
                  label="Tournament Name"
                  placeholder="Tornament name"
                />
              </div>

              <div class="col-span-12 sm:col-span-6">
                <BaseListbox
                  label="Difficulty level"
                  :items="difficulty"
                  placeholder="Select difficulty"
                />
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Tournament main banner</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Main Banner</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Thumbnail image</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Thumbnail Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Eligible school</label
                >
                <div class="grid grid-cols-2 gap-6 mt-1">
                  <BaseRadio
                    label="All schools"
                    name="eligible-school"
                    value="all"
                    color="primary"
                  />

                  <BaseRadio
                    label="Induvidual"
                    name="eligible-school"
                    value="induvidual"
                    color="primary"
                  />
                </div>
              </div>

              <div class="col-span-12 sm:col-span-12">
                <BaseAutocomplete
                  :items="exceptionSchools"
                  rounded="md"
                  icon="heroicons:building-library"
                  placeholder="Search school"
                  label="Except schools"
                  multiple
                />
              </div>

              <div class="col-span-12 sm:col-span-12">
                <BaseAutocomplete
                  :items="eligibleSchools"
                  rounded="md"
                  icon="heroicons:building-library"
                  placeholder="Search school"
                  label="School"
                  multiple
                />
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Eligible criteria</label
                >
                <div class="grid grid-cols-2 gap-6 mt-1">
                  <BaseRadio
                    label="All students"
                    name="eligible-criteria"
                    value="all"
                    color="primary"
                  />

                  <BaseRadio
                    label="Term performance"
                    name="eligible-criteria"
                    value="term"
                    color="primary"
                  />
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <BaseListbox
                  label="Term"
                  :items="term"
                  placeholder="Select term"
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <BaseInput
                  label="Start Date & Time"
                  type="text"
                  placeholder="Date & Time (DD/MM/YYYY HH:MM)"
                />
              </div>

              <div class="col-span-12 sm:col-span-6">
                <BaseInput
                  label="End Date & Time"
                  type="text"
                  placeholder="Date & Time (DD/MM/YYYY HH:MM)"
                />
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- INTRODUCTION FOR THE GAME -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8">
          <TairoFormGroup label="Introduction for the game">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-6">
                <BaseAutocomplete
                  label="Game"
                  :items="games"
                  placeholder="Search game"
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <BaseListbox
                  label="Age appropriate"
                  :items="age"
                  placeholder="Select age"
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Brief about the game"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Impact on student education"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section image</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section score</label
                >
                <BaseButtonGroup>
                  <BaseInput
                    type="text"
                    icon="ic:round-sports-score"
                    placeholder="Section score"
                    :classes="{
                      wrapper: 'w-full',
                    }"
                  />
                  <BaseButton color="muted">
                    <span>%</span>
                  </BaseButton>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- SKILLS AND LEARNING -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8">
          <TairoFormGroup label="Skills and learning">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Section description"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >List of skills</label
                >
                <div class="grid grid-cols-12 sm:gap-4">
                  <div class="col-span-12 sm:col-span-5">
                    <BaseAutocomplete
                      :items="skills"
                      placeholder="Search skill"
                      class="sa-group-skills"
                    />
                  </div>
                  <div class="col-span-12 sm:col-span-6">
                    <BaseInput type="text" placeholder="Post URL" />
                  </div>

                  <div class="col-span-12 sm:col-span-1">
                    <BaseButtonIcon color="primary" class="w-full">
                      <Icon name="lucide:plus" class="size-5" />
                    </BaseButtonIcon>
                  </div>
                </div>
                <div class="grid grid-cols-12 sm:gap-4 mt-4">
                  <div class="col-span-12 sm:col-span-5">
                    <BaseAutocomplete
                      :items="skills"
                      placeholder="Search skill"
                      class="sa-group-skills"
                    />
                  </div>
                  <div class="col-span-12 sm:col-span-6">
                    <BaseInput type="text" placeholder="Post URL" />
                  </div>

                  <div class="col-span-12 sm:col-span-1">
                    <BaseButtonIcon color="danger" class="w-full">
                      <Icon name="lucide:minus" class="size-5" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section image</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section score</label
                >
                <BaseButtonGroup>
                  <BaseInput
                    type="text"
                    icon="ic:round-sports-score"
                    placeholder="Section score"
                    :classes="{
                      wrapper: 'w-full',
                    }"
                  />
                  <BaseButton color="muted">
                    <span>%</span>
                  </BaseButton>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- SCORING AND DIRECTION -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8">
          <TairoFormGroup label="Scoring and direction">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Section description"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="How to complete this tournament"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Score table</label
                >
                <div class="grid grid-cols-12 sm:gap-4">
                  <div class="col-span-12 sm:col-span-8">
                    <BaseInput type="text" placeholder="Section name" />
                  </div>
                  <div class="col-span-12 sm:col-span-3">
                    <BaseInput type="text" placeholder="Score" />
                  </div>

                  <div class="col-span-12 sm:col-span-1">
                    <BaseButtonIcon color="primary" class="w-full">
                      <Icon name="lucide:plus" class="size-5" />
                    </BaseButtonIcon>
                  </div>
                </div>
                <div class="grid grid-cols-12 sm:gap-4 mt-4">
                  <div class="col-span-12 sm:col-span-8">
                    <BaseInput type="text" placeholder="Section name" />
                  </div>
                  <div class="col-span-12 sm:col-span-3">
                    <BaseInput type="text" placeholder="Score" />
                  </div>

                  <div class="col-span-12 sm:col-span-1">
                    <BaseButtonIcon color="danger" class="w-full">
                      <Icon name="lucide:minus" class="size-5" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Awards"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Eligibility for end of year tournament</label
                >
              </div>
              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section image</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section score</label
                >
                <BaseButtonGroup>
                  <BaseInput
                    type="text"
                    icon="ic:round-sports-score"
                    placeholder="Section score"
                    :classes="{
                      wrapper: 'w-full',
                    }"
                  />
                  <BaseButton color="muted">
                    <span>%</span>
                  </BaseButton>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- GAMING DEVICES AND DOWNLOADS -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8">
          <TairoFormGroup label="Gaming devices and downloads">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Section description"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Gaming consoles</label
                >
                <div class="grid grid-cols-12 sm:gap-4">
                  <div class="col-span-12 sm:col-span-4">
                    <BaseListbox
                      :items="consoles"
                      placeholder="Select console"
                      :properties="{
                        label: 'name',
                        icon: 'icon',
                        sublabel: 'subText',
                      }"
                    />
                  </div>
                  <div class="col-span-12 sm:col-span-7">
                    <BaseInput type="text" placeholder="URL" />
                  </div>

                  <div class="col-span-12 sm:col-span-1">
                    <BaseButtonIcon color="primary" class="w-full">
                      <Icon name="lucide:plus" class="size-5" />
                    </BaseButtonIcon>
                  </div>
                </div>
                <div class="grid grid-cols-12 sm:gap-4 mt-4">
                  <div class="col-span-12 sm:col-span-4">
                    <BaseListbox
                      :items="consoles"
                      placeholder="select console"
                      :properties="{
                        label: 'name',
                        icon: 'icon',
                        sublabel: 'subText',
                      }"
                    />
                  </div>
                  <div class="col-span-12 sm:col-span-7">
                    <BaseInput type="text" placeholder="URL" />
                  </div>

                  <div class="col-span-12 sm:col-span-1">
                    <BaseButtonIcon color="danger" class="w-full">
                      <Icon name="lucide:minus" class="size-5" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section image</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section score</label
                >
                <BaseButtonGroup>
                  <BaseInput
                    type="text"
                    icon="ic:round-sports-score"
                    placeholder="Section score"
                    :classes="{
                      wrapper: 'w-full',
                    }"
                  />
                  <BaseButton color="muted">
                    <span>%</span>
                  </BaseButton>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- FINAL TASK -->
      <BaseCard class="mt-6">
        <div class="max-w-3xl p-8">
          <TairoFormGroup label="Final task">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Section description"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-12">
                <BaseTextarea
                  label="Tornament instruction"
                  placeholder="Write some description..."
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <BaseInput
                  type="text"
                  icon="material-symbols-light:title"
                  label="Video title"
                  placeholder="Video title"
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <BaseInput
                  type="text"
                  icon="material-symbols:link"
                  label="Video URL"
                  placeholder="Video URL"
                />
              </div>
              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section image</label
                >
                <BaseParagraph
                  size="xs"
                  lead="tight"
                  class="text-muted-500 dark:text-muted-400 pb-2"
                >
                  <span>Size: 100px x 100px</span>
                </BaseParagraph>
                <div>
                  <BaseButton color="primary">
                    <Icon
                      name="icon-park-outline:upload-picture"
                      class="me-1 size-4"
                    />
                    <span>Add Section Image</span>
                  </BaseButton>
                </div>
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3"
                  >
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <img
                          class="size-14 rounded-md object-cover object-center w-16"
                          src="/img/apps/2.png"
                          alt="Image preview"
                        />
                      </div>

                      <div class="font-sans">
                        <span
                          class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                        >
                          File name.jpg
                        </span>

                        <span class="text-muted-400 block text-xs"> 2MB </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        type="button"
                        tooltip="Remove"
                        @click.prevent="remove(file)"
                      >
                        <Icon name="lucide:x" class="size-4" />

                        <span class="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <label class="nui-label pb-2 text-[0.825rem] w-full"
                  >Section score</label
                >
                <BaseButtonGroup>
                  <BaseInput
                    type="text"
                    icon="ic:round-sports-score"
                    placeholder="Section score"
                    :classes="{
                      wrapper: 'w-full',
                    }"
                  />
                  <BaseButton color="muted">
                    <span>%</span>
                  </BaseButton>
                </BaseButtonGroup>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </BaseCard>

      <!-- ACTION -->
      <div class="max-w-3xl p-8">
        <div class="flex items-center gap-2 pt-8 pb-8">
          <BaseButton class="w-24" to="/schools">Cancel</BaseButton>

          <BaseButton type="submit" color="primary" class="w-24">
            Create
          </BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>
