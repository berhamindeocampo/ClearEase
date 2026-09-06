import { createRouter, createWebHistory } from 'vue-router'
import { supabase, type UserRole } from '../composables/auth'
import LandingPage from '../components/LandingPage.vue'
import StudentDashboard from '../student_pages/StudentDashboard.vue'
import Requirements from '../student_pages/StudentRequirements.vue'
import Login from '../components/Login.vue'
import SignIn from '../components/SignIn.vue'
import Profiles from '../student_pages/StudentProfiles.vue'
import AdminDashboard from '../admin_pages/AdminDashboard.vue'
import AdminAccounts from '../admin_pages/AdminAccounts.vue'
import AdminDepartment from '../admin_pages/AdminDepartment.vue'
import SPRequirements from '../school_personnel_pages/SP_Requirements.vue'
import SPClearances from '../school_personnel_pages/SP_Clearances.vue'
import Settings from '../components/Settings.vue'

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
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
    {
      path: '/sp/requirements',
      name: 'sp-requirements',
      component: SPRequirements,
    },
    {
      path: '/sp/clearances',
      name: 'sp-clearances',
      component: SPClearances,
    },
    {
      path: '/sp/settings',
      name: 'sp-settings',
      component: Settings,
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
      path: '/admin/department',
      name: 'admin-department',
      component: AdminDepartment,
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: Settings,
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
  const isSchoolPersonnelRoute = to.path.startsWith('/sp/')
  const isSettingsRoute = to.name === 'settings' || to.name === 'sp-settings' || to.name === 'admin-settings'

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

    if (isSchoolPersonnelRoute && localSession.role !== 'school_personnel' && localSession.role !== 'admin') {
      next('/dashboard')
      return
    }

    if (to.name === 'sp-settings' && localSession.role !== 'school_personnel' && localSession.role !== 'admin') {
      next('/dashboard')
      return
    }

    if (to.name === 'admin-settings' && localSession.role !== 'admin') {
      next('/dashboard')
      return
    }

    if (isSettingsRoute && to.name === 'settings' && localSession.role !== 'student') {
      next(localSession.role === 'admin' ? '/admin/settings' : '/sp/settings')
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
      const fallbackRole: UserRole = sessionEmail ? await (async (): Promise<UserRole> => {
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

      if (isSchoolPersonnelRoute && fallbackRole !== 'school_personnel' && fallbackRole !== 'admin') {
        next('/dashboard')
        return
      }

      if (to.name === 'sp-settings' && fallbackRole !== 'school_personnel' && fallbackRole !== 'admin') {
        next('/dashboard')
        return
      }

      if (to.name === 'admin-settings' && fallbackRole !== 'admin') {
        next('/dashboard')
        return
      }

      if (isSettingsRoute && to.name === 'settings' && fallbackRole !== 'student') {
        next(fallbackRole === 'admin' ? '/admin/settings' : '/sp/settings')
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