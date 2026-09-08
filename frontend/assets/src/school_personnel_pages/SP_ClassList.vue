<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, Users, X } from 'lucide-vue-next'
import { supabase } from '../composables/auth'
import { fetchRows } from '../lib/database'

interface Student {
  id: string
  fullName: string
  email: string
  studentId: string
  gradeLevel: string
  section: string
  departmentIds: string[]
}

interface Requirement {
  id: string
  title: string
  department: string
}

interface Department {
  id: string
  name: string
  gradeLevel: string
  section: string
}

const students = ref<Student[]>([])
const requirements = ref<Requirement[]>([])
const departments = ref<Department[]>([])
const searchQuery = ref('')
const selectedClass = ref('all')
const isLoading = ref(true)
const loadError = ref('')
const selectedStudent = ref<Student | null>(null)
const showStudentEditor = ref(false)
const showRequirementEditor = ref(false)
const showClassRequirementEditor = ref(false)
const selectedRequirementId = ref('')
const selectedClassRequirementId = ref('')
const isSaving = ref(false)
const successMessage = ref('')

const classOptions = computed(() => {
  return departments.value
})

const selectedClassName = computed(() => departments.value.find((department) => department.id === selectedClass.value)?.name || 'the selected class')

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return students.value.filter((student) => {
    const matchesClass = selectedClass.value === 'all' || student.departmentIds.includes(selectedClass.value)
    const matchesSearch = !query || [student.fullName, student.email, student.studentId].some((value) => value.toLowerCase().includes(query))
    return matchesClass && matchesSearch
  })
})

const loadClassList = async () => {
  isLoading.value = true
  const [profilesResult, requirementsResult, departmentsResult, assignedDepartmentsResult, membershipsResult] = await Promise.all([
    fetchRows('profiles'),
    fetchRows('requirements'),
    fetchRows('departments'),
    supabase!.rpc('get_my_assigned_departments'),
    supabase!.from('department_students').select('department_id, student_id'),
  ])

  const departmentNames = new Map(departmentsResult.data.map((row) => [String(row.id), String(row.name || row.title || '—')]))
  let assignedDepartmentRows = (assignedDepartmentsResult.data ?? []) as Record<string, any>[]
  let assignmentError = assignedDepartmentsResult.error?.message || ''
  if (assignedDepartmentsResult.error) {
    const [legacyAssignmentsResult, currentProfileResult] = await Promise.all([
      fetchRows('department_personnel'),
      supabase!.rpc('get_my_profile'),
    ])
    const profileName = String(currentProfileResult.data?.full_name || currentProfileResult.data?.email || '').trim().toLowerCase()
    const assignedIds = new Set(legacyAssignmentsResult.data.map((row) => String(row.department_id)))
    assignedDepartmentRows = departmentsResult.data
      .filter((department) => assignedIds.has(String(department.id)) || String(department.adviser || '').trim().toLowerCase() === profileName)
      .map((department) => ({
        department_id: department.id,
        department_name: department.name || department.title,
        grade_level: department.grade_level,
        section: department.section,
        adviser: department.adviser,
      }))
    assignmentError = legacyAssignmentsResult.error || currentProfileResult.error?.message || ''
  }
  loadError.value = profilesResult.error || requirementsResult.error || departmentsResult.error || assignmentError || membershipsResult.error?.message || ''
  const assignedDepartmentIds = new Set(assignedDepartmentRows.map((row) => String(row.department_id)))
  departments.value = assignedDepartmentRows
    .map((row) => ({
      id: String(row.department_id),
      name: String(row.department_name || departmentNames.get(String(row.department_id)) || 'Subject'),
      gradeLevel: String(row.grade_level || 'N/A'),
      section: String(row.section || 'N/A'),
    }))
    .sort((left: Department, right: Department) => left.name.localeCompare(right.name))

  const studentDepartmentIds = new Map<string, string[]>()
  ;(membershipsResult.data ?? []).forEach((membership) => {
    const departmentId = String(membership.department_id)
    if (assignedDepartmentIds.has(departmentId)) {
      const studentId = String(membership.student_id)
      studentDepartmentIds.set(studentId, [...(studentDepartmentIds.get(studentId) || []), departmentId])
    }
  })
  students.value = profilesResult.data
    .filter((row) => String(row.role || '').toLowerCase() === 'student' && studentDepartmentIds.has(String(row.id)))
    .map((row) => ({
      id: String(row.id),
      fullName: String(row.full_name || row.email || 'Student'),
      email: String(row.email || ''),
      studentId: String(row.student_id || 'N/A'),
      gradeLevel: String(row.grade_level || 'N/A'),
      section: String(row.section || 'N/A'),
      departmentIds: studentDepartmentIds.get(String(row.id)) || [],
    }))
    .sort((left: Student, right: Student) => left.fullName.localeCompare(right.fullName))

  requirements.value = requirementsResult.data.map((row) => ({
    id: String(row.id),
    title: String(row.title || row.name || 'Requirement'),
    department: departmentNames.get(String(row.department_id)) || 'General',
  }))
  isLoading.value = false
}

