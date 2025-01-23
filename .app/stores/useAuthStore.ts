type Profile = {
  created_at: string
  designation: string
  organization: string
  profile_id: string
  profile_picture: string
  updated_at: string
  whatsapp_no: string
}

type User = {
  index: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  account_type: string
  profile: Profile | null
  role: string
}

type Permission = {
  role: string
  remark?: string | null
  data: Segment[]
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)
    const twoFactor = ref<boolean>(false)
    const lastAttempt = ref<string | null>(null)
    const permissions = ref<Permission | null>(null)

    const isLoggedIn = computed(() => {
      const sessionToken = localStorage.getItem('sessionToken')
      return !!user.value && twoFactor.value && !!sessionToken
    })

    async function logout() {
      const { data, error } = await useAuthFetch<any>('/api/admin-guest/logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      user.value = null
      token.value = null
      twoFactor.value = false
      lastAttempt.value = null
      permissions.value = null
      localStorage.clear()
      sessionStorage.clear()

      console.log('call logout')
      navigateTo('/')
    }

    async function login(email: string, password: string, remember: string) {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('remember', remember)

      const { data, error } = await useAuthFetch<any>('/api/admin-guest/login', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (data.value?.account_data.session_id) {
        token.value = data.value.account_data.session_id
        if (token.value !== null) {
          localStorage.setItem('sessionToken', token.value)
        }

        const loggedUser = {
          ...data.value?.account_data.account,
          profile: data.value?.account_data.profile,
          role: data.value?.account_data.role,
        }
        user.value = loggedUser
        lastAttempt.value = data.value.account_data?.last_attempt
        // permissions.value = data.value.account_data?.permissions
      }

      return { data, error }
    }

    async function updateUser(updatedUser: User) {
      user.value = updatedUser
    }

    async function setTwoFactor(value: boolean) {
      twoFactor.value = value
    }

    async function updatePermissions(permission: Permission) {
      permissions.value = permission
    }

    return {
      user,
      token,
      twoFactor,
      lastAttempt,
      permissions,
      login,
      isLoggedIn,
      logout,
      updateUser,
      setTwoFactor,
      updatePermissions,
    }
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  },
)
