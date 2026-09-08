<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BookOpen, GraduationCap, Search, UserRound } from 'lucide-vue-next'
import { supabase } from '../composables/auth'
import { fetchRows } from '../lib/database'

interface EnrolledClass {
  id: string
  name: string
  gradeLevel: string
  section: string
  adviser: string
  requirements: string[]
}

const classes = ref<EnrolledClass[]>([])
const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')

const filteredClasses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return classes.value.filter((item) => !query || [item.name, item.gradeLevel, item.section, item.adviser].some((value) => value.toLowerCase().includes(query)))
})

const loadClasses = async () => {
  isLoading.value = true
  try {
    if (!supabase) {
      loadError.value = 'Supabase is not configured.'
      return
    }

    const [classesResult, requirementsResult, departmentsResult] = await Promise.all([
      supabase.rpc('get_my_enrolled_departments'),
      fetchRows('requirements'),
      fetchRows('departments'),
    ])

    if (requirementsResult.error) throw new Error(requirementsResult.error)
    if (departmentsResult.error) throw new Error(departmentsResult.error)

    const departmentNames = new Map(departmentsResult.data.map((row) => [String(row.id), String(row.name || row.title || 'Subject')]))
    const requirementsByDepartment = new Map<string, string[]>()
    requirementsResult.data.forEach((row) => {
      const departmentId = String(row.department_id)
      requirementsByDepartment.set(departmentId, [...(requirementsByDepartment.get(departmentId) || []), String(row.title || row.name || 'Requirement')])
    })

    let classRows = (classesResult.data ?? []) as Record<string, any>[]
    if (classesResult.error) {
      const fallback = await supabase
        .from('department_students')
        .select('department_id')
        .eq('student_id', (await supabase.auth.getUser()).data.user?.id || '')
      if (fallback.error) throw classesResult.error
      classRows = (fallback.data ?? []).map((row) => {
        const department = departmentsResult.data.find((item) => String(item.id) === String(row.department_id))
        return {
          department_id: row.department_id,
          department_name: department?.name || department?.title,
          grade_level: department?.grade_level,
          section: department?.section,
          adviser: department?.adviser,
        }
      })
    }

    classes.value = classRows.map((row) => ({
      id: String(row.department_id || row.id),
      name: String(row.department_name || departmentNames.get(String(row.department_id)) || 'Subject'),
      gradeLevel: String(row.grade_level || 'N/A'),
      section: String(row.section || 'N/A'),
      adviser: String(row.adviser || 'N/A'),
      requirements: requirementsByDepartment.get(String(row.department_id)) || [],
    }))
  } catch (error: any) {
    loadError.value = error?.message || 'Enrolled classes could not be loaded.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadClasses)
</script>

<template>
  <div class="min-h-screen bg-[#f1eefb] text-slate-900">
    <main class="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d63e8]">Student portal</p>
          <h1 class="mt-1 text-4xl font-black tracking-tight">Enrolled Classes</h1>
          <p class="mt-2 text-base text-slate-600">See the subjects and requirements assigned to you.</p>
        </div>
        <div class="rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
          <p class="text-2xl font-black text-[#7c4fe0]">{{ classes.length }}</p>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Classes enrolled</p>
        </div>
      </div>

      <div class="mb-6 rounded-2xl border border-[#dfe3ea] bg-white p-3 shadow-sm sm:p-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="searchQuery" placeholder="Search your classes..." class="w-full rounded-lg border border-[#dfe3ea] bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#8d63e8]" />
        </div>
      </div>

      <div v-if="isLoading" class="rounded-2xl bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">Loading enrolled classes...</div>
      <div v-else-if="loadError" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="filteredClasses.length === 0" class="rounded-2xl bg-white px-5 py-12 text-center shadow-sm"><GraduationCap class="mx-auto h-10 w-10 text-[#8d63e8]" /><p class="mt-3 font-semibold text-slate-900">No enrolled classes found</p><p class="mt-1 text-sm text-slate-500">Your school administrator has not assigned you to a subject yet.</p></div>
      <div v-else class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="item in filteredClasses" :key="item.id" class="rounded-2xl border border-[#dfe3ea] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div class="flex items-start justify-between gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0e7ff] text-[#7c4fe0]"><BookOpen class="h-5 w-5" /></div><span class="rounded-full bg-[#f0e7ff] px-3 py-1 text-xs font-semibold text-[#7c4fe0]">{{ item.section }}</span></div>
          <h2 class="mt-4 text-xl font-black text-slate-950">{{ item.name }}</h2>
          <p class="mt-1 text-sm font-medium text-slate-600">{{ item.gradeLevel }}</p>
          <div class="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600"><UserRound class="h-4 w-4 text-[#8d63e8]" />{{ item.adviser }}</div>
          <div class="mt-4"><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Requirements</p><ul v-if="item.requirements.length" class="mt-2 space-y-2"><li v-for="requirement in item.requirements" :key="requirement" class="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">{{ requirement }}</li></ul><p v-else class="mt-2 text-sm text-slate-500">No requirements assigned yet.</p></div>
        </article>
      </div>
    </main>
  </div>
</template>
