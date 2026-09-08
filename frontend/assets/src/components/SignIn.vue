<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth'
import cleareaseLogo from '../assets/clearease.png'
import universityLogo from '../assets/stpaul.png'

const router = useRouter()
const { signUp } = useAuth()
const goBack = () => {
  router.back()
}

interface FormData {
  email: string
  fullName: string
  studentId: string
  password: string
  agreeToTerms: boolean
}

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

const formData = ref<FormData>({
  email: '',
  fullName: '',
  studentId: '',
  password: '',
  agreeToTerms: false,
})

const errors = ref<FormErrors>({})
const isLoading = ref(false)
const showPassword = ref(false)
const successMessage = ref('')

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email'
  }

  if (!formData.value.password) {
    errors.value.password = 'Password is required'
  } else if (formData.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }

  if (!formData.value.fullName) {
    errors.value.submit = 'Full name is required'
  }

  if (!formData.value.studentId) {
    errors.value.submit = 'Student ID is required'
  }

  if (!formData.value.agreeToTerms) {
    errors.value.submit = 'You must agree to the terms'
  }

  return Object.keys(errors.value).length === 0
}

const handleSignUp = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errors.value = {}

  try {
    await signUp({
      email: formData.value.email,
      password: formData.value.password,
      fullName: formData.value.fullName,
      studentId: formData.value.studentId,
    })

    successMessage.value = 'Account created successfully! Redirecting...'

    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (error: any) {
    errors.value.submit = error?.message || 'Failed to sign up. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-shell min-h-screen flex items-center justify-center px-4 py-4">
    <div class="w-full max-w-[820px]">
      <div class="flex justify-center mb-3">
        <img
          :src="universityLogo"
          alt="St. Paul University"
          class="h-14 md:h-16 object-contain"
        />
      </div>

      <div class="auth-card relative mx-auto w-full max-w-[440px] rounded-[22px] p-5 md:p-6">
        <button
          type="button"
          @click="goBack"
          class="absolute left-4 top-4 flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-900"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div class="flex justify-center mb-3 mt-4">
          <img
            :src="cleareaseLogo"
            alt="ClearEase Logo"
            class="h-14 md:h-16 object-contain"
          />
        </div>

        <h1 class="text-center text-2xl font-bold text-gray-900">Welcome!</h1>
        <p class="mt-1 text-center text-sm text-gray-700">
          Sign up to start checking your Clearance.
        </p>

        <form @submit.prevent="handleSignUp" class="mt-5 space-y-3">
          <div>
            <label class="mb-1 block text-sm font-bold text-gray-900">
              Email
            </label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              required
              class="auth-input w-full rounded-lg border-2 bg-white/80 px-3 py-2 text-sm text-gray-800 outline-none"
            />
            <span v-if="errors.email" class="mt-1 block text-xs text-red-500">
              {{ errors.email }}
            </span>
          </div>

          <div>
            <label class="mb-1 block text-sm font-bold text-gray-900">
              Full Name
            </label>
            <input
              v-model="formData.fullName"
              type="text"
              placeholder="Enter your full name"
              required
              class="auth-input w-full rounded-lg border-2 bg-white/80 px-3 py-2 text-sm text-gray-800 outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-bold text-gray-900">
              Student ID
            </label>
            <input
              v-model="formData.studentId"
              type="text"
              placeholder="Enter your student ID"
              required
              class="auth-input w-full rounded-lg border-2 bg-white/80 px-3 py-2 text-sm text-gray-800 outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-bold text-gray-900">
              Password
            </label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a password"
                required
                class="auth-input w-full rounded-lg border-2 bg-white/80 px-3 py-2 pr-10 text-sm text-gray-800 outline-none"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg
                  v-if="!showPassword"
                  class="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clip-rule="evenodd"
                  />
                  <path d="M15.171 13.576l1.414 1.414A10.015 10.015 0 0120.542 10c-1.274-4.057-5.064-7-9.542-7a9.948 9.948 0 00-2.742.384l1.514 1.294A7.971 7.971 0 0110 5c4.418 0 8.268 2.943 9.542 7a9.957 9.957 0 01-.571 1.576z" />
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="mt-1 block text-xs text-red-500">
              {{ errors.password }}
            </span>
          </div>

          <div class="flex items-center">
            <input
              v-model="formData.agreeToTerms"
              type="checkbox"
              id="terms"
              required
              class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label for="terms" class="ml-2 text-xs text-gray-700">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="brand-button w-full rounded-xl py-2.5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-80"
          >
            <span v-if="isLoading">Signing Up...</span>
            <span v-else>Sign Up</span>
          </button>
        </form>

        <div v-if="errors.submit" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          {{ errors.submit }}
        </div>

        <div v-if="successMessage" class="mt-4 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs text-green-700">
          {{ successMessage }}
        </div>

        <p class="mt-4 text-center text-sm text-gray-700">
          Already have an account?
          <router-link to="/login" class="font-bold text-purple-700 hover:underline">
            Log In
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>