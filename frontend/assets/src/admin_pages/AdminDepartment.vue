<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminHeader from '../headers/AdminHeader.vue'
import AdminAddDepartmentPopup from '../popups/AdminAddDepartmentPopup.vue'
import AdminManagePopup from '../popups/AdminManagePopup.vue'
import { supabase } from '../composables/auth'
import { fetchRows } from '../lib/database'

const levelOptions = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Others']
type StudentOption = { id: string; name: string; studentId: string; gradeLevel: string; section: string }
const departments = ref<Array<{ id: string; name: string; adviser: string; gradeLevel: string; requirement: string; requirements: string[]; action: string; studentIds: string[] }>>([])
const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const activePopup = ref<'add' | 'manage' | null>(null)
const selectedDepartment = ref<(typeof departments.value)[number] | null>(null)
const selectedDepartmentDetail = ref<(typeof departments.value)[number] | null>(null)
const adviserOptions = ref(['N/A'])
const studentOptions = ref<StudentOption[]>([])
const activeLevel = ref('Grade 7')

const filteredDepartments = computed(() => departments.value.filter((item) =>
  item.gradeLevel === activeLevel.value && item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
))

async function addDepartment(form: { name: string; adviser: string; gradeLevel: string }) {
  if (!supabase) {
    loadError.value = 'Supabase is not configured.'
    return
  }

  const { error } = await supabase.from('departments').insert({ name: form.name.trim(), adviser: form.adviser.trim(), grade_level: form.gradeLevel })
  if (error) {
    loadError.value = error.message
    return
  }

  activePopup.value = null
  await loadDepartments()
}

async function deleteDepartment(departmentId: string) {
  if (!supabase) {
    loadError.value = 'Supabase is not configured.'
    return
  }

  const { error } = await supabase.from('departments').delete().eq('id', departmentId)
  if (error) {
    loadError.value = error.message
    return
  }

  activePopup.value = null
  selectedDepartment.value = null
  await loadDepartments()
}

async function updateDepartment(departmentId: string, name: string, adviser: string, gradeLevel: string, studentIds: string[]) {
  if (!supabase) {
    loadError.value = 'Supabase is not configured.'
    return
  }

  saveError.value = ''
  const { error } = await supabase.from('departments').update({ name, adviser, grade_level: gradeLevel }).eq('id', departmentId)
  if (error) {
    saveError.value = error.message
    return
  }

  const { error: membershipDeleteError } = await supabase.from('department_students').delete().eq('department_id', departmentId)
  if (membershipDeleteError) {
    saveError.value = `Students could not be saved: ${membershipDeleteError.message}`
    return
  }

  if (studentIds.length > 0) {
    const { error: membershipInsertError } = await supabase.from('department_students').insert(
      studentIds.map((studentId) => ({ department_id: departmentId, student_id: studentId })),
    )
    if (membershipInsertError) {
      saveError.value = `Students could not be saved: ${membershipInsertError.message}`
      return
    }
  }

  activePopup.value = null
  selectedDepartment.value = null
  await loadDepartments()
}

