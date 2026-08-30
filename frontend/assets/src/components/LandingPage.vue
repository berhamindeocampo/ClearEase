<script setup lang="ts">
import { BellRing, CheckCheck, Clock3, ShieldCheck } from 'lucide-vue-next'
import cleareaseLogo from '../assets/clearease.png'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToSignIn = () => {
  router.push('/signin')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header/Navigation -->
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <img :src="cleareaseLogo" alt="ClearEase Logo" class="h-10 object-contain" />
        </div>
        <div class="flex gap-4">
          <button
            @click="goToLogin"
            class="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Log In
          </button>
          <button
            @click="goToSignIn"
            class="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Sign In
          </button>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left Content -->
        <div class="space-y-6">
          <div class="inline-block bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
            STUDENT CLEARANCE MANAGEMENT SYSTEM
          </div>
          <h1 class="text-5xl font-bold leading-tight">
            Your Clearance Made
            <span class="text-purple-600 block">Clear and Easy.</span>
          </h1>
          <p class="text-lg text-gray-600 leading-relaxed">
            ClearEase makes the student clearance process simpler by allowing students to track
            their clearance status, monitor requirements, and receive updates in one convenient system.
          </p>
        </div>

        <!-- Right Content - Dashboard Preview -->
        <div class="relative">
          <div class="bg-white rounded-lg shadow-2xl p-6 border border-gray-100">
            <!-- Dashboard Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <span class="font-semibold text-gray-800">ClearEase</span>
                <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                  DASHBOARD
                </span>
              </div>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 cursor-pointer">
                  Clearance
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 cursor-pointer">
                  Notifications
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 cursor-pointer">
                  Profile
                </span>
              </div>
            </div>

            <!-- Status Cards -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="text-3xl font-bold text-blue-600">8</div>
                <div class="text-sm text-gray-600 mt-1">Total Requirements</div>
              </div>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="text-3xl font-bold text-yellow-600">3</div>
                <div class="text-sm text-gray-600 mt-1">Remaining</div>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="text-3xl font-bold text-green-600">4</div>
                <div class="text-sm text-gray-600 mt-1">Completed</div>
              </div>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-3xl font-bold text-red-600">1</div>
                <div class="text-sm text-gray-600 mt-1">Pending</div>
              </div>
            </div>

            <!-- Progress Section -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700">Clearance Progress</span>
                  <span class="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded">View Details</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="relative w-16 h-16">
                    <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" stroke-width="8" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#a855f7" stroke-width="8" stroke-dasharray="169.64 424.1" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-lg font-bold text-purple-600">50%</span>
                    </div>
                  </div>
                  <div class="text-sm">
                    <div class="text-gray-600">4 of 8 Requirements</div>
                    <div class="text-xs text-gray-500 mt-1">Nearly Complete</div>
                  </div>
                </div>
              </div>

              <!-- Recent Activity -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="text-sm font-semibold text-gray-700 mb-3">Recent Activity</div>
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Library</span>
                    <span class="text-green-600 font-semibold">Cleared</span>
                    <span class="text-gray-500">Aug 28 2025</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Finance</span>
                    <span class="text-yellow-600 font-semibold">Pending</span>
                    <span class="text-gray-500">Aug 27 2025</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Registrar</span>
                    <span class="text-yellow-600 font-semibold">Pending</span>
                    <span class="text-gray-500">Aug 15 2025</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Section -->
            <div class="flex items-center justify-between">
              <div />
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:shadow-lg transition">
                JD
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="bg-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-bold text-center mb-16">
          Everything you need for your Clearance
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Clearance Tracking -->
          <div class="text-center">
            <div class="inline-flex w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
              <Clock3 class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Clearance Tracking</h3>
            <p class="text-gray-600">
              Easily monitor the status of your clearance requirements.
            </p>
          </div>

          <!-- Real time updates -->
          <div class="text-center">
            <div class="inline-flex w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
              <BellRing class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Real time updates</h3>
            <p class="text-gray-600">
              Receive instant updates and approvals regarding requirements and actions needed.
            </p>
          </div>

          <!-- Simple Process -->
          <div class="text-center">
            <div class="inline-flex w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
              <CheckCheck class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Simple Process</h3>
            <p class="text-gray-600">
              Manage your clearance in one convenient online system.
            </p>
          </div>

          <!-- Secured Records -->
          <div class="text-center">
            <div class="inline-flex w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
              <ShieldCheck class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Secured Records</h3>
            <p class="text-gray-600">
              Your account and data stay organized and protected.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-purple-50 to-blue-50 py-20">
      <div class="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          Ready to check your clearance?
        </h2>
        <p class="text-gray-600 mb-8">
          Create your ClearEase account and start checking your clearance.
        </p>
        <button
          @click="goToSignIn"
          class="px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition transform hover:scale-105"
        >
          Sign In
        </button>
      </div>
    </section>
  </div>
</template>