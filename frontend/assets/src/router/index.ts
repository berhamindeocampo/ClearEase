import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../composables/auth'
import LandingPage from '../components/LandingPage.vue'
import StudentDashboard from '../components/StudentDashboard.vue'
import Login from '../components/Login.vue'
import SignIn from '../components/SignIn.vue'
import Profiles from '../components/Profiles.vue'

const publicRoutes = ['landing', 'login', 'signin']
const getLocalSession = () => {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(localStorage.getItem('clearease-local-session') || 'null')
  } catch {
    return null
  }
}

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
      component: Profiles,
      alias: ['/profiles'],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const isPublicRoute = to.name && publicRoutes.includes(String(to.name))

  if (isPublicRoute) {
    next()
    return
  }

  const localSession = getLocalSession()
  if (localSession) {
    next()
    return
  }

  if (!supabase) {
    next('/login')
    return
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      next()
      return
    }

    next('/login')
  } catch {
    next('/login')
  }
})

export default router