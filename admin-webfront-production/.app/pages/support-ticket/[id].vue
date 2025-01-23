<script setup>
import { format, formatDistanceToNow, isYesterday } from 'date-fns'

definePageMeta({
  title: 'Manage Support Request',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const replies = ref([])
const ticket = ref(null)
const displayedReplies = ref([])

const isModalImageOpen = ref(false)
const isModalVideoOpen = ref(false)

const modalTitle = ref('')
const modalBtnText = ref('')
const modalContent = ref('')
const actionType = ref('')

const isModalExceed = ref(false)
const isModalChangeTicketStatus = ref(false)

const replyMsg = ref('')
const attachedImg = ref('')
const attachedVideo = ref('')

const uploadedImgFile = ref(null)
const uploadedDocFile = ref(null)
const uploadedVideoFile = ref(null)
const uploadedFilesArray = ref([])

const openFileInput = (type) => {
  const imgFileInput = document.getElementById('imgFileInput')
  const docFileInput = document.getElementById('docFileInput')
  const vidFileInput = document.getElementById('vidFileInput')

  if (type === 'img') {
    if (imgFileInput) {
      imgFileInput.click()
    }
  } else if (type === 'doc') {
    if (docFileInput) {
      docFileInput.click()
    }
  } else {
    if (vidFileInput) {
      vidFileInput.click()
    }
  }
}

const handleFileSelection = async (event, type) => {
  const target = event.target
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (type === 'img') {
      uploadedImgFile.value = file
    } else if (type === 'doc') {
      uploadedDocFile.value = file
    } else {
      uploadedVideoFile.value = file
    }
    uploadedFilesArray.value.push(file)
  }
}

const fetchTicket = async () => {
  const { data } = await useSupportTicketService(`/api/admin-support-ticket/${id}`)
  ticket.value = data.value.data?.st_data
  replies.value = data.value.data?.st_reply
  displayedReplies.value = replies.value
}
await fetchTicket()

const formatDateTimeAgo = (dateWithTime) => {
  const date = new Date(dateWithTime)
  const now = new Date()

  if (isYesterday(date)) {
    return 'yesterday'
  }

  const distanceToNow = formatDistanceToNow(date)
  if (distanceToNow.includes('minute') || distanceToNow.includes('hour')) {
    return `${distanceToNow} ago`
  }

  const formattedDate = format(date, 'dd MMMM yyyy')
  const formattedTime = format(date, 'p')

  return `${formattedDate} | ${formattedTime}`
}

const getInitials = (name) => {
  const nameParts = name?.split(' ')
  let initials = ''
  for (const part of nameParts) {
    if (part.length > 0) {
      initials += part[0].toUpperCase()
    }
  }
  return initials
}

const statusColor = (status) => {
  switch (status) {
    case 'resolved':
      return 'tag-resolved'
    case 'in progress':
      return 'tag-in-progress'
    case 'pending':
      return 'tag-pending'
    case 'opened':
      return 'tag-opened'
    case 'closed':
      return 'tag-closed'
    default:
      break
  }
}

const isImage = (file) => {
  if (!file) return false
  return (
    file.toString().endsWith('.jpg') ||
    file.toString().endsWith('.jpeg') ||
    file.toString().endsWith('.png')
  )
}

const isDocument = (file) => {
  if (!file) return false
  return (
    file.toString().endsWith('.pdf') ||
    file.toString().endsWith('.doc') ||
    file.toString().endsWith('.docx') ||
    file.toString().endsWith('.xls') ||
    file.toString().endsWith('.xlsx') ||
    file.toString().endsWith('.txt')
  )
}

const isVideo = (file) => {
  if (!file) return false
  return file.toString().endsWith('.mp4')
}

const openImageModal = (files) => {
  attachedImg.value = getImageUrl(files)
  isModalImageOpen.value = true
}

const openVideoModal = (files) => {
  attachedVideo.value = getImageUrl(files)
  isModalVideoOpen.value = true
}

let loadedCommentsCount = 3
const loadMoreResponses = () => {
  loadedCommentsCount += 3
  displayedReplies.value = replies.value.slice(0, loadedCommentsCount)
}

const processing = ref(false)
const sendReply = async () => {
  try {
    const formData = new FormData()
    formData.append('reply_message', replyMsg.value)
    formData.append('st_id', id)
    formData.append('by', 'admin')
    formData.append('from', 'admin')

    for (const file of uploadedFilesArray.value) {
      formData.append('upload_files[]', file)
    }

    processing.value = true
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })

    const { error } = await useSupportTicketService('/api/support-ticket/reply', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    replyMsg.value = ''
    uploadedImgFile.value = null
    uploadedDocFile.value = null
    uploadedVideoFile.value = null
    processing.value = false
    uploadedFilesArray.value = []

    await fetchTicket()
    document.documentElement.scrollTo({ bottom: 0, behavior: 'smooth' })
  } catch (error) {
    processing.value = false
    showErrorToast('Oops!', error)
  }
}

