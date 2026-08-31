<script setup lang="ts">
import { ref } from 'vue'
import AdminHeader from './AdminHeader.vue'

interface StatCard {
  value: number
  label: string
  icon: string
  type: 'purple' | 'orange' | 'green' | 'red'
}

interface VerificationDocument {
  student: string
  requirement: string
  department: string
  submitted: string
}

const activePage = ref('Dashboard')
const mobileMenuOpen = ref(false)

const statistics: StatCard[] = [
  { value: 245, label: 'Total Students', icon: '▣', type: 'purple' },
  { value: 128, label: 'In Progress', icon: '⌛', type: 'orange' },
  { value: 87, label: 'Completed', icon: '✓', type: 'green' },
  { value: 30, label: 'For Action', icon: '!', type: 'red' }
]

const documents: VerificationDocument[] = [
  {
    student: 'Mary Grace Piattos',
    requirement: 'Registrar Requirements',
    department: 'Registrar',
    submitted: 'Today'
  },
  {
    student: 'Timon Andrew Pusa',
    requirement: 'Library Requirements',
    department: 'Library',
    submitted: 'Yesterday'
  },
  {
    student: 'Jay Kamote',
    requirement: 'Finance Requirements',
    department: 'Finance',
    submitted: '4 days ago'
  }
]

// Tailwind's default palette doesn't cover these exact brand colors,
// so we map each stat "type" to arbitrary-value utility classes.
const iconClasses: Record<StatCard['type'], string> = {
  purple: 'bg-[#e7e2ff] text-[#6937d8]',
  orange: 'bg-[#fff0dc] text-[#f7941d]',
  green: 'bg-[#dff7eb] text-[#20a76b]',
  red: 'bg-[#ffdfe4] text-[#f0444f]'
}

const lineClasses: Record<StatCard['type'], string> = {
  purple: 'bg-[#6937d8]',
  orange: 'bg-[#f7941d]',
  green: 'bg-[#20a76b]',
  red: 'bg-[#f0444f]'
}

const setActivePage = (page: string) => {
  activePage.value = page
  mobileMenuOpen.value = false
}

const reviewDocument = (student: string) => {
  alert(`Reviewing clearance document for ${student}`)
}
</script>

