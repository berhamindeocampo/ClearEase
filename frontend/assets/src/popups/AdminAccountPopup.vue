<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../composables/auth'

const props = defineProps<{ account: { name: string; role: string; id: string; status: string; profileId: string }; canAssign?: boolean }>()
const emit = defineEmits<{ (event: 'close'): void; (event: 'assigned', role: 'student' | 'school_personnel' | 'unlisted'): void }>()
const selectedRole = ref<'student' | 'school_personnel' | 'unlisted'>(
	props.account.role === 'Student' ? 'student' : props.account.role === 'School Personnel' ? 'school_personnel' : 'unlisted'
)
const isSaving = ref(false)
const errorMessage = ref('')

async function assignRole() {
	if (!supabase) {
		errorMessage.value = 'Supabase is not configured.'
		return
	}
	isSaving.value = true
	errorMessage.value = ''
	const { error } = await supabase.rpc('admin_update_profile_role', {
		p_profile_id: props.account.profileId,
		p_role: selectedRole.value,
	})
	if (error) errorMessage.value = error.message
	else emit('assigned', selectedRole.value)
	isSaving.value = false
}
</script>
<template><div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')"><section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Account details"><div class="flex justify-between"><h2 class="text-xl font-bold text-slate-900">Manage Account</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div><dl class="mt-5 space-y-3 text-sm"><div><dt class="text-slate-500">Name</dt><dd class="font-semibold">{{ account.name }}</dd></div><div><dt class="text-slate-500">School ID</dt><dd class="font-semibold">{{ account.id }}</dd></div><div><dt class="text-slate-500">Current Role</dt><dd class="font-semibold">{{ account.role }}</dd></div><div><dt class="text-slate-500">Status</dt><dd class="font-semibold">{{ account.status }}</dd></div></dl><div class="mt-5"><label for="account-role" class="mb-1 block text-sm font-medium text-slate-700">Change role</label><select id="account-role" v-model="selectedRole" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="student">Student</option><option value="school_personnel">School Personnel</option><option value="unlisted">Unlisted</option></select><p v-if="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p><button class="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="isSaving" @click="assignRole">{{ isSaving ? 'Saving...' : 'Save Role' }}</button></div><button class="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" @click="emit('close')">Close</button></section></div></template>