const selectStatus = (type) => {
  let modalTitleText
  let modalButtonText
  let actionTypeValue
  let modalContentText

  switch (type) {
    case 'in progress':
      modalTitleText = 'Review support ticket'
      modalButtonText = 'Review'
      actionTypeValue = 'in progress'
      modalContentText = 'Are you sure you want to review this ticket?'
      break
    case 'resolved':
      modalTitleText = 'Resolve support ticket'
      modalButtonText = 'Resolve'
      actionTypeValue = 'resolved'
      modalContentText = 'Are you sure you want to resolve this ticket?'
      break
    case 'closed':
      modalTitleText = 'Close support ticket'
      modalButtonText = 'Close'
      actionTypeValue = 'closed'
      modalContentText = 'Are you sure you want to close this ticket?'
      break
    case 'reopened':
      modalTitleText = 'Reopen support ticket'
      modalButtonText = 'Reopen'
      actionTypeValue = 'reopened'
      modalContentText = 'Are you sure you want to reopen this ticket?'
      break

    default:
      throw new Error('Invalid type')
  }

  modalTitle.value = modalTitleText
  modalBtnText.value = modalButtonText
  actionType.value = actionTypeValue
  modalContent.value = modalContentText

  isModalChangeTicketStatus.value = true
}

const changeTicketStatus = async () => {
  try {
    const formData = new FormData()
    formData.append('st_id', id)
    formData.append('status', actionType.value)

    const { error } = await useSupportTicketService('/api/admin-support-ticket/action-update', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    isModalChangeTicketStatus.value = false

    if (error.value) {
      throw new Error(error.value?.data.message)
    }

    await fetchTicket()
    showSuccessToast('Success', 'Ticket status has been updated!')
  } catch (error) {
    showErrorToast('Oops!', error)
  }
}

const openDocumentInNewTab = (fileUrl) => {
  let file = getImageUrl(fileUrl)
  window.open(file, '_blank')
}

const downloadFile = (fileUrl) => {
  window.open(fileUrl, '_blank')
}

const removeFile = (type) => {
  console.log(uploadedFilesArray.value)
  if (type === 'img') {
    removeFileUpload(uploadedImgFile.value)
    uploadedImgFile.value = null
  } else if (type === 'doc') {
    removeFileUpload(uploadedDocFile.value)
    uploadedDocFile.value = null
  } else {
    removeFileUpload(uploadedVideoFile.value)
    uploadedVideoFile.value = null
  }
}

const removeFileUpload = (fileToRemove) => {
  const index = uploadedFilesArray.value.indexOf(fileToRemove)
  if (index !== -1) {
    uploadedFilesArray.value.splice(index, 1)
  }
}

const toggleExceedModal = () => {
  isModalExceed.value = !isModalExceed.value
}

const handleClickReopen = (isExceed) => {
  if (isExceed) {
    toggleExceedModal()
  } else {
    selectStatus('reopened')
  }
}

const tab = route.query.tab || 'Support tickets'
const caseId = ticket.value.case_id

const addSupportBreadcrumb = [
  {
    label: tab,
    hideLabel: false,
    to: { name: 'support_tickets', query: { tab: tab } },
  },
  {
    label: caseId,
    hideLabel: false,
  },
]

onMounted(() => {
  window.history.replaceState({}, document.title, `/support-ticket/${id}`)
})

const adminReply = 'bg-primary-50/70 dark:bg-muted-800 rounded-xl p-4 rounded-se-none space-y-4'
const userReply = 'bg-muted-200 dark:bg-muted-800 rounded-xl p-4 rounded-ss-none space-y-4'
</script>

<template>
  <div>
    <div class="flex flex-col gap-6">
      <BaseBreadcrumb :items="addSupportBreadcrumb">
        <Icon name="lucide:chevron-right" class="block size-3" />
      </BaseBreadcrumb>
    </div>

    <form method="POST" class="w-full pb-16" @submit.prevent="onSubmit">
      <BaseCard>
        <div class="flex items-center justify-between px-8 py-8 pb-4">
          <div>
            <BaseHeading
              tag="h2"
              size="md"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
            >
              Case Detailed View
            </BaseHeading>

            <BaseText size="sm" class="text-muted-600 dark:text-muted-400">
              Get a closer look at the details of your support inquiry for better assistance.
            </BaseText>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <div class="flex gap-2 items-center mr-6 text-sm">
              Status
              <BaseTag
                shape="full"
                size="sm"
                class="capitalize status-tab"
                :class="statusColor(ticket.status)"
              >
                {{ ticket.status }}
              </BaseTag>
            </div>

            <BaseDropdown
              v-if="ticket.status !== 'closed'"
              label="Action"
              orientation="end"
              size="md"
              class="add-dropdown small-dropdown"
            >
              <BaseDropdownItem
                v-if="ticket.status === 'opened'"
                title="Review"
                color="default"
                rounded="sm"
                @click="selectStatus('in progress')"
              />

              <BaseDropdownItem
                v-if="ticket.status === 'in progress'"
                title="Resolve"
                color="default"
                rounded="sm"
                @click="selectStatus('resolved')"
              />

              <BaseDropdownItem
                v-if="ticket.status === 'resolved'"
                title="Close"
                color="default"
                rounded="sm"
                @click="selectStatus('closed')"
              />

              <BaseDropdownItem
                v-if="ticket.status === 'closed' && auth.user?.index === ticket.created_by?.id"
                title="Reopen"
                color="default"
                rounded="sm"
                @click="handleClickReopen(ticket?.is_exceed)"
              />
            </BaseDropdown>
          </div>
        </div>

        <!-- case details -->
        <div class="mt-4 px-8 pb-12 space-y-4">
          <div class="flex flex-col md:flex-row gap-x-6 gap-y-4">
            <div class="flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon name="ph:identification-card" class="text-primary-500 w-5 h-5" />
                <span class="text-muted-800 text-sm">Case ID</span>
              </div>

              <div class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm">
                {{ ticket.case_id }}
              </div>
            </div>

            <div class="flex-1 flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon name="uil:subject" class="text-primary-500 w-5 h-5" />
                <span class="text-muted-800 text-sm">Subject</span>
              </div>

              <div class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm">
                {{ ticket.subject }}
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-x-6 gap-y-4">
            <div class="flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon name="mingcute:department-line" class="text-primary-500 w-5 h-5" />
                <span class="text-muted-800 text-sm">Department</span>
              </div>

              <div
                class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm min-w-[200px]"
              >
                {{ ticket.department }}
              </div>
            </div>

            <div class="flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon name="pajamas:issue-type-incident" class="text-primary-500 w-5 h-5" />
                <span class="text-muted-800 text-sm">Issue Type</span>
              </div>

              <div
                class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm min-w-[200px]"
              >
                {{ ticket.issue_type }}
              </div>
            </div>

            <div class="flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon name="ic:baseline-low-priority" class="text-primary-500 w-5 h-5" />
                <span class="text-muted-800 text-sm">Priority</span>
              </div>

              <div
                class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm min-w-[120px]"
              >
                {{ ticket.priority }}
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-x-6 gap-y-4">
            <div class="flex-1 flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon name="bx:detail" class="text-primary-500 w-5 h-5" />
                <span class="text-muted-800 text-sm w-max">Case Explanation</span>
              </div>

              <div
                v-html="ticket.explanation"
                class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm"
              />
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-x-6 gap-y-4">
            <div class="flex-1 flex border border-muted-300 rounded-md devide-x">
              <div class="flex gap-2 items-center px-4 py-3 bg-muted-100">
                <Icon
                  name="material-symbols:apk-document-outline"
                  class="text-primary-500 w-5 h-5"
                />

                <span class="text-muted-800 text-sm w-max">File submitted</span>
              </div>

              <div
                class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm gap-4"
              >
                <div class="flex gap-2" v-if="ticket.upload_files">
                  <div
                    v-for="(file, fileIndex) in ticket.upload_files"
                    :key="fileIndex"
                    class="flex gap-4"
                  >
                    <div
                      v-if="isImage(file?.url)"
                      class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
                      @click="openImageModal(file?.url)"
                    >
                      <Icon
                        name="material-symbols:imagesmode-outline"
                        class="w-5 h-5 text-muted-800"
                      />
                      <p class="text-muted-800 text-xs">{{ file?.name }}</p>
                    </div>

                    <div
                      v-if="isDocument(file?.url)"
                      class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
                      @click="openDocumentInNewTab(file?.url)"
                    >
                      <Icon name="mdi:file-document-outline" class="w-5 h-5 text-muted-800" />
                      <p class="text-muted-800 text-xs">{{ file?.name }}</p>
                    </div>

                    <div
                      v-if="isVideo(file?.url)"
                      class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
                      @click="openVideoModal(file?.url)"
                    >
                      <Icon
                        name="material-symbols:video-file-outline"
                        class="w-5 h-5 text-muted-800"
                      />
                      <p class="text-muted-800 text-xs">{{ file?.name }}</p>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  class="px-4 py-2 flex items-center text-primary-500 dark:text-muted-100 text-sm"
                >
                  No attachments available
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="mt-4 p-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center mb-4">
            <img
              v-if="auth.user?.profile?.profile_picture"
              :src="auth.user?.profile?.profile_picture"
              alt="Avatar"
              class="h-12 w-12 bg-muted-200 dark:bg-muted-700/60 rounded-full object-cover object-center"
            />

            <div
              v-else
              class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 h-8 w-8 p-6 rounded-full object-cover object-center flex items-center justify-center text-xl nui-weight-bold"
            >
              <span>{{ getInitials(`${auth.user?.first_name} ${auth.user?.last_name}`) }}</span>
            </div>

            <div class="ms-3 leading-none">
              <h4 class="font-sans text-sm font-medium">
                {{ `${auth.user?.first_name} ${auth.user?.last_name}` }}
              </h4>

              <p class="text-muted-400 font-sans text-xs font-normal">
                {{ auth.user?.profile?.organization }}
              </p>
            </div>
          </div>
          <div>
            <ShowSpinner :showSpinner="processing" label="Processing data..." />
          </div>
        </div>

        <div
          class="w-full mb-4 border border-muted-200 rounded-lg bg-muted-50 dark:bg-muted-700 dark:border-muted-600"
        >
          <div class="px-4 py-2 bg-white rounded-t-lg dark:bg-muted-800">
            <label for="comment" class="sr-only">Write a message</label>
            <textarea
              v-model="replyMsg"
              rows="4"
              class="w-full px-0 text-sm text-muted-900 bg-white border-0 dark:bg-muted-800 focus:ring-0 focus:outline-0 dark:text-white"
              placeholder="Write a message..."
              required
            ></textarea>
          </div>

          <div class="flex items-center justify-between px-3 py-2 border-t dark:border-muted-600">
            <div class="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
              <input
                id="imgFileInput"
                type="file"
                ref="fileInput"
                accept=".png,.jpg,.jpeg,.svg,.gif"
                style="display: none"
                @change="handleFileSelection($event, 'img')"
              />

              <input
                id="docFileInput"
                type="file"
                ref="fileInput"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                style="display: none"
                @change="handleFileSelection($event, 'doc')"
              />

              <input
                id="vidFileInput"
                type="file"
                ref="fileInput"
                accept=".mp4,.mov,.webm"
                style="display: none"
                @change="handleFileSelection($event, 'vid')"
              />

              <button
                type="button"
                class="inline-flex justify-center items-center p-2 text-muted-500 rounded cursor-pointer hover:text-primary-500 dark:text-muted-400 dark:hover:text-white dark:hover:bg-muted-600 relative"
                @click="uploadedImgFile ? '' : openFileInput('img')"
              >
                <BaseButtonClose
                  v-if="uploadedImgFile"
                  size="sm"
                  rounded="sm"
                  color="muted"
                  class="absolute z-[9] w-[25px] h-[25px] p-[6px] right-[-12px] top-[-6px] bg-transparent"
                  @click.stop="removeFile('img')"
                />
                <Icon name="material-symbols:imagesmode-outline" class="w-5 h-5" />
                <span class="ml-1">{{ uploadedImgFile ? uploadedImgFile.name : '' }}</span>
              </button>

              <button
                type="button"
                class="inline-flex justify-center items-center p-2 text-muted-500 rounded cursor-pointer hover:text-primary-500 dark:text-muted-400 dark:hover:text-white dark:hover:bg-muted-600 relative"
                @click="uploadedDocFile ? '' : openFileInput('doc')"
              >
                <BaseButtonClose
                  v-if="uploadedDocFile"
                  size="sm"
                  rounded="sm"
                  color="muted"
                  class="absolute z-[9] w-[25px] h-[25px] p-[6px] right-[-12px] top-[-6px] bg-transparent"
                  @click.stop="removeFile('doc')"
                />
                <Icon name="mdi:file-document-outline" class="w-5 h-5" />
                <span class="ml-1">{{ uploadedDocFile ? uploadedDocFile.name : '' }}</span>
              </button>

              <button
                type="button"
                class="inline-flex justify-center items-center p-2 text-muted-500 rounded cursor-pointer hover:text-primary-500 dark:text-muted-400 dark:hover:text-white dark:hover:bg-muted-600 relative"
                @click="uploadedVideoFile ? '' : openFileInput('vid')"
              >
                <BaseButtonClose
                  v-if="uploadedVideoFile"
                  size="sm"
                  rounded="sm"
                  color="muted"
                  class="absolute z-[9] w-[25px] h-[25px] p-[6px] right-[-12px] top-[-6px] bg-transparent"
                  @click.stop="removeFile('vid')"
                />
                <Icon name="material-symbols:video-file-outline" class="w-5 h-5" />
                <span class="ml-1">{{ uploadedVideoFile ? uploadedVideoFile.name : '' }}</span>
              </button>
            </div>

            <BaseButton
              color="primary"
              size="sm"
              class="w-full sm:w-fit !px-6"
              :disabled="processing || ticket.status === 'closed'"
              @click="sendReply"
            >
              <span>Send</span>
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <div class="space-y-4 mt-6">
        <div v-for="(reply, index) in displayedReplies" :key="index">
          <div :class="reply.reply_from === 'admin' ? adminReply : userReply">
            <div class="flex gap-6 justify-between">
              <div class="flex items-center">
                <img
                  v-if="reply.reply_by.avatar"
                  :src="reply.reply_by.avatar"
                  alt="Avatar"
                  class="h-12 w-12 bg-muted-200 dark:bg-muted-700/60 rounded-full object-cover object-center"
                />

                <div
                  v-else
                  class="relative bg-primary-500 text-muted-100 dark:bg-muted-700/60 h-8 w-8 p-6 rounded-full object-cover object-center flex items-center justify-center text-xl nui-weight-bold"
                >
                  <span>{{ getInitials(reply.reply_by.name) }}</span>
                </div>

                <div class="ms-3 leading-none">
                  <h4 class="font-sans text-sm font-medium">{{ reply.reply_by.name }}</h4>

                  <p
                    v-if="reply.reply_from === 'school'"
                    class="text-muted-400 font-sans text-xs font-normal"
                  >
                    {{ reply.reply_by?.school }} | {{ reply.reply_by?.location }}
                  </p>

                  <p v-else class="text-muted-400 font-sans text-xs font-normal">
                    {{ reply.reply_by?.organization }}
                  </p>
                </div>
              </div>

              <p class="text-muted-500 text-sm font-sans">
                {{ formatDateTimeAgo(reply.created_at) }}
              </p>
            </div>

            <p class="font-sans text-sm">{{ reply.reply_message }}</p>
            <div class="flex gap-2" v-if="reply.upload_files">
              <div
                v-for="(file, fileIndex) in reply.upload_files"
                :key="fileIndex"
                class="flex gap-4"
              >
                <div
                  v-if="isImage(file?.url)"
                  class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
                  @click="openImageModal(file?.url)"
                >
                  <Icon name="material-symbols:imagesmode-outline" class="w-5 h-5 text-muted-800" />
                  <p class="text-muted-800 text-xs">{{ file?.name }}</p>
                </div>

                <div
                  v-if="isDocument(file?.url)"
                  class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
                  @click="openDocumentInNewTab(file?.url)"
                >
                  <Icon name="mdi:file-document-outline" class="w-5 h-5 text-muted-800" />
                  <p class="text-muted-800 text-xs">{{ file?.name }}</p>
                </div>

                <div
                  v-if="isVideo(file?.url)"
                  class="flex gap-2 items-center border border-muted-400 rounded-md px-4 py-2 w-fit bg-muted-100 dark:bg-muted-200 hover:bg-muted-50 dark:hover:bg-muted-100 cursor-pointer"
                  @click="openVideoModal(file?.url)"
                >
                  <Icon name="material-symbols:video-file-outline" class="w-5 h-5 text-muted-800" />
                  <p class="text-muted-800 text-xs">{{ file?.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="mt-8 flex justify-center" v-if="displayedReplies.length > 3">
          <BaseButton color="primary" class="w-full sm:w-fit" @click="loadMoreResponses">
            <span>More Responses</span>
          </BaseButton>
        </div> -->
      </div>
    </form>

    <!-- SHOW IMAGE MODAL -->
    <TairoModal :open="isModalImageOpen" size="lg" @close="isModalImageOpen = false">
      <template #header>
        <div class="relative">
          <BaseButtonClose
            @click="isModalImageOpen = false"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>

      <div class="p-4 md:pt-16 md:p-6 overflow-y-scroll max-h-80 lg:overflow-auto lg:max-h-none">
        <div>
          <div>
            <img :src="attachedImg" class="w-full" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:px-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalImageOpen = false"> Cancel </BaseButton>

            <BaseButton color="primary" variant="solid" @click="downloadFile(attachedImg)">
              <Icon name="material-symbols:download-rounded" class="h-4 w-4" />
              <span>Download</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- SHOW VIDEO MODAL -->
    <TairoModal :open="isModalVideoOpen" size="lg" @close="isModalVideoOpen = false">
      <template #header>
        <div class="relative">
          <BaseButtonClose
            @click="isModalVideoOpen = false"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>

      <div class="p-4 md:pt-16 md:p-6 overflow-y-scroll max-h-80 lg:overflow-auto lg:max-h-none">
        <div>
          <div>
            <video class="w-full" controls>
              <source :src="attachedVideo" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:px-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalVideoOpen = false"> Cancel </BaseButton>

            <BaseButton color="primary" variant="solid" @click="downloadFile(attachedVideo)">
              <Icon name="material-symbols:download-rounded" class="h-4 w-4" />
              <span>Download</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <BaseModal
      :isOpen="isModalChangeTicketStatus"
      :title="modalTitle"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="true"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      :primaryButtonText="modalBtnText"
      :primaryButtonAction="changeTicketStatus"
      :cancelButtonText="'Cancel'"
      @close="isModalChangeTicketStatus = false"
    >
      {{ modalContent }}
    </BaseModal>

    <BaseModal
      :isOpen="isModalExceed"
      title="Action Not Permitted"
      :icon="'ph:warning-octagon-bold'"
      iconColor="warning"
      :showCancelButton="false"
      :showPrimaryButton="true"
      primaryButtonColor="primary"
      primaryButtonText="ok"
      :primaryButtonAction="toggleExceedModal"
      :cancelButtonText="'Cancel'"
      @close="isModalExceed = false"
    >
      After 7 days passed from ticket closed time, you can not reopen a ticket.
    </BaseModal>
  </div>
</template>
