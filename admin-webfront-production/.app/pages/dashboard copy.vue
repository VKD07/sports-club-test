<script setup lang="ts">
definePageMeta({
  name: 'dashboard',
  title: 'Admin Dashboard',
  middleware: ['auth'],
})

const auth = useAuthStore()

if (!auth.permissions) {
  const permission = await getUserPermissions()
}

const userName = computed(() => {
  return `${auth.user?.first_name} ${auth.user?.last_name}`
})

const route = useRoute()
const isFirstLogin = route.query.isFirstLogin as string
const isWelcomeModalOpen = ref(false)

onMounted(() => {
  setTimeout(() => {
    isWelcomeModalOpen.value = isFirstLogin !== null && isFirstLogin === 'true'
  }, 5000)
})

const datePreset = ['Today', 'Yesterday', 'Maximum', 'Last 7 days', 'Last month', 'This month']
const academicYear = ['2024', '2025', '2026']
const academicTerm = ['1st Term', '2nd Term', '3rd Term']

// GRAPHS
const businessPotential = reactive(useBusinessPotential())
const studentsEngagement = reactive(useStudentsEngagements())
const schoolUsersEngagement = reactive(useSchoolUsersEngagements())
const weeklyProgress = reactive(useWeeklyProgress())

function useBusinessPotential() {
  const { primary } = useTailwindColors()
  const type = 'radialBar'
  const height = 220

  const options = {
    chart: {
      height: 350,
      type: 'radialBar',
    },
    colors: [primary.value],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
      },
    },
    labels: ['Success Rate'],
  }

  const series = ref([65])

  return {
    type,
    height,
    options,
    series,
  }
}

