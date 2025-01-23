<script setup lang="ts">
interface Action {
  id: string
  action: string
}

interface Segment {
  segment: string
  pages: Page[]
}

interface Page {
  page: string
  actions: Action[]
}

const auth = useAuthStore()
const route = useRoute()

const permission = reactive({
  activeUser: '',
  roleRemark: '',
})

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const segments = ref<any[]>([])
const userPermissions = ref<any[]>([])
const allActionIds = ref<string[]>([])

const collectAllActionIds = (segmentsArray: Segment[]): string[] => {
  const actionIds: string[] = []

  segmentsArray.forEach((segment: Segment) => {
    segment.pages.forEach((page: Page) => {
      page.actions.forEach((action: Action) => {
        actionIds.push(action.id)
      })
    })
  })

  return actionIds
}

const fetchAllPermission = async (): Promise<void> => {
  const { data } = await useApiFetch<any>('/api/admin/permissions/admin')
  segments.value = data?.value?.permission
}
await fetchAllPermission()

const fetchUser = async (): Promise<void> => {
  const { data } = await useApiFetch<any>(`/api/admin/user-all-permission/${id}`)
  userPermissions.value = data?.value?.permission.data
  permission.activeUser = data?.value?.permission?.role
  permission.roleRemark = data?.value?.permission?.remark

  allActionIds.value = collectAllActionIds(userPermissions.value)
}
await fetchUser()

const resetPermissions = async () => {
  userPermissions.value = []
  await fetchUser()
}

const checkUserPermission = (segment: Segment, page: Page, permission: string): boolean => {
  const userSegment = userPermissions.value.find((userSegment) => userSegment.segment === segment.segment)
  if (!userSegment) return false

  const userPage = userSegment.pages.find((userPage: any) => userPage.page === page.page)
  if (!userPage) return false

  return userPage.actions.some((userAction: any) => userAction.action === permission)
}

const handleCheckboxClick = (action: any[], isChecked: boolean, permission: string) => {
  if (!action) {
    console.error('Action ID not found for permission:', permission)
    return
  }

  const updatedActionIds = [...allActionIds.value]

  const targetActionObject = action.find((a: any) => a.action === permission)
  const id = targetActionObject ? targetActionObject.id : null

  if (isChecked) {
    const index = updatedActionIds.indexOf(id)
    if (index !== -1) {
      updatedActionIds.splice(index, 1)
    }
  } else {
    if (!updatedActionIds.includes(id)) {
      updatedActionIds.push(id)
    }
  }

  allActionIds.value = updatedActionIds
}

const onSubmit = async () => {
  try {
    const formData = new FormData()
    formData.append('user_id', id)
    formData.append('remark', permission.roleRemark)
    allActionIds.value.forEach((actionId, index) => {
      formData.append(`permissions[${index}]`, actionId)
    })

    const { error } = await useApiFetch<any>('/api/admin/sync-model-permission', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      showErrorToast('Oops!', `${error.value?.data.message}`)
      return
    }

    fetchUser()
    showSuccessToast('Success', 'User permissions updated successfully!')
  } catch (error) {
    showErrorToast('Oops!', 'Something went wrong, please try again!')
  } finally {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })

    if (auth.user?.index === id) {
      await syncProfileData()
    }
  }
}
</script>

