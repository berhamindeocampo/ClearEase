<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchRows } from '../lib/database'
import AdminHeader from '../headers/AdminHeader.vue'

interface StudentRow {
  id: string
  name: string
  schoolId: string
  gradeLevel: string
  section: string
  departments: string
}

const students = ref<StudentRow[]>([])
const departments = ref<string[]>([])
const selectedDepartment = ref('all')
const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return students.value.filter((student) => {
    const matchesDepartment = selectedDepartment.value === 'all' || student.departments.split(', ').includes(selectedDepartment.value)
    const matchesSearch = !query || [student.name, student.schoolId, student.gradeLevel, student.section, student.departments].some((value) => value.toLowerCase().includes(query))
    return matchesDepartment && matchesSearch
  })
})

async function loadStudents() {
  const [profilesResult, departmentsResult, membershipsResult] = await Promise.all([
    fetchRows('profiles'),
    fetchRows('departments'),
    fetchRows('department_students'),
  ])
  loadError.value = profilesResult.error || departmentsResult.error || membershipsResult.error || ''
  departments.value = departmentsResult.data.map((department) => String(department.name || department.title || department.id)).sort()
  const departmentNames = new Map(departmentsResult.data.map((department) => [String(department.id), String(department.name || department.title || department.id)]))
  const departmentIdsByStudent = new Map<string, string[]>()
  membershipsResult.data.forEach((membership) => {
    const studentId = String(membership.student_id)
    const departmentName = departmentNames.get(String(membership.department_id))
    if (departmentName) departmentIdsByStudent.set(studentId, [...(departmentIdsByStudent.get(studentId) || []), departmentName])
  })
  students.value = profilesResult.data
    .filter((profile) => String(profile.role || '').trim().toLowerCase() === 'student')
    .map((profile) => ({
      id: String(profile.id),
      name: String(profile.full_name || profile.email || 'Unnamed student'),
      schoolId: String(profile.student_id || 'N/A'),
      gradeLevel: String(profile.grade_level || 'N/A'),
      section: String(profile.section || 'N/A'),
      departments: (departmentIdsByStudent.get(String(profile.id)) || []).join(', '),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
  isLoading.value = false
}

onMounted(loadStudents)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <AdminHeader />
    <main class="max-w-[1280px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-5 flex flex-col gap-3 rounded-[16px] border border-[#dfe3ea] bg-white p-4 shadow-md sm:flex-row">
        <input v-model="searchQuery" placeholder="Search students" class="w-full rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-sm outline-none" />
        <select v-model="selectedDepartment" class="rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-sm">
          <option value="all">Department: All</option>
          <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
        </select>
      </div>
      <section class="overflow-x-auto rounded-[20px] border border-[#dfe3ea] bg-white shadow-md">
        <div class="px-5 pb-3 pt-5"><h1 class="text-xl font-black text-slate-900">Student List</h1></div>
        <div class="grid min-w-[850px] grid-cols-[1.3fr_1fr_0.9fr_0.9fr_2fr] gap-3 border-y border-[#edf0f4] bg-[#f3f4f6] px-5 py-3 text-sm font-semibold text-slate-600">
          <div>Name</div><div>School ID</div><div>Grade Level</div><div>Section</div><div>Departments</div>
        </div>
        <div v-if="isLoading" class="px-5 py-8 text-center text-sm text-slate-500">Loading students...</div>
        <div v-else-if="loadError" class="px-5 py-8 text-center text-sm text-red-600">{{ loadError }}</div>
        <div v-else-if="!filteredStudents.length" class="px-5 py-8 text-center text-sm text-slate-500">No students found.</div>
        <div v-for="student in filteredStudents" v-else :key="student.id" class="grid min-w-[850px] grid-cols-[1.3fr_1fr_0.9fr_0.9fr_2fr] gap-3 border-b border-[#edf0f4] px-5 py-3 text-sm last:border-b-0">
          <div class="font-medium">{{ student.name }}</div><div>{{ student.schoolId }}</div><div>{{ student.gradeLevel }}</div><div>{{ student.section }}</div><div>{{ student.departments || 'N/A' }}</div>
        </div>
      </section>
    </main>
  </div>
</template>
