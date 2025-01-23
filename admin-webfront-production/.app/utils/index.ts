import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  formatDistanceToNow,
  isYesterday,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns'
import { AdminRoles } from '~/types'

export const isAlphabetical = (value: string) => /^[A-Za-z]+$/.test(value)
export const isAlphanumeric = (value: string) => /^[a-zA-Z0-9\s]+$/.test(value)
export const isPhoneNumber = (value: string) => /^\+?\d{10,}$/.test(value)

export const isSuperAdmin = computed(() => {
  const auth = useAuthStore()
  return auth.user?.role === 'Super Admin'
})

export const statusColor = (itemStatus: string) => {
  switch (itemStatus) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    case 'draft':
      return 'warning'
    default:
      break
  }
}

export const formatDate = (dateWithTime: Date): string => {
  return format(dateWithTime, 'dd MMMM yyyy')
}

export const formatDateAgo = (dateWithTime: Date | null): string => {
  if (dateWithTime === null) {
    return 'never'
  }

  const now = new Date()

  if (isYesterday(dateWithTime)) {
    return 'yesterday'
  }

  const distanceToNow = formatDistanceToNow(dateWithTime)

  if (distanceToNow.includes('minute')) {
    return `${distanceToNow} ago`
  }

  if (distanceToNow.includes('hour')) {
    return `${distanceToNow} ago`
  }

  return format(dateWithTime, 'dd MMMM yyyy')
}

export const setDateValues = (dateStart: any, dateEnd: any, datePreset: any) => {
  const today = startOfToday()

  switch (datePreset.value) {
    case 'Custom day':
    case 'Custom range':
      dateStart.value = null
      dateEnd.value = null
      break
    case 'Maximum':
      dateStart.value = new Date('2024-01-01')
      dateEnd.value = endOfDay(today)
      break
    case 'Today':
      dateStart.value = endOfDay(today)
      dateEnd.value = null
      break
    case 'Last 7 days':
      dateStart.value = subDays(today, 7)
      dateEnd.value = today
      break
    case 'Last 14 days':
      dateStart.value = subDays(today, 14)
      dateEnd.value = today
      break
    case 'This week':
      dateStart.value = startOfWeek(today)
      dateEnd.value = endOfDay(today)
      break
    case 'Last week':
      dateStart.value = startOfWeek(subDays(today, 7))
      dateEnd.value = endOfWeek(subDays(today, 7))
      break
    case 'This month':
      dateStart.value = startOfMonth(today)
      dateEnd.value = endOfDay(today)
      break
    case 'Last month':
      dateStart.value = startOfMonth(subDays(today, 30))
      dateEnd.value = endOfMonth(subDays(today, 30))
      break
    case 'This Year':
      dateStart.value = startOfYear(today)
      dateEnd.value = endOfYear(today)
      break
    default:
      dateStart.value = null
      dateEnd.value = null
  }
}

export const showSuccessToast = (
  title: string = 'Success',
  message: string,
  duration: number = 2500,
) => {
  const toaster = useToaster()
  toaster.clearAll()
  toaster.show({
    title,
    message,
    color: 'success',
    icon: 'ph:check',
    closable: true,
    duration: duration,
  })
}

export const showErrorToast = (
  title: string = 'Oops!',
  message: string,
  duration: number = 2500,
) => {
  const toaster = useToaster()
  toaster.clearAll()
  toaster.show({
    title,
    message,
    color: 'danger',
    icon: 'lucide:alert-triangle',
    closable: true,
    duration: duration,
  })
}

export const getInitialLetters = (first_name: string, last_name: string) => {
  if (!first_name?.trim() || !last_name?.trim()) {
    return ''
  }
  const [fName, lName] = [first_name, last_name].map((name) => name.charAt(0).toUpperCase())
  return `${fName}${lName}`
}

export const setMaxDate = () => {
  const currentDate = new Date()
  const nextDay = new Date(currentDate)
  nextDay.setDate(nextDay.getDate() + 1)
  return nextDay
}

