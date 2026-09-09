<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SPAddRequirementPopup from '../popups/SPAddRequirementPopup.vue'
import SPEditRequirementPopup from '../popups/SPEditRequirementPopup.vue'
import { supabase } from '../composables/auth'
import { displayDate, fetchRows } from '../lib/database'

const requirements = ref<Array<{ id: string; name: string; department: string; departmentId: string; requiredDocument: string; instruction: string; deadline: string }>>([])
const departments = ref<Array<{ id: string; name: string }>>([])
const isLoading = ref(true)
const loadError = ref('')
const activePopup = ref<'add' | 'edit' | null>(null)
const selectedRequirement = ref<(typeof requirements.value)[number] | null>(null)
const pendingDeleteRequirement = ref<(typeof requirements.value)[number] | null>(null)
const searchQuery = ref('')
const selectedDepartment = ref('all')

const filteredRequirements = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return requirements.value.filter((requirement) => {
    const matchesSearch = !query || [requirement.name, requirement.department, requirement.requiredDocument, requirement.instruction]
      .some((value) => value.toLowerCase().includes(query))
    const matchesDepartment = selectedDepartment.value === 'all' || requirement.departmentId === selectedDepartment.value
    return matchesSearch && matchesDepartment
  })
})

type RequirementForm = {
  name: string
  department: string
  departmentId: string
  requiredDocument: string
  instruction: string
  deadline: string
}

const toRequirementRow = (form: RequirementForm) => ({
  title: form.name.trim(),
  required_document: form.requiredDocument.trim() || null,
  instruction: form.instruction.trim() || null,
  deadline: form.deadline || null,
})

async function addRequirement(form: RequirementForm) {
  if (!supabase) {
    loadError.value = 'Supabase is not configured.'
    return
  }

  const { data: createdRequirement, error } = await supabase.from('requirements').insert({
    ...toRequirementRow(form),
    department_id: form.departmentId,
  }).select('*').single()
  if (error) {
    loadError.value = error.message
    return
  }

  if (!createdRequirement) {
    loadError.value = 'Requirement was saved but could not be read back. Check the requirements SELECT policy.'
    return
  }

  activePopup.value = null
  await loadRequirements()
}

async function updateRequirement(form: RequirementForm) {
  if (!supabase || !selectedRequirement.value) return

  const { error } = await supabase
    .from('requirements')
    .update({ ...toRequirementRow(form), department_id: form.departmentId })
    .eq('id', selectedRequirement.value.id)

  if (error) {
    loadError.value = error.message
    return
  }

  activePopup.value = null
  selectedRequirement.value = null
  await loadRequirements()
}

async function deleteRequirement(requirement: (typeof requirements.value)[number]) {
  if (!supabase) return

  const { error } = await supabase.from('requirements').delete().eq('id', requirement.id)
  if (error) {
    loadError.value = error.message
    return
  }

  if (selectedRequirement.value?.id === requirement.id) selectedRequirement.value = null
  await loadRequirements()
}

function requestDeleteRequirement(requirement: (typeof requirements.value)[number]) {
  pendingDeleteRequirement.value = requirement
}

async function confirmDeleteRequirement() {
  if (!pendingDeleteRequirement.value) return
  const requirement = pendingDeleteRequirement.value
  pendingDeleteRequirement.value = null
  await deleteRequirement(requirement)
}

async function loadRequirements() {
  const [result, departmentsResult, assignmentsResult, profileResult] = await Promise.all([
    fetchRows('requirements'),
    fetchRows('departments'),
    fetchRows('department_personnel'),
    supabase ? supabase.rpc('get_my_profile') : Promise.resolve({ data: null, error: null }),
  ])
  loadError.value = result.error || departmentsResult.error || assignmentsResult.error || profileResult.error?.message || ''
  const profileName = String(profileResult.data?.full_name || profileResult.data?.email || '').trim().toLowerCase()
  const assignedDepartmentIds = new Set([
    ...assignmentsResult.data.map((assignment) => String(assignment.department_id)),
    ...departmentsResult.data
      .filter((department) => String(department.adviser || '').trim().toLowerCase() === profileName)
      .map((department) => String(department.id)),
  ])
  departments.value = departmentsResult.data
    .filter((department) => assignedDepartmentIds.has(String(department.id)))
    .map((department) => ({ id: String(department.id), name: String(department.name || department.title || department.id) }))
  const departmentNames = new Map(departments.value.map((department) => [department.id, department.name]))
  requirements.value = result.data
    .filter((item) => assignedDepartmentIds.has(String(item.department_id)))
    .sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))
    .map((item) => ({
    id: String(item.id),
    name: String(item.title || item.name || 'Requirement'),
    department: departmentNames.get(String(item.department_id)) || String(item.department_name || item.department_id || '—'),
    departmentId: String(item.department_id || ''),
    requiredDocument: String(item.required_document || item.document || '—'),
    instruction: String(item.instruction || item.instructions || '—'),
    deadline: displayDate(item.deadline),
    }))
  isLoading.value = false
}

