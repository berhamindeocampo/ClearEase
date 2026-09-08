<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Clock3, X } from 'lucide-vue-next'
import StudentViewAllPopup from '../popups/StudentViewAllPopup.vue'
import { supabase, useAuth } from '../composables/auth'
import { displayDate, fetchRows } from '../lib/database'

interface Activity {
  id: string | number
  title: string
  department: string
  status: 'Approved' | 'Pending' | 'Rejected'
  type: 'approved' | 'pending' | 'rejected'
  date: string
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
  const submissionsResult = supabase
    ? await supabase.rpc('get_my_clearance_submissions')
    : { data: [], error: { message: 'Supabase is not configured.' } }
  const currentUser = await getCurrentUser()
  const submissionRows = (submissionsResult.data ?? []) as Record<string, any>[]
  const submissions = submissionRows.filter((row: Record<string, unknown>) => !currentUser || String(row.student_id) === String(currentUser.id))
  const statuses = submissions.map((row) => String(row.status || 'pending').toLowerCase())
  requirementsTotal.value = submissions.length
  requirementsCompleted.value = statuses.filter((status) => ['approved', 'completed', 'cleared'].includes(status)).length
  requirementsRejected.value = statuses.filter((status) => ['rejected', 'for action'].includes(status)).length
  requirementsPending.value = Math.max(requirementsTotal.value - requirementsCompleted.value - requirementsRejected.value, 0)
  clearanceProgress.value = requirementsTotal.value ? Math.round((requirementsCompleted.value / requirementsTotal.value) * 100) : 0
  lastUpdated.value = displayDate(submissions[0]?.updated_at || submissions[0]?.created_at)
  const deadline = submissions
    .map((row) => row.deadline)
    .filter(Boolean)
    .map((value) => new Date(String(value)).getTime())
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b)[0]
  daysRemaining.value = deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000)) : 0

  const result = await fetchRows('activity_logs')
  if (result.error || (result.data.length === 0 && submissions.length > 0)) {
    activityError.value = result.error || ''
    recentActivities.value = submissions.slice(0, 5).map((row, index) => {
      const rawStatus = String(row.status || 'pending').toLowerCase()
      const status = rawStatus === 'approved' ? 'Approved' : rawStatus === 'rejected' ? 'Rejected' : 'Pending'
      return {
        id: row.id || index,
        title: String(row.remarks || row.title || row.requirement_name || 'Clearance update'),
        department: String(row.department_name || row.department || '—'),
        status: status === 'Rejected' ? 'Rejected' : status === 'Approved' ? 'Approved' : 'Pending',
        type: status.toLowerCase() === 'rejected' ? 'rejected' : status.toLowerCase() === 'approved' ? 'approved' : 'pending',
        date: displayDate(row.updated_at || row.created_at),
      }
    })
    return
  }

  recentActivities.value = result.data.slice(0, 5).map((row, index) => {
    const status = String(row.status || 'Pending')
    return {
      id: row.id || index,
      title: String(row.title || row.description || 'Activity update'),
      department: String(row.department_name || row.department || '—'),
      status: status === 'Rejected' ? 'Rejected' : status === 'Approved' ? 'Approved' : 'Pending',
      type: status.toLowerCase() === 'rejected' ? 'rejected' : status.toLowerCase() === 'approved' ? 'approved' : 'pending',
      date: displayDate(row.created_at),
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
    approved: Check,
    pending: Clock3,
    rejected: X,
  }

  return iconMap[type as keyof typeof iconMap] || Check
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

    <div class="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 class="text-lg font-semibold text-slate-900">Recent Activity</h3>
        <button @click="viewAllActivity" class="text-sm font-medium text-purple-600 hover:text-purple-700">
          View all
        </button>
      </div>

      <div class="divide-y divide-slate-200">
        <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-4">
            <div :class="['h-10 w-10 rounded-full flex items-center justify-center', getActivityIconClasses(activity.type)]">
              <component :is="getActivityIcon(activity.type)" class="h-5 w-5" />
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

    <StudentViewAllPopup v-if="activePopup === 'activity'" :activities="recentActivities" @close="activePopup = null" />
  </section>
</template>