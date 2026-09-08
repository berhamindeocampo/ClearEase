<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import cleareaseLogo from '../assets/clearease.png';
import universityLogo from '../assets/stpaul.png';
import { useAuth } from '../composables/auth';

// Define the shape of our form data
interface SignUpForm {
  email: string;
  fullName: string;
  studentId: string;
  password: string;
}

// Reactive form state
const form = reactive<SignUpForm>({
  email: '',
  fullName: '',
  studentId: '',
  password: ''
});

const router = useRouter();
const { signUp } = useAuth();

// UI states
const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = '';
  
  // Basic validation
  if (!form.email || !form.fullName || !form.studentId || !form.password) {
    errorMessage.value = 'Please fill in all required fields.';
    return;
  }
  isSubmitting.value = true;
  
  try {
    await signUp({
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      studentId: form.studentId.trim(),
    });

    router.push('/login');
  } catch (error: any) {
    errorMessage.value = error?.message || 'An error occurred during sign up. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="bg-[#e9e0ef] min-h-screen flex items-center justify-center p-3 antialiased text-slate-900 font-sans">
    <main class="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100">
      <div class="p-5 sm:p-6">
        
        <div class="flex flex-col items-center justify-center mb-5 space-y-2">
          <img
            :src="universityLogo"
            alt="St. Paul University"
            class="h-9 w-auto object-contain"
          />
          <img
            :src="cleareaseLogo"
            alt="ClearEase Student Clearance System"
            class="h-11 w-auto object-contain"
          />
          <div class="text-center mt-0.5">
            <h1 class="text-xl font-bold text-gray-900">Welcome!</h1>
            <p class="text-xs text-slate-600 mt-1">Sign up to start checking your Clearance.</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
          {{ errorMessage }}
        </div>

        <!-- SignUp Form -->
        <form class="space-y-3" @submit.prevent="handleSubmit">
          <!-- Email Field -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1" for="email">Email</label>
            <input 
              v-model="form.email"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all duration-200 text-sm" 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Full Name Field -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1" for="fullName">Full Name</label>
              <input 
                v-model="form.fullName"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all duration-200 text-sm" 
                id="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                required 
              />
            </div>
            <!-- School ID Field -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1" for="studentId">School ID</label>
              <input 
                v-model="form.studentId"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all duration-200 text-sm" 
                id="studentId" 
                type="text" 
                placeholder="Enter your school ID"
                required 
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1" for="password">Password</label>
            <div class="relative">
              <input 
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all duration-200 text-sm pr-10" 
                id="password" 
                placeholder="Create a password" 
                required 
              />
              <button 
                @click="togglePassword" 
                type="button" 
                aria-label="Toggle password visibility" 
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <!-- Eye Open Icon -->
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                </svg>
                <!-- Eye Closed Icon -->
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-1">
            <button 
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed" 
              type="submit"
              :disabled="isSubmitting"
            >
              <!-- Spinner SVG -->
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Creating Account...' : 'Sign Up' }}
            </button>
          </div>
        </form>

        <!-- Footer Links: "Already have an account? Log In" -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600">
            Already have an account? 
            <router-link to="/login" class="font-bold text-[#7c3aed] hover:text-[#6d28d9] transition-colors">Log In</router-link>
          </p>
        </div>

      </div>
    </main>
  </div>
</template>