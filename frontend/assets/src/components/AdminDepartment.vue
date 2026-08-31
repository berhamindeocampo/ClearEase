<script setup lang="ts">
import AdminHeader from './AdminHeader.vue'

const departments = [
  { name: 'Pr 1', requirement: 'Research Paper', personnel: '1 personnel', action: 'Manage' },
  { name: 'Finance', requirement: 'Finance Form', personnel: '2 personnel', action: 'Manage' },
  { name: 'Oral Com', requirement: 'Essay', personnel: '1 personnel', action: 'Manage' },
  { name: 'Library', requirement: 'Library Form', personnel: '2 personnel', action: 'Manage' },
]
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <AdminHeader />

    <main class="max-w-[1500px] mx-auto px-6 py-8">
      <div class="mb-6 flex items-center justify-between gap-4 rounded-[22px] border border-[#dfe3ea] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div class="flex-1 flex items-center gap-3 rounded-xl border border-[#dfe3ea] bg-slate-50 px-4 py-3">
          <span class="text-slate-400 text-xl">⌕</span>
          <input value="Search" class="w-full bg-transparent text-slate-600 outline-none" />
        </div>

        <button class="bg-[#8d63e8] text-white rounded-xl px-5 py-3 font-semibold shadow-sm hover:bg-[#7f55dd]">
          + Add Department
        </button>
      </div>

      <div class="bg-white rounded-[28px] border border-[#dfe3ea] shadow-[0_8px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <h2 class="text-[2.2rem] font-black text-slate-900">Departments</h2>
        </div>

        <div class="grid grid-cols-[1.1fr_1.4fr_1.2fr_0.8fr] gap-4 px-6 py-4 border-b border-[#edf0f4] bg-[#f3f4f6] text-base font-semibold text-slate-600">
          <div>Department</div>
          <div>Requirements needed</div>
          <div>Assigned Personnel</div>
          <div class="text-right">Action</div>
        </div>

        <div v-for="dept in departments" :key="dept.name" class="grid grid-cols-[1.1fr_1.4fr_1.2fr_0.8fr] gap-4 px-6 py-5 border-b border-[#edf0f4] last:border-b-0 items-center text-[1.02rem] text-slate-700">
          <div>{{ dept.name }}</div>
          <div>{{ dept.requirement }}</div>
          <div>{{ dept.personnel }}</div>
          <div class="text-right">
            <button class="bg-[#8d63e8] text-white rounded-xl px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#7f55dd]">
              {{ dept.action }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