function useStudentsEngagements() {
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

function useSchoolUsersEngagements() {
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

  const series = ref([48])

  return {
    type,
    height,
    options,
    series,
  }
}

function useWeeklyProgress() {
  const { primary, warning, success } = useTailwindColors()
  const type = 'area'
  const height = 258

  const options = {
    chart: {
      height: 350,
      type: 'line',
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value, success.value, warning.value],
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
      width: [2, 2, 3],
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: [
        '2024-03-19T00:00:00.000Z',
        '2024-03-20T01:30:00.000Z',
        '2024-03-21T02:30:00.000Z',
        '2024-03-22T03:30:00.000Z',
        '2024-03-23T04:30:00.000Z',
        '2024-03-24T05:30:00.000Z',
        '2024-03-25T06:30:00.000Z',
      ],
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: primary.value,
        },
        labels: {
          style: {
            colors: primary.value,
          },
        },
        title: {
          text: 'Task Participation',
          style: {
            color: primary.value,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      {
        seriesName: 'Daily Task Completion',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: success.value,
        },
        labels: {
          style: {
            colors: success.value,
          },
        },
        title: {
          text: 'Daily Task Completion',
          style: {
            color: success.value,
          },
        },
      },
      {
        seriesName: 'Student Engagement',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: warning.value,
        },
        labels: {
          style: {
            colors: warning.value,
          },
        },
        title: {
          text: 'Student Engagement',
          style: {
            color: warning.value,
          },
        },
      },
    ],
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  }

  const series = ref([
    {
      name: 'Task Participation',
      type: 'column',
      data: [1, 4, 8, 2, 3, 6, 4],
    },
    {
      name: 'Daily Task Completion',
      type: 'column',
      data: [1, 2, 3, 2, 4, 1, 5],
    },
    {
      name: 'Student Engagement',
      type: 'line',
      data: [78, 53, 36, 98, 45, 20, 25],
    },
  ])

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
        size="md"
        weight="medium"
        lead="normal"
        class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
      >
        BUSINESS OVERVIEW
      </BaseHeading>

      <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
        As of 8th March 2024
      </BaseText>
    </div>

    <div class="flex items-center gap-2">
      <BaseHeading
        tag="h2"
        size="xl"
        weight="bold"
        lead="tight"
        class="tracking-normal text-primary-500 dark:text-muted-100"
      >
        Hello!
      </BaseHeading>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-4">
    <!-- Total schools -->

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
            <span>Total schools</span>
          </BaseHeading>
          <BaseIconBox
            size="xs"
            class="bg-teal-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-teal-500 dark:border-2"
            shape="full"
          >
            <Icon name="heroicons-outline:library" class="h-5 w-5" />
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
            <span>7,549</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- Total Loctions -->
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
            <span>Total Locations</span>
          </BaseHeading>

          <BaseIconBox
            size="xs"
            class="bg-amber-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-amber-500 dark:border-2"
            shape="full"
          >
            <Icon name="material-symbols:location-automation-sharp" class="h-5 w-5" />
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
            <span>7,549</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- Total Platform Users -->
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
            <span>Total Platform Users</span>
          </BaseHeading>

          <BaseIconBox
            size="xs"
            class="bg-indigo-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-indigo-500 dark:border-2"
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
            <span>7,549</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- User Engagement Rate -->
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
            <span>User Engagement Rate</span>
          </BaseHeading>

          <BaseIconBox
            size="xs"
            class="bg-pink-500 text-white dark:bg-transparent dark:text-muted-100 dark:border-pink-500 dark:border-2"
            shape="full"
          >
            <Icon name="material-symbols:av-timer" class="h-5 w-5" />
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
            <span>7,549</span>
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
            For the last 3 months
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
              class="bg-amber-100 text-amber-500 dark:border-2 dark:border-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
              shape="full"
            >
              <Icon name="material-symbols:location-automation-sharp" class="h-4 w-4" />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>159</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> New Locations </span>
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
              class="bg-pink-100 text-pink-500 dark:border-2 dark:border-pink-500 dark:bg-pink-500/20 dark:text-pink-400"
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
                <span class="text-muted-500 dark:text-muted-400"> Resources Reads </span>
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
            Platform Engagement Rate
          </BaseHeading>

          <div class="flex gap-2 justify-between items-center mt-1">
            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              As of 8th March 2024
            </BaseText>

            <BaseListbox :items="datePreset" placeholder="Date preset" class="w-52" />
          </div>
        </div>
        <div>
          <div class="pt-8">
            <AddonApexcharts v-bind="studentsEngagement" class="-mt-14" />
          </div>

          <p class="text-center text-sm text-primary-500 dark:text-muted-400 mt-2">Student</p>
        </div>
        <div class="">
          <div class="pt-16">
            <AddonApexcharts v-bind="schoolUsersEngagement" class="-mt-14" />
          </div>

          <p class="text-center text-sm text-primary-500 dark:text-muted-400 mt-2">School Users</p>
        </div>
      </BaseCard>
    </div>

    <!-- BUSINESS POTENTIAL -->
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
            Usage Potentials
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            As of 8th March 2024
          </BaseText>
        </div>

        <div class="">
          <AddonApexcharts v-bind="businessPotential" />
        </div>
        <p class="text-center text-sm mb-2 text-muted-800 dark:text-muted-300">
          Based on last 30 days engagement
        </p>
        <div class="mt-6">
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
        <div class="mb-6">
          <BaseHeading
            tag="h3"
            size="md"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
          >
            WEEKLY PROGRESS
          </BaseHeading>
          <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
            29th June - 5th July
          </BaseText>
          <!-- <NuxtLink
            to="#"
            class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 dark:text-muted-300 rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </NuxtLink> -->
        </div>

        <div class="flex gap-8 mb-6">
          <div>
            <span class="text-muted-400 font-sans text-xs">Potential Completion</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">689</p>
          </div>
          <div>
            <span class="text-muted-400 font-sans text-xs">Task Open</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">24</p>
          </div>
          <div>
            <span class="text-muted-400 font-sans text-xs">Task Participation</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">20</p>
          </div>
          <div>
            <span class="text-muted-400 font-sans text-xs">Task Completion</span>
            <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">14</p>
          </div>
        </div>
        <AddonApexcharts v-bind="weeklyProgress" />
      </BaseCard>
    </div>

    <!-- TOP PERFORMERS -->
    <div class="col-span-12 lg:col-span-4">
      <BaseCard class="p-6 h-full">
        <!-- Title -->
        <div class="mb-2 flex items-center justify-between">
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
          </div>
        </div>
        <div class="flex gap-2 mb-6">
          <BaseListbox :items="academicYear" placeholder="Academic Year" class="w-44" />
          <BaseListbox :items="academicTerm" placeholder="Academic Term " class="w-44" />
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
              Top Academic Tasks
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              As of 8th March 2024
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

    <!-- TOP SCHOOLS -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
        <!-- Title -->
        <div class="mb-2 flex items-center justify-between">
          <div>
            <BaseHeading
              tag="h3"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Top Schools
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Based on schools overall performance as of 8th March 2024
            </BaseText>
          </div>

          <!-- <NuxtLink
            to="/schools/organisation"
            class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 dark:text-muted-300 rounded-md px-4 py-2 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </NuxtLink> -->
        </div>

        <div class="flex gap-2 mb-6">
          <BaseListbox :items="academicYear" placeholder="Academic Year" class="w-44" />
          <BaseListbox :items="academicTerm" placeholder="Academic Term " class="w-44" />
        </div>

        <DashboardTopSchools />
      </BaseCard>
    </div>
  </div>

  <div>
    <TairoModal :open="isWelcomeModalOpen" size="md" @close="isWelcomeModalOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-end p-4 md:p-6">
          <BaseButtonClose @click="isWelcomeModalOpen = false" />
        </div>
      </template>

      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs flex flex-col items-center justify-center text-center">
          <img src="img/login/Welcome Icon.png" class="w-40" />
          <h3 class="font-heading text-primary-500 text-3xl font-medium leading-6 dark:text-white">
            Welcome Back!
          </h3>
          <h3 class="font-alt text-muted-500 dark:text-muted-400 my-6 leading-5">
            Hello {{ userName }}!, We're glad to see you today. Let’s achieve great things together!
          </h3>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
