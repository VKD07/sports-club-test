<script setup lang="ts">
definePageMeta({
  title: 'Dashboard',
  middleware: ['auth'],
})

const datePreset = [
  'Maximum',
  'Today',
  'Last 7 days',
  'Last 14 days',
  'This week',
  'Last week',
  'This month',
  'Last month',
]

// GRAPHS
const radialGoal = reactive(useRadialGoal())
const areaCustomers = reactive(useAreaCustomers())
const gaugePersonal = reactive(useGaugePersonal())

function useRadialGoal() {
  const { primary, success } = useTailwindColors()
  const type = 'radialBar'
  const height = 220

  const options = {
    chart: {
      offsetY: -10,
    },
    colors: [primary.value, success.value],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        inverseOrder: true,
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 500,
            offsetY: -10,
          },
          value: {
            show: true,
            fontWeight: 600,
            fontSize: '16px',
            offsetY: -5,
          },
          total: {
            show: true,
            fontSize: '14px',
            fontWeight: 500,
          },
        },
        hollow: {
          margin: 15,
          size: '75%',
        },
        track: {
          strokeWidth: '100%',
        },
      },
    },

    stroke: {
      lineCap: 'round',
    },
    labels: ['Efficiency', 'Productivity'],
  }

  const series = ref([57, 86])

  return {
    type,
    height,
    options,
    series,
  }
}

function useAreaCustomers() {
  const { primary, info, success } = useTailwindColors()
  const type = 'area'
  const height = 258

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value, info.value, success.value],
    title: {
      show: false,
      text: undefined,
      align: 'left',
    },
    legend: {
      show: true,
      position: 'top',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [2, 2, 2],
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: [
        '2020-09-19T00:00:00.000Z',
        '2020-09-20T01:30:00.000Z',
        '2020-09-21T02:30:00.000Z',
        '2020-09-22T03:30:00.000Z',
        '2020-09-23T04:30:00.000Z',
        '2020-09-24T05:30:00.000Z',
        '2020-09-25T06:30:00.000Z',
      ],
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  }

  const series = ref([
    {
      name: 'Returning',
      data: [31, 40, 28, 51, 42, 109, 100],
    },
    {
      name: 'Newcomers',
      data: [11, 32, 45, 32, 34, 52, 41],
    },
    {
      name: 'Abandonned',
      data: [78, 53, 36, 10, 14, 5, 2],
    },
  ])

  return {
    type,
    height,
    options,
    series,
  }
}

function useGaugePersonal() {
  const { primary } = useTailwindColors()
  const type = 'radialBar'
  const height = 220

  const options = {
    title: {
      text: undefined,
    },
    chart: {
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
          dropShadow: {
            enabled: false,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 1,
            blur: 2,
          },
        },
        hollow: {
          margin: 0,
          size: '35%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.1,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91],
      },
    },
    labels: ['Average Results'],
  }

  const series = ref([76])

  return {
    type,
    height,
    options,
    series,
  }
}
</script>

