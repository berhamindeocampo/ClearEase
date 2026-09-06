<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminHeader from '../headers/AdminHeader.vue'
import AdminAccountPopup from '../popups/AdminAccountPopup.vue'
import { supabase } from '../composables/auth'

type AccountType = 'students' | 'school_personnel'

interface Account {
  name: string
  role: string
  id: string
  status: string
  yearLevel: string
  email: string
}

const activeType = ref<AccountType>('students')
const accounts = ref<Account[]>([])
const selectedAccount = ref<Account | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const getName = (record: Record<string, unknown>) => String(record.full_name || record.fullName || record.name || record.username || record.user_name || record.email || 'Unnamed account')
const getStatus = (record: Record<string, unknown>) => {
  if (record.status) return String(record.status)
  if (record.is_active === false || record.active === false) return 'Inactive'
  return 'Active'
}

const mapAccount = (record: Record<string, unknown>, type: AccountType): Account => ({
  name: getName(record),
  role: type === 'students' ? 'Student' : 'School Personnel',
  id: String(record.student_id || record.id || '—'),
  status: getStatus(record),
  yearLevel: String(record.year_level || record.grade_level || (type === 'students' ? 'Grade 12' : '—')),
  email: String(record.email || '—'),
})

async function fetchAccounts() {
  isLoading.value = true
  errorMessage.value = ''
  selectedAccount.value = null

  if (!supabase) {
    accounts.value = []
    errorMessage.value = 'Supabase is not configured.'
    isLoading.value = false
    return
  }

  const table = activeType.value === 'students' ? 'users' : 'clearease_personnel'
  const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true })

  if (error) {
    accounts.value = []
    errorMessage.value = error.message
  } else {
    accounts.value = (data ?? []).map((record) => mapAccount(record, activeType.value))
  }

  isLoading.value = false
}

function selectAccountType(type: AccountType) {
  activeType.value = type
  fetchAccounts()
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-slate-900">
    <AdminHeader />

    <main class="max-w-[1280px] mx-auto px-4 py-6 sm:px-6 sm:py-7">
      <h1 class="text-3xl font-black text-slate-900 mb-4">User Accounts</h1>

      <div class="mb-5 flex gap-2 text-sm font-medium">
        <button :class="activeType === 'students' ? 'bg-[#8d63e8] text-white' : 'bg-white text-[#4b5563]'" class="rounded-full border border-[#d5d7df] px-3.5 py-1.5 shadow-sm" @click="selectAccountType('students')">Students</button>
        <button :class="activeType === 'school_personnel' ? 'bg-[#8d63e8] text-white' : 'bg-white text-[#4b5563]'" class="rounded-full border border-[#d5d7df] px-3.5 py-1.5 shadow-sm" @click="selectAccountType('school_personnel')">School Personnel</button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-[#dfe3ea] bg-white shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
        <div class="grid min-w-[760px] grid-cols-[1.2fr_1.5fr_0.9fr_1fr_1.3fr] gap-3 border-b border-[#e5e7eb] bg-[#f3f4f6] px-4 py-3 text-xs font-semibold text-slate-600 sm:text-sm">
          <div>ID</div>
          <div>Name</div>
          <div>{{ activeType === 'students' ? 'Year Level' : 'Role' }}</div>
          <div>Account Status</div>
          <div class="text-right pr-2">Action</div>
        </div>

        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-slate-500">Loading accounts...</div>
        <div v-else-if="errorMessage" class="px-4 py-8 text-center text-sm text-red-600">{{ errorMessage }}</div>
        <div v-else-if="accounts.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">No accounts found.</div>
        <div v-for="account in accounts" v-else :key="account.id" class="grid min-w-[760px] grid-cols-[1.2fr_1.5fr_0.9fr_1fr_1.3fr] items-center gap-3 border-b border-[#edf0f4] px-4 py-3 last:border-b-0 text-sm">
          <div class="font-medium text-slate-700">{{ account.id }}</div>
          <div class="font-medium text-slate-700">{{ account.name }}</div>
          <div>{{ activeType === 'students' ? account.yearLevel : account.role }}</div>
          <div>
            <span
              :class="[
                'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold',
                account.status === 'Active' ? 'bg-[#d9f9ed] text-[#0f9f67]' : 'bg-[#ffd7d7] text-[#d93c3c]'
              ]"
            >
              {{ account.status }}
            </span>
          </div>
          <div class="text-right">
            <button class="rounded-lg bg-[#8d63e8] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7f55dd]" @click="selectedAccount = account">
              View Account Details <span class="ml-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
    <AdminAccountPopup v-if="selectedAccount" :account="selectedAccount" @close="selectedAccount = null" />
  </div>
</template>
