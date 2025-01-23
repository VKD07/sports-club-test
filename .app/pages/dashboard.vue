<script setup>
import { format } from 'date-fns'

definePageMeta({
  name: 'dashboard',
  title: 'Admin Dashboard',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isFirstLogin = route.query.isFirstLogin

if (!auth.permissions) {
  const permission = await getUserPermissions()
}

const userName = computed(() => {
  return `${auth.user?.first_name} ${auth.user?.last_name}`
})

const today = ref(new Date())

const formattedDateTime = computed(() => {
  const dayWithOrdinal = format(today.value, 'do')
  const month = format(today.value, 'MMMM')
  const year = format(today.value, 'yyyy')
  const fullDay = `${dayWithOrdinal} ${month} ${year}`
  return { month, year, fullDay }
})

const latestTrends = ref(null)
const businessOverview = ref(null)
const isWelcomeModalOpen = ref(false)

onMounted(() => {
  window.history.replaceState({}, document.title, '/dashboard')

  setTimeout(() => {
    isWelcomeModalOpen.value = isFirstLogin !== null && isFirstLogin === 'true'
  }, 5000)
})

const getBusinessOverview = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/business-overview')

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    return data.value
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

const getLatestTrends = async () => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/latest-trends')

    if (error.value) {
      throw new Error(error.value?.data?.message)
    }

    return data.value
  } catch (error) {
    showErrorToast('Oops!', error.message)
  }
}

const getData = async () => {
  try {
    const [latestTrendsData, businessOverviewData] = await Promise.all([
      getLatestTrends(),
      getBusinessOverview(),
    ])

    latestTrends.value = latestTrendsData
    businessOverview.value = businessOverviewData
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  }
}
await getData()

const getLastThreeMonths = () => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const today = new Date()
  const lastThreeMonths = []

  for (let i = 0; i < 3; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthName = monthNames[date.getMonth()]
    const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    lastThreeMonths.push({ monthName, yearMonth })
  }

  return lastThreeMonths
}

// Get the last three months dynamically
const lastThreeMonths = getLastThreeMonths()
const trendsMonth = lastThreeMonths.map((item) => item.monthName)

const selectedMonth = ref(trendsMonth[0])
const filteredData = computed(() => {
  const monthMapping = lastThreeMonths.reduce((acc, item) => {
    acc[item.monthName] = item.yearMonth
    return acc
  }, {})

  const selectedMonthValue = monthMapping[selectedMonth.value]

  return {
    newStudents:
      latestTrends.value.lastThreeMonthStudents.find((item) => item.month === selectedMonthValue)
        ?.count || 0,
    newLocations:
      latestTrends.value.lastThreeMonthLocations.find((item) => item.month === selectedMonthValue)
        ?.count || 0,
    inactiveStudents:
      latestTrends.value.lastThreeMonthInactiveStudents.find(
        (item) => item.month === selectedMonthValue,
      )?.count || 0,
    supportsGenerated:
      latestTrends.value.supportGenerated.find((item) => item.month === selectedMonthValue)
        ?.count || 0,
    resourcesReads:
      latestTrends.value.lastThreeMonthPostReadSchool.find(
        (item) => item.month === selectedMonthValue,
      )?.count || 0,
  }
})

const academicYear = ['2024', '2025', '2026']
const weeklyFilter = ['This week', 'Last week']
const academicTerm = ['1st Term', '2nd Term', '3rd Term']
const datePreset = ['Today', 'Yesterday', 'Maximum', 'Last 7 days', 'Last month', 'This month']

