<script setup lang="ts">
defineProps<{ activities: Array<{ title: string; department: string; status: string; date: string }> }>()
const emit = defineEmits<{ (event: 'close'): void }>()
</script>
<template>
  <div class="fixed inset-0 z-50 flex items-start justify-end bg-slate-950/30 p-4 pt-20" @click.self="emit('close')">
    <section class="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="Notifications">
      <div class="flex items-center justify-between"><h2 class="text-lg font-bold text-slate-900">Notifications</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div>
      <div class="mt-4 divide-y divide-slate-100"><div v-for="activity in activities" :key="`${activity.title}-${activity.date}`" class="py-3"><p class="font-semibold text-slate-800">{{ activity.title }}</p><p class="text-sm text-slate-500">{{ activity.department }} · {{ activity.status }} · {{ activity.date }}</p></div></div>
    </section>
  </div>
</template>