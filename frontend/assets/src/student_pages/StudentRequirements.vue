<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, Filter, BookOpen, Landmark, BadgeCheck, FlaskConical, Brain, Upload } from 'lucide-vue-next'
import StudentSubmitPopup from '../popups/StudentSubmitPopup.vue'
import StudentViewDetailsPopup from '../popups/StudentViewDetailsPopup.vue'
import { displayDate, fetchRows } from '../lib/database'
import { supabase, useAuth } from '../composables/auth'

const searchQuery = ref('')
const activeFilter = ref('All')
const selectedRequirement = ref<string | null>(null)
const activePopup = ref<'details' | 'submit' | null>(null)

const requirements = ref<Array<{ id: string; title: string; department: string; requiredDocument: string; instruction: string; deadline: string; status: string; icon: typeof BookOpen }>>([])
const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)
const { getCurrentUser } = useAuth()

const iconFor = (value: string) => {
  const normalized = value.toLowerCase()
  if (normalized.includes('finance')) return Landmark
  if (normalized.includes('registrar')) return BadgeCheck
  if (normalized.includes('project') || normalized.includes('emptech')) return FlaskConical
  if (normalized.includes('portfolio') || normalized.includes('perdev')) return Brain
  return BookOpen
}

async function loadRequirements() {
  const [requirementsResult, submissionsResult, departmentsResult, profileResult, classAssignmentsResult, studentAssignmentsResult] = await Promise.all([
    fetchRows('requirements'),
    supabase ? supabase.rpc('get_my_clearance_submissions') : Promise.resolve({ data: [], error: { message: 'Supabase is not configured.' } }),
    fetchRows('departments'),
    supabase ? supabase.rpc('get_my_profile') : Promise.resolve({ data: null, error: null }),
    supabase ? supabase.from('class_requirements').select('requirement_id, grade_level, section') : Promise.resolve({ data: [], error: null }),
    supabase ? supabase.from('student_requirements').select('requirement_id') : Promise.resolve({ data: [], error: null }),
  ])
  loadError.value = requirementsResult.error || submissionsResult.error?.message || departmentsResult.error || classAssignmentsResult.error?.message || studentAssignmentsResult.error?.message || ''
  const departmentNames = new Map(
    departmentsResult.data.map((department) => [
      String(department.id),
      String(department.name || department.title || department.id),
    ]),
  )
  const currentUser = await getCurrentUser()
  const studentSubmissions = ((submissionsResult.data ?? []) as Record<string, any>[]).filter((row) => !currentUser || String(row.student_id) === String(currentUser.id))
  const profile = profileResult.data as Record<string, any> | null
  const classAssignments = (classAssignmentsResult.data ?? []) as Record<string, any>[]
  const studentAssignments = new Set(((studentAssignmentsResult.data ?? []) as Record<string, any>[]).map((row) => String(row.requirement_id)))
  const studentClass = classAssignments.filter((row) => String(row.grade_level || '') === String(profile?.grade_level || '') && String(row.section || '') === String(profile?.section || ''))
  const assignedRequirementIds = new Set(studentClass.map((row) => String(row.requirement_id)))
  studentAssignments.forEach((id) => assignedRequirementIds.add(id))
  const hasAssignments = assignedRequirementIds.size > 0
  requirements.value = requirementsResult.data.map((row, index) => {
    const submission = studentSubmissions.find((item) => String(item.requirement_id) === String(row.id))
    return {
      id: String(row.id || index + 1),
      title: String(row.title || row.name || 'Requirement'),
      department: departmentNames.get(String(row.department_id)) || String(row.department_name || row.department || '—'),
      requiredDocument: String(row.required_document || row.document || '—'),
      instruction: String(row.instruction || row.instructions || '—'),
      deadline: displayDate(row.deadline),
      status: String(submission?.status || 'Pending').toLowerCase() === 'approved' ? 'Cleared' : String(submission?.status || 'Pending').toLowerCase() === 'rejected' ? 'Rejected' : String(submission?.status || 'Pending').toLowerCase() === 'in review' ? 'In Review' : 'Pending',
      icon: iconFor(String(row.title || row.name || '')),
    }
  }).filter((item) => !hasAssignments || assignedRequirementIds.has(item.id))
  isLoading.value = false
}

onMounted(loadRequirements)

const filteredRequirements = computed(() => {
  return requirements.value.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (activeFilter.value === 'All') return matchesSearch
    return matchesSearch && item.status === activeFilter.value
  })
})

const statusClasses: Record<string, string> = {
  Pending: 'bg-[#fbe5ea] text-[#d94d61]',
  'In Review': 'bg-[#f3efe7] text-[#a16309]',
  Cleared: 'bg-[#e8f7ee] text-[#1f9d72]',
  Rejected: 'bg-[#ffdfe4] text-[#d93c3c]',
}

