<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchRows, relativeDate } from '../lib/database'
import { supabase, useAuth } from '../composables/auth'

interface ClearanceActivity {
	id: string
	requirement: string
	status: string
	remarks: string
	personnel: string
	date: string
}

const { getCurrentUser } = useAuth()
const studentName = ref('Student')
const studentId = ref('N/A')
const email = ref('')
const activities = ref<ClearanceActivity[]>([])
const requirementsTotal = ref(0)
const clearedRequirements = ref(0)
const isLoading = ref(true)
const loadError = ref('')

const completedCount = computed(() => clearedRequirements.value)
const totalCount = computed(() => requirementsTotal.value)
const progress = computed(() => totalCount.value ? Math.round((completedCount.value / totalCount.value) * 100) : 0)
const initials = computed(() => studentName.value.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'ST')

async function loadClearance() {
	const user = await getCurrentUser()
	if (!user) {
		loadError.value = 'Your session has expired. Please log in again.'
		isLoading.value = false
		return
	}

	const profile = 'profile' in user ? user.profile : null
	studentName.value = profile?.full_name || user.email || 'Student'
	studentId.value = profile?.student_id || 'N/A'
	email.value = user.email || ''

	const [submissionsResult, requirementsResult] = await Promise.all([
		supabase ? supabase.rpc('get_my_clearance_submissions') : Promise.resolve({ data: [], error: { message: 'Supabase is not configured.' } }),
		fetchRows('requirements'),
	])
	loadError.value = submissionsResult.error?.message || requirementsResult.error || ''

	const requirements = new Map(requirementsResult.data.map((item) => [String(item.id), item]))
	const submissions = (submissionsResult.data ?? []) as Record<string, any>[]
	requirementsTotal.value = requirementsResult.data.length
	clearedRequirements.value = requirementsResult.data.filter((requirement) => {
		const submission = submissions.find((item) => String(item.requirement_id) === String(requirement.id))
		return ['approved', 'cleared', 'completed'].includes(String(submission?.status || '').toLowerCase())
	}).length
	activities.value = submissions
		.filter((item) => String(item.student_id) === String(user.id))
		.map((item) => {
			const requirement = requirements.get(String(item.requirement_id))
			const rawStatus = String(item.status || 'pending').toLowerCase()
			return {
				id: String(item.id),
				requirement: String(requirement?.title || item.requirement_name || 'Requirement'),
				status: rawStatus === 'approved' || rawStatus === 'cleared' ? 'Cleared' : rawStatus === 'rejected' || rawStatus === 'for action' ? 'For Action' : 'Pending',
				remarks: String(item.remarks || item.remark || 'No remarks yet.'),
				personnel: String(item.personnel_name || item.reviewed_by_name || 'School Personnel'),
				date: relativeDate(item.updated_at || item.created_at),
			}
		})
		.sort((left, right) => right.date.localeCompare(left.date))
	isLoading.value = false
}

onMounted(loadClearance)
</script>

<template>
	<main class="min-h-screen bg-[#f4f5f8] px-4 py-8 text-slate-900 sm:px-8 lg:px-16">
		<div class="mx-auto max-w-[1200px]">
			<div v-if="isLoading" class="py-16 text-center text-slate-500">Loading clearance...</div>
			<div v-else-if="loadError" class="rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">{{ loadError }}</div>
			<template v-else>
				<section class="grid gap-6 lg:grid-cols-2">
					<article class="flex min-h-[220px] items-center justify-between rounded-[22px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.14)] sm:p-8">
						<div>
							<h1 class="text-xl font-black">Student Information</h1>
							<dl class="mt-7 space-y-3 text-base">
								<div class="flex gap-2"><dt class="font-bold">Name:</dt><dd>{{ studentName }}</dd></div>
								<div class="flex gap-2"><dt class="font-bold">School ID:</dt><dd>{{ studentId }}</dd></div>
								<div class="flex gap-2"><dt class="font-bold">Email:</dt><dd class="break-all">{{ email }}</dd></div>
							</dl>
						</div>
						<div class="flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-[#8960ed] text-4xl font-bold text-white sm:h-44 sm:w-44 sm:text-5xl">{{ initials }}</div>
					</article>

					<article class="min-h-[220px] rounded-[22px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.14)] sm:p-8">
						<h2 class="text-xl font-black text-[#5125bd]">Clearance Progress</h2>
						<div class="mt-3 flex items-center justify-center gap-8 sm:mt-0 sm:justify-end">
							<div class="relative flex h-36 w-36 items-center justify-center rounded-full" :style="{ background: `conic-gradient(#4d18b9 ${progress}%, #9c7af4 ${progress}% 100%)` }">
								<div class="flex h-28 w-28 items-center justify-center rounded-full bg-white text-4xl font-black">{{ progress }}%</div>
							</div>
						</div>
						<p class="mt-3 text-center text-lg">{{ completedCount }} out of {{ totalCount }} Requirements have been cleared.</p>
					</article>
				</section>

				<section class="mt-7 rounded-[22px] bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.14)] sm:p-6">
					<h2 class="text-lg font-black">Recent Activity</h2>
					<div class="mt-3 overflow-x-auto">
						<div class="min-w-[760px]">
							<div class="grid grid-cols-[1.2fr_0.8fr_1.5fr_1.3fr_0.8fr] bg-[#f4f4f6] px-3 py-2 text-xs text-slate-600"><div>Requirements</div><div>Status</div><div>Remarks</div><div>School Personnel</div><div>Date</div></div>
							<div v-if="activities.length === 0" class="p-8 text-center text-sm text-slate-500">No activity yet.</div>
							<div v-for="activity in activities" v-else :key="activity.id" class="grid grid-cols-[1.2fr_0.8fr_1.5fr_1.3fr_0.8fr] items-center border-b border-slate-200 px-3 py-3 text-sm last:border-b-0"><strong>{{ activity.requirement }}</strong><span :class="activity.status === 'Cleared' ? 'text-emerald-600' : activity.status === 'For Action' ? 'text-rose-500' : 'text-amber-500'" class="font-semibold">{{ activity.status }}</span><span>{{ activity.remarks }}</span><span>{{ activity.personnel }}</span><span>{{ activity.date }}</span></div>
						</div>
					</div>
				</section>
			</template>
		</div>
	</main>
</template>
