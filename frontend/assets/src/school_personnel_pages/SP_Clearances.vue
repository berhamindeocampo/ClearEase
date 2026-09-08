<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchRows, relativeDate } from '../lib/database'
import { supabase } from '../composables/auth'
import AdminReviewPopup from '../popups/AdminReviewPopup.vue'

const stats = ref([
  { value: 0, label: 'Total Students', icon: '▣', tone: 'purple' },
  { value: 0, label: 'In Progress', icon: '◔', tone: 'orange' },
  { value: 0, label: 'Completed', icon: '✓', tone: 'green' },
  { value: 0, label: 'For Action', icon: '!', tone: 'red' },
])

const clearances = ref<Array<{ id: string; student: string; requirement: string; department: string; submitted: string; status: string; fileName?: string; remarks: string }>>([])
const selectedClearance = ref<(typeof clearances.value)[number] | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedDepartment = ref('all')
const departments = ref<string[]>([])
const isLoading = ref(true)
const loadError = ref('')

async function loadClearances() {
  const [submissionsResult, profilesResult, departmentsResult, requirementsResult, assignmentsResult] = await Promise.all([
    supabase ? supabase.rpc('get_staff_clearance_submissions') : Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    fetchRows('profiles'),
    fetchRows('departments'),
    fetchRows('requirements'),
    fetchRows('department_personnel'),
  ])
  const result = {
    data: (submissionsResult.data ?? []) as Record<string, any>[],
    error: submissionsResult.error?.message ?? null,
  }
  loadError.value = result.error || profilesResult.error || departmentsResult.error || requirementsResult.error || assignmentsResult.error || ''
  const assignedDepartmentIds = new Set(assignmentsResult.data.map((assignment) => String(assignment.department_id)))
  const status = (row: Record<string, any>) => String(row.status || 'Pending')
  const rows = result.data
  departments.value = departmentsResult.data
    .filter((department) => assignedDepartmentIds.has(String(department.id)))
    .map((department) => String(department.name || department.title || '').trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
  const profiles = new Map(profilesResult.data.map((profile) => [String(profile.id), profile]))
  const requirements = new Map(requirementsResult.data.filter((requirement) => assignedDepartmentIds.has(String(requirement.department_id))).map((requirement) => [String(requirement.id), requirement]))
  const departmentGrades = new Map(departmentsResult.data.map((department) => [String(department.id), String(department.grade_level || 'Others').trim().toLowerCase()]))
  const visibleRows = rows.filter((row) => {
    const requirement = requirements.get(String(row.requirement_id))
    const student = profiles.get(String(row.student_id))
    if (!requirement || !student) return false

    const departmentGrade = departmentGrades.get(String(requirement.department_id))
    const studentGrade = String(student.grade_level || '').trim().toLowerCase()
    return Boolean(departmentGrade && studentGrade && departmentGrade === studentGrade)
  })
  const departmentNames = new Map(departmentsResult.data.map((department) => [String(department.id), String(department.name || department.title || department.id)]))
  clearances.value = visibleRows.map((row) => ({
    id: String(row.id),
    student: String(row.student_name || profiles.get(String(row.student_id))?.full_name || profiles.get(String(row.student_id))?.email || row.full_name || row.student_id || 'Unknown student'),
    requirement: String(row.requirement_name || row.title || requirements.get(String(row.requirement_id))?.title || row.requirement_id || 'Requirement'),
    department: String(row.department_name || departmentNames.get(String(requirements.get(String(row.requirement_id))?.department_id)) || row.department || '—'),
    submitted: relativeDate(row.submitted_at || row.created_at),
    fileName: row.file_name ? String(row.file_name) : undefined,
    remarks: String(row.remarks || ''),
    status: status(row).toLowerCase() === 'approved' ? 'Approved' : status(row).toLowerCase() === 'rejected' ? 'Rejected' : status(row).toLowerCase() === 'in review' ? 'In Review' : 'Pending',
  }))
  const count = (values: string[]) => visibleRows.filter((row) => values.includes(status(row).toLowerCase())).length
  stats.value = [
    { value: profilesResult.data.filter((profile) => String(profile.role || '').trim().toLowerCase() === 'student').length, label: 'Total Students', icon: '▣', tone: 'purple' },
    { value: count(['pending', 'in review', 'in_progress']), label: 'In Progress', icon: '◔', tone: 'orange' },
    { value: count(['approved', 'completed', 'cleared']), label: 'Completed', icon: '✓', tone: 'green' },
    { value: count(['rejected', 'for action']), label: 'For Action', icon: '!', tone: 'red' },
  ]
  isLoading.value = false
}

onMounted(loadClearances)

async function reviewSubmission(id: string, status: 'approved' | 'rejected', remarks: string) {
  if (!supabase) return
  const { error } = await supabase.rpc('review_clearance_submission', {
    p_submission_id: id,
    p_status: status,
    p_remarks: remarks,
  })
  if (error) {
    loadError.value = error.message
    return
  }
  await loadClearances()
}

async function reviewSelected(status: 'Approved' | 'Rejected', remarks: string) {
  if (!selectedClearance.value) return
  await reviewSubmission(selectedClearance.value.id, status.toLowerCase() as 'approved' | 'rejected', remarks)
  selectedClearance.value = null
}

const filteredClearances = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return clearances.value.filter((item) => {
    const matchesSearch = !query || [item.student, item.requirement, item.department].some((value) => value.toLowerCase().includes(query))
    const matchesStatus = selectedStatus.value === 'all' || item.status.toLowerCase() === selectedStatus.value
    const matchesDepartment = selectedDepartment.value === 'all' || item.department.toLowerCase() === selectedDepartment.value.toLowerCase()
    return matchesSearch && matchesStatus && matchesDepartment
  })
})

