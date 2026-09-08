<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchRows } from '../lib/database'
import { supabase } from '../composables/auth'

interface StudentRow {
  id: string
  name: string
  schoolId: string
  gradeLevel: string
  departments: string
}

const students = ref<StudentRow[]>([])
const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return students.value
  return students.value.filter((student) => [student.name, student.schoolId, student.gradeLevel, student.departments].some((value) => value.toLowerCase().includes(query)))
})

async function loadStudents() {
  if (!supabase) {
    loadError.value = 'Supabase is not configured.'
    isLoading.value = false
    return
  }

  const [profilesResult, departmentsResult, assignmentsResult] = await Promise.all([
    fetchRows('profiles'),
    fetchRows('departments'),
    fetchRows('department_personnel'),
  ])

  loadError.value = profilesResult.error || departmentsResult.error || assignmentsResult.error || ''
  const assignedDepartmentIds = new Set(assignmentsResult.data.map((assignment) => String(assignment.department_id)))
  const assignedDepartments = departmentsResult.data
    .filter((department) => assignedDepartmentIds.has(String(department.id)))
    .map((department) => ({
      name: String(department.name || department.title || department.id),
      grade: String(department.grade_level || 'Others').trim().toLowerCase(),
    }))
  const departmentsByStudent = new Map<string, Set<string>>()

  for (const student of profilesResult.data.filter((profile) => String(profile.role || '').trim().toLowerCase() === 'student')) {
    const studentId = String(student.id)
    const studentGrade = String(student.grade_level || '').trim().toLowerCase()
    const matchingDepartments = assignedDepartments.filter((department) => department.grade === studentGrade)
    if (matchingDepartments.length) {
      departmentsByStudent.set(studentId, new Set(matchingDepartments.map((department) => department.name)))
    }
  }

  students.value = profilesResult.data
    .filter((profile) => departmentsByStudent.has(String(profile.id)))
    .map((profile) => ({
      id: String(profile.id),
      name: String(profile.full_name || profile.email || 'Unnamed student'),
      schoolId: String(profile.student_id || 'N/A'),
      gradeLevel: String(profile.grade_level || 'N/A'),
      departments: Array.from(departmentsByStudent.get(String(profile.id)) || []).sort().join(', '),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
  isLoading.value = false
}

onMounted(loadStudents)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <main class="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-6 rounded-[16px] border border-[#dfe3ea] bg-white p-4 shadow-md">
        <input v-model="searchQuery" placeholder="Search students" class="w-full rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-sm outline-none" />
      </div>

      <section class="overflow-x-auto rounded-[20px] border border-[#dfe3ea] bg-white shadow-md">
        <div class="px-4 pb-3 pt-5 sm:px-5">
          <h1 class="text-lg font-black text-slate-900 sm:text-xl">Students</h1>
          <p class="mt-1 text-sm text-slate-500">Students in your assigned departments and matching grade levels.</p>
        </div>
        <div class="grid min-w-[720px] grid-cols-[1.3fr_1fr_0.8fr_2fr] gap-3 border-y border-[#edf0f4] bg-[#f3f4f6] px-4 py-3 text-xs font-semibold text-slate-600 sm:px-5 sm:text-sm">
          <div>Name</div>
          <div>School ID</div>
          <div>Grade Level</div>
          <div>Departments</div>
        </div>
        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-slate-500">Loading students...</div>
        <div v-else-if="loadError" class="px-4 py-8 text-center text-sm text-red-600">{{ loadError }}</div>
        <div v-else-if="!filteredStudents.length" class="px-4 py-8 text-center text-sm text-slate-500">No matching students found.</div>
        <div v-for="student in filteredStudents" v-else :key="student.id" class="grid min-w-[720px] grid-cols-[1.3fr_1fr_0.8fr_2fr] gap-3 border-b border-[#edf0f4] px-4 py-3 text-sm last:border-b-0 sm:px-5">
          <div class="font-medium">{{ student.name }}</div>
          <div>{{ student.schoolId }}</div>
          <div>{{ student.gradeLevel }}</div>
          <div>{{ student.departments }}</div>
        </div>
      </section>
    </main>
  </div>
</template>
