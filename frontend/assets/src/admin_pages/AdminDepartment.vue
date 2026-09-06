<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminHeader from '../headers/AdminHeader.vue'
import AdminAddDepartmentPopup from '../popups/AdminAddDepartmentPopup.vue'
import AdminManagePopup from '../popups/AdminManagePopup.vue'
import { fetchRows } from '../lib/database'

const departments = ref<Array<{ name: string; requirement: string; personnel: string; action: string }>>([])
const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')
const activePopup = ref<'add' | 'manage' | null>(null)
const selectedDepartment = ref<(typeof departments.value)[number] | null>(null)

async function loadDepartments() {
  const [departmentResult, requirementResult, personnelResult] = await Promise.all([
    fetchRows('departments'),
    fetchRows('requirements'),
    fetchRows('department_personnel'),
  ])
  loadError.value = departmentResult.error || requirementResult.error || personnelResult.error || ''
  departments.value = departmentResult.data.map((department) => {
    const id = department.id
    const requirements = requirementResult.data.filter((item) => item.department_id === id || item.department === department.name)
    const personnel = personnelResult.data.filter((item) => item.department_id === id).length
    return {
      name: String(department.name || department.title || id),
      requirement: String(requirements[0]?.title || requirements[0]?.name || '—'),
      personnel: `${personnel} personnel`,
      action: 'Manage',
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

        <div class="grid grid-cols-[1.1fr_1.4fr_1.2fr_0.8fr] gap-3 px-4 sm:px-5 py-3 border-b border-[#edf0f4] bg-[#f3f4f6] text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
          <div>Department</div>
          <div>Requirements needed</div>
          <div>Assigned Personnel</div>
          <div class="text-right">Action</div>
        </div>

        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-slate-500">Loading departments...</div>
        <div v-else-if="loadError" class="px-4 py-8 text-center text-sm text-red-600">{{ loadError }}</div>
        <div v-else-if="departments.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">No departments found.</div>
        <div v-for="dept in departments.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))" v-else :key="dept.name" class="grid grid-cols-[1.1fr_1.4fr_1.2fr_0.8fr] gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#edf0f4] last:border-b-0 items-center text-xs sm:text-sm text-slate-700">
          <div>{{ dept.name }}</div>
          <div>{{ dept.requirement }}</div>
          <div>{{ dept.personnel }}</div>
          <div class="text-right">
            <button class="bg-[#8d63e8] text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click="selectedDepartment = dept; activePopup = 'manage'">
              {{ dept.action }}
            </button>
          </div>
        </div>
      </div>
    </main>
    <AdminAddDepartmentPopup v-if="activePopup === 'add'" @close="activePopup = null" @save="activePopup = null" />
    <AdminManagePopup v-if="activePopup === 'manage' && selectedDepartment" :department="selectedDepartment" @close="activePopup = null; selectedDepartment = null" />
  </div>
</template>
