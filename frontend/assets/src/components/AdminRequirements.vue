<script setup lang="ts">
import AdminHeader from './AdminHeader.vue'

const requirements = [
  { name: 'Pr 1 Clearance', department: 'Practical Research 1', requiredDocument: 'Research Paper', instruction: 'Finished Research paper', deadline: 'Sep 12, 2026' },
  { name: 'Finance Clearance', department: 'Finance', requiredDocument: 'Finance Form', instruction: 'Submit Form', deadline: 'Sep 12, 2026' },
  { name: 'Oral Com Clearance', department: 'Oral Communication', requiredDocument: 'Essay', instruction: '500 words essay about...', deadline: 'Sep 15, 2026' },
  { name: 'Library Clearance', department: 'Library', requiredDocument: 'Library Form', instruction: 'Submit Form', deadline: 'Sep 15, 2026' },
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

        <select class="rounded-xl border border-[#dfe3ea] bg-slate-50 px-4 py-3 text-slate-600">
          <option>Department: All</option>
        </select>

        <button class="bg-[#8d63e8] text-white rounded-xl px-5 py-3 font-semibold shadow-sm hover:bg-[#7f55dd]">
          + Add Requirements
        </button>
      </div>

      <div class="bg-white rounded-[28px] border border-[#dfe3ea] shadow-[0_8px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <h2 class="text-[2.2rem] font-black text-slate-900">Requirements List</h2>
        </div>

        <div class="grid grid-cols-[1.2fr_1.2fr_1.1fr_1.5fr_0.8fr_0.8fr] gap-4 px-6 py-4 border-b border-[#edf0f4] bg-[#f3f4f6] text-base font-semibold text-slate-600">
          <div>Requirements</div>
          <div>Department</div>
          <div>Required Document</div>
          <div>Instruction</div>
          <div>Deadline</div>
          <div class="text-right">Action</div>
        </div>

        <div v-for="item in requirements" :key="item.name" class="grid grid-cols-[1.2fr_1.2fr_1.1fr_1.5fr_0.8fr_0.8fr] gap-4 px-6 py-5 border-b border-[#edf0f4] last:border-b-0 items-center text-[1.02rem] text-slate-700">
          <div>{{ item.name }}</div>
          <div>{{ item.department }}</div>
          <div>{{ item.requiredDocument }}</div>
          <div>{{ item.instruction }}</div>
          <div>{{ item.deadline }}</div>
          <div class="text-right">
            <button class="bg-[#8d63e8] text-white rounded-xl px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#7f55dd]">
              Edit
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
