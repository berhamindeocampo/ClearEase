<template>
  <div id="app" class="flex min-h-screen flex-col bg-slate-50">
    <component :is="currentHeader" v-if="showHeader" />
    <main class="min-w-0 flex-1 overflow-hidden">
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" :key="currentRoute.fullPath" />
        </transition>
      </router-view>
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './headers/Header.vue'
import SPHeader from './headers/SPHeader.vue'
import AdminHeader from './headers/AdminHeader.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const THEME_MODE_KEY = 'clearease-theme-mode'

function applyRouteTheme() {
  const isPublicRoute = ['landing', 'login', 'signin'].includes(String(route.name))
  if (isPublicRoute) {
    document.documentElement.dataset.theme = 'light'
    return
  }

  document.documentElement.dataset.theme = localStorage.getItem(THEME_MODE_KEY) === 'dark' ? 'dark' : 'light'
}

watch(() => route.name, applyRouteTheme, { immediate: true })

const isLandingPage = computed(() => route.name === 'landing')
const isAdminRoute = computed(() => route.path === '/admindashboard' || route.path.startsWith('/admin/'))
const isSchoolPersonnelRoute = computed(() => route.path.startsWith('/sp/'))
const isSettingsRoute = computed(() => ['settings', 'sp-settings', 'admin-settings'].includes(String(route.name)))
const hideHeaderRoutes = ['login', 'signin', 'admin', 'admin-accounts', 'admin-clearances', 'admin-requirements', 'admin-department']
const showHeader = computed(() =>
  !isLandingPage.value &&
  !hideHeaderRoutes.includes(String(route.name)) &&
  (isSettingsRoute.value || !isAdminRoute.value)
)
const showFooter = computed(() => !['login', 'signin'].includes(String(route.name)))
const currentHeader = computed(() => {
  if (isAdminRoute.value) return AdminHeader
  if (isSchoolPersonnelRoute.value) return SPHeader
  return Header
})
</script>

<style>
</style>
