<script setup lang="ts">
const props = defineProps<{ department: { id: string; name: string; adviser: string; requirement: string } }>()
const emit = defineEmits<{ (event: 'close'): void; (event: 'delete', id: string): void }>()

function confirmDelete() {
	if (window.confirm(`Delete the ${props.department.name} department?`)) {
		emit('delete', props.department.id)
	}
}
</script>
<template><div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')"><section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true"><div class="flex justify-between"><h2 class="text-xl font-bold">Manage {{ department.name }}</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div><p class="mt-5 text-sm text-slate-600">Adviser: {{ department.adviser }}</p><p class="mt-2 text-sm text-slate-600">Requirement: {{ department.requirement }}</p><div class="mt-6 flex gap-3"><button class="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600" @click="confirmDelete">Delete</button><button class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="emit('close')">Done</button></div></section></div></template>