const statusClasses: Record<string, string> = {
  Pending: 'bg-[#fdf1d1] text-[#d58c08]',
  Approved: 'bg-[#daf9ea] text-[#0f9f67]',
  'For Action': 'bg-[#ffd6d6] text-[#d93c3c]',
}
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <main class="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-[20px] border border-[#e5e7eb] shadow-md p-4 sm:p-5 min-h-[130px] sm:min-h-[140px]">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-2xl sm:text-3xl font-semibold',
                stat.tone === 'purple' ? 'bg-[#f0e7ff] text-[#8d63e8]' :
                stat.tone === 'orange' ? 'bg-[#fff0dc] text-[#f59e0b]' :
                stat.tone === 'green' ? 'bg-[#def9ea] text-[#1ea86a]' : 'bg-[#ffdfe2] text-[#e74f57]'
              ]"
            >
              {{ stat.icon }}
            </div>
            <div class="text-2xl sm:text-3xl font-bold leading-none">{{ stat.value }}</div>
          </div>
          <div class="mt-3 sm:mt-4 text-sm font-medium text-slate-700">{{ stat.label }}</div>
          <div
            :class="[
              'mt-3 h-1 rounded-full',
              stat.tone === 'purple' ? 'bg-[#8d63e8]' :
              stat.tone === 'orange' ? 'bg-[#f59e0b]' :
              stat.tone === 'green' ? 'bg-[#1ea86a]' : 'bg-[#e74f57]'
            ]"
            :style="{ width: stat.tone === 'purple' ? '40%' : stat.tone === 'orange' ? '52%' : stat.tone === 'green' ? '74%' : '12%' }"
          />
        </div>
      </div>

      <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-[16px] border border-[#dfe3ea] bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-md">
        <div class="w-full sm:flex-1 flex items-center gap-2 rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2">
          <span class="text-slate-400 text-lg">⌕</span>
          <input v-model="searchQuery" placeholder="Search" class="w-full bg-transparent text-slate-600 text-sm outline-none" />
        </div>
        <select v-model="selectedStatus" class="w-full sm:w-auto rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-slate-600 text-sm">
          <option value="all">Status: All</option>
          <option value="pending">Pending</option>
          <option value="in review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="selectedDepartment" class="w-full sm:w-auto rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-slate-600 text-sm">
          <option value="all">Department: All</option>
          <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
        </select>
      </div>

      <div class="bg-white rounded-[20px] border border-[#dfe3ea] shadow-md overflow-x-auto">
        <div class="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
          <h2 class="text-lg sm:text-xl font-black text-slate-900">Clearances Table</h2>
        </div>

        <div class="grid grid-cols-[1.5fr_1.4fr_1.2fr_1fr_1.4fr] gap-3 px-4 sm:px-5 py-3 border-b border-[#edf0f4] bg-[#f3f4f6] text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
          <div>Students</div>
          <div>Requirements</div>
          <div>Department</div>
          <div>Submitted</div>
          <div>Status</div>
        </div>

        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-slate-500">Loading clearances...</div>
        <div v-else-if="loadError" class="px-4 py-8 text-center text-sm text-red-600">{{ loadError }}</div>
        <div v-else-if="filteredClearances.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">No clearance submissions found.</div>
        <div v-for="item in filteredClearances" v-else :key="item.id" class="grid grid-cols-[1.5fr_1.4fr_1.2fr_1fr_1.4fr] gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#edf0f4] last:border-b-0 items-center text-xs sm:text-sm text-slate-700">
          <div>{{ item.student }}</div>
          <div>{{ item.requirement }}</div>
          <div>{{ item.department }}</div>
          <div>{{ item.submitted }}</div>
          <div>
            <div class="flex items-center gap-2">
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusClasses[item.status] || 'bg-slate-200 text-slate-700']">{{ item.status }}</span>
              <button v-if="item.status === 'Pending' || item.status === 'In Review'" class="rounded-lg bg-[#8d63e8] px-2 py-1 text-xs font-semibold text-white" @click="selectedClearance = item">Review</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <AdminReviewPopup v-if="selectedClearance" :document="selectedClearance" @close="selectedClearance = null" @reviewed="reviewSelected" />
</template>
