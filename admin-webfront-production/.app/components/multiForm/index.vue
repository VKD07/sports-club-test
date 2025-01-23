<template>
  <div>
    <component :is="currentStepComponent" @next="nextStep" @prev="prevStep" />
  </div>
</template>

<script>
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'

export default {
  components: {
    Step1,
    Step2,
    Step3,
    Step4,
    Step5,
  },
  setup() {
    const selectedSchoolData = reactive({})
    provide('selectedSchoolData', selectedSchoolData)

    const uploadedData = reactive({})
    provide('uploadedData', uploadedData)

    const successfulEntries = reactive({})
    provide('successfulEntries', successfulEntries)

    const errorEntries = reactive({})
    provide('errorEntries', errorEntries)

    const btnAction = ref('')
    provide('btnAction', btnAction)

    return {
      uploadedData,
      selectedSchoolData,
      successfulEntries,
      errorEntries,
      btnAction,
    }
  },
  data() {
    return {
      currentStep: 1,
    }
  },
  computed: {
    currentStepComponent() {
      return `Step${this.currentStep}`
    },
  },
  methods: {
    nextStep() {
      if (this.currentStep < 6) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
  },
}
</script>
