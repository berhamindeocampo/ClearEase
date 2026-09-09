<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../composables/auth'

interface Requirement {
  title: string
  department: string
  requiredDocument: string
  instruction: string
  deadline: string
  status: string
  fileName: string
  filePath: string
}

const props = defineProps<{ requirement: Requirement }>()
const emit = defineEmits<{ (event: 'close'): void }>()
const previewUrl = ref('')
const previewError = ref('')
const isLoadingPreview = ref(false)

const isPdf = () => props.requirement.fileName.toLowerCase().endsWith('.pdf')
const isImage = () => /\.(png|jpe?g|gif|webp)$/i.test(props.requirement.fileName)
const isOfficeDocument = () => /\.(docx?|pptx?|xlsx?)$/i.test(props.requirement.fileName)
const officePreviewUrl = computed(() => previewUrl.value ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl.value)}` : '')

async function loadPreview() {
  if (!supabase || !props.requirement.filePath) return
  isLoadingPreview.value = true
  const { data, error } = await supabase.storage.from('clearance-submissions').createSignedUrl(props.requirement.filePath, 60 * 10)
  if (error || !data?.signedUrl) previewError.value = error?.message || 'The file preview could not be loaded.'
  else previewUrl.value = data.signedUrl
  isLoadingPreview.value = false
}

onMounted(loadPreview)
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
        <div v-if="props.requirement.fileName"><dt class="font-semibold text-slate-500">Uploaded file</dt><dd class="mt-1 break-all text-slate-900">{{ props.requirement.fileName }}</dd></div>
      </dl>
        <div v-if="props.requirement.filePath" class="mt-5">
          <p class="font-semibold text-slate-500">Preview</p>
          <div v-if="isLoadingPreview" class="mt-2 flex h-40 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">Loading preview...</div>
          <div v-else-if="previewError" class="mt-2 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-600">{{ previewError }}</div>
          <iframe v-else-if="previewUrl && (isPdf() || isOfficeDocument())" :src="isOfficeDocument() ? officePreviewUrl : previewUrl" title="Uploaded document preview" class="mt-2 h-40 w-full rounded-lg border border-slate-200"></iframe>
          <img v-else-if="previewUrl && isImage()" :src="previewUrl" alt="Uploaded document preview" class="mt-2 h-40 w-full rounded-lg border border-slate-200 object-contain" />
          <div v-else-if="previewUrl" class="mt-2 flex h-40 items-center justify-center rounded-lg bg-slate-50 px-3 text-center text-sm text-slate-500">Preview unavailable for this file type.</div>
        </div>
      <div class="mt-6 flex justify-end"><button type="button" class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white" @click="emit('close')">Close</button></div>
    </section>
  </div>
</template>