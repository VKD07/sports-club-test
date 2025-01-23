import type { UseFetchOptions } from 'nuxt/app'

export function useBulkUpload<T>(path: string, options: UseFetchOptions<T> = {}) {
  const auth = useAuthStore()

  let headers: any = {}
  const token = localStorage.getItem('sessionToken')

  if (token) {
    headers['Authorization'] = token as string
    headers['index'] = auth.user?.index
  }

  if (auth.isLoggedIn) {
    return useFetch('/admin_service' + path, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
      onResponseError: async ({ response, request }) => {
        const { status } = response

        // Check if the request was aborted
        if (request?.signal?.aborted) {
          console.log('Request was aborted by the user')
          throw new Error('AbortError')
        }

        switch (status) {
          case 400:
            // Handle 400 - Bad Request
            showError(
              'Bad Request',
              'The server could not process your request. Please check your input and try again.',
            )
            break

          case 401:
          case 403:
            showError(
              'Unauthorized Access',
              'You do not have permission to access this resource. Please log in and try again.',
            )
            await auth.logout()
            break

          case 404:
            showError(
              'Not Found',
              'The requested resource could not be found. Please check the URL and try again.',
            )
            break

          case 419:
          case 420:
            showError(
              'Session Expired',
              'Your session has expired. Please log in again to continue.',
            )
            await auth.logout()
            break

          case 500:
            showError(
              'Internal Server Error',
              'An unexpected error occurred while processing your request. Please refresh the page or try again later.',
            )
            await router.push('/error')
            break

          default:
            console.log(`An unknown error occurred (status code: ${status}).`)
            break
        }
      },
    })
  }
}
