import { ref, Ref, computed } from 'vue'

interface TermObj {
  term: number
  year: number
}

interface YearTerms {
  [key: number]: TermObj[]
}

interface HistoryObj {
  [key: number]: Set<number>
}

interface YearOption {
  text: string
  value: number
}

interface TermOption {
  text: string
  value: number
}

export function useSchoolHistory(school_history: string | null, selectedYear: Ref<number>) {
  // Guard clause to handle null or empty school_history
  if (!school_history) {
    return {
      years: ref<YearOption[]>([]),
      terms: ref<TermOption[]>([]),
    }
  }

  // Parse the JSON string into an array
  const parsedHistory: YearTerms[] = JSON.parse(school_history)

  // Create the historyObj
  const historyObj: HistoryObj = {}

  // Populate the historyObj
  parsedHistory.forEach((yearTerms) => {
    yearTerms.forEach((termObj) => {
      if (termObj) {
        const { year, term } = termObj
        if (!historyObj[year]) {
          historyObj[year] = new Set<number>()
        }
        historyObj[year].add(term)
      }
    })
  })

  // Convert the Sets to arrays
  Object.keys(historyObj).forEach((year) => {
    historyObj[Number(year)] = Array.from(historyObj[Number(year)])
  })

  // Function to create the years array from historyObj
  const createYearsArray = (history: HistoryObj): YearOption[] => {
    return Object.keys(history)
      .map((year) => ({
        text: `${year}st Year`,
        value: Number(year),
      }))
      .map((year) => {
        if (year.value === 1) {
          year.text = '1st Year'
        } else if (year.value === 2) {
          year.text = '2nd Year'
        } else if (year.value === 3) {
          year.text = '3rd Year'
        }
        return year
      })
  }

  // Creating the years array
  const years: Ref<YearOption[]> = ref(createYearsArray(historyObj))

  // Function to create the terms array based on selected year
  const createTermsArray = (year: number): TermOption[] => {
    const terms =
      historyObj[year]?.map((term) => ({
        text: `${term}st Term`,
        value: term,
      })) ?? []

    // Adjust term text based on value
    return terms.map((term) => {
      if (term.value === 1) {
        term.text = '1st Term'
      } else if (term.value === 2) {
        term.text = '2nd Term'
      } else if (term.value === 3) {
        term.text = '3rd Term'
      }
      return term
    })
  }

  // Reactive terms array that updates based on the selectedYear
  const terms: Ref<TermOption[]> = computed(() => createTermsArray(selectedYear))

  return {
    years,
    terms,
  }
}
