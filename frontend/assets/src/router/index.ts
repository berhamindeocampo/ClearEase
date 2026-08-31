import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../composables/auth'
import LandingPage from '../components/LandingPage.vue'
import StudentDashboard from '../components/StudentDashboard.vue'
import Requirements from '../components/Requirements.vue'
import Login from '../components/Login.vue'
import SignIn from '../components/SignIn.vue'
import Profiles from '../components/Profiles.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import AdminAccounts from '../components/AdminAccounts.vue'
import AdminClearances from '../components/AdminClearances.vue'
import AdminRequirements from '../components/AdminRequirements.vue'
import AdminDepartment from '../components/AdminDepartment.vue'

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
      path: '/requirements',
      name: 'requirements',
      component: Requirements,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profiles,
      alias: ['/profiles'],
    },
    {
      path: '/admindashboard',
      name: 'admin',
      component: AdminDashboard,
    },
    {
      path: '/admin/accounts',
      name: 'admin-accounts',
      component: AdminAccounts,
    },
    {
      path: '/admin/clearances',
      name: 'admin-clearances',
      component: AdminClearances,
    },
    {
      path: '/admin/requirements',
      name: 'admin-requirements',
      component: AdminRequirements,
    },
    {
      path: '/admin/department',
      name: 'admin-department',
      component: AdminDepartment,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const isPublicRoute = to.name && publicRoutes.includes(String(to.name))
  const isAdminRoute =
    to.path === '/admindashboard' ||
    to.path.startsWith('/admin/') ||
    to.name === 'admin' ||
    ['admin-accounts', 'admin-clearances', 'admin-requirements', 'admin-department'].includes(String(to.name))

  if (isPublicRoute) {
    next()
    return
  }

  const localSession = getLocalSession()
  if (localSession) {
    if (isAdminRoute && localSession.role !== 'admin') {
      next('/dashboard')
      return
    }

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
      const sessionEmail = session.user?.email
      const fallbackRole = sessionEmail ? await (async () => {
        const { data, error } = await supabase
          .from('admin')
          .select('email')
          .eq('email', sessionEmail)
          .maybeSingle()

        if (!error && data) {
          return 'admin'
        }

        return 'student'
      })() : 'student'

      if (isAdminRoute && fallbackRole !== 'admin') {
        next('/dashboard')
        return
      }

      next()
      return
    }

    next('/login')
  } catch {
    next('/login')
  }
})

export default router