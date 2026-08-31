<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  label: string
  path: string
}

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

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    label: 'Accounts',
    path: '/accounts'
  },
  {
    label: 'Clearances',
    path: '/clearances'
  },
  {
    label: 'Requirements',
    path: '/requirements'
  },
  {
    label: 'Department',
    path: '/department'
  }
]

const statistics: StatCard[] = [
  {
    value: 245,
    label: 'Total Students',
    icon: '▣',
    type: 'purple'
  },
  {
    value: 128,
    label: 'In Progress',
    icon: '⌛',
    type: 'orange'
  },
  {
    value: 87,
    label: 'Completed',
    icon: '✓',
    type: 'green'
  },
  {
    value: 30,
    label: 'For Action',
    icon: '!',
    type: 'red'
  }
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

const setActivePage = (page: string) => {
  activePage.value = page
  mobileMenuOpen.value = false
}

const reviewDocument = (student: string) => {
  alert(`Reviewing clearance document for ${student}`)
}
</script>

<template>
  <div class="admin-page">

    <!-- ============================================
         HEADER
    ============================================= -->

    <header class="admin-header">

      <!-- CLEAREASE BRAND -->
      <div
        class="brand"
        @click="setActivePage('Dashboard')"
      >

        <div class="brand-icon">
          ✓
        </div>

        <div class="brand-text">

          <div class="brand-name">
            Clear<span>Ease</span>
          </div>

          <div class="brand-subtitle">
            STUDENT CLEARANCE SYSTEM
          </div>

        </div>

      </div>


      <!-- DESKTOP NAVIGATION -->
      <nav class="desktop-navigation">

        <a
          v-for="item in navItems"
          :key="item.label"
          href="#"
          class="nav-link"
          :class="{ active: activePage === item.label }"
          @click.prevent="setActivePage(item.label)"
        >
          {{ item.label }}
        </a>

      </nav>


      <!-- UNIVERSITY -->
      <div class="university">

        <div class="university-name">
          St. Paul University
        </div>

        <div class="university-location">
          AT SAN MIGUEL
        </div>

      </div>


      <!-- MOBILE BUTTON -->
      <button
        class="mobile-menu-button"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        {{ mobileMenuOpen ? '×' : '☰' }}
      </button>

    </header>


    <!-- ============================================
         MOBILE NAVIGATION
    ============================================= -->

    <nav
      v-if="mobileMenuOpen"
      class="mobile-navigation"
    >

      <a
        v-for="item in navItems"
        :key="item.label"
        href="#"
        :class="{ active: activePage === item.label }"
        @click.prevent="setActivePage(item.label)"
      >
        {{ item.label }}
      </a>

    </nav>


    <!-- ============================================
         MAIN CONTENT
    ============================================= -->

    <main class="dashboard-content">

      <!-- ==========================================
           STATISTICS
      =========================================== -->

      <section class="statistics-grid">

        <div
          v-for="stat in statistics"
          :key="stat.label"
          class="stat-card"
        >

          <div class="stat-content">

            <!-- ICON -->
            <div
              class="stat-icon"
              :class="`icon-${stat.type}`"
            >
              {{ stat.icon }}
            </div>


            <!-- INFORMATION -->
            <div class="stat-information">

              <div class="stat-number">
                {{ stat.value }}
              </div>

              <div class="stat-label">
                {{ stat.label }}
              </div>

            </div>

          </div>


          <!-- BOTTOM INDICATOR -->
          <div
            class="stat-bottom-line"
            :class="`line-${stat.type}`"
          ></div>

        </div>

      </section>


      <!-- ==========================================
           LOWER SECTION
      =========================================== -->

      <section class="lower-grid">


        <!-- ========================================
             CLEARANCE OVERVIEW
        ========================================= -->

        <section class="overview-card">

          <h2>
            Clearance Overview
          </h2>


          <!-- COMPLETED -->

          <div class="progress-item">

            <div class="progress-label">

              <span>
                Completed
              </span>

              <strong>
                87
              </strong>

            </div>


            <div class="progress-row">

              <div class="progress-background">

                <div
                  class="progress-fill purple-fill"
                  style="width: 35%"
                ></div>

              </div>

              <span class="percentage">
                35%
              </span>

            </div>

          </div>


          <!-- IN PROGRESS -->

          <div class="progress-item">

            <div class="progress-label">

              <span>
                In Progress
              </span>

              <strong>
                128
              </strong>

            </div>


            <div class="progress-row">

              <div class="progress-background">

                <div
                  class="progress-fill purple-fill"
                  style="width: 52%"
                ></div>

              </div>

              <span class="percentage">
                52%
              </span>

            </div>

          </div>


          <!-- NEEDS ACTION -->

          <div class="progress-item">

            <div class="progress-label">

              <span>
                Needs Action
              </span>

              <strong>
                30
              </strong>

            </div>


            <div class="progress-row">

              <div class="progress-background">

                <div
                  class="progress-fill red-fill"
                  style="width: 12%"
                ></div>

              </div>

              <span class="percentage">
                12%
              </span>

            </div>

          </div>

        </section>


        <!-- ========================================
             DOCUMENTS
        ========================================= -->

        <section class="documents-card">

          <!-- TITLE -->
          <div class="documents-header">

            <h2>
              Documents Awaiting Verification
            </h2>

            <a
              href="#"
              @click.prevent="setActivePage('Clearances')"
            >
              View All
            </a>

          </div>


          <!-- TABLE HEADER -->

          <div class="table-header">

            <div>
              Students
            </div>

            <div>
              Requirements
            </div>

            <div>
              Department
            </div>

            <div>
              Submitted
            </div>

            <div></div>

          </div>


          <!-- TABLE ROWS -->

          <div
            v-for="document in documents"
            :key="document.student"
            class="document-row"
          >

            <div>
              {{ document.student }}
            </div>

            <div>
              {{ document.requirement }}
            </div>

            <div>
              {{ document.department }}
            </div>

            <div>
              {{ document.submitted }}
            </div>

            <div class="review-container">

              <button
                class="review-button"
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


<style scoped>

/* =====================================================
   PAGE
===================================================== */

.admin-page {
  min-height: 100vh;
  background: #f0efff;
  color: #111111;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}


/* =====================================================
   HEADER
===================================================== */

.admin-header {
  height: 138px;
  background: #ffffff;
  border-bottom: 1px solid #dddddd;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.08);

  display: flex;
  align-items: center;

  padding: 0 40px;

  gap: 35px;

  position: sticky;
  top: 0;
  z-index: 100;
}


/* =====================================================
   BRAND
===================================================== */

.brand {
  display: flex;
  align-items: center;

  min-width: 280px;

  cursor: pointer;
}

.brand-icon {
  width: 60px;
  height: 60px;

  border-radius: 50%;

  background: #7545e8;

  color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 38px;
  font-weight: bold;
}

.brand-text {
  margin-left: 13px;
}

.brand-name {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: #202b38;
}

.brand-name span {
  color: #079dcc;
}

.brand-subtitle {
  margin-top: 7px;

  font-size: 10px;
  font-weight: 600;

  letter-spacing: 1.7px;

  color: #64748b;
}


/* =====================================================
   NAVIGATION
===================================================== */

.desktop-navigation {
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;
}

.nav-link {
  padding: 13px 19px;

  border-radius: 30px;

  color: #111111;

  text-decoration: none;

  font-size: 20px;

  transition: 0.2s ease;
}

.nav-link:hover {
  background: #f2f2f2;
}

.nav-link.active {
  background: #7545e8;
  color: #ffffff;
}


/* =====================================================
   UNIVERSITY
===================================================== */

.university {
  min-width: 205px;

  text-align: right;
}

.university-name {
  color: #176b35;

  font-size: 21px;

  font-weight: 700;
}

.university-location {
  margin-top: 2px;

  color: #176b35;

  font-size: 14px;

  font-weight: 600;
}


/* =====================================================
   MOBILE MENU
===================================================== */

.mobile-menu-button {
  display: none;

  border: none;
  background: transparent;

  font-size: 30px;

  cursor: pointer;
}


/* =====================================================
   MOBILE NAV
===================================================== */

.mobile-navigation {
  display: none;
}


/* =====================================================
   MAIN CONTENT
===================================================== */

.dashboard-content {
  width: 100%;

  max-width: 1800px;

  margin: 0 auto;

  padding: 45px 40px 60px;
}


/* =====================================================
   STATISTICS GRID
===================================================== */

.statistics-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 28px;
}


/* =====================================================
   STAT CARD
===================================================== */

.stat-card {
  position: relative;

  height: 190px;

  background: #ffffff;

  border-radius: 32px;

  overflow: hidden;

  box-shadow:
    0 9px 13px rgba(0, 0, 0, 0.12);
}

.stat-content {
  height: 100%;

  display: flex;
  align-items: center;

  padding: 0 25px;
}


/* =====================================================
   STAT ICON
===================================================== */

.stat-icon {
  width: 68px;
  height: 68px;

  border-radius: 18px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 42px;
  font-weight: 500;
}

.icon-purple {
  background: #e7e2ff;
  color: #6937d8;
}

.icon-orange {
  background: #fff0dc;
  color: #f7941d;
}

.icon-green {
  background: #dff7eb;
  color: #20a76b;
}

.icon-red {
  background: #ffdfe4;
  color: #f0444f;
}


/* =====================================================
   STAT INFORMATION
===================================================== */

.stat-information {
  margin-left: 19px;
}

.stat-number {
  font-size: 55px;

  font-weight: 700;

  line-height: 1;

  color: #000000;
}

.stat-label {
  margin-top: 6px;

  font-size: 24px;

  line-height: 1;

  color: #000000;
}


/* =====================================================
   STAT BOTTOM LINES
===================================================== */

.stat-bottom-line {
  position: absolute;

  bottom: 0;
  left: 0;

  height: 5px;

  width: 35%;
}

.line-purple {
  background: #6937d8;
}

.line-orange {
  background: #f7941d;
}

.line-green {
  background: #20a76b;
}

.line-red {
  background: #f0444f;
}


/* =====================================================
   LOWER GRID
===================================================== */

.lower-grid {
  display: grid;

  grid-template-columns:
    1fr 1.2fr;

  gap: 24px;

  margin-top: 32px;
}


/* =====================================================
   GENERAL CARD
===================================================== */

.overview-card,
.documents-card {
  background: #ffffff;

  border-radius: 32px;

  box-shadow:
    0 9px 13px rgba(0, 0, 0, 0.12);

  overflow: hidden;
}


/* =====================================================
   CLEARANCE OVERVIEW
===================================================== */

.overview-card {
  padding: 35px;
}

.overview-card h2,
.documents-card h2 {
  margin: 0;

  color: #5225bd;

  font-size: 27px;

  font-weight: 700;
}


/* =====================================================
   PROGRESS
===================================================== */

.progress-item {
  margin-top: 35px;
}

.progress-label {
  display: flex;

  align-items: center;

  font-size: 20px;
}

.progress-label strong {
  margin-left: 8px;

  font-weight: 700;
}

.progress-row {
  display: flex;

  align-items: center;

  gap: 20px;

  margin-top: 9px;
}

.progress-background {
  height: 11px;

  flex: 1;

  overflow: hidden;

  border-radius: 20px;

  background: #bda3ff;
}

.progress-fill {
  height: 100%;

  border-radius: 20px;
}

.purple-fill {
  background: #5520c5;
}

.red-fill {
  background: #ed0000;
}

.percentage {
  width: 40px;

  font-size: 20px;
}


/* =====================================================
   DOCUMENTS HEADER
===================================================== */

.documents-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 35px 24px 28px;
}

