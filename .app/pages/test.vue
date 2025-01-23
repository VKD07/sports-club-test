<template>
  <div class="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="region" class="block text-sm font-medium text-gray-700">Region:</label>
        <select
          v-model="selectedRegion"
          @change="onRegionChange"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option v-for="region in regions" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
      </div>
      <div v-if="selectedRegion">
        <label for="country" class="block text-sm font-medium text-gray-700">Country:</label>
        <select
          v-model="selectedCountry"
          @change="onCountryChange"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option
            v-for="country in groupedByRegion[selectedRegion]"
            :key="country.name"
            :value="country.name"
          >
            {{ country.name }}
          </option>
        </select>
      </div>
      <div v-if="selectedCountry">
        <p class="mt-2 text-sm text-gray-600">Subregion: {{ selectedCountryDetails?.subregion }}</p>
      </div>
      <div v-if="selectedCountry">
        <label for="timezone" class="block text-sm font-medium text-gray-700">Timezone:</label>
        <select
          v-model="selectedTimezone"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option
            v-for="timezone in selectedCountryDetails?.timezones"
            :key="timezone"
            :value="timezone"
          >
            {{ timezone }}
          </option>
        </select>
      </div>
      <div>
        <label for="city" class="block text-sm font-medium text-gray-700">City:</label>
        <input
          type="text"
          v-model="cityName"
          placeholder="Enter city name"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    </form>
  </div>
</template>

<script setup>
import countries from '../countries.json'

const formattedCountries = countries.map((country) => ({
  name: country.name.common,
  region: country.region,
  subregion: country.subregion,
  timezones: country.timezones,
  continents: country.continents,
}))

const groupedByRegion = formattedCountries.reduce((acc, country) => {
  const region = country.region
  if (!acc[region]) {
    acc[region] = []
  }
  acc[region].push(country)
  return acc
}, {})

console.log(groupedByRegion)

const regions = Object.keys(groupedByRegion)
const selectedRegion = ref(null)
const selectedCountry = ref(null)
const selectedTimezone = ref(null)
const cityName = ref('')

const selectedCountryDetails = computed(() => {
  if (selectedRegion.value && selectedCountry.value) {
    return groupedByRegion[selectedRegion.value].find(
      (country) => country.name === selectedCountry.value,
    )
  }
  return null
})

const onRegionChange = () => {
  selectedCountry.value = null
  selectedTimezone.value = null
}

const onCountryChange = () => {
  selectedTimezone.value = null
}

const handleSubmit = () => {
  alert(
    `Region: ${selectedRegion.value}, Country: ${selectedCountry.value}, Subregion: ${selectedCountryDetails.value.subregion}, Timezone: ${selectedTimezone.value}, City: ${cityName.value}`,
  )
}
</script>
