<script setup lang="ts">
import { ref } from "vue";

interface RequirementCard {
  id: string;
  title: string;
  deadline: string;
}

const requirements = ref<RequirementCard[]>([
  { id: "library", title: "Library Clearance", deadline: "SEP 2, 2026" },
  { id: "finance", title: "Finance Clearance", deadline: "SEP 2, 2026" },
  { id: "registrar", title: "Registrar Clearance", deadline: "SEP 2, 2026" },
  { id: "emptech", title: "EmpTech", deadline: "SEP 10, 2026" },
  { id: "pr1", title: "PR-1", deadline: "SEP 10, 2026" },
  { id: "perdev", title: "PerDev", deadline: "SEP 10, 2026" },
  { id: "philpolgov", title: "PhilPolGov", deadline: "SEP 15, 2026" },
  { id: "philosophy", title: "Philosophy", deadline: "SEP 15, 2026" },
  { id: "oralcom", title: "OralCom", deadline: "SEP 15, 2026" },
]);

const emit = defineEmits<{
  (e: "view-requirements", id: string): void;
  (e: "submit-requirements", id: string): void;
}>();

function handleView(id: string) {
  emit("view-requirements", id);
}

function handleSubmit(id: string) {
  emit("submit-requirements", id);
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <main class="mx-auto max-w-7xl px-6 py-10">
      <h1 class="text-4xl font-extrabold text-purple-600">Requirements</h1>
      <p class="mt-2 text-slate-600">View all the requirements needed.</p>

      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in requirements"
          :key="item.id"
          class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">{{ item.title }}</h2>
              <p class="text-sm text-slate-500">DEADLINE: {{ item.deadline }}</p>
            </div>
            <button
              type="button"
              class="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              @click="handleSubmit(item.id)"
            >
              Submit Requirements
              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor">
                <path
                  d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1z"
                />
                <path d="M4 16a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8D63E8] py-3 text-base font-medium text-white transition-colors hover:bg-purple-800"
            @click="handleView(item.id)"
          >
            View Requirements
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="10" cy="10" r="8.2" />
              <path d="M8.3 6.8l3.2 3.2-3.2 3.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </article>
      </div>
    </main>
  </div>
</template>