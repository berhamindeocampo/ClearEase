<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminHeader from '../headers/AdminHeader.vue'
import AdminReviewPopup from '../popups/AdminReviewPopup.vue'
import { supabase } from '../composables/auth'
import { fetchRows, relativeDate } from '../lib/database'

interface StatCard {
  value: number
  label: string
  icon: string
  type: 'purple' | 'orange' | 'green' | 'red'
}

interface VerificationDocument {
  id: string
  student: string
  requirement: string
  department: string
  submitted: string
}

const activePage = ref('Dashboard')
const mobileMenuOpen = ref(false)
const selectedDocument = ref<VerificationDocument | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const statistics = ref<StatCard[]>([])

const documents = ref<VerificationDocument[]>([])

const counts = computed(() => {
  const total = statistics.value.find((stat) => stat.label === 'Total Students')?.value ?? 0
  const inProgress = statistics.value.find((stat) => stat.label === 'In Progress')?.value ?? 0
  const completed = statistics.value.find((stat) => stat.label === 'Completed')?.value ?? 0
  const action = statistics.value.find((stat) => stat.label === 'For Action')?.value ?? 0
  return { total, inProgress, completed, action }
})

const overviewPercentages = computed(() => {
  const total = counts.value.inProgress + counts.value.completed + counts.value.action
  if (!total) return { completed: 0, inProgress: 0, action: 0 }

  return {
    completed: Math.round((counts.value.completed / total) * 100),
    inProgress: Math.round((counts.value.inProgress / total) * 100),
    action: Math.round((counts.value.action / total) * 100),
  }
})

async function loadDashboard() {
  const [profilesResult, submissionsResult] = await Promise.all([fetchRows('profiles'), fetchRows('clearance_submissions')])
  loadError.value = profilesResult.error || submissionsResult.error || ''
  const submissions = submissionsResult.data
  const status = (row: Record<string, any>) => String(row.status || '').toLowerCase()
  const completed = submissions.filter((row) => ['approved', 'completed', 'cleared'].includes(status(row))).length
  const action = submissions.filter((row) => ['rejected', 'for action'].includes(status(row))).length
  const inProgress = Math.max(submissions.length - completed - action, 0)
  statistics.value = [
    { value: profilesResult.data.filter((profile) => profile.role === 'student').length, label: 'Total Students', icon: '▣', type: 'purple' },
    { value: inProgress, label: 'In Progress', icon: '⌛', type: 'orange' },
    { value: completed, label: 'Completed', icon: '✓', type: 'green' },
    { value: action, label: 'For Action', icon: '!', type: 'red' },
  ]
  documents.value = submissions.slice(0, 5).map((row) => ({
    id: String(row.id),
    student: row.student_name || row.full_name || row.student_email || String(row.student_id || 'Unknown student'),
    requirement: row.requirement_name || row.title || String(row.requirement_id || 'Requirement'),
    department: row.department_name || String(row.department || '—'),
    submitted: relativeDate(row.submitted_at || row.created_at),
  }))
  isLoading.value = false
}

async function reviewSubmission(status: 'Approved' | 'Rejected') {
  if (!supabase || !selectedDocument.value) return

  const { error } = await supabase
    .from('clearance_submissions')
    .update({ status: status.toLowerCase() })
    .eq('id', selectedDocument.value.id)

  if (error) {
    loadError.value = error.message
    return
  }

  selectedDocument.value = null
  await loadDashboard()
}

onMounted(loadDashboard)

// Tailwind's default palette doesn't cover these exact brand colors,
// so we map each stat "type" to arbitrary-value utility classes.
const iconClasses: Record<StatCard['type'], string> = {
  purple: 'bg-[#e7e2ff] text-[#6937d8]',
  orange: 'bg-[#fff0dc] text-[#f7941d]',
  green: 'bg-[#dff7eb] text-[#20a76b]',
  red: 'bg-[#ffdfe4] text-[#f0444f]'
}

const lineClasses: Record<StatCard['type'], string> = {
  purple: 'bg-[#6937d8]',
  orange: 'bg-[#f7941d]',
  green: 'bg-[#20a76b]',
  red: 'bg-[#f0444f]'
}

const setActivePage = (page: string) => {
  activePage.value = page
  mobileMenuOpen.value = false
}

