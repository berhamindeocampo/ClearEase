<template>
  <div id="app" class="min-h-screen bg-slate-50">
    <Header v-if="showHeader" />
    <main class="overflow-hidden">
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" :key="currentRoute.fullPath" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const isLandingPage = computed(() => route.name === 'landing')
const hideHeaderRoutes = ['login', 'signin']
const showHeader = computed(() => !isLandingPage.value && !hideHeaderRoutes.includes(String(route.name)))
</script>

