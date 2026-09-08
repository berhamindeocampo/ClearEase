<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchRows } from '../lib/database'
import { supabase } from '../composables/auth'

interface StudentRow {
  id: string
  name: string
  schoolId: string
  gradeLevel: string
  section: string
  departments: string
}

const students = ref<StudentRow[]>([])
const searchQuery = ref('')
const activeGrade = ref('Grade 7')
const activeSection = ref<'all' | 'STEM' | 'GAS'>('all')
const isLoading = ref(true)
const loadError = ref('')

const gradeOptions = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const sectionOptions = computed<Array<'all' | 'STEM' | 'GAS'>>(() => activeGrade.value === 'Grade 11' || activeGrade.value === 'Grade 12' ? ['all', 'STEM', 'GAS'] : ['all'])

const normalizeGrade = (value: unknown) => {
  const match = String(value || '').trim().toLowerCase().match(/grade\s*(7|8|9|10|11|12)/)
  return match ? `Grade ${match[1]}` : String(value || '').trim()
}

const normalizeSection = (value: unknown) => String(value || '').trim().toUpperCase().replace(/^SECTION\s+/, '')

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return students.value.filter((student) => {
    const matchesGrade = normalizeGrade(student.gradeLevel) === activeGrade.value
    const matchesSection = activeSection.value === 'all' || normalizeSection(student.section) === activeSection.value
    const matchesSearch = !query || [student.name, student.schoolId, student.gradeLevel, student.section, student.departments].some((value) => value.toLowerCase().includes(query))
    return matchesGrade && matchesSection && matchesSearch
  })
})

function selectGrade(grade: string) {
  activeGrade.value = grade
  activeSection.value = grade === 'Grade 11' || grade === 'Grade 12' ? 'STEM' : 'all'
}

async function loadStudents() {
  if (!supabase) {
    loadError.value = 'Supabase is not configured.'
    isLoading.value = false
    return
  }

  const [profilesResult, departmentsResult, assignmentsResult, currentProfileResult] = await Promise.all([
    fetchRows('profiles'),
    fetchRows('departments'),
    fetchRows('department_personnel'),
    supabase.rpc('get_my_profile'),
  ])

  loadError.value = profilesResult.error || departmentsResult.error || assignmentsResult.error || currentProfileResult.error?.message || ''
  const currentProfileName = String(currentProfileResult.data?.full_name || currentProfileResult.data?.email || '').trim().toLowerCase()
  const assignedDepartmentIds = new Set([
    ...assignmentsResult.data.map((assignment) => String(assignment.department_id)),
    ...departmentsResult.data
      .filter((department) => String(department.adviser || '').trim().toLowerCase() === currentProfileName)
      .map((department) => String(department.id)),
  ])
  const normalizeGrade = (value: unknown) => {
    const match = String(value || '').trim().toLowerCase().match(/grade\s*(7|8|9|10|11|12)/)
    return match ? `grade ${match[1]}` : String(value || '').trim().toLowerCase()
  }
  const assignedDepartments = departmentsResult.data
    .filter((department) => assignedDepartmentIds.has(String(department.id)))
    .map((department) => ({
      name: String(department.name || department.title || department.id),
      grade: normalizeGrade(department.grade_level || 'Others'),
    }))
  const departmentsByStudent = new Map<string, Set<string>>()

  for (const student of profilesResult.data.filter((profile) => String(profile.role || '').trim().toLowerCase() === 'student')) {
    const studentId = String(student.id)
    const studentGrade = normalizeGrade(student.grade_level)
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
      section: String(profile.section || 'N/A'),
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
        <div class="flex gap-2 overflow-x-auto border-y border-[#edf0f4] px-4 py-3 sm:px-5">
          <button v-for="grade in gradeOptions" :key="grade" class="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold" :class="activeGrade === grade ? 'border-[#8d63e8] bg-[#8d63e8] text-white' : 'border-[#d5d7df] bg-white text-slate-600'" @click="selectGrade(grade)">
            {{ grade }}
          </button>
        </div>
        <div v-if="activeGrade === 'Grade 11' || activeGrade === 'Grade 12'" class="flex gap-2 border-b border-[#edf0f4] px-4 py-3 sm:px-5">
          <button v-for="section in sectionOptions.filter((option) => option !== 'all')" :key="section" class="rounded-full border px-3 py-1.5 text-xs font-semibold" :class="activeSection === section ? 'border-[#8d63e8] bg-[#8d63e8] text-white' : 'border-[#d5d7df] bg-white text-slate-600'" @click="activeSection = section">
            {{ section }}
          </button>
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
