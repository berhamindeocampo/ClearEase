import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../components/LandingPage.vue'
import StudentDashboard from '../components/StudentDashboard.vue'
import Login from '../components/Login.vue'
import SignIn from '../components/SignIn.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: StudentDashboard,
    },
    {
      path: '/clearance',
      name: 'clearance',
      component: StudentDashboard,
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: StudentDashboard,
    },
    {
      path: '/profile',
      name: 'profile',
      component: StudentDashboard,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router