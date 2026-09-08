<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../composables/auth'

const props = defineProps<{ account: { name: string; role: string; id: string; status: string; profileId: string }; canAssign?: boolean }>()
const emit = defineEmits<{ (event: 'close'): void; (event: 'assigned'): void }>()
const selectedRole = ref<'student' | 'school_personnel'>('student')
const isSaving = ref(false)
const errorMessage = ref('')

async function assignRole() {
	if (!supabase) return
	isSaving.value = true
	errorMessage.value = ''
	const { error } = await supabase.from('profiles').update({ role: selectedRole.value }).eq('id', props.account.profileId)
	if (error) errorMessage.value = error.message
	else emit('assigned')
	isSaving.value = false
}
</script>
<template><div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')"><section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Account details"><div class="flex justify-between"><h2 class="text-xl font-bold text-slate-900">{{ canAssign ? 'Manage Account' : 'Account Details' }}</h2><button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button></div><dl class="mt-5 space-y-3 text-sm"><div><dt class="text-slate-500">Name</dt><dd class="font-semibold">{{ account.name }}</dd></div><div><dt class="text-slate-500">Student ID</dt><dd class="font-semibold">{{ account.id }}</dd></div><div><dt class="text-slate-500">Role</dt><dd class="font-semibold">{{ account.role }}</dd></div><div><dt class="text-slate-500">Status</dt><dd class="font-semibold">{{ account.status }}</dd></div></dl><div v-if="canAssign" class="mt-5"><label for="account-role" class="mb-1 block text-sm font-medium text-slate-700">Assign account to</label><select id="account-role" v-model="selectedRole" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="student">Student</option><option value="school_personnel">School Personnel</option></select><p v-if="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p><button class="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="isSaving" @click="assignRole">{{ isSaving ? 'Saving...' : 'Assign Role' }}</button></div><button class="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" @click="emit('close')">Close</button></section></div></template>