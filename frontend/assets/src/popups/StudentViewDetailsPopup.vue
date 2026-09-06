<script setup lang="ts">
interface Requirement {
  title: string
  department: string
  requiredDocument: string
  instruction: string
  deadline: string
  status: string
}

const props = defineProps<{ requirement: Requirement }>()
const emit = defineEmits<{ (event: 'close'): void }>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')">
    <section class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" :aria-label="`${props.requirement.title} details`">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-purple-600">{{ props.requirement.department }}</p>
          <h2 class="mt-1 text-xl font-bold text-slate-900">{{ props.requirement.title }}</h2>
        </div>
        <button type="button" class="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close" @click="emit('close')">&times;</button>
      </div>
      <dl class="mt-6 space-y-4 text-sm">
        <div><dt class="font-semibold text-slate-500">Status</dt><dd class="mt-1 text-slate-900">{{ props.requirement.status }}</dd></div>
        <div><dt class="font-semibold text-slate-500">Required document</dt><dd class="mt-1 text-slate-900">{{ props.requirement.requiredDocument }}</dd></div>
        <div><dt class="font-semibold text-slate-500">Instructions</dt><dd class="mt-1 text-slate-900">{{ props.requirement.instruction }}</dd></div>
        <div><dt class="font-semibold text-slate-500">Deadline</dt><dd class="mt-1 text-slate-900">{{ props.requirement.deadline }}</dd></div>
      </dl>
      <div class="mt-6 flex justify-end"><button type="button" class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="emit('close')">Close</button></div>
    </section>
  </div>
</template>