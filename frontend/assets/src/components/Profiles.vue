<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth'

const router = useRouter()
const { logOut } = useAuth()

const getSessionUser = () => {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(localStorage.getItem('clearease-local-session') || 'null')
  } catch {
    return null
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'ST'
}

// --- TypeScript Interfaces ---
interface StudentProfile {
  fullName: string;
  initials: string;
  studentId: string;
  gradeLevel: string;
  section: string;
  email: string;
  contactNumber: string;
  password: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Reactive State ---
const showPasswordForm = ref<boolean>(false);
const errorMessage = ref<string>('');

const student = ref<StudentProfile>({
  fullName: 'Student',
  initials: 'ST',
  studentId: 'N/A',
  gradeLevel: 'Grade 12 - STEM',
  section: 'STEM - A',
  email: '',
  contactNumber: '+63 000 000 0000',
  password: ''
});

const syncStudentFromSession = () => {
  const sessionUser = getSessionUser()

  if (!sessionUser) {
    return
  }

  student.value = {
    fullName: sessionUser.fullName || 'Student',
    initials: getInitials(sessionUser.fullName || 'Student'),
    studentId: sessionUser.studentId || 'N/A',
    gradeLevel: 'Grade 12 - STEM',
    section: 'STEM - A',
    email: sessionUser.email || '',
    contactNumber: '+63 917 123 4567',
    password: ''
  }
}

onMounted(() => {
  syncStudentFromSession()
  window.addEventListener('storage', syncStudentFromSession)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', syncStudentFromSession)
})

const passwordForm = ref<PasswordFormState>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// --- Computed Properties ---
const maskedPassword = computed(() => {
  return '*'.repeat(8); // Always shows exactly 8 asterisks as per the image
});

// --- Methods ---
const togglePasswordForm = () => {
  showPasswordForm.value = !showPasswordForm.value;
  errorMessage.value = '';
  // Reset form when closing
  if (!showPasswordForm.value) {
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }
};

const handleUpdatePassword = () => {
  errorMessage.value = '';
  
  // Basic Frontend Validation
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = 'New passwords do not match.';
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.';
    return;
  }

  // Here you would typically dispatch an API call to your backend
  // e.g., await authStore.changePassword(passwordForm.value);
  
  alert('Password updated successfully! (Mock)');
  togglePasswordForm();
};

const handleLogOut = async () => {
  try {
    await logOut()
    router.push('/login')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      <!-- Profile Header (Avatar & Basic Info) -->
      <div class="bg-white rounded-lg shadow p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <!-- Avatar -->
          <div class="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {{ student.initials }}
          </div>
          <!-- Name & ID -->
          <div class="text-center sm:text-left">
            <h2 class="text-2xl font-bold text-gray-800">{{ student.fullName }}</h2>
            <p class="text-gray-500 mt-1">Student ID: <span class="font-medium text-gray-700">{{ student.studentId }}</span></p>
            <p class="text-gray-500">{{ student.gradeLevel }}</p>
          </div>
        </div>

        <button
          @click="handleLogOut"
          class="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>

      <!-- Grid Layout for Details & Password Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p class="text-sm text-gray-500">Full Name</p>
                <p class="font-medium text-gray-800">{{ student.fullName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Student ID</p>
                <p class="font-medium text-gray-800">{{ student.studentId }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Grade Level</p>
                <p class="font-medium text-gray-800">{{ student.gradeLevel }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Section</p>
                <p class="font-medium text-gray-800">{{ student.section }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email Address</p>
                <p class="font-medium text-gray-800">{{ student.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Contact Number</p>
                <p class="font-medium text-gray-800">{{ student.contactNumber }}</p>
              </div>
            </div>
          </div>

          <!-- Account Security -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Account Security</h3>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-500">Password</p>
                <p class="font-mono text-gray-800 tracking-widest">{{ maskedPassword }}</p>
              </div>
              <button 
                @click="togglePasswordForm" 
                class="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {{ showPasswordForm ? 'Cancel Change' : 'Change Password' }}
              </button>
            </div>
          </div>

        </div>

        <!-- Right Column: Change Password Form -->
        <div v-if="showPasswordForm" class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 h-full">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-6">Change Password</h3>
            <form @submit.prevent="handleUpdatePassword" class="space-y-4">
              <!-- Current Password -->
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
                <input 
                  v-model="passwordForm.currentPassword"
                  type="password" 
                  id="currentPassword" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <!-- New Password -->
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                <input 
                  v-model="passwordForm.newPassword"
                  type="password" 
                  id="newPassword" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <!-- Confirm New Password -->
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input 
                  v-model="passwordForm.confirmPassword"
                  type="password" 
                  id="confirmPassword" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <!-- Validation Error Message -->
              <p v-if="errorMessage" class="text-sm text-red-600">
                {{ errorMessage }}
              </p>

              <!-- Actions -->
              <div class="flex items-center justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  @click="togglePasswordForm"
                  class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Empty placeholder to keep layout stable when form is hidden (Optional but good for UX) -->
        <div v-else class="hidden lg:block lg:col-span-1">
           <!-- Empty space -->
        </div>

      </div>
    </main>
  </div>
</template>