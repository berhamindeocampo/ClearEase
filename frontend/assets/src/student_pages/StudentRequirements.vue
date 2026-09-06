<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Filter, BookOpen, Landmark, BadgeCheck, FlaskConical, Brain, Upload } from 'lucide-vue-next'
import StudentSubmitPopup from '../popups/StudentSubmitPopup.vue'
import StudentViewDetailsPopup from '../popups/StudentViewDetailsPopup.vue'

const searchQuery = ref('')
const activeFilter = ref('All')
const selectedRequirement = ref<number | null>(null)
const activePopup = ref<'details' | 'submit' | null>(null)

const requirements = ref([
  {
    id: 1,
    title: 'Library Clearance',
    department: 'Library',
    requiredDocument: 'Library Form',
    instruction: 'Submit Form',
    deadline: 'Sep 2, 2024',
    status: 'Pending',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Finance Clearance',
    department: 'Finance',
    requiredDocument: 'Finance Form',
    instruction: 'Submit Form',
    deadline: 'Sep 2, 2024',
    status: 'In Review',
    icon: Landmark,
  },
  {
    id: 3,
    title: 'Registrar Clearance',
    department: 'Registrar',
    requiredDocument: 'Registration Record',
    instruction: 'Clearance completed',
    deadline: '—',
    status: 'Cleared',
    icon: BadgeCheck,
  },
  {
    id: 4,
    title: 'EmpTech Project',
    department: 'IT Department',
    requiredDocument: 'Project File',
    instruction: 'Submit final output',
    deadline: 'Sep 10, 2024',
    status: 'Pending',
    icon: FlaskConical,
  },
  {
    id: 5,
    title: 'PerDev Portfolio',
    department: 'Student Affairs',
    requiredDocument: 'Portfolio',
    instruction: 'Submit proof of completion',
    deadline: 'Sep 15, 2024',
    status: 'Pending',
    icon: Brain,
  },
])

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
}

const handleViewDetails = (id: number) => {
  selectedRequirement.value = id
  activePopup.value = 'details'
}

const handleSubmit = (id: number) => {
  selectedRequirement.value = id
  activePopup.value = 'submit'
}

const closePopup = () => {
  activePopup.value = null
  selectedRequirement.value = null
}

const selectedItem = computed(() => requirements.value.find((item) => item.id === selectedRequirement.value))
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

        <div v-for="item in filteredRequirements" :key="item.id" class="grid grid-cols-[1.8fr_1.3fr_1.4fr_1.5fr_0.9fr_1.1fr] items-center gap-3 border-b border-[#edf0f4] px-4 py-4 last:border-b-0 text-sm text-slate-700">
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
    @submitted="closePopup"
  />
</template>
