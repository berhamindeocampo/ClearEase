<script setup lang="ts">
import AdminHeader from './AdminHeader.vue'

const accounts = [
  { name: 'Mary Grace Piattos', role: 'Student', id: '20230119', status: 'Active' },
  { name: 'Timon Andrew Pusa', role: 'Student', id: '20230125', status: 'Active' },
  { name: 'Jay Kamote', role: 'Student', id: '20240221', status: 'Inactive' },
]
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <AdminHeader />

    <main class="max-w-[1500px] mx-auto px-6 py-8">
      <h1 class="text-[2.4rem] font-black text-slate-900 mb-5">User Accounts</h1>

      <div class="mb-6 flex gap-3 text-sm font-medium">
        <button class="rounded-full border border-[#d5d7df] bg-white px-4 py-2 text-[#4b5563] shadow-sm">[ Students ]</button>
        <button class="rounded-full border border-[#d5d7df] bg-white px-4 py-2 text-[#4b5563] shadow-sm">[ School Personnel ]</button>
      </div>

      <div class="bg-white rounded-[28px] border border-[#dfe3ea] shadow-[0_8px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        <div class="grid grid-cols-[1.3fr_1.1fr_1fr_1.1fr_1.6fr] gap-4 px-5 py-4 border-b border-[#e5e7eb] bg-[#f3f4f6] text-sm font-semibold text-slate-600">
          <div>Students ID</div>
          <div>Students Name</div>
          <div>Year Level</div>
          <div>Account Status</div>
          <div class="text-right pr-2">Action</div>
        </div>

        <div v-for="account in accounts" :key="account.id" class="grid grid-cols-[1.3fr_1.1fr_1fr_1.1fr_1.6fr] gap-4 px-5 py-4 border-b border-[#edf0f4] last:border-b-0 items-center text-[1.02rem]">
          <div class="font-medium text-slate-700">{{ account.id }}</div>
          <div class="font-medium text-slate-700">{{ account.name }}</div>
          <div>Grade 12</div>
          <div>
            <span
              :class="[
                'inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold',
                account.status === 'Active' ? 'bg-[#d9f9ed] text-[#0f9f67]' : 'bg-[#ffd7d7] text-[#d93c3c]'
              ]"
            >
              {{ account.status }}
            </span>
          </div>
          <div class="text-right">
            <button class="bg-[#8d63e8] text-white rounded-[12px] px-4 py-2 font-semibold shadow-sm hover:bg-[#7f55dd]">
              View Account Details <span class="ml-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