const openStudentEditor = (student: Student) => {
  selectedStudent.value = { ...student }
  successMessage.value = ''
  showStudentEditor.value = true
}

const openRequirementEditor = (student: Student) => {
  selectedStudent.value = student
  selectedRequirementId.value = ''
  successMessage.value = ''
  showRequirementEditor.value = true
}

const openClassRequirementEditor = () => {
  selectedClassRequirementId.value = ''
  successMessage.value = ''
  showClassRequirementEditor.value = true
}

const saveStudent = async () => {
  if (!supabase || !selectedStudent.value) return
  isSaving.value = true
  loadError.value = ''
  const student = selectedStudent.value
  const { error } = await supabase.from('profiles').update({
    grade_level: student.gradeLevel,
    section: student.section,
  }).eq('id', student.id)

  if (error) {
    loadError.value = error.message
  } else {
    const index = students.value.findIndex((item) => item.id === student.id)
    if (index >= 0) students.value[index] = { ...student }
    showStudentEditor.value = false
    successMessage.value = `${student.fullName}'s class was updated.`
  }
  isSaving.value = false
}

const addRequirement = async () => {
  if (!supabase || !selectedStudent.value || !selectedRequirementId.value) return
  isSaving.value = true
  loadError.value = ''
  const { error } = await supabase.from('student_requirements').upsert({
    student_id: selectedStudent.value.id,
    requirement_id: selectedRequirementId.value,
  }, { onConflict: 'student_id,requirement_id' })

  if (error) {
    loadError.value = error.message
  } else {
    showRequirementEditor.value = false
    successMessage.value = `Requirement added for ${selectedStudent.value.fullName}.`
  }
  isSaving.value = false
}

const addClassRequirement = async () => {
  if (!supabase || selectedClass.value === 'all' || !selectedClassRequirementId.value) return
  const selectedDepartment = departments.value.find((department) => department.id === selectedClass.value)
  if (!selectedDepartment) return
  isSaving.value = true
  loadError.value = ''
  const { error } = await supabase.from('class_requirements').upsert({
    grade_level: selectedDepartment.gradeLevel,
    section: selectedDepartment.section,
    requirement_id: selectedClassRequirementId.value,
  }, { onConflict: 'requirement_id,grade_level,section' })

  if (error) {
    loadError.value = error.message
  } else {
    showClassRequirementEditor.value = false
    successMessage.value = `Requirement added for ${selectedDepartment.name}.`
  }
  isSaving.value = false
}

