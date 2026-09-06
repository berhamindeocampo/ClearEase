<script setup lang="ts">
defineProps<{ activities: Array<{ title: string; department: string; status: string; date: string }> }>()
const emit = defineEmits<{ (event: 'close'): void }>()
</script>
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')"><section class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="All activity"><div class="flex justify-between"><h2 class="text-xl font-bold text-slate-900">All Activity</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div><div class="mt-4 divide-y divide-slate-200"><div v-for="activity in activities" :key="`${activity.title}-${activity.date}`" class="flex justify-between gap-4 py-4 text-sm"><div><p class="font-semibold text-slate-900">{{ activity.title }}</p><p class="text-slate-500">{{ activity.department }}</p></div><div class="text-right"><p class="font-semibold text-slate-700">{{ activity.status }}</p><p class="text-slate-500">{{ activity.date }}</p></div></div></div></section></div>
</template>