// GRAPHS
const weeklyProgress = reactive(useWeeklyProgress())
const businessPotential = reactive(useBusinessPotential())
const studentsEngagement = reactive(useStudentsEngagements())
const schoolUsersEngagement = reactive(useSchoolUsersEngagements())

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

  const series = ref([latestTrends.value?.successRate.toFixed(2)])

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
  const type = 'line'
  const height = 350

  const options = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ['#fde047', '#fdba74', '#93c5fd', '#86efac'],
    title: {
      show: false,
      text: undefined,
      align: 'left',
    },
    markers: {
      size: 1,
    },
    legend: {
      show: true,
      position: 'top',
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
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
    yaxis: {},
  }

  const series = ref([
    {
      name: 'Potential Completion',
      data: [1, 4, 8, 2, 3, 6, 4],
    },
    {
      name: 'Task Open',
      data: [1, 2, 3, 2, 4, 1, 5],
    },
    {
      name: 'Task Participation',
      data: [16, 20, 21, 18, 15, 10, 15],
    },
    {
      name: 'Task Completion',
      data: [8, 3, 6, 8, 5, 0, 5],
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
        Business Overview
      </BaseHeading>

      <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
        As of {{ formattedDateTime.fullDay }}
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
        Hello {{ userName }}!
      </BaseHeading>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-4">
    <!-- Total Schools -->
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
            <span>Total Schools</span>
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
            <span>{{ businessOverview?.school ?? 0 }}</span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>

    <!-- Total Locations -->
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
            <span>{{ businessOverview?.location ?? 0 }}</span>
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
            <span>{{ businessOverview?.total_users ?? 0 }}</span>
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
            <span>
              {{ businessOverview?.rate ? parseFloat(businessOverview?.rate).toFixed(5) : 0 }}%
            </span>
          </BaseHeading>
        </div>
      </BaseCard>
    </div>
  </div>

  <!-- Grid -->
  <div class="grid grid-cols-10 gap-6 mt-6">
    <!-- Latest Trends -->
    <div class="col-span-12 lg:col-span-4">
      <BaseCard class="p-6">
        <div class="flex gap-2 justify-between">
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

          <div>
            <BaseListbox
              v-model="selectedMonth"
              :items="trendsMonth"
              placeholder="Select Month"
              class="w-44"
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- New Students -->
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
                <span>{{ filteredData.newStudents }}</span>
              </BaseHeading>

              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> New Students </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- New Locations -->
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
                <span>{{ filteredData.newLocations }}</span>
              </BaseHeading>

              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> New Locations </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Time Spend -->
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
                <span>0d 0h 0m</span>
              </BaseHeading>

              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Time Spend </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Inactive Students -->
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
                <span>{{ filteredData.inactiveStudents }}</span>
              </BaseHeading>

              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Inactive Students </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Supports Generated -->
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
                <span>{{ filteredData.supportsGenerated }}</span>
              </BaseHeading>

              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Supports Generated </span>
              </BaseParagraph>
            </div>
          </div>

          <!-- Resources Reads -->
          <div
            class="bg-muted-100/80 dark:bg-muted-700 flex items-center gap-2 rounded-md px-4 py-7"
          >
            <BaseIconBox
              size="xs"
              class="bg-indigo-100 text-indigo-500 dark:border-2 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
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
                <span>{{ filteredData.resourcesReads }}</span>
              </BaseHeading>

              <BaseParagraph size="xs">
                <span class="text-muted-500 dark:text-muted-400"> Resources Reads </span>
              </BaseParagraph>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Platform Engagement Rate -->
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
              As of {{ formattedDateTime.fullDay }}
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

    <!-- Usage Potentials -->
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
            As of {{ formattedDateTime.fullDay }}
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
              <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">
                {{ latestTrends?.activeStudent ?? 0 }}
              </p>
            </div>

            <div class="flex-1 px-2">
              <span class="text-muted-600 dark:text-muted-400 font-sans text-xs">
                Total Students
              </span>
              <p class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium">
                {{ latestTrends?.totalStudent ?? 0 }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>

  <div class="grid grid-cols-10 gap-6 mt-6">
    <!-- Weekly Progress -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
        <div class="flex gap-2 justify-between">
          <div class="mb-6">
            <BaseHeading
              tag="h3"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Weekly Progress
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              29th June - 5th July
            </BaseText>
          </div>

          <div>
            <BaseListbox :items="weeklyFilter" placeholder="Select week" class="w-44" />
          </div>
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

    <!-- Top Performers -->
    <div class="col-span-12 lg:col-span-4">
      <BaseCard class="p-6 h-full">
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

  <div class="grid grid-cols-12 gap-6 mt-6">
    <!-- Top Academic Tasks -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
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
              As of {{ formattedDateTime.fullDay }}
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

    <!-- Top Schools -->
    <div class="col-span-12 lg:col-span-6">
      <BaseCard class="p-6 h-full">
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
        </div>

        <div class="flex gap-2 mb-6">
          <BaseListbox :items="academicYear" placeholder="Academic Year" class="w-44" />
          <BaseListbox :items="academicTerm" placeholder="Academic Term " class="w-44" />
        </div>

        <DashboardTopSchools />
      </BaseCard>
    </div>
  </div>

  <DashboardWelcomeModal
    v-if="isWelcomeModalOpen"
    :isOpen="isWelcomeModalOpen"
    :userName="userName"
    @close="isWelcomeModalOpen = false"
  />
</template>
