<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheckBig, CircleX, Clock3 } from 'lucide-vue-next'
import StudentViewAllPopup from '../popups/StudentViewAllPopup.vue'
import { supabase, useAuth } from '../composables/auth'
import { displayDate, fetchRows } from '../lib/database'

interface Activity {
  id: string | number
  title: string
  requirement: string
  department: string
  personnel: string
  remarks: string
  status: 'Approved' | 'Pending' | 'Rejected'
  type: 'approved' | 'pending' | 'rejected'
  date: string
  timestamp: number
}

const studentName = ref('Student')
const clearanceProgress = ref(0)
const requirementsTotal = ref(0)
const requirementsCompleted = ref(0)
const requirementsPending = ref(0)
const requirementsRejected = ref(0)
const daysRemaining = ref(0)
const lastUpdated = ref('—')
const activePopup = ref<'activity' | null>(null)
const selectedActivity = ref<Activity | null>(null)
const activityError = ref('')
const router = useRouter()
const { getCurrentUser } = useAuth()

onMounted(async () => {
  const currentUser = await getCurrentUser()
  if (currentUser?.role === 'admin') {
    await router.replace('/admindashboard')
    return
  }

  if (currentUser?.role === 'school_personnel') {
    await router.replace('/sp/requirements')
    return
  }

  const session = localStorage.getItem('clearease-local-session')
  const savedName = localStorage.getItem('clearease-user-name')
  const savedEmail = localStorage.getItem('clearease-user-email')

  if (session) {
    try {
      const user = JSON.parse(session)
      if (user?.fullName) {
        studentName.value = user.fullName
        return
      }
    } catch {
      // ignore
    }
  }

  if (savedName) {
    studentName.value = savedName
    return
  }

  if (savedEmail) {
    const localPart = savedEmail.split('@')[0]?.trim()
    studentName.value = localPart ? localPart.charAt(0).toUpperCase() + localPart.slice(1) : 'Student'
  }
})

const recentActivities = ref<Activity[]>([])

