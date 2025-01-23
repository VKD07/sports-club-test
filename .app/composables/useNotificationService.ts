import type { UseFetchOptions } from 'nuxt/app'
import { handleApiError, retryFetch } from '~/utils/errorHandler'

export function useNotificationService<T>(path: string, options: UseFetchOptions<T> = {}) {
  const auth = useAuthStore()
  const token = localStorage.getItem('sessionToken')
  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = token
    headers['index'] = auth.user?.index ?? ''
  }

  if (!auth.isLoggedIn) return

  const fetchFn = () => {
    return useFetch('/notification_service' + path, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      onResponseError: handleApiError,
    })
  }

  return retryFetch(fetchFn, 2, 1000)
}
