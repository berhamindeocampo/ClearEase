<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../composables/auth'

const props = defineProps<{ document: { student: string; requirement: string; department: string; submitted: string; status: string; remarks: string; fileName?: string; filePath?: string } }>()
const emit = defineEmits<{ (event: 'close'): void; (event: 'reviewed', status: 'Approved' | 'Rejected', remarks: string): void }>()
const remarks = ref(props.document.remarks || '')
const isOpeningDocument = ref(false)
const documentError = ref('')

function review(status: 'Approved' | 'Rejected') {
  if (status === 'Rejected' && !remarks.value.trim()) return
  emit('reviewed', status, remarks.value.trim())
}

async function openDocument() {
  if (!supabase || !props.document.filePath) return

  isOpeningDocument.value = true
  documentError.value = ''
  const { data, error } = await supabase.storage.from('clearance-submissions').createSignedUrl(props.document.filePath, 60 * 10)
  if (error || !data?.signedUrl) {
    documentError.value = error?.message || 'The document could not be opened.'
  } else {
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }
  isOpeningDocument.value = false
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="emit('close')">
    <section class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
      <div class="flex justify-between">
        <h2 class="text-xl font-bold">{{ props.document.status === 'Pending' || props.document.status === 'In Review' ? 'Review Document' : 'Review Details' }}</h2>
        <button class="text-2xl text-slate-400" aria-label="Close" @click="emit('close')">&times;</button>
      </div>
      <dl class="mt-5 space-y-3 text-sm">
        <div><dt class="text-slate-500">Student</dt><dd class="font-semibold">{{ props.document.student }}</dd></div>
        <div><dt class="text-slate-500">Requirement</dt><dd class="font-semibold">{{ props.document.requirement }}</dd></div>
        <div><dt class="text-slate-500">Department</dt><dd class="font-semibold">{{ props.document.department }}</dd></div>
        <div><dt class="text-slate-500">Submitted</dt><dd class="font-semibold">{{ props.document.submitted }}</dd></div>
        <div><dt class="text-slate-500">Status</dt><dd class="font-semibold">{{ props.document.status }}</dd></div>
        <div v-if="props.document.fileName">
          <dt class="text-slate-500">Uploaded file</dt>
          <dd class="flex items-center gap-3 font-semibold">
            <span class="break-all">{{ props.document.fileName }}</span>
            <button v-if="props.document.filePath" class="shrink-0 rounded-lg bg-[#8d63e8] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="isOpeningDocument" @click="openDocument">{{ isOpeningDocument ? 'Opening...' : 'Open' }}</button>
          </dd>
          <p v-if="documentError" class="mt-1 text-xs font-normal text-red-600">{{ documentError }}</p>
        </div>
      </dl>
      <label class="mt-5 block text-sm font-semibold text-slate-700" for="review-remarks">Review comment<span v-if="props.document.status === 'Pending' || props.document.status === 'In Review'" class="text-red-500"> *</span></label>
      <textarea id="review-remarks" v-model="remarks" rows="3" :readonly="props.document.status !== 'Pending' && props.document.status !== 'In Review'" placeholder="Explain the decision, especially if rejecting" class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm read-only:bg-slate-50"></textarea>
      <div v-if="props.document.status === 'Pending' || props.document.status === 'In Review'" class="mt-6 flex justify-end gap-3">
        <button class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50" :disabled="!remarks.trim()" @click="review('Rejected')">Reject</button>
        <button class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" @click="review('Approved')">Approve</button>
      </div>
      <div v-else class="mt-6 flex justify-end">
        <button class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white" @click="emit('close')">Close</button>
      </div>
    </section>
  </div>
</template>
