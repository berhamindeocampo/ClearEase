<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const login = async () => {
	loading.value = true
	error.value = ''

	try {
		const { error: loginError } = await supabase.auth.signInWithPassword({
			email: email.value,
			password: password.value,
		})

		if (loginError) {
			throw loginError
		}

		const { data: loginRecord, error: tableError } = await supabase
			.from('login')
			.select('email')
			.eq('email', email.value)
			.maybeSingle()

		if (tableError) {
			throw tableError
		}

		if (!loginRecord) {
			await supabase.auth.signOut()
			throw new Error('No matching account was found in the logins table.')
		}
	} catch (loginError) {
		error.value = loginError instanceof Error ? loginError.message : 'Login failed'
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<form @submit.prevent="login">
		<label>
			Email
			<input v-model="email" type="email" required />
		</label>

		<label>
			Password
			<input v-model="password" type="password" required />
		</label>

		<button type="submit" :disabled="loading">
			{{ loading ? 'Logging in...' : 'Log in' }}
		</button>

		<p v-if="error">{{ error }}</p>
	</form>
</template>