async function openAddRequirement() {
  const [departmentsResult, assignmentsResult, profileResult] = await Promise.all([
    fetchRows('departments'),
    fetchRows('department_personnel'),
    supabase ? supabase.rpc('get_my_profile') : Promise.resolve({ data: null, error: null }),
  ])
  if (departmentsResult.error || assignmentsResult.error || profileResult.error) {
    loadError.value = departmentsResult.error || assignmentsResult.error || profileResult.error?.message || ''
    return
  }

  const profileName = String(profileResult.data?.full_name || profileResult.data?.email || '').trim().toLowerCase()
  const assignedDepartmentIds = new Set([
    ...assignmentsResult.data.map((assignment) => String(assignment.department_id)),
    ...departmentsResult.data
      .filter((department) => String(department.adviser || '').trim().toLowerCase() === profileName)
      .map((department) => String(department.id)),
  ])
  departments.value = departmentsResult.data.filter((department) => assignedDepartmentIds.has(String(department.id))).map((department) => ({
    id: String(department.id),
    name: String(department.name || department.title || department.id),
  }))
  activePopup.value = 'add'
}

onMounted(loadRequirements)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <main class="max-w-[1400px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-[16px] border border-[#dfe3ea] bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-md">
        <div class="w-full sm:flex-1 flex items-center gap-2 rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2">
          <span class="text-slate-400 text-lg">⌕</span>
          <input v-model="searchQuery" placeholder="Search" class="w-full bg-transparent text-slate-600 text-sm outline-none" />
        </div>
        <select v-model="selectedDepartment" class="w-full sm:w-auto rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-slate-600 text-sm">
          <option value="all">Department: All</option>
          <option v-for="department in departments" :key="department.id" :value="department.id">
            {{ department.name }}
          </option>
        </select>
        <button class="w-full sm:w-auto bg-[#8d63e8] text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click="openAddRequirement">
          + Add Requirements
        </button>
      </div>

      <div class="bg-white rounded-[20px] border border-[#dfe3ea] shadow-md overflow-x-auto">
        <div class="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
          <h2 class="text-lg sm:text-xl font-black text-slate-900">Requirements List</h2>
        </div>

        <div class="grid grid-cols-[1.2fr_1.2fr_1.1fr_1.5fr_0.8fr_0.8fr] gap-3 px-4 sm:px-5 py-3 border-b border-[#aeb6c4] bg-[#f3f4f6] text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
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
        <div v-for="item in filteredRequirements" v-else :key="item.id" class="grid grid-cols-[1.2fr_1.2fr_1.1fr_1.5fr_0.8fr_0.8fr] gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#b8c0cc] last:border-b-0 items-center text-xs sm:text-sm text-slate-700">
          <div class="flex min-w-0 items-center gap-2 font-medium"><span class="h-2 w-2 shrink-0 rounded-full bg-[#8d63e8]" aria-hidden="true"></span><span class="truncate">{{ item.name }}</span></div>
          <div>{{ item.department }}</div>
          <div>{{ item.requiredDocument }}</div>
          <div>{{ item.instruction }}</div>
          <div>{{ item.deadline }}</div>
          <div class="flex justify-end gap-2">
            <button class="bg-[#8d63e8] text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click="selectedRequirement = item; activePopup = 'edit'">
              Edit
            </button>
            <button class="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 sm:px-3 sm:py-1.5 sm:text-sm" @click="requestDeleteRequirement(item)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
    <SPAddRequirementPopup v-if="activePopup === 'add'" :departments="departments" @close="activePopup = null" @save="addRequirement" />
    <SPEditRequirementPopup v-if="activePopup === 'edit' && selectedRequirement" :requirement="selectedRequirement" :departments="departments" @close="activePopup = null; selectedRequirement = null" @save="updateRequirement" />

    <div v-if="pendingDeleteRequirement" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4" @click.self="pendingDeleteRequirement = null">
      <section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="delete-requirement-title" aria-describedby="delete-requirement-description">
        <h2 id="delete-requirement-title" class="text-lg font-bold text-slate-900">Delete requirement?</h2>
        <p id="delete-requirement-description" class="mt-2 text-sm text-slate-600">Delete the requirement "{{ pendingDeleteRequirement.name }}"? This may also remove related submissions.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" @click="pendingDeleteRequirement = null">Cancel</button>
          <button type="button" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="confirmDeleteRequirement">Delete requirement</button>
        </div>
      </section>
    </div>
  </div>
</template>
