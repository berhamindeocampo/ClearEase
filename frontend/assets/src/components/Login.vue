<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth'
import cleareaseLogo from '../assets/clearease.png'
import universityLogo from '../assets/stpaul.png'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const { logIn } = useAuth()

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

const formData = ref<FormData>({
  email: '',
  password: '',
  rememberMe: false,
})

const errors = ref<FormErrors>({})
const isLoading = ref(false)
const showPassword = ref(false)

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.email) {
    errors.value.email = 'Username or email is required'
  }

  if (!formData.value.password) {
    errors.value.password = 'Password is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleLogIn = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errors.value = {}

  try {
    const response = await logIn(formData.value.email, formData.value.password)
    const role = response?.user?.role

    if (!role) {
      throw new Error('Your account role could not be loaded. Please contact an administrator.')
    }

    if (role === 'admin') {
      await router.replace('/admindashboard')
      return
    }

    if (role === 'school_personnel') {
      await router.replace('/sp/requirements')
      return
    }

    await router.replace('/dashboard')
  } catch (error: any) {
    errors.value.submit = error?.message || 'Failed to log in. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-shell min-h-screen flex items-center justify-center px-4 py-5">
    <div class="w-full max-w-[440px]">
      <router-link to="/" class="group mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-3.5 py-2 text-sm font-semibold text-purple-700 shadow-sm backdrop-blur transition hover:border-purple-300 hover:bg-white hover:text-purple-900 hover:shadow-md">
        <ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to landing page
      </router-link>

      <div class="mb-3 flex justify-center">
          <img
            :src="universityLogo"
            alt="St. Paul University"
            class="h-11 w-auto object-contain md:h-14"
          />
      </div>

      <div class="auth-card mx-auto w-full rounded-[26px] p-5 sm:p-7">
        <div class="mb-3 flex justify-center">
          <img
              :src="cleareaseLogo"
              alt="ClearEase Logo"
              class="h-14 w-auto object-contain md:h-16"
            />
        </div>

        <h1 class="text-center text-2xl font-bold text-gray-900">Welcome!</h1>
        <p class="mt-1 text-center text-sm text-gray-700">
          Log in to access your ClearEase account.
        </p>

        <form @submit.prevent="handleLogIn" class="mt-5 space-y-4">
          <div>
            <label for="login-identifier" class="mb-1 block text-sm font-bold text-gray-900">
              Username or email
            </label>
            <input
              id="login-identifier"
              v-model="formData.email"
              type="text"
              placeholder="Enter username or email"
              required
              class="auth-input w-full rounded-lg border-2 bg-white/80 px-3 py-2.5 text-sm text-gray-800 outline-none"
            />
            <span v-if="errors.email" class="mt-1 block text-xs text-red-500">
              {{ errors.email }}
            </span>
          </div>

          <div>
            <label for="login-password" class="mb-1 block text-sm font-bold text-gray-900">
              Password
            </label>
            <div class="relative">
              <input
                id="login-password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                required
                class="auth-input w-full rounded-lg border-2 bg-white/80 px-3 py-2.5 pr-12 text-sm text-gray-800 outline-none"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg
                  v-if="!showPassword"
                  class="h-5 w-5"
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
                  class="h-5 w-5"
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

          <button
            type="submit"
            :disabled="isLoading"
            class="brand-button w-full rounded-xl py-2.5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-80"
          >
            <span v-if="isLoading">Logging in...</span>
            <span v-else>Log In</span>
          </button>
        </form>

        <div v-if="errors.submit" class="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {{ errors.submit }}
        </div>

        <p class="mt-4 text-center text-sm text-gray-700">
          Don’t have an account?
          <router-link to="/signin" class="font-bold text-purple-700 hover:underline">
            Sign In
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>