<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

import { 
  LayoutGrid, 
  BookOpen, 
  ClipboardCheck, 
  Settings,
  User
} from 'lucide-vue-next'

interface NavItem {
  name: string
  href: string
  icon: any
}

const NavItems: NavItem[] = [
  {name: 'Dashboard', href: '#', icon: LayoutGrid},
  {name: 'Subjects', href: '#', icon: BookOpen},
  {name: 'Requirements', href: '#', icon: ClipboardCheck},
  {name: 'Settings', href: '#', icon: Settings},
]

const activeItems = ref<String[]>(['Dashboard'])

const user = {
  name: "Kuchiba Chisa",
  subtitle: "Student",
}

interface ClearanceRequest {
  id: number
  student_name: string
  status: string
}

const requests = ref<ClearanceRequest[]>([])
const errorMessage = ref('')

onMounted(async () => {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('*')

  if (error) {
    errorMessage.value = error.message
    return
  }

  requests.value = data ?? []
})
</script>

<template>
    <aside class="w-64 h-screen bg-[#24113f] text-white flex flex-col justify-between p-4 font-sans select-none"> 
      <! -- that grey border underneath the title -- >
        <div>
          <! --Your generic header whatever-- >
          <header class="px-2 pt-2 pb-4 border-b border-white/20 mb-4">
            <h1 class="font-bold text-2xl tracking-wide leading-none">
                ClearEase
            </h1>
            <p class="text-xs text-emerald-100 font-medium mt-1">Clearance Tracker</p>
          </header>
        </div>

        <! -- Your navigation, I'm falling in Nav with you -- >
        <nav class="space-y-1">
          <ul>
              <a 
              v-for="item in NavItems"
              :key="item.name"
              :href="item.href"
              @click.prevent="activeItems = [item.name]"
              :class="[
                'flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors duration-100',
                activeItems.includes(item.name)
              ? 'bg-[#6C2BD9] text-white'
              : 'text-white hover:bg-white/10'
              ]">
                  <component :is="item.icon" class="w-6 h-5 shrink-0" />
                  <span>{{ item.name }}</span>
              </a>
          </ul>
        </nav>

        <! -- Your user profile footer, I see you, mah boi -- >
        <div class="bg-[#6C2BD9 ] rounded-xl p-3 flex items-center gap-3 border border-purple-600/50">
            <div class="w-10 h-10 rounded-full bg-white text-[#6C2BD9] flex items-center justify-center shrink-0">
                <User class="w-6 h-6" fill-current />
            </div>
            <div class="overflow-hidden">
                <h2 class="font-semibold text-sm leading-none truncate">{{ user.name }}</h2>
                <p class="text-xs text-emerald-100 truncate">{{ user.subtitle }}</p>
            </div>  
        </div>
    </aside>

    <section> </section>
  </template>