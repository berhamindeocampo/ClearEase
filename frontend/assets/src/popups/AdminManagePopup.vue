<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ department: { id: string; name: string; adviser: string; gradeLevel?: string; section?: string; requirement?: string }; advisers: string[]; saveError?: string }>()
const levelOptions = ['Grade 11', 'Grade 12']
const emit = defineEmits<{ (event: 'close'): void; (event: 'delete', id: string): void; (event: 'save', id: string, name: string, adviser: string, gradeLevels: string[], sections: string[]): void }>()
const name = ref(props.department.name)
const adviser = ref(props.department.adviser)
const gradeLevels = ref((props.department.gradeLevel || 'Grade 11').split(',').map((level) => level.trim()).filter((level) => levelOptions.includes(level)))
const sectionOptions = ['N/A', 'STEM', 'GAS']
const sections = ref((props.department.section || 'N/A').split(',').map((section) => section.trim()).filter((section) => sectionOptions.includes(section)))
const showGradeMenu = ref(false)
const showSectionMenu = ref(false)

function toggleSelection(values: string[], value: string) {
	const index = values.indexOf(value)
	if (index >= 0) {
		if (values.length > 1) values.splice(index, 1)
		return
	}
	values.push(value)
}

function confirmDelete() {
	if (window.confirm(`Delete the ${props.department.name} department?`)) {
		emit('delete', props.department.id)
	}
}

function saveChanges() {
	if (name.value.trim() && gradeLevels.value.length && sections.value.length) emit('save', props.department.id, name.value.trim(), adviser.value, gradeLevels.value, sections.value)
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
				<div class="relative mt-1">
					<button id="manage-department-level" type="button" class="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm" @click="showGradeMenu = !showGradeMenu"><span>{{ gradeLevels.join(', ') }}</span><span class="text-slate-400">&#9662;</span></button>
					<div v-if="showGradeMenu" class="absolute left-0 right-0 z-10 mt-1 rounded-lg border border-slate-300 bg-white p-1 shadow-lg"><label v-for="level in levelOptions" :key="level" class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-50"><input type="checkbox" :checked="gradeLevels.includes(level)" class="h-4 w-4 accent-purple-600" @change="toggleSelection(gradeLevels, level)" /><span>{{ level }}</span></label></div>
				</div>
				<label for="manage-department-section" class="mt-4 block text-sm font-medium text-slate-700">Sections</label>
				<div class="relative mt-1">
					<button id="manage-department-section" type="button" class="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm" @click="showSectionMenu = !showSectionMenu"><span>{{ sections.join(', ') }}</span><span class="text-slate-400">&#9662;</span></button>
					<div v-if="showSectionMenu" class="absolute left-0 right-0 z-10 mt-1 rounded-lg border border-slate-300 bg-white p-1 shadow-lg"><label v-for="sectionOption in sectionOptions" :key="sectionOption" class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-50"><input type="checkbox" :checked="sections.includes(sectionOption)" class="h-4 w-4 accent-purple-600" @change="toggleSelection(sections, sectionOption)" /><span>{{ sectionOption }}</span></label></div>
				</div>
				<label for="manage-department-adviser" class="mt-4 block text-sm font-medium text-slate-700">Adviser</label>
				<select id="manage-department-adviser" v-model="adviser" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option v-for="adviserOption in props.advisers" :key="adviserOption" :value="adviserOption">{{ adviserOption }}</option></select>
				<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">All students whose profile matches this department's grade level and section will automatically receive its class requirements.</div>
				<p v-if="props.saveError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{{ props.saveError }}</p>
			</div>
			<div class="flex shrink-0 gap-3 border-t border-slate-200 bg-white px-6 py-4"><button class="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600" @click="confirmDelete">Delete</button><button class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="saveChanges">Save</button></div>
		</section>
	</div>
</template>