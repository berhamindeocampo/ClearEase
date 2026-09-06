<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth'

type ThemeMode = 'light' | 'dark'

const themeMode = ref<ThemeMode>('light')
const autoMatchSystem = ref(false)
const router = useRouter()
const { logOut } = useAuth()
const isLoggingOut = ref(false)

type UserRole = 'student' | 'admin' | 'school_personnel'

interface LocalSession {
  role?: UserRole
  fullName?: string
  email?: string
  studentId?: string
}

const session = (() => {
  try {
    return JSON.parse(localStorage.getItem('clearease-local-session') || 'null') as LocalSession | null
  } catch {
    return null
  }
})()

const userRole = computed<UserRole>(() => session?.role ?? 'student')
const isStudent = computed(() => userRole.value === 'student')

interface AccountProfile {
  name: string
  role: string
  email: string
  initials: string
  sessionId: string
}

const accountProfile = computed<AccountProfile>(() => {
  const name = session?.fullName?.trim() || session?.email?.split('@')[0] || 'User'
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    name,
    role: userRole.value === 'school_personnel' ? 'School Personnel' : userRole.value === 'admin' ? 'Administrator' : 'Student',
    email: session?.email || 'No email available',
    initials: initials || 'U',
    sessionId: session?.studentId ? `#${session.studentId}` : '#LOCAL-SESSION',
  }
})

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'theme-change', mode: ThemeMode): void
}>()

function selectTheme(mode: ThemeMode) {
  themeMode.value = mode
  emit('theme-change', mode)
}

async function handleLogout() {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  emit('logout')

  try {
    await logOut()
    await router.replace('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f0effc] antialiased text-gray-800 flex flex-col font-sans">
    <!-- Top Navigation -->

    <!-- Main Content -->
    <main class="flex-1 max-w-[1720px] w-full mx-auto px-6 lg:px-12 py-8 flex flex-col gap-6">
      <div class="max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div class="mb-2">
          <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p class="text-sm lg:text-base text-gray-500 mt-1">Manage your system appearance and account session.</p>
        </div>

        <!-- Appearance Card -->
        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-[0_4px_20px_-2px_rgba(99,102,241,0.07),0_2px_6px_-1px_rgba(0,0,0,0.04)] border border-gray-100">
          <div class="flex items-center space-x-3 pb-5 border-b border-gray-100 mb-6">
            <div class="p-2.5 bg-purple-50 rounded-xl text-[#7b57db]">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-800">Appearance</h2>
              <p class="text-xs text-gray-500">Customize how ClearEase looks on your device</p>
            </div>
          </div>

          <!-- Mode Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Light Mode -->
            <label
              class="relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all"
              :class="themeMode === 'light' ? 'border-[#7b57db] bg-[#ede9fe]/20' : 'border-gray-200 hover:border-gray-300 bg-white'"
            >
              <input type="radio" name="theme_mode" value="light" class="sr-only" :checked="themeMode === 'light'" @change="selectTheme('light')" />
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" :class="themeMode === 'light' ? 'text-[#7b57db]' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span class="text-sm font-bold" :class="themeMode === 'light' ? 'text-gray-900' : 'text-gray-700'">Light Mode</span>
                </div>
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  :class="themeMode === 'light' ? 'bg-[#7b57db] text-white' : 'border border-gray-300 text-transparent'"
                >
                  <svg v-if="themeMode === 'light'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <div class="w-full h-20 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5 shadow-inner">
                <div class="w-1/3 h-2 bg-[#7b57db] rounded" />
                <div class="w-full h-1.5 bg-gray-200 rounded" />
                <div class="w-4/5 h-1.5 bg-gray-200 rounded" />
                <div class="w-2/3 h-1.5 bg-gray-200 rounded" />
              </div>
              <span class="text-[11px] font-medium mt-2.5" :class="themeMode === 'light' ? 'text-[#7b57db]' : 'text-gray-400'">
                Default system interface
              </span>
            </label>

            <!-- Dark Mode -->
            <label
              class="relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all"
              :class="themeMode === 'dark' ? 'border-[#7b57db] bg-[#ede9fe]/20' : 'border-gray-200 hover:border-gray-300 bg-white'"
            >
              <input type="radio" name="theme_mode" value="dark" class="sr-only" :checked="themeMode === 'dark'" @change="selectTheme('dark')" />
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" :class="themeMode === 'dark' ? 'text-[#7b57db]' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  <span class="text-sm font-bold" :class="themeMode === 'dark' ? 'text-gray-900' : 'text-gray-700'">Dark Mode (Optional)</span>
                </div>
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  :class="themeMode === 'dark' ? 'bg-[#7b57db] text-white' : 'border border-gray-300 text-transparent'"
                >
                  <svg v-if="themeMode === 'dark'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <div class="w-full h-20 rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col gap-1.5 shadow-inner">
                <div class="w-1/3 h-2 bg-[#7b57db] rounded" />
                <div class="w-full h-1.5 bg-slate-700 rounded" />
                <div class="w-4/5 h-1.5 bg-slate-700 rounded" />
                <div class="w-2/3 h-1.5 bg-slate-700 rounded" />
              </div>
              <span class="text-[11px] font-medium mt-2.5 text-gray-400">Reduces eye strain in low-light</span>
            </label>
          </div>

          <!-- Auto-match toggle -->
          <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-xs font-semibold text-gray-800">Auto-match system preference</span>
              <p class="text-[11px] text-gray-500">Sync theme automatically with your operating system display settings</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input v-model="autoMatchSystem" type="checkbox" class="sr-only peer" />
              <div
                class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7b57db]"
              />
            </label>
          </div>
        </div>

        <!-- Account & Session Card -->
        <div v-if="!isStudent" class="bg-white rounded-2xl p-6 lg:p-8 shadow-[0_4px_20px_-2px_rgba(99,102,241,0.07),0_2px_6px_-1px_rgba(0,0,0,0.04)] border border-gray-100">
          <div class="flex items-center space-x-3 pb-5 border-b border-gray-100 mb-6">
            <div class="p-2.5 bg-purple-50 rounded-xl text-[#7b57db]">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-800">Account Session</h2>
              <p class="text-xs text-gray-500">Manage your active session and sign out</p>
            </div>
          </div>

          <div class="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#7b57db] to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {{ accountProfile.initials }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-slate-900">{{ accountProfile.name }}</p>
                  <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Active Now</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ accountProfile.role }} • {{ accountProfile.email }}</p>
              </div>
            </div>
            <span class="text-[11px] font-medium text-gray-400">Session ID: {{ accountProfile.sessionId }}</span>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <p class="text-xs text-gray-500">Terminating your session will return you to the ClearEase institutional login page.</p>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-rose-500 bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm flex-shrink-0"
              @click="handleLogout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{{ isLoggingOut ? 'Logging Out...' : 'Log Out of Account' }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

.font-sans {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>