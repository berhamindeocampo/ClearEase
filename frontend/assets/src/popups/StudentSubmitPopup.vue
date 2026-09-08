<script setup lang="ts">
import { ref } from 'vue'

interface Requirement {
  title: string
  department: string
  requiredDocument: string
  instruction: string
  deadline: string
}

const props = defineProps<{ requirement: Requirement; isSubmitting?: boolean }>()
const emit = defineEmits<{ (event: 'close'): void; (event: 'submitted', file: File): void }>()
const selectedFile = ref<File | null>(null)

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

function submit() {
  if (!selectedFile.value) return
  emit('submitted', selectedFile.value)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')">
    <section class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" :aria-label="`Submit ${props.requirement.title}`">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-purple-600">{{ props.requirement.department }}</p>
          <h2 class="mt-1 text-xl font-bold text-slate-900">Submit {{ props.requirement.title }}</h2>
        </div>
        <button type="button" class="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close" @click="emit('close')">&times;</button>
      </div>

      <div class="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p><span class="font-semibold text-slate-800">Required document:</span> {{ props.requirement.requiredDocument }}</p>
        <p class="mt-2"><span class="font-semibold text-slate-800">Instructions:</span> {{ props.requirement.instruction }}</p>
        <p class="mt-2"><span class="font-semibold text-slate-800">Deadline:</span> {{ props.requirement.deadline }}</p>
      </div>

      <label class="mt-5 block text-sm font-semibold text-slate-700" for="submission-file">Upload file</label>
      <input id="submission-file" type="file" class="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" @change="handleFileChange" />
      <p v-if="selectedFile" class="mt-2 text-xs text-slate-500">Selected: {{ selectedFile.name }}</p>

      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" @click="emit('close')">Cancel</button>
        <button type="button" class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" :disabled="!selectedFile || props.isSubmitting" @click="submit">{{ props.isSubmitting ? 'Submitting...' : 'Submit' }}</button>
      </div>
    </section>
  </div>
</template>