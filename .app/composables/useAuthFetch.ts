import type { UseFetchOptions } from 'nuxt/app'

export function useAuthFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
  const auth = useAuthStore()

  let headers: any = {}
  const token = localStorage.getItem('sessionToken')

  if (token) {
    headers['Authorization'] = token as string
    headers['index'] = auth.user?.index
  }

  return useFetch('/admin_service' + path, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  })
}
