<template>
  <div id="app" class="min-h-screen bg-slate-50">
    <component :is="currentHeader" v-if="showHeader" />
    <main>
      <router-view />
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './headers/Header.vue'
import SPHeader from './headers/SPHeader.vue'
import AdminHeader from './headers/AdminHeader.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
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
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
