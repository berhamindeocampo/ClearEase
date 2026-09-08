import { createRouter, createWebHistory } from 'vue-router'
import { supabase, type UserRole } from '../composables/auth'
import LandingPage from '../components/LandingPage.vue'
import StudentDashboard from '../student_pages/StudentDashboard.vue'
import StudentClearance from '../student_pages/StudentClearance.vue'
import Requirements from '../student_pages/StudentRequirements.vue'
import Login from '../components/Login.vue'
import SignIn from '../components/SignIn.vue'
import Profiles from '../student_pages/StudentProfiles.vue'
import AdminDashboard from '../admin_pages/AdminDashboard.vue'
import AdminAccounts from '../admin_pages/AdminAccounts.vue'
import AdminDepartment from '../admin_pages/AdminDepartment.vue'
import SPRequirements from '../school_personnel_pages/SP_Requirements.vue'
import SPClearances from '../school_personnel_pages/SP_Clearances.vue'
import SPClassList from '../school_personnel_pages/SP_ClassList.vue'
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

const getSupabaseUserRole = async (userId: string, email?: string): Promise<UserRole> => {
  const { data: rpcProfile, error: rpcError } = await supabase!
    .rpc('get_my_profile')

  const rpcRole = String(rpcProfile?.role || '').trim().toLowerCase()
  if (rpcRole === 'admin' || rpcRole === 'school_personnel' || rpcRole === 'student' || rpcRole === 'unlisted') {
    return rpcRole
  }

  const { data, error } = await supabase!
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  const role = String(data?.role || '').trim().toLowerCase()
  if (role === 'admin' || role === 'school_personnel') return role

  if (email) {
    const { data: emailData, error: emailError } = await supabase!
      .from('profiles')
      .select('role')
      .eq('email', email)
      .maybeSingle()

    const emailRole = String(emailData?.role || '').trim().toLowerCase()
    if (!emailError && (emailRole === 'admin' || emailRole === 'school_personnel')) {
      return emailRole
    }
  }

  if (error || rpcError) {
    console.error('Error fetching user role:', error?.message || rpcError?.message)
  }

  return 'student'
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
      component: StudentClearance,
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
      path: '/sp/class-list',
      name: 'sp-class-list',
      component: SPClassList,
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

  if (!supabase) {
    const localSession = getLocalSession()
    if (!localSession) {
      next('/login')
      return
    }

    if (isAdminRoute && localSession.role !== 'admin') {
      next('/dashboard')
      return
    }

    if (isSchoolPersonnelRoute && localSession.role !== 'school_personnel' && localSession.role !== 'admin') {
      next('/dashboard')
      return
    }

    if (isSettingsRoute && to.name === 'settings' && localSession.role !== 'student' && localSession.role !== 'unlisted') {
      next(localSession.role === 'admin' ? '/admin/settings' : '/sp/settings')
      return
    }

    next()
    return
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const fallbackRole = await getSupabaseUserRole(session.user.id, session.user.email)

      if (fallbackRole === 'admin' && !isAdminRoute) {
        next('/admindashboard')
        return
      }

      if (fallbackRole === 'school_personnel' && !isSchoolPersonnelRoute && !isSettingsRoute) {
        next('/sp/requirements')
        return
      }

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

      if (isSettingsRoute && to.name === 'settings' && fallbackRole !== 'student' && fallbackRole !== 'unlisted') {
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