.documents-header a {
  color: #5225bd;

  font-size: 19px;

  text-decoration: none;
}

.documents-header a:hover {
  text-decoration: underline;
}


/* =====================================================
   TABLE HEADER
===================================================== */

.table-header {
  display: grid;

  grid-template-columns:
    1.1fr
    1.25fr
    0.85fr
    0.7fr
    100px;

  background: #f2f1f4;

  padding: 17px 18px;

  font-size: 18px;
}


/* =====================================================
   DOCUMENT ROW
===================================================== */

.document-row {
  display: grid;

  grid-template-columns:
    1.1fr
    1.25fr
    0.85fr
    0.7fr
    100px;

  align-items: center;

  min-height: 72px;

  padding: 0 18px;

  border-bottom: 1px solid #cccccc;

  font-size: 17px;

  color: #444444;
}

.document-row:last-child {
  border-bottom: none;
}


/* =====================================================
   REVIEW BUTTON
===================================================== */

.review-container {
  text-align: right;
}

.review-button {
  border: none;

  background: #7545e8;

  color: #ffffff;

  padding: 10px 21px;

  border-radius: 25px;

  font-size: 16px;

  cursor: pointer;

  transition: 0.2s ease;
}

.review-button:hover {
  background: #6334d6;

  transform: translateY(-1px);
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1200px) {

  .admin-header {
    padding: 0 25px;
  }

  .brand {
    min-width: 240px;
  }

  .brand-name {
    font-size: 27px;
  }

  .nav-link {
    padding: 11px 12px;

    font-size: 17px;
  }

  .university {
    min-width: 160px;
  }

  .university-name {
    font-size: 18px;
  }

  .statistics-grid {
    gap: 18px;
  }

  .stat-number {
    font-size: 45px;
  }

  .stat-label {
    font-size: 20px;
  }

}