onMounted(loadClassList)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <main class="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d63e8]">Teacher workspace</p>
          <h1 class="mt-1 text-3xl font-black tracking-tight">Class List</h1>
          <p class="mt-2 text-sm text-slate-600">Manage the students you handle and give each class the requirements they need to complete.</p>
        </div>
        <div class="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
          <Users class="h-5 w-5 text-[#8d63e8]" />
          {{ filteredStudents.length }} students
        </div>
      </div>

      <div class="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dfe3ea] bg-white p-3 shadow-md sm:flex-row sm:items-center sm:p-4">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="searchQuery" placeholder="Search students..." class="w-full rounded-lg border border-[#dfe3ea] bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#8d63e8]" />
        </div>
        <select v-model="selectedClass" class="rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#8d63e8]">
          <option value="all">Class: All</option>
          <option v-for="department in classOptions" :key="department.id" :value="department.id">{{ department.name }} · {{ department.gradeLevel }}</option>
        </select>
        <button class="rounded-lg bg-[#8d63e8] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f55dd] disabled:cursor-not-allowed disabled:opacity-50" :disabled="selectedClass === 'all'" @click="openClassRequirementEditor">+ Add to Class</button>
      </div>

      <div v-if="successMessage" class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</div>
      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>

      <div class="overflow-x-auto rounded-2xl border border-[#dfe3ea] bg-white shadow-md">
        <div class="min-w-[860px]">
          <div class="grid grid-cols-[1.5fr_1.3fr_1.3fr_1.1fr_1.4fr] gap-3 border-b border-[#edf0f4] bg-[#f7f7fb] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <div>Student</div><div>School ID</div><div>Class</div><div>Status</div><div class="text-right">Actions</div>
          </div>
          <div v-if="isLoading" class="px-5 py-10 text-center text-sm text-slate-500">Loading class list...</div>
          <div v-else-if="filteredStudents.length === 0" class="px-5 py-10 text-center text-sm text-slate-500">No students found.</div>
          <div v-for="student in filteredStudents" v-else :key="student.id" class="grid grid-cols-[1.5fr_1.3fr_1.3fr_1.1fr_1.4fr] items-center gap-3 border-b border-[#edf0f4] px-5 py-4 text-sm last:border-b-0">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee7ff] font-bold text-[#7c4fe0]">{{ student.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('') }}</div>
              <div><p class="font-semibold text-slate-900">{{ student.fullName }}</p><p class="text-xs text-slate-500">{{ student.email }}</p></div>
            </div>
            <div class="text-slate-600">{{ student.studentId }}</div>
            <div><p class="font-medium">{{ student.gradeLevel }}</p><p class="text-xs text-slate-500">{{ student.section }}</p></div>
            <div><span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span></div>
            <div class="flex justify-end gap-2">
              <button class="rounded-lg border border-[#8d63e8] px-3 py-2 text-xs font-semibold text-[#7c4fe0] transition hover:bg-[#f3ebff]" @click="openStudentEditor(student)">Edit Student</button>
              <button class="rounded-lg bg-[#8d63e8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#7f55dd]" @click="openRequirementEditor(student)">+ Requirement</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showStudentEditor && selectedStudent" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="showStudentEditor = false">
      <form class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="saveStudent">
        <div class="flex items-center justify-between"><h2 class="text-xl font-bold">Edit Student Class</h2><button type="button" aria-label="Close" @click="showStudentEditor = false"><X class="h-5 w-5 text-slate-400" /></button></div>
        <p class="mt-1 text-sm text-slate-500">{{ selectedStudent.fullName }}</p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="text-sm font-semibold">Grade level<select v-model="selectedStudent.gradeLevel" class="mt-1 w-full rounded-lg border px-3 py-2 font-normal"><option v-for="grade in ['N/A', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']" :key="grade">{{ grade }}</option></select></label>
          <label class="text-sm font-semibold">Section<input v-model="selectedStudent.section" class="mt-1 w-full rounded-lg border px-3 py-2 font-normal" placeholder="Section A" /></label>
        </div>
        <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="showStudentEditor = false">Cancel</button><button class="rounded-lg bg-[#8d63e8] px-4 py-2 text-sm font-semibold text-white" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save Changes' }}</button></div>
      </form>
    </div>

    <div v-if="showRequirementEditor && selectedStudent" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="showRequirementEditor = false">
      <form class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="addRequirement">
        <div class="flex items-center justify-between"><h2 class="text-xl font-bold">Add Student Requirement</h2><button type="button" aria-label="Close" @click="showRequirementEditor = false"><X class="h-5 w-5 text-slate-400" /></button></div>
        <p class="mt-1 text-sm text-slate-500">This extra requirement will be visible to {{ selectedStudent.fullName }}.</p>
        <select v-model="selectedRequirementId" required class="mt-5 w-full rounded-lg border px-3 py-2 text-sm"><option value="" disabled>Select a requirement</option><option v-for="requirement in requirements" :key="requirement.id" :value="requirement.id">{{ requirement.title }} · {{ requirement.department }}</option></select>
        <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="showRequirementEditor = false">Cancel</button><button class="rounded-lg bg-[#8d63e8] px-4 py-2 text-sm font-semibold text-white" :disabled="isSaving">{{ isSaving ? 'Adding...' : 'Add Requirement' }}</button></div>
      </form>
    </div>

    <div v-if="showClassRequirementEditor" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="showClassRequirementEditor = false">
      <form class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="addClassRequirement">
        <div class="flex items-center justify-between"><h2 class="text-xl font-bold">Add Requirement to Class</h2><button type="button" aria-label="Close" @click="showClassRequirementEditor = false"><X class="h-5 w-5 text-slate-400" /></button></div>
        <p class="mt-1 text-sm text-slate-500">This will be visible to every student in {{ selectedClassName }}.</p>
        <select v-model="selectedClassRequirementId" required class="mt-5 w-full rounded-lg border px-3 py-2 text-sm"><option value="" disabled>Select a requirement</option><option v-for="requirement in requirements" :key="requirement.id" :value="requirement.id">{{ requirement.title }} · {{ requirement.department }}</option></select>
        <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="showClassRequirementEditor = false">Cancel</button><button class="rounded-lg bg-[#8d63e8] px-4 py-2 text-sm font-semibold text-white" :disabled="isSaving">{{ isSaving ? 'Adding...' : 'Add to Class' }}</button></div>
      </form>
    </div>
  </div>
</template>