<template>
  <div class="min-h-screen bg-[#f0efff] text-[#111111] font-sans">
    <AdminHeader />

    <!-- ============================================
         MAIN CONTENT
    ============================================= -->

    <main class="w-full max-w-[1800px] mx-auto px-10 pt-[45px] pb-[60px] max-[650px]:px-[18px] max-[650px]:pt-[25px] max-[650px]:pb-10">

      <!-- ==========================================
           STATISTICS
      =========================================== -->

      <section class="grid grid-cols-4 gap-7 max-[1200px]:gap-[18px] max-[1000px]:grid-cols-2 max-[650px]:grid-cols-1">
        <div
          v-for="stat in statistics"
          :key="stat.label"
          class="relative h-[190px] max-[650px]:h-40 bg-white rounded-[32px] overflow-hidden shadow-[0_9px_13px_rgba(0,0,0,0.12)]"
        >
          <div class="h-full flex items-center px-[25px]">
            <!-- ICON -->
            <div
              class="flex items-center justify-center flex-shrink-0 w-[68px] h-[68px] rounded-[18px] text-[42px] font-medium"
              :class="iconClasses[stat.type]"
            >
              {{ stat.icon }}
            </div>

            <!-- INFORMATION -->
            <div class="ml-[19px]">
              <div class="text-[55px] max-[1200px]:text-[45px] max-[650px]:text-[44px] font-bold leading-none text-black">
                {{ stat.value }}
              </div>

              <div class="mt-[6px] text-2xl max-[1200px]:text-xl leading-none text-black">
                {{ stat.label }}
              </div>
            </div>
          </div>

          <!-- BOTTOM INDICATOR -->
          <div
            class="absolute bottom-0 left-0 h-[5px] w-[35%]"
            :class="lineClasses[stat.type]"
          ></div>
        </div>
      </section>

      <!-- ==========================================
           LOWER SECTION
      =========================================== -->

      <section class="grid grid-cols-[1fr_1.2fr] max-[1000px]:grid-cols-1 gap-6 mt-8 max-[650px]:mt-[22px]">

        <!-- ========================================
             CLEARANCE OVERVIEW
        ========================================= -->

        <section class="bg-white rounded-[32px] shadow-[0_9px_13px_rgba(0,0,0,0.12)] overflow-hidden p-[35px] max-[650px]:p-[25px_20px]">
          <h2 class="m-0 text-[27px] max-[650px]:text-[23px] font-bold text-[#5225bd]">
            Clearance Overview
          </h2>

          <!-- COMPLETED -->
          <div class="mt-[35px]">
            <div class="flex items-center text-xl">
              <span>Completed</span>
              <strong class="ml-2 font-bold">87</strong>
            </div>

            <div class="flex items-center gap-5 mt-[9px]">
              <div class="flex-1 h-[11px] overflow-hidden rounded-[20px] bg-[#bda3ff]">
                <div class="h-full rounded-[20px] bg-[#5520c5]" style="width: 35%"></div>
              </div>
              <span class="w-10 text-xl">35%</span>
            </div>
          </div>

          <!-- IN PROGRESS -->
          <div class="mt-[35px]">
            <div class="flex items-center text-xl">
              <span>In Progress</span>
              <strong class="ml-2 font-bold">128</strong>
            </div>

            <div class="flex items-center gap-5 mt-[9px]">
              <div class="flex-1 h-[11px] overflow-hidden rounded-[20px] bg-[#bda3ff]">
                <div class="h-full rounded-[20px] bg-[#5520c5]" style="width: 52%"></div>
              </div>
              <span class="w-10 text-xl">52%</span>
            </div>
          </div>

          <!-- NEEDS ACTION -->
          <div class="mt-[35px]">
            <div class="flex items-center text-xl">
              <span>Needs Action</span>
              <strong class="ml-2 font-bold">30</strong>
            </div>

            <div class="flex items-center gap-5 mt-[9px]">
              <div class="flex-1 h-[11px] overflow-hidden rounded-[20px] bg-[#bda3ff]">
                <div class="h-full rounded-[20px] bg-[#ed0000]" style="width: 12%"></div>
              </div>
              <span class="w-10 text-xl">12%</span>
            </div>
          </div>
        </section>

        <!-- ========================================
             DOCUMENTS
        ========================================= -->

        <section class="bg-white rounded-[32px] shadow-[0_9px_13px_rgba(0,0,0,0.12)] overflow-hidden max-[650px]:overflow-x-auto">

          <!-- TITLE -->
          <div class="flex items-center justify-between px-6 pt-[35px] pb-7 max-[650px]:min-w-[750px]">
            <h2 class="m-0 text-[27px] max-[650px]:text-[23px] font-bold text-[#5225bd]">
              Documents Awaiting Verification
            </h2>

            <a
              href="#"
              class="text-[#5225bd] text-[19px] no-underline hover:underline"
              @click.prevent="setActivePage('Clearances')"
            >
              View All
            </a>
          </div>

          <!-- TABLE HEADER -->
          <div class="grid grid-cols-[1.1fr_1.25fr_0.85fr_0.7fr_100px] bg-[#f2f1f4] px-[18px] py-[17px] text-lg max-[650px]:min-w-[750px]">
            <div>Students</div>
            <div>Requirements</div>
            <div>Department</div>
            <div>Submitted</div>
            <div></div>
          </div>

          <!-- TABLE ROWS -->
          <div
            v-for="document in documents"
            :key="document.student"
            class="grid grid-cols-[1.1fr_1.25fr_0.85fr_0.7fr_100px] items-center min-h-[72px] px-[18px]
                   border-b border-[#cccccc] last:border-b-0 text-[17px] text-[#444444] max-[650px]:min-w-[750px]"
          >
            <div>{{ document.student }}</div>
            <div>{{ document.requirement }}</div>
            <div>{{ document.department }}</div>
            <div>{{ document.submitted }}</div>

            <div class="text-right">
              <button
                class="border-none bg-[#7545e8] text-white px-[21px] py-[10px] rounded-[25px] text-base
                       cursor-pointer transition-all duration-200 hover:bg-[#6334d6] hover:-translate-y-px"
                @click="reviewDocument(document.student)"
              >
                Review
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>