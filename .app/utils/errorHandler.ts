export async function handleApiError(response: any) {
  const { status } = response.response
  const auth = useAuthStore()
  const router = useRouter()
  const error = useError()

  console.error('API Error:', {
    status,
    response,
    url: response.response.url,
    method: response.options?.method,
    data: response.response._data,
  })

  const showError = (title: string, message: string) => {
    showErrorToast(title, message, 2500)
  }

  switch (status) {
    case 400:
      // showError(
      //   'Bad Request',
      //   'The server could not process your request. Please check your input and try again.',
      // )
      break

    case 401:
    case 403:
      showError(
        'Unauthorized Access',
        'You do not have permission to access this resource. Please log in and try again.',
      )
      console.log('Unauthorized Access')
      await auth.logout()
      break

    case 404:
      showError(
        'Not Found',
        'The requested resource could not be found. Please check the URL and try again.',
      )
      error.value = { statusCode: 404, message: 'The requested resource could not be found' }
      break

    case 419:
    case 420:
      showError('Session Expired', 'Your session has expired. Please log in again to continue.')
      console.log('Session Expired')
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
      console.log(`An error occurred (status code: ${status}).`)
      break
  }
}

export function retryFetch(fetchFn: any, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attemptFetch = (attempt: any) => {
      fetchFn()
        .then(resolve)
        .catch((error: any) => {
          if (attempt <= 1) {
            reject(error)
          } else {
            setTimeout(() => {
              attemptFetch(attempt - 1)
            }, delay)
          }
        })
    }
    attemptFetch(retries)
  })
}