@media (max-width: 1000px) {

  .desktop-navigation {
    display: none;
  }

  .mobile-menu-button {
    display: block;
  }

  .mobile-navigation {
    display: flex;

    flex-direction: column;

    background: #ffffff;

    padding: 10px 25px 20px;

    border-bottom: 1px solid #dddddd;
  }

  .mobile-navigation a {
    padding: 13px;

    border-radius: 10px;

    color: #222222;

    text-decoration: none;

    font-size: 17px;
  }

  .mobile-navigation a.active {
    background: #7545e8;

    color: #ffffff;
  }

  .university {
    margin-left: auto;
  }

  .statistics-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .lower-grid {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 650px) {

  .admin-header {
    height: 90px;

    padding: 0 18px;
  }

  .brand-icon {
    width: 45px;
    height: 45px;

    font-size: 27px;
  }

  .brand-name {
    font-size: 23px;
  }

  .brand-subtitle {
    font-size: 7px;

    letter-spacing: 1px;
  }

  .university {
    display: none;
  }

  .dashboard-content {
    padding: 25px 18px 40px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    height: 160px;
  }

  .stat-number {
    font-size: 44px;
  }

  .lower-grid {
    margin-top: 22px;
  }

  .overview-card {
    padding: 25px 20px;
  }

  .overview-card h2,
  .documents-card h2 {
    font-size: 23px;
  }

  .documents-card {
    overflow-x: auto;
  }

  .documents-header {
    min-width: 750px;
  }

  .table-header,
  .document-row {
    min-width: 750px;
  }

}

</style>