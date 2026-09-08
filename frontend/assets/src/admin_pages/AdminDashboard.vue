<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminHeader from '../headers/AdminHeader.vue'
import { fetchRows } from '../lib/database'

interface StatCard {
  value: number
  label: string
  icon: string
  type: 'purple' | 'orange' | 'green'
}

interface DepartmentRow {
  name: string
  adviser: string
}

interface AccountRow {
  name: string
  role: string
}

const isLoading = ref(true)
const loadError = ref('')
const counts = ref({ students: 0, personnel: 0, departments: 0 })
const departmentRows = ref<DepartmentRow[]>([])
const accountRows = ref<AccountRow[]>([])

const statistics = computed<StatCard[]>(() => [
  { value: counts.value.students, label: 'Total Students', icon: '▣', type: 'purple' },
  { value: counts.value.personnel, label: 'School Personnel', icon: '♙', type: 'orange' },
  { value: counts.value.departments, label: 'Departments', icon: '⌂', type: 'green' },
])

async function loadDashboard() {
  const [profilesResult, departmentsResult] = await Promise.all([
    fetchRows('profiles'),
    fetchRows('departments'),
  ])

  loadError.value = profilesResult.error || departmentsResult.error || ''
  const profiles = profilesResult.data
  const role = (profile: Record<string, any>) => String(profile.role || '').trim().toLowerCase()

  counts.value = {
    students: profiles.filter((profile) => role(profile) === 'student').length,
    personnel: profiles.filter((profile) => role(profile) === 'school_personnel').length,
    departments: departmentsResult.data.length,
  }
  departmentRows.value = departmentsResult.data.map((department) => ({
    name: String(department.name || 'Unnamed department'),
    adviser: String(department.adviser || '').trim() || 'N/A',
  }))
  accountRows.value = profiles.map((profile) => ({
    name: String(profile.full_name || profile.fullName || profile.name || profile.email || 'Unnamed account'),
    role: role(profile) === 'school_personnel' ? 'School Personnel' : role(profile) === 'student' ? 'Student' : String(profile.role || '—'),
  }))
  isLoading.value = false
}

onMounted(loadDashboard)

const iconClasses: Record<StatCard['type'], string> = {
  purple: 'bg-[#e7e2ff] text-[#6937d8]',
  orange: 'bg-[#fff0dc] text-[#f7941d]',
  green: 'bg-[#dff7eb] text-[#20a76b]',
}

const lineClasses: Record<StatCard['type'], string> = {
  purple: 'bg-[#6937d8]',
  orange: 'bg-[#f7941d]',
  green: 'bg-[#20a76b]',
}
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-[#111111] font-sans">
    <AdminHeader />
    <main class="w-full max-w-[1400px] mx-auto px-4 pt-6 pb-8 sm:px-6 sm:pt-8 md:px-8 md:pt-10">
      <div v-if="loadError" class="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
        {{ loadError }}
      </div>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
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
                <span v-if="isLoading" class="text-2xl">...</span>
                <span v-else>{{ stat.value }}</span>
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

      <section class="grid grid-cols-1 gap-4 mt-6 sm:mt-8 md:grid-cols-2">
        <section class="overflow-hidden rounded-[20px] bg-white shadow-md">
          <div class="border-b border-[#eeeaf8] px-5 py-4">
            <h2 class="m-0 text-lg font-bold text-[#5225bd]">Department Advisers</h2>
          </div>
          <div class="grid grid-cols-2 gap-3 bg-[#f2f1f4] px-5 py-3 text-sm font-semibold">
            <div>Department</div>
            <div>Adviser</div>
          </div>
          <div v-if="isLoading" class="px-5 py-6 text-center text-sm text-slate-500">Loading departments...</div>
          <div v-else-if="!departmentRows.length" class="px-5 py-6 text-center text-sm text-slate-500">No departments found.</div>
          <div v-else v-for="department in departmentRows" :key="department.name" class="grid grid-cols-2 gap-3 border-b border-[#eeeaf8] px-5 py-3 text-sm last:border-b-0">
            <div>{{ department.name }}</div>
            <div>{{ department.adviser }}</div>
          </div>
        </section>

        <section class="overflow-hidden rounded-[20px] bg-white shadow-md">
          <div class="border-b border-[#eeeaf8] px-5 py-4">
            <h2 class="m-0 text-lg font-bold text-[#5225bd]">Accounts</h2>
          </div>
          <div class="grid grid-cols-2 gap-3 bg-[#f2f1f4] px-5 py-3 text-sm font-semibold">
            <div>Name</div>
            <div>Position</div>
          </div>
          <div v-if="isLoading" class="px-5 py-6 text-center text-sm text-slate-500">Loading accounts...</div>
          <div v-else-if="!accountRows.length" class="px-5 py-6 text-center text-sm text-slate-500">No accounts found.</div>
          <div v-else v-for="account in accountRows" :key="`${account.name}-${account.role}`" class="grid grid-cols-2 gap-3 border-b border-[#eeeaf8] px-5 py-3 text-sm last:border-b-0">
            <div>{{ account.name }}</div>
            <div>{{ account.role }}</div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>