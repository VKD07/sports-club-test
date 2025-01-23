export interface AdminProfile {
  profile_id: string
  designation: string | null
  organization: string | null
  profile_picture: string | null
  whatsapp_no: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  role: string
  status: string
  created_at: string
  account_type: string
  admin_profile: AdminProfile | null
  email_verified_at: string | null
  last_attempt: string | null
  location: string | null
  phone_number: string | null
  school: string | null
  updated_at: string | null
}

export interface schoolAdminProfile {
  profile_id: string
  designation: string | null
  organization: string | null
  profile_picture: string | null
  whatsapp_no: string | null
  created_at: string
  updated_at: string
}

export interface SchoolUser {
  id: string
  user_id: string
  account_type: string
  first_name: string
  last_name: string
  email: string
  email_verified_at: string | null
  created_at: string
  last_attempt: string | null
  location: string
  phone_number: string
  role: string
  school: string
  school_admin_profile: schoolAdminProfile | null
  status: string
  updated_at: string
}

export interface Location {
  id: number
  src: string
  locationName: string
  locationId: string
  schoolName: string
  createdDate: string
  term: string
  status: string
  students: string
}

export interface AdminRoles {
  message: string
  role: {
    uuid: string
    name: string
    for: string
    guard_name: string
    created_at: string
    updated_at: string
  }
}

export interface School {
  id: string
  school_name: string
  school_type: string
  school_join_year: string
  school_join_term: string
  school_id: string
  status: string
  created_at: string
  schoolLogo: string
  primary_contact_person_email: string
  no_of_student: string
  locations_count: string
  colorVarient: string
  color: string
}

interface Action {
  id: string
  action: string
}

interface Page {
  page: string
  actions?: Action[]
}

interface Segment {
  segment: string
  pages?: Page[]
}

export interface Permission {
  permissions: Segment[]
}

export interface Folder {
  name: string
}

export interface File {
  index: string
  url: string
}

export interface FilteredFile {
  category: string
  url: string
  created_at: string
}

export interface DepartmentAndTasks {
  departments: string[]
  tasks: string[]
}

export interface AllDepartment {
  id: string
  departments: string
}

export interface DepartmentTasks {
  id: number
  dep_id: string
  tasks: string
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: string
  case_id: string
  from: string
  subject: string
  department: string
  issue_type: string
  priority: string
  explanation: string
  upload_files: string[]
  created_by: string
  status: string
  created_at: string
  updated_at: string
}

export interface Color {
  id: number
  color: string
  variation: string
  code: string
}

export interface SupportTicket {
  st_data: TicketData
  st_reply: Reply
  message: string
}

interface TicketData {
  id: string
  case_id: string
  from: string
  subject: string
  department: string
  issue_type: string
  priority: string
  explanation: string
  upload_files: string
  name: string
  created_by: {
    id: string
    code: string
    email: string
    name: string
    avatar: string | null
  }
  opened_by: {
    id: string
    code: string
    email: string
    name: string
    avatar: string | null
  }
  status: string
  created_at: string
  updated_at: string
}

interface Reply {
  id: string
  reply_by: {
    id: string
    code: string
    email: string
    name: string
    avatar: string | null
  }
  reply_message: string
  upload_files: string | null
  created_at: string
  updated_at: string
}

export interface EstarsGames {
  name: string
}