async function loadDepartments() {
  const [departmentResult, requirementResult, profilesResult, membershipResult] = await Promise.all([
    fetchRows('departments'),
    fetchRows('requirements'),
    supabase
      ? supabase.rpc('get_admin_profiles')
      : Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
      supabase
        ? supabase.from('department_students').select('department_id, student_id')
        : Promise.resolve({ data: [], error: { message: 'Supabase is not configured.' } }),
  ])
  const profileRows = (profilesResult.data ?? []) as Record<string, any>[]
  const membershipResponse = membershipResult as unknown as { data?: Record<string, any>[] | null; error?: { message?: string } | string | null }
  const membershipRows = membershipResponse.data ?? []
  const membershipErrorMessage = typeof membershipResponse.error === 'string'
    ? membershipResponse.error
    : membershipResponse.error?.message || ''
  const membershipTableMissing = membershipErrorMessage.toLowerCase().includes('department_students') || membershipErrorMessage.toLowerCase().includes('schema cache')
  loadError.value = departmentResult.error || requirementResult.error || profilesResult.error?.message || (membershipTableMissing ? '' : membershipErrorMessage)
  const personnelNames = profileRows
    .filter((profile) => String(profile.role || '').trim().toLowerCase() === 'school_personnel')
    .map((profile) => String(profile.full_name || profile.fullName || profile.name || profile.email || '').trim())
    .filter(Boolean)
  adviserOptions.value = ['N/A', ...Array.from(new Set(personnelNames))]
  studentOptions.value = profileRows
    .filter((profile) => String(profile.role || '').trim().toLowerCase() === 'student')
    .map((profile) => ({
      id: String(profile.id),
      name: String(profile.full_name || profile.email || 'Student'),
      studentId: String(profile.student_id || 'N/A'),
      gradeLevel: String(profile.grade_level || 'N/A'),
      section: String(profile.section || 'N/A'),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
  const studentsByDepartment = new Map<string, string[]>()
  membershipRows.forEach((row) => {
    const departmentId = String(row.department_id)
    studentsByDepartment.set(departmentId, [...(studentsByDepartment.get(departmentId) || []), String(row.student_id)])
  })
  departments.value = departmentResult.data.map((department) => {
    const id = department.id
    const departmentRequirements = requirementResult.data
      .filter((item) => String(item.department_id) === String(id))
      .map((item) => String(item.title || item.name || 'Requirement'))
    return {
      id: String(id),
      name: String(department.name || department.title || id),
      adviser: String(department.adviser || '').trim() || 'N/A',
      gradeLevel: String(department.grade_level || 'Others'),
      requirement: departmentRequirements[0] || '—',
      requirements: departmentRequirements,
      action: 'Manage',
      studentIds: studentsByDepartment.get(String(id)) || [],
    }
  })
  isLoading.value = false
}

onMounted(loadDepartments)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <AdminHeader />

    <main class="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-[16px] border border-[#dfe3ea] bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-md">
        <div class="w-full sm:flex-1 flex items-center gap-2 rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2">
          <span class="text-slate-400 text-lg">⌕</span>
          <input v-model="searchQuery" placeholder="Search" class="w-full bg-transparent text-slate-600 text-sm outline-none" />
        </div>
        <button class="w-full sm:w-auto bg-[#8d63e8] text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click="activePopup = 'add'">
          + Add Department
        </button>
      </div>

      <div class="bg-white rounded-[20px] border border-[#dfe3ea] shadow-md overflow-x-auto">
        <div class="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
          <h2 class="text-lg sm:text-xl font-black text-slate-900">Departments</h2>
        </div>

        <div class="flex gap-2 overflow-x-auto border-b border-[#edf0f4] px-4 sm:px-5 py-3">
          <button v-for="level in levelOptions" :key="level" class="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold" :class="activeLevel === level ? 'border-[#8d63e8] bg-[#8d63e8] text-white' : 'border-[#d5d7df] bg-white text-slate-600'" @click="activeLevel = level">
            {{ level }}
          </button>
        </div>

        <div class="grid grid-cols-[1.1fr_1.2fr_0.8fr] gap-3 px-4 sm:px-5 py-3 border-b border-[#edf0f4] bg-[#f3f4f6] text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
          <div>Department</div>
          <div>Adviser</div>
          <div class="text-right">Action</div>
        </div>

        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-slate-500">Loading departments...</div>
        <div v-else-if="loadError" class="px-4 py-8 text-center text-sm text-red-600">{{ loadError }}</div>
        <div v-else-if="filteredDepartments.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">No departments found for {{ activeLevel }}.</div>
        <div v-for="dept in filteredDepartments" v-else :key="dept.id" class="grid cursor-pointer grid-cols-[1.1fr_1.2fr_0.8fr] gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#d9dde5] last:border-b-0 items-center text-xs sm:text-sm text-slate-900 transition hover:bg-[#f7f3ff]" @click="selectedDepartmentDetail = dept">
          <div class="font-semibold text-slate-950">{{ dept.name }}</div>
          <div class="font-medium text-slate-900">{{ dept.adviser }}</div>
          <div class="text-right">
            <button class="bg-[#8d63e8] text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click.stop="selectedDepartment = dept; activePopup = 'manage'">
              {{ dept.action }}
            </button>
          </div>
        </div>
      </div>
    </main>
    <AdminAddDepartmentPopup v-if="activePopup === 'add'" :advisers="adviserOptions" @close="activePopup = null" @save="addDepartment" />
    <AdminManagePopup v-if="activePopup === 'manage' && selectedDepartment" :department="selectedDepartment" :advisers="adviserOptions" :students="studentOptions" :save-error="saveError" @close="activePopup = null; selectedDepartment = null; saveError = ''" @delete="deleteDepartment" @save="updateDepartment" />

    <div v-if="selectedDepartmentDetail" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" @click.self="selectedDepartmentDetail = null">
      <section class="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="department-detail-title">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-[#7c4fe0]">Subject details</p>
            <h2 id="department-detail-title" class="mt-1 text-2xl font-black text-slate-950">{{ selectedDepartmentDetail.name }}</h2>
          </div>
          <button class="text-2xl font-semibold text-slate-400 hover:text-slate-700" aria-label="Close" @click="selectedDepartmentDetail = null">&times;</button>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-[#f6f3ff] p-4"><p class="text-xs font-semibold uppercase tracking-wide text-slate-600">Grade level</p><p class="mt-1 font-bold text-slate-950">{{ selectedDepartmentDetail.gradeLevel }}</p></div>
          <div class="rounded-xl bg-[#f6f3ff] p-4"><p class="text-xs font-semibold uppercase tracking-wide text-slate-600">Adviser</p><p class="mt-1 font-bold text-slate-950">{{ selectedDepartmentDetail.adviser }}</p></div>
        </div>

        <div class="mt-5">
          <h3 class="text-sm font-bold text-slate-950">Requirements</h3>
          <ul v-if="selectedDepartmentDetail.requirements.length" class="mt-2 space-y-2">
            <li v-for="requirement in selectedDepartmentDetail.requirements" :key="requirement" class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900">{{ requirement }}</li>
          </ul>
          <p v-else class="mt-2 text-sm text-slate-600">No requirements assigned yet.</p>
        </div>

        <div class="mt-5">
          <h3 class="text-sm font-bold text-slate-950">Students assigned</h3>
          <div v-if="selectedDepartmentDetail.studentIds.length" class="mt-2 space-y-2">
            <p v-for="studentId in selectedDepartmentDetail.studentIds" :key="studentId" class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900">
              {{ studentOptions.find((student) => student.id === studentId)?.name || 'Student' }}
            </p>
          </div>
          <p v-else class="mt-2 text-sm text-slate-600">No students assigned yet.</p>
        </div>

        <div class="mt-6 flex justify-end"><button class="rounded-lg bg-[#8d63e8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7f55dd]" @click="selectedDepartmentDetail = null">Close</button></div>
      </section>
    </div>
  </div>
</template>
