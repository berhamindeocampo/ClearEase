<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase'

const status = ref<'checking' | 'connected' | 'error'>('checking')

onMounted(async () => {
  try {
    const { error } = await supabase.auth.getSession()
    if (error) throw error
    status.value = 'connected'
  } catch (err) {
    console.error(err)
    status.value = 'error'
  }
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
    <div class="p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl">
      <h1 class="text-2xl font-bold text-emerald-400">Vue 3 + Tailwind + Supabase</h1>
      <div 
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
        :class="{
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': status === 'connected',
          'bg-rose-500/10 text-rose-400 border border-rose-500/20': status === 'error',
          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20': status === 'checking'
        }"
      >
        <span>Status: {{ status }}</span>
      </div>
    </div>
  </main>
</template>