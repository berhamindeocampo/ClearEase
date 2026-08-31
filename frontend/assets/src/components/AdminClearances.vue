<script setup lang="ts">
import AdminHeader from './AdminHeader.vue'

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
    <AdminHeader />

    <main class="max-w-[1500px] mx-auto px-6 py-8">
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-[28px] border border-[#e5e7eb] shadow-[0_8px_20px_rgba(15,23,42,0.06)] p-5 min-h-[170px]">
          <div class="flex items-center gap-4">
            <div
              :class="[
                'flex h-14 w-14 items-center justify-center rounded-2xl text-3xl font-semibold',
                stat.tone === 'purple' ? 'bg-[#f0e7ff] text-[#8d63e8]' :
                stat.tone === 'orange' ? 'bg-[#fff0dc] text-[#f59e0b]' :
                stat.tone === 'green' ? 'bg-[#def9ea] text-[#1ea86a]' : 'bg-[#ffdfe2] text-[#e74f57]'
              ]"
            >
              {{ stat.icon }}
            </div>
            <div class="text-[3rem] font-bold leading-none">{{ stat.value }}</div>
          </div>
          <div class="mt-4 text-[1.1rem] font-medium text-slate-700">{{ stat.label }}</div>
          <div
            :class="[
              'mt-4 h-1.5 rounded-full',
              stat.tone === 'purple' ? 'bg-[#8d63e8]' :
              stat.tone === 'orange' ? 'bg-[#f59e0b]' :
              stat.tone === 'green' ? 'bg-[#1ea86a]' : 'bg-[#e74f57]'
            ]"
            :style="{ width: stat.tone === 'purple' ? '40%' : stat.tone === 'orange' ? '52%' : stat.tone === 'green' ? '74%' : '12%' }"
          />
        </div>
      </div>

      <div class="mb-8 flex items-center gap-4 rounded-[22px] border border-[#dfe3ea] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div class="flex-1 flex items-center gap-3 rounded-xl border border-[#dfe3ea] bg-slate-50 px-4 py-3">
          <span class="text-slate-400 text-xl">⌕</span>
          <input value="Search" class="w-full bg-transparent text-slate-600 outline-none" />
        </div>
        <select class="rounded-xl border border-[#dfe3ea] bg-slate-50 px-4 py-3 text-slate-600">
          <option>Status: All</option>
        </select>
        <select class="rounded-xl border border-[#dfe3ea] bg-slate-50 px-4 py-3 text-slate-600">
          <option>Department: All</option>
        </select>
      </div>

      <div class="bg-white rounded-[28px] border border-[#dfe3ea] shadow-[0_8px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <h2 class="text-[2.2rem] font-black text-slate-900">Clearances Table</h2>
        </div>

        <div class="grid grid-cols-[1.5fr_1.4fr_1.2fr_1fr_1fr] gap-4 px-6 py-4 border-b border-[#edf0f4] bg-[#f3f4f6] text-base font-semibold text-slate-600">
          <div>Students</div>
          <div>Requirements</div>
          <div>Department</div>
          <div>Submitted</div>
          <div>Status</div>
        </div>

        <div v-for="item in clearances" :key="item.student" class="grid grid-cols-[1.5fr_1.4fr_1.2fr_1fr_1fr] gap-4 px-6 py-5 border-b border-[#edf0f4] last:border-b-0 items-center text-[1.02rem] text-slate-700">
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