<template>
  <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
    <div>
      <BaseHeading
        tag="h2"
        size="xl"
        weight="bold"
        lead="tight"
        class="tracking-normal text-primary-500 dark:text-muted-100"
      >
        Hello Donsal!
      </BaseHeading>
    </div>

    <div class="flex items-center gap-2">
      <div class="grid grid-cols-2 w-fit divide-x bg-primary-500 rounded-lg px-8 py-2">
        <div class="text-center pe-8">
          <h4 class="text-white text-sm font-medium leading-none">3th</h4>
          <p class="text-white text-sm">March</p>
        </div>
        <div class="text-center ps-8">
          <h4 class="text-white text-sm font-medium leading-none">1st</h4>
          <p class="text-white text-sm">Term</p>
        </div>
      </div>
    </div>
  </div>

  <!-- MAIN BANNER -->
  <div class="rounded-xl relative h-96 flex justify-center items-end">
    <img
      src="/img/school/ga-banner-6.jpg"
      class="absolute inset-0 object-cover h-full w-full rounded-xl"
    />
    <div
      class="bg-gradient-to-r from-muted-900 from-0% to-transparent to-50% w-full h-full absolute inset-0 rounded-xl"
    ></div>
    <div class="relative p-8 flex flex-col-reverse gap-6 md:flex-row justify-between">
      <div class="md:basis-96">
        <BaseHeading tag="h3" size="4xl" weight="medium" lead="none" class="text-white">
          Notice Name
        </BaseHeading>

        <p class="text-sm text-white my-6">
          Creativity allows players to think outside the box, develop innovative strategies, and
          find unique solutions to challenges presented in the game. It enables players to approach
          situations from different perspectives, leading to unexpected and inventive gameplay
          experiences
        </p>

        <BaseButton class="" color="primary">
          <span>Read More</span>
        </BaseButton>
      </div>
      <div class="flex justify-end gap-2 mt-4 absolute bottom-8 right-8">
        <BaseButton color="default">
          <span>Previous</span>
          <Icon
            name="mdi:chevron-left-circle-outline"
            class="-ms-1 w-5 h-5 text-primary-500 dark:text-muted-100"
          />
        </BaseButton>

        <BaseButton color="default">
          <Icon
            name="mdi:chevron-right-circle-outline"
            class="-ms-1 w-5 h-5 text-primary-500 dark:text-muted-100"
          />
          <span>Next</span>
        </BaseButton>
      </div>
    </div>
  </div>

  <div class="flex gap-4 lg:items-center justify-between p-4 my-2 flex-col lg:flex-row">
    <div>
      <BaseHeading
        tag="h2"
        size="md"
        weight="medium"
        lead="normal"
        class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
      >
        OVERVIEW
      </BaseHeading>

      <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
        As of 8th March 2024
      </BaseText>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-4">
    <!-- Total active students -->

    <div class="col-span-12 md:col-span-3">
      <BaseCard class="p-4 !bg-teal-500/10 !border-teal-500">
        <div class="mb-1 flex items-center justify-between">
          <BaseHeading
            as="h5"
            size="sm"
            weight="medium"
            lead="tight"
            class="text-muted-500 dark:text-muted-400"
          >
            <span>Total Active Students</span>
          </BaseHeading>
          <BaseIconBox
            size="xs"
            class="bg-teal-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-teal-500 dark:border-2"
            shape="full"
          >
            <Icon name="material-symbols:shield-person-outline-rounded" class="h-5 w-5" />
          </BaseIconBox>
        </div>
        <div class="mb-2">
          <BaseHeading
            as="h4"
            size="3xl"
            weight="bold"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>5549</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- Total School Users -->
    <div class="col-span-12 md:col-span-3">
      <BaseCard class="p-4 !bg-amber-500/10 !border-amber-500">
        <div class="mb-1 flex items-center justify-between">
          <BaseHeading
            as="h5"
            size="sm"
            weight="medium"
            lead="tight"
            class="text-muted-500 dark:text-muted-400"
          >
            <span>Total School Users</span>
          </BaseHeading>

          <BaseIconBox
            size="xs"
            class="bg-amber-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-amber-500 dark:border-2"
            shape="full"
          >
            <Icon name="material-symbols:deployed-code-account-outline-rounded" class="h-5 w-5" />
          </BaseIconBox>
        </div>

        <div class="mb-2">
          <BaseHeading
            as="h4"
            size="3xl"
            weight="bold"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>678</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- Total Active Tasks -->
    <div class="col-span-12 md:col-span-3">
      <BaseCard class="p-4 !bg-indigo-500/10 !border-indigo-500">
        <div class="mb-1 flex items-center justify-between">
          <BaseHeading
            as="h5"
            size="sm"
            weight="medium"
            lead="tight"
            class="text-muted-500 dark:text-muted-400"
          >
            <span>Total Active Tasks</span>
          </BaseHeading>

          <BaseIconBox
            size="xs"
            class="bg-indigo-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-indigo-500 dark:border-2"
            shape="full"
          >
            <Icon name="fluent:clipboard-task-list-24-regular" class="h-5 w-5" />
          </BaseIconBox>
        </div>

        <div class="mb-2">
          <BaseHeading
            as="h4"
            size="3xl"
            weight="bold"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>90</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- Total Tournaments -->
    <div class="col-span-12 md:col-span-3">
      <BaseCard class="p-4 !bg-pink-500/10 !border-pink-500">
        <div class="mb-1 flex items-center justify-between">
          <BaseHeading
            as="h5"
            size="sm"
            weight="medium"
            lead="tight"
            class="text-muted-500 dark:text-muted-400"
          >
            <span>Total Tournaments</span>
          </BaseHeading>

          <BaseIconBox
            size="xs"
            class="bg-pink-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-pink-500 dark:border-2"
            shape="full"
          >
            <Icon name="mdi:tournament" class="h-5 w-5" />
          </BaseIconBox>
        </div>

        <div class="mb-2">
          <BaseHeading
            as="h4"
            size="3xl"
            weight="bold"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>16</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>
  </div>

  <!-- Grid -->
  <div class="grid grid-cols-10 gap-6 mt-6">
    <!-- LATEST TRENDS -->
    <div class="col-span-12 lg:col-span-4">
      <BaseCard class="p-6">
        <div class="mb-6">
          <BaseHeading
            tag="h3"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Latest Trends
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Stats are for this term
          </BaseText>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Grid item -->
          <div
            class="bg-muted-100/80 dark:bg-muted-700 flex items-center gap-2 rounded-md px-4 py-7"
          >
            <BaseIconBox
              size="xs"
              class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
              shape="full"
            >
              <Icon name="ph:student" class="h-4 w-4" />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>250</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> New Students </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Grid item -->
          <div
            class="bg-muted-100/80 dark:bg-muted-700 flex items-center gap-2 rounded-md px-4 py-7"
          >
            <BaseIconBox
              size="xs"
              class="bg-pink-100 text-pink-500 dark:border-2 dark:border-pink-500 dark:bg-pink-500/20 dark:text-pink-400"
              shape="full"
            >
              <Icon name="ph:shield-warning" class="h-4 w-4" />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>100</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Inactive students </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Grid item -->
          <div
            class="bg-muted-100/80 dark:bg-muted-700 flex items-center gap-2 rounded-md px-4 py-7"
          >
            <BaseIconBox
              size="xs"
              class="bg-green-100 text-green-500 dark:border-2 dark:border-green-500 dark:bg-green-500/20 dark:text-green-400"
              shape="full"
            >
              <Icon name="material-symbols-light:hourglass-bottom" class="h-4 w-4" />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>5d 3h 45m</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Time Spend </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Grid item -->
          <div
            class="bg-muted-100/80 dark:bg-muted-700 flex items-center gap-2 rounded-md px-4 py-7"
          >
            <BaseIconBox
              size="xs"
              class="bg-teal-100 text-teal-500 dark:border-2 dark:border-teal-500 dark:bg-teal-500/20 dark:text-teal-400"
              shape="full"
            >
              <Icon name="material-symbols:contact-support-outline" class="h-4 w-4" />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>100</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Supports Generated </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Grid item -->
          <div
            class="bg-muted-100/80 dark:bg-muted-700 flex items-center gap-2 rounded-md px-4 py-7"
          >
            <BaseIconBox
              size="xs"
              class="bg-indigo-100 text-indigo-500 dark:border-2 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-ingigo-400"
              shape="full"
            >
              <Icon name="material-symbols:chrome-reader-mode-outline" class="h-4 w-4" />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>100</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Resources Read </span>
              </BaseParagraph>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- PLATFORM ENGAGEMENT -->
    <div class="col-span-12 lg:col-span-3">
      <BaseCard class="p-6 h-full">
        <div class="mb-6">
          <BaseHeading
            tag="h3"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Platform Engagement
          </BaseHeading>

          <div class="flex gap-2 justify-between items-center mt-1">
            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              By 8th March 2024
            </BaseText>

            <BaseListbox :items="datePreset" placeholder="Date preset" class="w-40" />
          </div>
        </div>
        <div>
          <div class="pt-8">
            <AddonApexcharts v-bind="gaugePersonal" class="-mt-14" />
          </div>

          <p class="text-center text-sm text-primary-500 dark:text-muted-400 mt-2">Students</p>
        </div>
        <div class="">
          <div class="pt-16">
            <AddonApexcharts v-bind="gaugePersonal" class="-mt-14" />
          </div>

          <p class="text-center text-sm text-primary-500 dark:text-muted-400 mt-2">Students</p>
        </div>
      </BaseCard>
    </div>

    <!-- STUDENT PARTICIPATION -->
    <div class="col-span-12 lg:col-span-3">
      <BaseCard class="p-6 h-full">
        <div class="mb-6">
          <BaseHeading
            tag="h3"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            Student Participation
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            Based on total active students
          </BaseText>
        </div>

        <div class="mb-6 mt-10">
          <AddonApexcharts v-bind="radialGoal" />
        </div>
        <div class="mt-14">
          <div class="border-muted-200 dark:border-muted-700 flex w-full border-t pt-4 text-center">
            <div class="border-muted-200 dark:border-muted-700 flex-1 border-r px-2">
              <span class="text-muted-600 dark:text-muted-400 font-sans text-xs">
                Active Students
              </span>
              <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">1431</p>
            </div>
            <div class="flex-1 px-2">
              <span class="text-muted-600 dark:text-muted-400 font-sans text-xs">
                Total Students
              </span>
              <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">219</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>

  <!-- Grid -->
  <div class="grid grid-cols-10 gap-6 mt-6">
    <!-- WEEKLY PROGRESS -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
        <!-- Title -->
        <div class="mb-6 flex items-center justify-between">
          <BaseHeading
            tag="h3"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            WEEKLY PROGRESS
          </BaseHeading>
          <NuxtLink
            to="#"
            class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 dark:text-muted-300 rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </NuxtLink>
        </div>

        <div class="flex gap-8 mb-6">
          <div>
            <span class="text-muted-400 font-sans text-xs">Student engagement</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">689</p>
          </div>
          <div>
            <span class="text-muted-400 font-sans text-xs">Task participation</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">1724</p>
          </div>
          <div>
            <span class="text-muted-400 font-sans text-xs">Daily task completion</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">500</p>
          </div>
        </div>
        <AddonApexcharts v-bind="areaCustomers" />
      </BaseCard>
    </div>

    <!-- TOP PERFORMERS -->
    <div class="col-span-12 lg:col-span-4">
      <BaseCard class="p-6">
        <!-- Title -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <BaseHeading
              tag="h3"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Top Performers
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Based on their performance
            </BaseText>
          </div>

          <NuxtLink
            to="/leaderboard"
            class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 dark:text-muted-300 rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </NuxtLink>
        </div>

        <DashboardTopPerformers />
      </BaseCard>
    </div>
  </div>

  <!-- Grid -->
  <div class="grid grid-cols-12 gap-6 mt-6">
    <!-- TOP TASKS -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
        <!-- Title -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <BaseHeading
              tag="h3"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Top Tasks
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Based on their performance
            </BaseText>
          </div>

          <NuxtLink
            to="/tasks"
            class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 dark:text-muted-300 rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </NuxtLink>
        </div>

        <DashboardTopTasks />
      </BaseCard>
    </div>

    <!-- LATEST RESOURCES -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
        <!-- Title -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <BaseHeading
              tag="h3"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Latest Resources
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              More engaged resources by students
            </BaseText>
          </div>

          <NuxtLink
            to="/information-hub"
            class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 dark:text-muted-300 rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </NuxtLink>
        </div>

        <DashboardLatestResources />
      </BaseCard>
    </div>
  </div>
</template>