async function loadActivities() {
  const [submissionsResult, requirementsResult, departmentsResult, profileResult, classAssignmentsResult, studentAssignmentsResult, enrolledDepartmentsResult] = await Promise.all([
    supabase
      ? supabase.rpc('get_my_clearance_submissions')
      : Promise.resolve({ data: [], error: { message: 'Supabase is not configured.' } }),
    fetchRows('requirements'),
    fetchRows('departments'),
    supabase ? supabase.rpc('get_my_profile') : Promise.resolve({ data: null, error: null }),
    supabase ? supabase.from('class_requirements').select('requirement_id, grade_level, section') : Promise.resolve({ data: [], error: null }),
    supabase ? supabase.rpc('get_my_student_requirements') : Promise.resolve({ data: [], error: null }),
    supabase
      ? supabase.from('department_students').select('department_id').eq('student_id', (await supabase.auth.getUser()).data.user?.id || '')
      : Promise.resolve({ data: [], error: null }),
  ])
  const currentUser = await getCurrentUser()
  const submissionRows = (submissionsResult.data ?? []) as Record<string, any>[]
  const submissions = submissionRows.filter((row: Record<string, unknown>) => !currentUser || String(row.student_id) === String(currentUser.id))
  const profile = profileResult.data as Record<string, any> | null
  const gradeLevel = String(profile?.grade_level || '').trim()
  const section = String(profile?.section || '').trim()
  const hasClassProfile = ['Grade 11', 'Grade 12'].includes(gradeLevel) && ['STEM', 'GAS'].includes(section)
  const classAssignments = (classAssignmentsResult.data ?? []) as Record<string, any>[]
  const studentAssignments = new Set(((studentAssignmentsResult.data ?? []) as Record<string, any>[]).map((row) => String(row.requirement_id)))
  const enrolledDepartmentIds = new Set(((enrolledDepartmentsResult.data ?? []) as Record<string, any>[]).map((row) => String(row.department_id)))
  const assignedRequirementIds = new Set<string>()
  if (hasClassProfile) {
    classAssignments
      .filter((row) => String(row.grade_level || '').trim() === gradeLevel && String(row.section || '').trim() === section)
      .forEach((row) => assignedRequirementIds.add(String(row.requirement_id)))
    studentAssignments.forEach((id) => assignedRequirementIds.add(id))
    submissions.forEach((row) => assignedRequirementIds.add(String(row.requirement_id)))
  }
  const assignedRequirements = requirementsResult.data.filter((requirement) =>
    hasClassProfile && (assignedRequirementIds.has(String(requirement.id)) || enrolledDepartmentIds.has(String(requirement.department_id))))
  const assignedRequirementIdsSet = new Set(assignedRequirements.map((requirement) => String(requirement.id)))
  const relevantSubmissions = submissions.filter((row) => assignedRequirementIdsSet.has(String(row.requirement_id)))
  const departmentNames = new Map(departmentsResult.data.map((department) => [String(department.id), String(department.name || department.title || 'Subject')]))
  const departmentPersonnel = new Map(departmentsResult.data.map((department) => [String(department.id), String(department.adviser || 'School Personnel')]))
  const subjectNames = new Map(requirementsResult.data.map((requirement) => [
    String(requirement.id),
    departmentNames.get(String(requirement.department_id)) || String(requirement.department_name || requirement.department || 'Subject'),
  ]))
  const subjectFor = (row: Record<string, any>) => subjectNames.get(String(row.requirement_id)) || String(row.department_name || row.department || row.title || row.requirement_name || 'Subject')
  const requirementFor = (row: Record<string, any>) => String(row.requirement_name || row.requirement || row.title || 'Requirement')
  const personnelFor = (row: Record<string, any>) => departmentPersonnel.get(String(requirementsResult.data.find((requirement) => String(requirement.id) === String(row.requirement_id))?.department_id)) || String(row.personnel_name || row.school_personnel || 'School Personnel')
  const sortedSubmissions = [...relevantSubmissions].sort((left, right) => {
    const leftTime = new Date(String(left.updated_at || left.created_at || 0)).getTime()
    const rightTime = new Date(String(right.updated_at || right.created_at || 0)).getTime()
    return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime)
  })
  const statuses = sortedSubmissions.map((row) => String(row.status || 'pending').toLowerCase())
  requirementsTotal.value = assignedRequirements.length
  requirementsCompleted.value = statuses.filter((status) => ['approved', 'completed', 'cleared'].includes(status)).length
  requirementsRejected.value = statuses.filter((status) => ['rejected', 'for action'].includes(status)).length
  requirementsPending.value = Math.max(requirementsTotal.value - requirementsCompleted.value - requirementsRejected.value, 0)
  clearanceProgress.value = requirementsTotal.value ? Math.round((requirementsCompleted.value / requirementsTotal.value) * 100) : 0
  lastUpdated.value = displayDate(sortedSubmissions[0]?.updated_at || sortedSubmissions[0]?.created_at)
  const deadline = assignedRequirements
    .map((row) => row.deadline)
    .filter(Boolean)
    .map((value) => new Date(String(value)).getTime())
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b)[0]
  daysRemaining.value = deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000)) : 0

  const result = await fetchRows('activity_logs')
  if (result.error || (result.data.length === 0 && relevantSubmissions.length > 0)) {
    activityError.value = result.error || ''
    recentActivities.value = sortedSubmissions.slice(0, 5).map((row, index) => {
      const rawStatus = String(row.status || 'pending').toLowerCase()
      const status = rawStatus === 'approved' ? 'Approved' : rawStatus === 'rejected' ? 'Rejected' : 'Pending'
      const timestamp = new Date(String(row.updated_at || row.created_at || 0)).getTime()
      return {
        id: row.id || index,
        title: subjectFor(row),
        requirement: requirementFor(row),
        department: String(row.department_name || row.department || '—'),
        personnel: personnelFor(row),
        remarks: String(row.remarks || 'No remarks provided.'),
        status: status === 'Rejected' ? 'Rejected' : status === 'Approved' ? 'Approved' : 'Pending',
        type: status.toLowerCase() === 'rejected' ? 'rejected' : status.toLowerCase() === 'approved' ? 'approved' : 'pending',
        date: displayDate(row.updated_at || row.created_at),
        timestamp: Number.isNaN(timestamp) ? 0 : timestamp,
      }
    })
    return
  }

  const sortedActivities = [...result.data].sort((left, right) => {
    const leftTime = new Date(String(left.created_at || left.updated_at || 0)).getTime()
    const rightTime = new Date(String(right.created_at || right.updated_at || 0)).getTime()
    return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime)
  })
  recentActivities.value = sortedActivities.slice(0, 5).map((row, index) => {
    const status = String(row.status || 'Pending')
    const timestamp = new Date(String(row.created_at || row.updated_at || 0)).getTime()
    return {
      id: row.id || index,
      title: subjectFor(row),
      requirement: requirementFor(row),
      department: String(row.department_name || row.department || '—'),
      personnel: personnelFor(row),
      remarks: String(row.remarks || row.description || 'No remarks provided.'),
      status: status === 'Rejected' ? 'Rejected' : status === 'Approved' ? 'Approved' : 'Pending',
      type: status.toLowerCase() === 'rejected' ? 'rejected' : status.toLowerCase() === 'approved' ? 'approved' : 'pending',
      date: displayDate(row.created_at),
      timestamp: Number.isNaN(timestamp) ? 0 : timestamp,
    }
  })
}

onMounted(loadActivities)

const userInitials = computed(() => {
  const names = studentName.value.split(' ')
  return names.map((n: string) => n[0]).join('').toUpperCase()
})

const toggleProfile = () => {
  console.log('Toggle profile menu')
}

const viewAllActivity = () => {
  activePopup.value = 'activity'
}

