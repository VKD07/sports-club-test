interface Permissions {
  [key: string]: boolean
}

export default async function usePermissionChecker(
  segmentName: string,
  pageName: string,
): Promise<Ref<Permissions>> {
  try {
    const auth = useAuthStore()
    const userPermissions = auth.permissions

    // const userPermissions = await getUserPermissions()

    const checkPermissions = computed(() => {
      const defaultPermissions = {
        Approve: false,
        Create: false,
        Delete: false,
        Export: false,
        Update: false,
        View: false,
      }

      if (!userPermissions || !userPermissions.data || userPermissions.data.length === 0) {
        return defaultPermissions
      }

      const targetSegment = userPermissions.data.find((p) => p.segment === segmentName)
      if (!targetSegment) return defaultPermissions

      const targetPage = targetSegment.pages.find((p) => p.page === pageName)
      if (!targetPage) return defaultPermissions

      const actions: string[] = ['Create', 'View', 'Update', 'Approve', 'Delete', 'Export']
      const permissionActions: Record<string, boolean> = {}

      actions.forEach((action) => {
        permissionActions[action] = targetPage.actions?.some((a) => a.action === action) || false
      })

      return permissionActions
    })

    const create = checkPermissions.value.Create
    const _delete = checkPermissions.value.Delete
    const _export = checkPermissions.value.Export
    const update = checkPermissions.value.Update
    const view = checkPermissions.value.View
    const approve = checkPermissions.value.Approve

    return {
      _delete,
      _export,
      create,
      update,
      view,
      approve,
    }
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    const defaultPermissions = {
      Approve: false,
      Create: false,
      Delete: false,
      Export: false,
      Update: false,
      View: false,
    }
    return computed(() => defaultPermissions) as Ref<Permissions>
  }
}