const reviewDocument = (student: string) => {
  selectedDocument.value = documents.value.find((document) => document.student === student) ?? null
}
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-[#111111] font-sans">
    <AdminHeader />
    <main class="w-full max-w-[1400px] mx-auto px-4 pt-6 pb-8 sm:px-6 sm:pt-8 md:px-8 md:pt-10">
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        <div
          v-for="stat in statistics"
          :key="stat.label"
          class="relative h-[140px] sm:h-[150px] bg-white rounded-[20px] overflow-hidden shadow-md"
        >
          <div class="h-full flex items-center px-4 sm:px-5">
            <div
              class="flex items-center justify-center flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg text-2xl sm:text-3xl font-medium"
              :class="iconClasses[stat.type]"
            >
              {{ stat.icon }}
            </div>
            <div class="ml-3 sm:ml-4">
              <div class="text-3xl sm:text-4xl font-bold leading-none text-black">
                {{ stat.value }}
              </div>
              <div class="mt-1 text-xs sm:text-sm leading-none text-black">
                {{ stat.label }}
              </div>
            </div>
          </div>

          <div
            class="absolute bottom-0 left-0 h-1 w-[35%]"
            :class="lineClasses[stat.type]"
          ></div>
        </div>
      </section>
      <section class="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4 mt-6 sm:mt-8">
        <section class="bg-white rounded-[20px] shadow-md overflow-hidden p-4 sm:p-5 md:p-6">
          <h2 class="m-0 text-lg sm:text-xl font-bold text-[#5225bd]">
            Clearance Overview
          </h2>
          <div class="mt-5 sm:mt-6">
            <div class="flex items-center text-sm sm:text-base">
              <span>Completed</span>
                <strong class="ml-2 font-bold">{{ counts.completed }}</strong>
            </div>

            <div class="flex items-center gap-3 mt-2">
              <div class="flex-1 h-2 overflow-hidden rounded-full bg-[#bda3ff]">
                <div class="h-full rounded-full bg-[#5520c5]" :style="{ width: `${overviewPercentages.completed}%` }"></div>
              </div>
              <span class="w-8 text-sm">{{ overviewPercentages.completed }}%</span>
            </div>
          </div>

          <div class="mt-5 sm:mt-6">
            <div class="flex items-center text-sm sm:text-base">
              <span>In Progress</span>
                <strong class="ml-2 font-bold">{{ counts.inProgress }}</strong>
            </div>

            <div class="flex items-center gap-3 mt-2">
              <div class="flex-1 h-2 overflow-hidden rounded-full bg-[#bda3ff]">
                <div class="h-full rounded-full bg-[#5520c5]" :style="{ width: `${overviewPercentages.inProgress}%` }"></div>
              </div>
              <span class="w-8 text-sm">{{ overviewPercentages.inProgress }}%</span>
            </div>
          </div>

          <!-- NEEDS ACTION -->
          <div class="mt-5 sm:mt-6">
            <div class="flex items-center text-sm sm:text-base">
              <span>Needs Action</span>
                <strong class="ml-2 font-bold">{{ counts.action }}</strong>
            </div>

            <div class="flex items-center gap-3 mt-2">
              <div class="flex-1 h-2 overflow-hidden rounded-full bg-[#bda3ff]">
                <div class="h-full rounded-[20px] bg-[#ed0000]" :style="{ width: `${overviewPercentages.action}%` }"></div>
              </div>
              <span class="w-10 text-xl">{{ overviewPercentages.action }}%</span>
            </div>
          </div>
        </section>
        <section class="bg-white rounded-[20px] shadow-md overflow-hidden">
          <div class="flex items-center justify-between px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <h2 class="m-0 text-lg sm:text-xl font-bold text-[#5225bd]">
              Documents Awaiting Verification
            </h2>
            <a
              href="#"
              class="text-[#5225bd] text-sm sm:text-base no-underline hover:underline"
              @click.prevent="setActivePage('Clearances')"
            >
              View All
            </a>
          </div>

          <div class="grid grid-cols-[1.1fr_1.25fr_0.85fr_0.7fr_80px] gap-2 bg-[#f2f1f4] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold overflow-x-auto">
            <div>Students</div>
            <div>Requirements</div>
            <div>Department</div>
            <div>Submitted</div>
            <div></div>
          </div>

          <div v-if="isLoading" class="px-4 py-6 text-center text-sm text-slate-500">Loading records...</div>
          <div v-else-if="loadError" class="px-4 py-6 text-center text-sm text-red-600">{{ loadError }}</div>
          <div v-for="document in documents" v-else :key="document.id"
            class="grid grid-cols-[1.1fr_1.25fr_0.85fr_0.7fr_80px] gap-2 items-center min-h-[60px] sm:min-h-[72px] px-3 sm:px-4 border-b border-[#cccccc] last:border-b-0 text-xs sm:text-sm text-[#444444] overflow-x-auto"
          >
            <div>{{ document.student }}</div>
            <div>{{ document.requirement }}</div>
            <div>{{ document.department }}</div>
            <div>{{ document.submitted }}</div>
            <div class="text-right">
              <button
                class="border-none bg-[#7545e8] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#6334d6]"
                @click="reviewDocument(document.student)"
              >
                Review
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
    <AdminReviewPopup
      v-if="selectedDocument"
      :document="selectedDocument"
      @close="selectedDocument = null"
      @reviewed="reviewSubmission"
    />
  </div>
</template>