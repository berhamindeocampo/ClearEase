<script setup lang="ts">
import { ref } from 'vue'
import SPAddRequirementPopup from '../popups/SPAddRequirementPopup.vue'
import SPEditRequirementPopup from '../popups/SPEditRequirementPopup.vue'
const requirements = [
  { name: 'Pr 1 Clearance', department: 'Practical Research 1', requiredDocument: 'Research Paper', instruction: 'Finished Research paper', deadline: 'Sep 12, 2026' },
  { name: 'Finance Clearance', department: 'Finance', requiredDocument: 'Finance Form', instruction: 'Submit Form', deadline: 'Sep 12, 2026' },
  { name: 'Oral Com Clearance', department: 'Oral Communication', requiredDocument: 'Essay', instruction: '500 words essay about...', deadline: 'Sep 15, 2026' },
  { name: 'Library Clearance', department: 'Library', requiredDocument: 'Library Form', instruction: 'Submit Form', deadline: 'Sep 15, 2026' },
]
const activePopup = ref<'add' | 'edit' | null>(null)
const selectedRequirement = ref<(typeof requirements)[number] | null>(null)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <main class="max-w-[1400px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-[16px] border border-[#dfe3ea] bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-md">
        <div class="w-full sm:flex-1 flex items-center gap-2 rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2">
          <span class="text-slate-400 text-lg">⌕</span>
          <input placeholder="Search" class="w-full bg-transparent text-slate-600 text-sm outline-none" />
        </div>
        <select class="w-full sm:w-auto rounded-lg border border-[#dfe3ea] bg-slate-50 px-3 py-2 text-slate-600 text-sm">
          <option>Department: All</option>
        </select>
        <button class="w-full sm:w-auto bg-[#8d63e8] text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click="activePopup = 'add'">
          + Add Requirements
        </button>
      </div>

      <div class="bg-white rounded-[20px] border border-[#dfe3ea] shadow-md overflow-x-auto">
        <div class="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
          <h2 class="text-lg sm:text-xl font-black text-slate-900">Requirements List</h2>
        </div>

        <div class="grid grid-cols-[1.2fr_1.2fr_1.1fr_1.5fr_0.8fr_0.8fr] gap-3 px-4 sm:px-5 py-3 border-b border-[#edf0f4] bg-[#f3f4f6] text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
          <div>Requirements</div>
          <div>Department</div>
          <div>Required Document</div>
          <div>Instruction</div>
          <div>Deadline</div>
          <div class="text-right">Action</div>
        </div>

        <div v-for="item in requirements" :key="item.name" class="grid grid-cols-[1.2fr_1.2fr_1.1fr_1.5fr_0.8fr_0.8fr] gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#edf0f4] last:border-b-0 items-center text-xs sm:text-sm text-slate-700">
          <div>{{ item.name }}</div>
          <div>{{ item.department }}</div>
          <div>{{ item.requiredDocument }}</div>
          <div>{{ item.instruction }}</div>
          <div>{{ item.deadline }}</div>
          <div class="text-right">
            <button class="bg-[#8d63e8] text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#7f55dd]" @click="selectedRequirement = item; activePopup = 'edit'">
              Edit
            </button>
          </div>
        </div>
      </div>
    </main>
    <SPAddRequirementPopup v-if="activePopup === 'add'" @close="activePopup = null" @save="activePopup = null" />
    <SPEditRequirementPopup v-if="activePopup === 'edit' && selectedRequirement" :requirement="selectedRequirement" @close="activePopup = null; selectedRequirement = null" @save="activePopup = null; selectedRequirement = null" />
  </div>
</template>