export const syncProfileData = async () => {
  const auth = useAuthStore()

  const { data: updatedUser, error: syncError } = await useApiFetch<any>(
    '/api/account-sync/sync-admin-account',
    {
      method: 'POST',
      body: JSON.stringify({ token: auth.token }),
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (syncError.value) {
    console.log('syncError.error:', updatedUser.value)
  }

  if (updatedUser.value?.account_data.session_id) {
    const syncData = {
      ...updatedUser.value?.account_data.account,
      profile: updatedUser.value?.account_data.profile,
      role: updatedUser.value?.account_data.role,
    }
    await auth.updateUser(syncData)
  }
}

export const createActionTitles = (
  status: string = 'draft',
  titleText: string,
  msgText: string,
) => {
  const ActiveMsg = `Are you sure you want to activate this ${msgText}?`
  const ApproveMsg = `Are you sure you want to approve this ${msgText}?`
  const SuspendMsg = `Are you sure you want to suspend this ${msgText}?`
  const HoldMsg = `Are you sure you want to place ${msgText} on hold?`
  const ReleaseMsg = `Are you sure you want to release this ${msgText} from hold?`
  const ResumeMsg = `Are you sure you want to resume this ${msgText}?`
  const DeleteMsg = `Do you want to proceed to delete this ${msgText}?`

  switch (status) {
    case 'draft':
      return {
        title: `Approve ${titleText}`,
        buttonText: 'Approve',
        msg: ApproveMsg,
      }
    case 'active':
      return {
        title: `Release ${titleText}`,
        buttonText: 'Release',
        msg: ReleaseMsg,
      }
    case 'on hold':
      return {
        title: `Release ${titleText}`,
        buttonText: 'Release',
        msg: ReleaseMsg,
      }
    case 'suspended':
      return {
        title: `Resume ${titleText}`,
        buttonText: 'Resume',
        msg: ResumeMsg,
      }
    case 'inactive':
      return {
        title: `Delete ${titleText}`,
        buttonText: 'Delete',
        msg: DeleteMsg,
      }
    default:
      return {
        title: '',
        buttonText: '',
        msg: '',
      }
  }
}

export const createActionMenu = (status: string, titleText: string, btnAction: string) => {
  switch (status) {
    case 'draft':
      switch (btnAction) {
        case 'Active':
          return {
            title: `Approve ${titleText}`,
            buttonText: 'Approve',
          }
        case 'Delete':
          return {
            title: `Delete ${titleText}`,
            buttonText: 'Delete',
          }
      }
    case 'active':
      switch (btnAction) {
        case 'Suspend':
          return {
            title: `Suspend ${titleText}`,
            buttonText: 'Suspend',
          }
        case 'Hold':
          return {
            title: `Hold ${titleText}`,
            buttonText: 'Hold',
          }
      }
    case 'on hold':
      switch (btnAction) {
        case 'Release':
          return {
            title: `Release ${titleText}`,
            buttonText: 'Release',
          }
        case 'Suspend':
          return {
            title: `Suspend ${titleText}`,
            buttonText: 'Suspend',
          }
      }
    case 'suspended':
      switch (btnAction) {
        case 'Resume':
          return {
            title: `Resume ${titleText}`,
            buttonText: 'Resume',
          }
        case 'Delete':
          return {
            title: `Delete ${titleText}`,
            buttonText: 'Delete',
          }
      }
    default:
      return {
        title: '',
        buttonText: '',
      }
  }
}

export const actionMenuItems = (status: string, titleText: string, btnAction: string) => {
  switch (status) {
    case 'Draft':
      switch (btnAction) {
        case 'Active':
          return {
            title: `Approve ${titleText}`,
            buttonText: 'Approve',
          }
        case 'Delete':
          return {
            title: `Delete ${titleText}`,
            buttonText: 'Delete',
          }
      }
    case 'Active':
      switch (btnAction) {
        case 'Suspend':
          return {
            title: `Suspend ${titleText}`,
            buttonText: 'Suspend',
          }
        case 'Hold':
          return {
            title: `Hold ${titleText}`,
            buttonText: 'Hold',
          }
      }
    case 'On-Hold':
      switch (btnAction) {
        case 'Release':
          return {
            title: `Release ${titleText}`,
            buttonText: 'Release',
          }
        case 'Suspend':
          return {
            title: `Suspend ${titleText}`,
            buttonText: 'Suspend',
          }
      }
    case 'Suspended':
      switch (btnAction) {
        case 'Resume':
          return {
            title: `Resume ${titleText}`,
            buttonText: 'Resume',
          }
        case 'Delete':
          return {
            title: `Delete ${titleText}`,
            buttonText: 'Delete',
          }
      }
    default:
      return {
        title: '',
        buttonText: '',
      }
  }
}

export const getAdminUserRoles = async (): Promise<string[]> => {
  try {
    const { data, error } = await useApiFetch<AdminRoles[]>('/api/admin/roles/internal')

    if (error.value || !data.value || !data.value.role) {
      return []
    }

    return data.value.role.map((role) => role.name)
  } catch (error) {
    console.error('Error fetching admin roles:', error)
    return []
  }
}

export const getSchoolUserRoles = async (): Promise<string[]> => {
  try {
    const { data, error } = await useApiFetch<AdminRoles[]>('/api/admin/roles/school')

    if (error.value || !data.value || !data.value.role) {
      return []
    }

    return data.value.role.map((role) => role.name)
  } catch (error) {
    console.error('Error fetching admin roles:', error)
    return []
  }
}

export const getSchoolColors = async (): Promise<Color[]> => {
  try {
    const { data, error } = await useApiFetch('/api/get-color')

    if (error.value) {
      throw new Error('Failed to fetch theme colors')
    }

    return data.value
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getSchoolList = async (): Promise<AllSchool[]> => {
  try {
    const { data, error } = await useAdminReadService('/api/admin/all-school')

    if (error.value) {
      throw new Error('Failed to fetch schools')
    }

    const schoolData: AllSchool[] = data.value.School

    const schools: AllSchool[] = schoolData.map((school) => ({
      id: school.id,
      school_name: school.school_name,
    }))

    // Sort schools by school_name in alphabetical order
    const sortedSchools: AllSchool[] = schools.sort((a, b) =>
      a.school_name.localeCompare(b.school_name),
    )

    return sortedSchools
  } catch (error) {
    console.error('Error fetching schools:', error)
    return []
  }
}

export const getSchoolLocationsByName = async (
  schools: AllSchool[],
  schoolName: string,
): Promise<string[] | null> => {
  try {
    const getSchoolIdByName = (schoolName: string): string | null => {
      const lowercaseSchoolName = schoolName.toLowerCase()
      for (const school of schools) {
        const lowercaseCurrentSchoolName = school.school_name.toLowerCase()
        if (lowercaseCurrentSchoolName === lowercaseSchoolName) {
          return school.id
        }
      }
      return null
    }

    const schoolId = getSchoolIdByName(schoolName)
    if (!schoolId) {
      throw new Error(`School ID not found for school name "${schoolName}"`)
    }

    const { data, error } = await useSchoolReadService(`/api/school/${schoolId}`)
    if (error.value) {
      throw new Error('Failed to fetch school locations')
    }

    // const locations: string[] = data.value.School.location

    const locationNames: string[] = data.value.Location.map(
      (location: any) => location.location_name,
    )

    return locationNames
  } catch (error) {
    console.error('Error fetching school locations:', error)
    return null
  }
}

export const getSchoolDataByName = async (schools, schoolName) => {
  try {
    const getSchoolIdByName = (schoolName) => {
      const lowercaseSchoolName = schoolName.toLowerCase()
      for (const school of schools) {
        const lowercaseCurrentSchoolName = school.school_name.toLowerCase()
        if (lowercaseCurrentSchoolName === lowercaseSchoolName) {
          return school.id
        }
      }
      return null
    }

    const schoolId = getSchoolIdByName(schoolName)

    if (!schoolId) {
      throw new Error(`School ID not found for school name "${schoolName}"`)
    }

    const { data, error } = await useSchoolReadService(`/api/school/${schoolId}`)
    if (error.value) {
      throw new Error('Failed to fetch school locations')
    }

    const schoolData = data.value
    return schoolData
  } catch (error) {
    console.error('Error fetching school locations:', error)
    return null
  }
}

export const getSchoolLocationsByNameStudent = async (
  schools: AllSchool[],
  schoolName: string,
): Promise<string[] | null> => {
  try {
    const getSchoolIdByName = (schoolName: string): string | null => {
      const lowercaseSchoolName = schoolName.toLowerCase()
      for (const school of schools) {
        const lowercaseCurrentSchoolName = school.school_name.toLowerCase()
        if (lowercaseCurrentSchoolName === lowercaseSchoolName) {
          return school.id
        }
      }
      return null
    }

    const schoolId = getSchoolIdByName(schoolName)
    if (!schoolId) {
      throw new Error(`School ID not found for school name "${schoolName}"`)
    }

    const { data, error } = await useSchoolReadService(`/api/school/${schoolId}`)
    if (error.value) {
      throw new Error('Failed to fetch school locations')
    }
    const locationNames: string[] = data.value.Location.map(
      (location: any) => location.location_name,
    )

    return locationNames
  } catch (error) {
    console.error('Error fetching school locations:', error)
    return null
  }
}

export const getSchoolIdByName = async (
  schools: AllSchool[],
  schoolName: string,
): Promise<string[] | null> => {
  try {
    const lowercaseSchoolName = schoolName.toLowerCase()
    for (const school of schools) {
      const lowercaseCurrentSchoolName = school.school_name.toLowerCase()
      if (lowercaseCurrentSchoolName === lowercaseSchoolName) {
        return school.id
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching school locations:', error)
    return null
  }
}

export const getUserPermissions = async (): Promise<Permission[]> => {
  const auth = useAuthStore()
  try {
    const { data, error } = await useApiFetch<Permission[]>(
      `/api/admin/user-all-permission/${auth.user?.index}`,
    )

    if (error.value || !data.value || !data.value.permission) {
      return []
    }

    await useAuthStore().updatePermissions(data.value.permission)
    return data.value.permission
  } catch (error) {
    console.error('Error fetching user permission:', error)
    return []
  }
}

export const getFolderList = async (): Promise<Folder[]> => {
  try {
    const { data, error } = await useMediaService('/api/file/folder-list')

    if (error.value) {
      throw new Error('Failed to fetch folder list')
    }

    const folderList: Folder[] = data.value.folder_list
    return folderList
  } catch (error) {
    console.error('Error fetching folder list:', error)
    return []
  }
}

export const getAllFiles = async (): Promise<File[]> => {
  try {
    const { data, error } = await useMediaService('/api/file/all-files')

    if (error.value) {
      throw new Error('Failed to fetch files')
    }

    const fileData: File[] = data.value.folder_data
    return fileData
  } catch (error) {
    console.error('Error fetching files:', error)
    return []
  }
}

export const getFilesByFolder = async (folderName: string): Promise<File[]> => {
  try {
    const { data, error } = await useMediaService(`/api/file/folder-file/${folderName}`)

    if (error.value) {
      throw new Error('Failed to fetch files')
    }

    const folderData: File[] = data.value.folder_data
    return folderData
  } catch (error) {
    console.error('Error fetching files:', error)
    return []
  }
}

export const getDepartmentAndTasks = async (type: string): Promise<DepartmentAndTasks> => {
  try {
    const { data, error } = await useSupportTicketService(
      `/api/support-ticket/all-departments/${type}`,
    )

    if (error.value) {
      throw new Error('Failed to fetch departments')
    }
    const { departments, tasks } = data.value

    return { departments, tasks }
  } catch (error) {
    console.error('Error fetching department and tasks:', error)
    throw new Error('Failed to fetch department and tasks')
  }
}

export const getDepartmentList = async (): Promise<AllDepartment[]> => {
  try {
    const { data, error } = await useSupportTicketService(
      '/api/admin-support-ticket/all-departments',
    )

    if (error.value) {
      throw new Error('Failed to fetch departments')
    }

    const departmentsData = data.value.departments

    const departments = departmentsData.map((department) => ({
      id: department.id,
      name: department.departments,
    }))

    return departments
  } catch (error) {
    console.error('Error fetching departments:', error)
    return []
  }
}

export const getDepartmentTasksById = async (departmentId: string): Promise<DepartmentTasks[]> => {
  try {
    const { data, error } = await useSupportTicketService(
      `/api/admin-support-ticket/all-departments-task/${departmentId}`,
    )

    if (error.value) {
      throw new Error('Failed to fetch department tasks')
    }

    const departmentsTasks = data.value.tasks
    return departmentsTasks
  } catch (error) {
    console.error('Error fetching department tasks:', error)
    return []
  }
}

export const formatDateFromString = (dateString: any) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getImageUrl = (imagePath: string): string => {
  const baseUrl = 'https://dmqi9pgu9gwur.cloudfront.net'
  return `${baseUrl}${imagePath}`
}

export const getEstarsGames = async (): Promise<EstarsGames[]> => {
  try {
    const { data, error } = await useApiFetch('/api/admin/app-data/estar-games')

    if (error.value) {
      throw new Error('Failed to fetch games')
    }
    return data.value
  } catch (error) {
    console.error('Error fetching games:', error)
    return []
  }
}

export const getInitialLettersFromFullName = (full_name: string) => {
  if (!full_name?.trim()) {
    return ''
  }

  const names = full_name.split(' ').filter((name) => name.trim() !== '')

  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  } else {
    const [fName, lName] = names.map((name) => name.charAt(0).toUpperCase())
    return `${fName}${lName}`
  }
}

export const getSuffix = (number) => {
  const j = number % 10
  const k = number % 100
  if (j == 1 && k != 11) {
    return 'st'
  }
  if (j == 2 && k != 12) {
    return 'nd'
  }
  if (j == 3 && k != 13) {
    return 'rd'
  }
  return 'th'
}

export const getImagePath = (filePath) => {
  const extensionToPath = {
    '.pdf': '/img/icons/files/pdf.svg',
    '.doc': '/img/icons/files/doc.svg',
    '.docx': '/img/icons/files/doc.svg',
    '.txt': '/img/icons/files/doc.svg',
    '.xls': '/img/icons/files/sheet.svg',
    '.xlsx': '/img/icons/files/sheet.svg',
    '.csv': '/img/icons/files/sheet.svg',
    '.mp4': '/img/icons/files/video.svg',
    '.mov': '/img/icons/files/video.svg',
    '.webm': '/img/icons/files/video.svg',
  }

  const extension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase()

  return extensionToPath[extension] || '/img/icons/files/doc-2.svg'
}
