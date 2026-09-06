<script setup lang="ts">
const stats = [
  { value: 245, label: 'Total Students', icon: '▣', tone: 'purple' },
  { value: 128, label: 'In Progress', icon: '◔', tone: 'orange' },
  { value: 87, label: 'Completed', icon: '✓', tone: 'green' },
  { value: 30, label: 'For Action', icon: '!', tone: 'red' },
]

const clearances = [
  { student: 'Xuniso Belat', requirement: 'Activities', department: 'Philosophy', submitted: 'Today', status: 'Pending' },
  { student: 'Heart Santiago', requirement: 'Assignments, Acts', department: 'PR-1', submitted: 'Yesterday', status: 'Approved' },
  { student: 'Anne Ongpauco', requirement: 'Finance Requirements', department: 'Finance', submitted: '4 days ago', status: 'For Action' },
  { student: 'Ralph Josh Bacon', requirement: 'Project', department: 'Oral Com', submitted: '4 days ago', status: 'Approved' },
]

const statusClasses: Record<string, string> = {
  Pending: 'bg-[#fdf1d1] text-[#d58c08]',
  Approved: 'bg-[#daf9ea] text-[#0f9f67]',
  'For Action': 'bg-[#ffd6d6] text-[#d93c3c]',
}
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <main class="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-[20px] border border-[#e5e7eb] shadow-md p-4 sm:p-5 min-h-[130px] sm:min-h-[140px]">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-2xl sm:text-3xl font-semibold',
                stat.tone === 'purple' ? 'bg-[#f0e7ff] text-[#8d63e8]' :
                stat.tone === 'orange' ? 'bg-[#fff0dc] text-[#f59e0b]' :
                stat.tone === 'green' ? 'bg-[#def9ea] text-[#1ea86a]' : 'bg-[#ffdfe2] text-[#e74f57]'
              ]"
            >
              {{ stat.icon }}
            </div>
            <div class="text-2xl sm:text-3xl font-bold leading-none">{{ stat.value }}</div>
          </div>
          <div class="mt-3 sm:mt-4 text-sm font-medium text-slate-700">{{ stat.label }}</div>
          <div
            :class="[
              'mt-3 h-1 rounded-full',
              stat.tone === 'purple' ? 'bg-[#8d63e8]' :
              stat.tone === 'orange' ? 'bg-[#f59e0b]' :
              stat.tone === 'green' ? 'bg-[#1ea86a]' : 'bg-[#e74f57]'
            ]"
            :style="{ width: stat.tone === 'purple' ? '40%' : stat.tone === 'orange' ? '52%' : stat.tone === 'green' ? '74%' : '12%' }"
          />
        </div>
      </div>

      <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-[16px] border border-[#dfe3ea] bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-md">
        <div class="w-full sm:flex-1 flex items-center gap-2 rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2">
          <span class="text-slate-400 text-lg">⌕</span>
          <input placeholder="Search" class="w-full bg-transparent text-slate-600 text-sm outline-none" />
        </div>
        <select class="w-full sm:w-auto rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-slate-600 text-sm">
          <option>Status: All</option>
        </select>
        <select class="w-full sm:w-auto rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-slate-600 text-sm">
          <option>Department: All</option>
        </select>
      </div>

      <div class="bg-white rounded-[20px] border border-[#dfe3ea] shadow-md overflow-x-auto">
        <div class="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
          <h2 class="text-lg sm:text-xl font-black text-slate-900">Clearances Table</h2>
        </div>

        <div class="grid grid-cols-[1.5fr_1.4fr_1.2fr_1fr_1fr] gap-3 px-4 sm:px-5 py-3 border-b border-[#edf0f4] bg-[#f3f4f6] text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
          <div>Students</div>
          <div>Requirements</div>
          <div>Department</div>
          <div>Submitted</div>
          <div>Status</div>
        </div>

        <div v-for="item in clearances" :key="item.student" class="grid grid-cols-[1.5fr_1.4fr_1.2fr_1fr_1fr] gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#edf0f4] last:border-b-0 items-center text-xs sm:text-sm text-slate-700">
          <div>{{ item.student }}</div>
          <div>{{ item.requirement }}</div>
          <div>{{ item.department }}</div>
          <div>{{ item.submitted }}</div>
          <div>
            <button
              :class="[
                'rounded-full px-4 py-2 text-sm font-semibold',
                statusClasses[item.status]
              ]"
            >
              {{ item.status }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
