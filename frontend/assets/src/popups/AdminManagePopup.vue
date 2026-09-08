<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ department: { id: string; name: string; adviser: string; requirement?: string }; advisers: string[] }>()
const emit = defineEmits<{ (event: 'close'): void; (event: 'delete', id: string): void; (event: 'save', id: string, name: string, adviser: string): void }>()
const name = ref(props.department.name)
const adviser = ref(props.department.adviser)

function confirmDelete() {
	if (window.confirm(`Delete the ${props.department.name} department?`)) {
		emit('delete', props.department.id)
	}
}

function saveChanges() {
	if (name.value.trim()) emit('save', props.department.id, name.value.trim(), adviser.value)
}
</script>
<template><div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')"><section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true"><div class="flex justify-between"><h2 class="text-xl font-bold">Manage Department</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div><label for="manage-department-name" class="mt-5 block text-sm font-medium text-slate-700">Department name</label><input id="manage-department-name" v-model="name" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><label for="manage-department-adviser" class="mt-4 block text-sm font-medium text-slate-700">Adviser</label><select id="manage-department-adviser" v-model="adviser" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option v-for="adviserOption in props.advisers" :key="adviserOption" :value="adviserOption">{{ adviserOption }}</option></select><div class="mt-6 flex gap-3"><button class="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600" @click="confirmDelete">Delete</button><button class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="saveChanges">Save</button></div></section></div></template>