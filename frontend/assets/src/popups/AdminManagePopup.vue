<script setup lang="ts">
import { computed, ref } from 'vue'

type StudentOption = { id: string; name: string; studentId: string; gradeLevel: string; section: string }
const props = defineProps<{ department: { id: string; name: string; adviser: string; gradeLevel?: string; section?: string; requirement?: string; studentIds?: string[] }; advisers: string[]; students: StudentOption[]; saveError?: string }>()
const levelOptions = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const emit = defineEmits<{ (event: 'close'): void; (event: 'delete', id: string): void; (event: 'save', id: string, name: string, adviser: string, gradeLevels: string[], section: string, studentIds: string[]): void }>()
const name = ref(props.department.name)
const adviser = ref(props.department.adviser)
const gradeLevels = ref((props.department.gradeLevel || 'Grade 7').split(',').map((level) => level.trim()).filter(Boolean))
const section = ref(props.department.section || 'N/A')
const selectedStudentIds = ref<string[]>([...(props.department.studentIds || [])])
const studentSearch = ref('')

const filteredStudents = computed(() => props.students.filter((student) => {
	const query = studentSearch.value.trim().toLowerCase()
	return !query || [student.name, student.studentId, student.gradeLevel, student.section].some((value) => value.toLowerCase().includes(query))
}))

function confirmDelete() {
	if (window.confirm(`Delete the ${props.department.name} department?`)) {
		emit('delete', props.department.id)
	}
}

function saveChanges() {
	if (name.value.trim() && gradeLevels.value.length) emit('save', props.department.id, name.value.trim(), adviser.value, gradeLevels.value, section.value, selectedStudentIds.value)
}
</script>
<template>
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')">
		<section class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
			<div class="flex justify-between"><h2 class="text-xl font-bold">Manage Department</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div>
			<label for="manage-department-name" class="mt-5 block text-sm font-medium text-slate-700">Department name</label>
			<input id="manage-department-name" v-model="name" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
			<label for="manage-department-level" class="mt-4 block text-sm font-medium text-slate-700">Grade level</label>
			<select id="manage-department-level" v-model="gradeLevels" multiple class="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option v-for="level in levelOptions" :key="level" :value="level">{{ level }}</option></select>
			<div v-if="gradeLevels.includes('Grade 11') || gradeLevels.includes('Grade 12')"><label for="manage-department-section" class="mt-4 block text-sm font-medium text-slate-700">Section</label><select id="manage-department-section" v-model="section" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option>N/A</option><option>STEM</option><option>GAS</option></select></div>
			<label for="manage-department-adviser" class="mt-4 block text-sm font-medium text-slate-700">Adviser</label>
			<select id="manage-department-adviser" v-model="adviser" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option v-for="adviserOption in props.advisers" :key="adviserOption" :value="adviserOption">{{ adviserOption }}</option></select>
			<div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
				<div class="flex items-center justify-between gap-3"><div><h3 class="text-sm font-bold text-slate-800">Students in this department</h3><p class="text-xs text-slate-500">{{ selectedStudentIds.length }} selected</p></div><input v-model="studentSearch" placeholder="Search students" class="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500" /></div>
				<div class="mt-3 max-h-52 space-y-1 overflow-y-auto pr-1">
					<label v-for="student in filteredStudents" :key="student.id" class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white"><input v-model="selectedStudentIds" type="checkbox" :value="student.id" class="h-4 w-4 accent-purple-600" /><span class="min-w-0"><span class="block truncate text-sm font-medium text-slate-800">{{ student.name }}</span><span class="block text-xs text-slate-500">{{ student.studentId }} · {{ student.gradeLevel }} · {{ student.section }}</span></span></label>
					<p v-if="filteredStudents.length === 0" class="py-4 text-center text-xs text-slate-500">No students found.</p>
				</div>
			</div>
			<p v-if="props.saveError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{{ props.saveError }}</p>
			<div class="mt-6 flex gap-3"><button class="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600" @click="confirmDelete">Delete</button><button class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="saveChanges">Save</button></div>
		</section>
	</div>
</template>