<template>
  <div class="relative">
    <div class="absolute top-0 right-0 flex items-center gap-2 pt-2 pb-2">
      <BaseButton class="w-24" to="/users">Cancel</BaseButton>
      <BaseButton color="primary" class="w-24" @click="onSubmit"> Update </BaseButton>
    </div>

    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between py-4">
        <div>
          <BaseHeading tag="h2" size="md" weight="medium" lead="normal" class="uppercase tracking-wider text-primary-500 dark:text-muted-100">
            User role and access
          </BaseHeading>

          <BaseText size="sm" class="text-muted-600 dark:text-muted-400"> Customize user access and permissions for each segment </BaseText>
        </div>
      </div>

      <div class="flex lg:items-center gap-4 md:gap-12 py-4 my-2 flex-col md:flex-row max-w-5xl">
        <div class="flex gap-1 md:gap-4 items-start md:items-center w-full flex-col md:flex-row">
          <p>Active user role</p>
          <div class="flex-1 w-full">
            <BaseInput v-model="permission.activeUser" disabled />
          </div>
        </div>

        <div class="flex gap-1 md:gap-4 items-start md:items-center w-full flex-col md:flex-row">
          <p>Role Remark</p>
          <div class="flex-1 w-full">
            <BaseInput v-model="permission.roleRemark" placeholder="Type here" />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between py-4">
        <div>
          <BaseHeading tag="h2" size="sm" weight="medium" lead="normal" class="uppercase tracking-wider text-primary-500 dark:text-muted-100">
            Permissions table
          </BaseHeading>
        </div>
      </div>

      <div>
        <TairoTable rounded="none">
          <template #header>
            <TairoTableHeading uppercase class="p-4"> Permissions table </TairoTableHeading>
            <TairoTableHeading uppercase class="text-center w-24 px-2"> Create </TairoTableHeading>
            <TairoTableHeading uppercase class="text-center w-24 px-2"> View </TairoTableHeading>
            <TairoTableHeading uppercase class="text-center w-24 px-2"> Update </TairoTableHeading>
            <TairoTableHeading uppercase class="text-center w-24 px-2"> Approve </TairoTableHeading>
            <TairoTableHeading uppercase class="text-center w-24 px-2"> Delete </TairoTableHeading>
            <TairoTableHeading uppercase class="text-center w-24 px-2"> Export </TairoTableHeading>
          </template>

          <template v-for="segment in segments" :key="segment.segment">
            <TairoTableRow>
              <TairoTableCell class="p-4">
                <p class="!text-base !font-medium">{{ segment.segment }}</p>
              </TairoTableCell>
            </TairoTableRow>

            <template v-for="page in segment.pages" :key="page.page">
              <TairoTableRow>
                <TairoTableCell class="ps-8 !text-base">{{ page.page }}</TairoTableCell>

                <TairoTableCell>
                  <div class="flex items-center justify-center">
                    <BaseCheckbox
                      v-if="page.actions.some((action: any) => action.action === 'Create')"
                      :model-value="checkUserPermission(segment, page, 'Create')"
                      rounded="none"
                      @click="handleCheckboxClick(page.actions, checkUserPermission(segment, page, 'Create'), 'Create')"
                    />
                  </div>
                </TairoTableCell>

                <TairoTableCell>
                  <div class="flex items-center justify-center">
                    <BaseCheckbox
                      v-if="page.actions.some((action: any) => action.action === 'View')"
                      :model-value="checkUserPermission(segment, page, 'View')"
                      rounded="none"
                      @click="handleCheckboxClick(page.actions, checkUserPermission(segment, page, 'View'), 'View')"
                    />
                  </div>
                </TairoTableCell>

                <TairoTableCell>
                  <div class="flex items-center justify-center">
                    <BaseCheckbox
                      v-if="page.actions.some((action: any) => action.action === 'Update')"
                      :model-value="checkUserPermission(segment, page, 'Update')"
                      rounded="none"
                      @click="handleCheckboxClick(page.actions, checkUserPermission(segment, page, 'Update'), 'Update')"
                    />
                  </div>
                </TairoTableCell>

                <TairoTableCell>
                  <div class="flex items-center justify-center">
                    <BaseCheckbox
                      v-if="page.actions.some((action: any) => action.action === 'Approve')"
                      :model-value="checkUserPermission(segment, page, 'Approve')"
                      rounded="none"
                      @click="handleCheckboxClick(page.actions, checkUserPermission(segment, page, 'Approve'), 'Approve')"
                    />
                  </div>
                </TairoTableCell>

                <TairoTableCell>
                  <div class="flex items-center justify-center">
                    <BaseCheckbox
                      v-if="page.actions.some((action: any) => action.action === 'Delete')"
                      :model-value="checkUserPermission(segment, page, 'Delete')"
                      rounded="none"
                      @click="handleCheckboxClick(page.actions, checkUserPermission(segment, page, 'Delete'), 'Delete')"
                    />
                  </div>
                </TairoTableCell>

                <TairoTableCell>
                  <div class="flex items-center justify-center">
                    <BaseCheckbox
                      v-if="page.actions.some((action: any) => action.action === 'Export')"
                      :model-value="checkUserPermission(segment, page, 'Export')"
                      rounded="none"
                      @click="handleCheckboxClick(page.actions, checkUserPermission(segment, page, 'Export'), 'Export')"
                    />
                  </div>
                </TairoTableCell>
              </TairoTableRow>
            </template>
          </template>
        </TairoTable>
      </div>

      <div class="flex items-center gap-2 pt-12 pb-8">
        <BaseButton class="w-24" @click="resetPermissions">Reset</BaseButton>
        <BaseButton type="submit" color="primary" class="w-24"> Update </BaseButton>
      </div>
    </form>
  </div>
</template>
