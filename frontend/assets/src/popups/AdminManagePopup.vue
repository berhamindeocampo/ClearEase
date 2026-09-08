<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ department: { id: string; name: string; adviser: string; gradeLevel?: string; section?: string; requirement?: string }; advisers: string[]; saveError?: string }>()
const levelOptions = ['Grade 11', 'Grade 12']
const emit = defineEmits<{ (event: 'close'): void; (event: 'delete', id: string): void; (event: 'save', id: string, name: string, adviser: string, gradeLevels: string[], sections: string[]): void }>()
const name = ref(props.department.name)
const adviser = ref(props.department.adviser)
const gradeLevel = ref((props.department.gradeLevel || 'Grade 11').split(',')[0].trim() || 'Grade 11')
const section = ref((props.department.section || 'N/A').split(',')[0].trim() || 'N/A')

function confirmDelete() {
	if (window.confirm(`Delete the ${props.department.name} department?`)) {
		emit('delete', props.department.id)
	}
}

function saveChanges() {
	if (name.value.trim() && gradeLevel.value && section.value) emit('save', props.department.id, name.value.trim(), adviser.value, [gradeLevel.value], [section.value])
}
</script>
<template>
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')">
		<section class="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true">
			<div class="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4"><h2 class="text-xl font-bold">Manage Department</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div>
			<div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
				<label for="manage-department-name" class="block text-sm font-medium text-slate-700">Department name</label>
				<input id="manage-department-name" v-model="name" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
				<label for="manage-department-level" class="mt-4 block text-sm font-medium text-slate-700">Grade level</label>
				<select id="manage-department-level" v-model="gradeLevel" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option v-for="level in levelOptions" :key="level" :value="level">{{ level }}</option></select>
				<div><label for="manage-department-section" class="mt-4 block text-sm font-medium text-slate-700">Section</label><select id="manage-department-section" v-model="section" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option>N/A</option><option>STEM</option><option>GAS</option></select></div>
				<label for="manage-department-adviser" class="mt-4 block text-sm font-medium text-slate-700">Adviser</label>
				<select id="manage-department-adviser" v-model="adviser" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option v-for="adviserOption in props.advisers" :key="adviserOption" :value="adviserOption">{{ adviserOption }}</option></select>
				<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">All students whose profile matches this department's grade level and section will automatically receive its class requirements.</div>
				<p v-if="props.saveError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{{ props.saveError }}</p>
			</div>
			<div class="flex shrink-0 gap-3 border-t border-slate-200 bg-white px-6 py-4"><button class="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600" @click="confirmDelete">Delete</button><button class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="saveChanges">Save</button></div>
		</section>
	</div>
</template>