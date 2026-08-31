<template>
  <div id="app" class="min-h-screen bg-slate-50">
    <Header v-if="showHeader" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const isLandingPage = computed(() => route.name === 'landing')
const isAdminRoute = computed(() => route.path === '/admindashboard' || route.path.startsWith('/admin/'))
const hideHeaderRoutes = ['login', 'signin', 'admin', 'admin-accounts', 'admin-clearances', 'admin-requirements', 'admin-department']
const showHeader = computed(() =>
  !isLandingPage.value &&
  !isAdminRoute.value &&
  !hideHeaderRoutes.includes(String(route.name))
)
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
