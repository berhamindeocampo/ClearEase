<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import cleareaseLogo from '../assets/clearease.png'
import universityLogo from '../assets/stpaul.png'

interface NavItem {
  id: number
  label: string
  path: string
}

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navItems: NavItem[] = [
  { id: 1, label: 'Dashboard', path: '/dashboard' },
  { id: 2, label: 'Clearance', path: '/clearance' },
  { id: 3, label: 'Notifications', path: '/notifications' },
  { id: 4, label: 'Profile', path: '/profile' }
]

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style scoped>
a {
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 md:gap-5 min-w-0 flex-1">
          <router-link to="/" class="flex items-center shrink-0 group">
            <img
              :src="cleareaseLogo"
              alt="ClearEase Logo"
              class="h-16 w-auto sm:h-20 md:h-24 object-contain drop-shadow-sm"
            />
          </router-link>

          <nav class="hidden md:flex items-center gap-3 flex-1">
            <router-link
              v-for="item in navItems"
              :key="item.id"
              :to="item.path"
              :class="[
                'px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-200',
                isActive(item.path)
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              ]"
            >
              {{ item.label }}
            </router-link>
          </nav>
        </div>

        <div class="flex items-center gap-3 shrink-0 ml-auto">
          <div class="hidden sm:flex items-center justify-center bg-transparent p-0">
            <img :src="universityLogo" alt="University Logo" class="h-12 w-auto sm:h-14 md:h-16 object-contain" />
          </div>

          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <nav v-if="isMobileMenuOpen" class="md:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
          <router-link
            v-for="item in navItems"
            :key="item.id"
            :to="item.path"
            @click="isMobileMenuOpen = false"
            :class="[
              'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
              isActive(item.path)
                ? 'bg-purple-600 text-white'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            ]"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </transition>
    </div>
  </header>
</template>