const handleViewDetails = (id: string) => {
  selectedRequirement.value = id
  activePopup.value = 'details'
}

const handleSubmit = (id: string) => {
  selectedRequirement.value = id
  activePopup.value = 'submit'
}

const closePopup = () => {
  activePopup.value = null
  selectedRequirement.value = null
}

const selectedItem = computed(() => requirements.value.find((item) => item.id === selectedRequirement.value))

async function submitRequirement(file: File) {
  if (!supabase || !selectedItem.value) return

  isSubmitting.value = true
  loadError.value = ''
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Your session has expired. Please log in again.')

    const filePath = `${user.id}/${selectedItem.value.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const upload = await supabase.storage.from('clearance-submissions').upload(filePath, file)
    if (upload.error) throw upload.error

    const { error } = await supabase.rpc('submit_clearance_requirement', {
      p_requirement_id: selectedItem.value.id,
      p_file_name: file.name,
      p_file_path: filePath,
    })
    if (error) throw error

    closePopup()
    await loadRequirements()
  } catch (error: any) {
    loadError.value = error?.message || 'Could not submit the requirement.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f1eefb] text-slate-900">
    <main class="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-5">
        <h1 class="text-4xl font-black tracking-tight text-slate-900">Requirements</h1>
        <p class="mt-2 text-base text-slate-600">
          View and manage all outstanding academic and administrative requirements needed for clearance.
        </p>
      </div>

      <div class="mb-6 flex flex-col gap-3 rounded-[18px] border border-[#dfe3ea] bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:px-4">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search requirements..."
            class="w-full rounded-lg border border-[#dfe3ea] bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#8d63e8]"
          />
        </div>

        <div class="flex items-center gap-2">
          <button class="inline-flex items-center gap-2 rounded-lg border border-[#dfe3ea] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
            <Filter class="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-[18px] border border-[#dfe3ea] bg-white shadow-sm">
        <div class="grid grid-cols-[1.8fr_1.3fr_1.4fr_1.5fr_0.9fr_1.1fr] gap-3 border-b border-[#edf0f4] bg-[#f7f7fb] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">
          <div>Requirements</div>
          <div>Department</div>
          <div>Required Document</div>
          <div>Instruction</div>
          <div>Deadline</div>
          <div class="text-right">Action</div>
        </div>

        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-slate-500">Loading requirements...</div>
        <div v-else-if="loadError" class="px-4 py-8 text-center text-sm text-red-600">{{ loadError }}</div>
        <div v-else-if="filteredRequirements.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">No requirements found.</div>
        <div v-for="item in filteredRequirements" v-else :key="item.id" class="grid grid-cols-[1.8fr_1.3fr_1.4fr_1.5fr_0.9fr_1.1fr] items-center gap-3 border-b border-[#edf0f4] px-4 py-4 last:border-b-0 text-sm text-slate-700">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8e2f7] bg-[#f2ebff] text-[#7c4fe0]">
              <component :is="item.icon" class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-slate-900">{{ item.title }}</div>
              <span :class="['mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', statusClasses[item.status] || 'bg-slate-200 text-slate-700']">
                {{ item.status }}
              </span>
            </div>
          </div>

          <div>{{ item.department }}</div>
          <div>{{ item.requiredDocument }}</div>
          <div class="text-slate-600">{{ item.instruction }}</div>
          <div class="text-slate-600">{{ item.deadline }}</div>

          <div class="flex justify-end gap-2">
            <button
              @click="handleViewDetails(item.id)"
              class="rounded-lg border border-[#8d63e8] bg-white px-3 py-2 text-xs font-semibold text-[#7c4fe0] transition hover:bg-[#f3ebff]"
            >
              View Details
            </button>
            <button
              v-if="item.status !== 'Cleared'"
              @click="handleSubmit(item.id)"
              class="inline-flex items-center gap-1 rounded-lg bg-[#8d63e8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#7b54d9]"
            >
              Submit
              <Upload class="h-3.5 w-3.5" />
            </button>
            <button
              v-else
              @click="handleViewDetails(item.id)"
              class="rounded-lg border border-[#dfe3ea] bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              View Record
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <StudentViewDetailsPopup
    v-if="activePopup === 'details' && selectedItem"
    :requirement="selectedItem"
    @close="closePopup"
  />
  <StudentSubmitPopup
    v-if="activePopup === 'submit' && selectedItem"
    :requirement="selectedItem"
    @close="closePopup"
    :is-submitting="isSubmitting"
    @submitted="submitRequirement"
  />
</template>
