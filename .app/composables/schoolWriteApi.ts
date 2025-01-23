// import type { UseFetchOptions } from 'nuxt/app'

// export function schoolWriteApi<T>(path: string, options: UseFetchOptions<T> = {}) {
//   const auth = useAuthStore()

//   let headers: any = {}
//   const token = localStorage.getItem('sessionToken')

//   if (token) {
//     headers['Authorization'] = token as string
//   }

//   if (auth.isLoggedIn) {
//     return useFetch('/school-write-backend' + path, {
//       ...options,
//       headers: {
//         ...headers,
//         ...options?.headers,
//       },
//       onResponseError: async ({ response }) => {
//         const { status } = response
//         switch (status) {
//           case 401:
//           case 419:
//           case 420:
//             showErrorToast(
//               'Session Expired!',
//               'Your session has expired. You are being signed out.',
//               2000,
//             )
//             await auth.logout()
//             break
//           case 500:
//             showErrorToast(
//               'Internal server error!',
//               'You are being signed out, Please login again',
//               2000,
//             )
//             // await auth.logout()
//             break
//           default:
//             // console.log('Unhandled Error')
//             break
//         }
//       },
//     })
//   }
// }

import type { UseFetchOptions } from 'nuxt/app'
import { handleApiError, retryFetch } from '~/utils/errorHandler'

export function schoolWriteApi<T>(path: string, options: UseFetchOptions<T> = {}) {
  const auth = useAuthStore()
  const token = localStorage.getItem('sessionToken')
  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = token
    headers['index'] = auth.user?.index ?? ''
  }

  if (!auth.isLoggedIn) return

  const fetchFn = () => {
    return useFetch('/school-write-backend' + path, {
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