const viewActivityDetails = (activity: Activity) => {
  selectedActivity.value = activity
}

const viewActivityById = (id: string | number) => {
  const activity = recentActivities.value.find((item) => String(item.id) === String(id))
  if (activity) viewActivityDetails(activity)
}

const getActivityIconClasses = (type: string): string => {
  const iconMap: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-600',
    pending: 'bg-amber-100 text-amber-600',
    rejected: 'bg-red-100 text-red-600',
  }
  return iconMap[type] || 'bg-slate-100 text-slate-600'
}

const getActivityIcon = (type: string) => {
  const iconMap = {
    approved: CircleCheckBig,
    pending: Clock3,
    rejected: CircleX,
  }

  return iconMap[type as keyof typeof iconMap] || CircleCheckBig
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    Approved: 'text-emerald-600',
    Pending: 'text-amber-600',
    Rejected: 'text-red-600',
  }
  return colorMap[status] || 'text-slate-600'
}
</script>

<style scoped>
button {
  transition: all 0.3s ease;
}
</style>

<template>
  <section class="max-w-7xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-purple-600 font-semibold">Student Portal</p>
        <h1 class="text-3xl font-bold text-slate-900">Welcome back, {{ studentName }}</h1>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="toggleProfile"
          class="flex items-center gap-3 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-sm"
        >
          <div class="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center">
            {{ userInitials }}
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold text-slate-900">{{ studentName }}</p>
            <p class="text-xs text-slate-500">Student</p>
          </div>
        </button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p class="text-sm text-slate-500">Clearance Progress</p>
        <div class="mt-3 flex items-end justify-between">
          <h2 class="text-3xl font-bold text-slate-900">{{ clearanceProgress }}%</h2>
          <span class="text-xs font-medium text-emerald-600">On track</span>
        </div>
        <div class="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" :style="{ width: `${clearanceProgress}%` }" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p class="text-sm text-slate-500">Requirements</p>
        <h2 class="mt-3 text-3xl font-bold text-slate-900">{{ requirementsCompleted }}/{{ requirementsTotal }}</h2>
        <p class="mt-2 text-sm text-slate-600">{{ requirementsPending }} pending • {{ requirementsRejected }} rejected</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p class="text-sm text-slate-500">Days Remaining</p>
        <h2 class="mt-3 text-3xl font-bold text-slate-900">{{ daysRemaining }}</h2>
        <p class="mt-2 text-sm text-slate-600">Last updated {{ lastUpdated }}</p>
      </div>
    </div>

    <div class="mt-8 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-300 px-5 py-4">
        <h3 class="text-lg font-semibold text-slate-900">Recent Activity</h3>
        <button @click="viewAllActivity" class="text-sm font-medium text-purple-600 hover:text-purple-700">
          View all
        </button>
      </div>

      <div class="divide-y divide-slate-300">
        <div v-for="activity in recentActivities" :key="activity.id" class="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50" role="button" tabindex="0" @click="viewActivityDetails(activity)" @keyup.enter="viewActivityDetails(activity)">
          <div class="flex items-center gap-4">
            <div :class="['h-10 w-10 rounded-full border flex items-center justify-center', getActivityIconClasses(activity.type)]">
              <component :is="getActivityIcon(activity.type)" class="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <p class="font-medium text-slate-900">{{ activity.title }}</p>
              <p class="text-sm text-slate-500">{{ activity.department }}</p>
            </div>
          </div>

          <div class="text-right">
            <p :class="['text-sm font-semibold', getStatusColor(activity.status)]">{{ activity.status }}</p>
            <p class="text-xs text-slate-500">{{ activity.date }}</p>
          </div>
        </div>
      </div>
    </div>

    <StudentViewAllPopup v-if="activePopup === 'activity'" :activities="recentActivities" @close="activePopup = null" @select="viewActivityById" />

    <div v-if="selectedActivity" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="selectedActivity = null">
      <section class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Activity details">
        <div class="flex items-start justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-purple-600">Activity details</p>
            <h2 class="mt-1 text-xl font-bold text-slate-900">{{ selectedActivity.title }}</h2>
          </div>
          <button class="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close" @click="selectedActivity = null">&times;</button>
        </div>
        <div class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between gap-4"><span class="text-slate-500">Status</span><span :class="['font-semibold', getStatusColor(selectedActivity.status)]">{{ selectedActivity.status }}</span></div>
          <div class="flex justify-between gap-4"><span class="text-slate-500">Date</span><span class="font-medium text-slate-900">{{ selectedActivity.date }}</span></div>
          <div><p class="text-slate-500">Remarks from school personnel</p><p class="mt-2 rounded-lg bg-slate-50 p-3 leading-6 text-slate-800">{{ selectedActivity.remarks }}</p></div>
        </div>
        <div class="mt-6 flex justify-end"><button class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700" @click="selectedActivity = null">Close</button></div>
      </section>
    </div>
  </section>
</template>