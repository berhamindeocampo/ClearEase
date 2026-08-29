<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bell, Check, Clock3, X } from 'lucide-vue-next'

interface Activity {
  id: number
  title: string
  department: string
  status: 'Approved' | 'Pending' | 'Rejected'
  type: 'approved' | 'pending' | 'rejected'
  date: string
}

const studentName = ref('Amiel')
const notificationCount = ref(2)
const clearanceProgress = ref(50)
const requirementsTotal = ref(8)
const requirementsCompleted = ref(4)
const requirementsPending = ref(3)
const requirementsRejected = ref(1)
const daysRemaining = ref(45)
const lastUpdated = ref('Aug 29, 2026')

const recentActivities = ref<Activity[]>([
  {
    id: 1,
    title: 'Library Clearance Approved',
    department: 'Library',
    status: 'Approved',
    type: 'approved',
    date: 'Aug 28, 2026',
  },
  {
    id: 2,
    title: 'Finance Review Required',
    department: 'Finance',
    status: 'Pending',
    type: 'pending',
    date: 'Aug 27, 2026',
  },
  {
    id: 3,
    title: 'Guidance Approval Completed',
    department: 'Guidance',
    status: 'Approved',
    type: 'approved',
    date: 'Aug 26, 2026',
  },
  {
    id: 4,
    title: 'Registrar - Documentation Missing',
    department: 'Registrar',
    status: 'Rejected',
    type: 'rejected',
    date: 'Aug 25, 2026',
  },
])

const userInitials = computed(() => {
  const names = studentName.value.split(' ')
  return names.map((n: string) => n[0]).join('').toUpperCase()
})

const toggleNotifications = () => {
  console.log('Toggle Notifications')
}

const toggleProfile = () => {
  console.log('Toggle profile menu')
}

const viewAllActivity = () => {
  console.log('View all activity')
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
          @click="toggleNotifications"
          class="relative rounded-full bg-white border border-slate-200 p-3 text-slate-600 hover:text-slate-900"
        >
          <Bell class="h-5 w-5" />
          <span
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ notificationCount }}
          </span>
        </button>

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
  </section>
</template>