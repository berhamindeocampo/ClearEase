import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const LOCAL_SESSION_KEY = 'clearease-local-session'
const LEGACY_USER_NAME_KEY = 'clearease-user-name'
const LEGACY_USER_EMAIL_KEY = 'clearease-user-email'

export type UserRole = 'student' | 'admin' | 'school_personnel'

export interface Profile {
  id: string
  email: string
  full_name: string
  student_id: string | null
  role: UserRole
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  studentId: string
  role?: UserRole
}

const normalizeRole = (role: unknown): UserRole | null => {
  const normalizedRole = String(role || '').trim().toLowerCase()
  return normalizedRole === 'student' || normalizedRole === 'admin' || normalizedRole === 'school_personnel'
    ? normalizedRole
    : null
}

// Local storage helpers
const getLocalSession = () => {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

const saveLocalSession = (user: { email: string; fullName: string; studentId?: string; role: UserRole }) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user))
  localStorage.setItem(LEGACY_USER_NAME_KEY, user.fullName)
  localStorage.setItem(LEGACY_USER_EMAIL_KEY, user.email)
}

const clearLocalSession = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LOCAL_SESSION_KEY)
  localStorage.removeItem(LEGACY_USER_NAME_KEY)
  localStorage.removeItem(LEGACY_USER_EMAIL_KEY)
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const useAuth = () => {

  const fetchUserProfile = async (userId: string, email?: string): Promise<Profile | null> => {
    if (!supabase) return null

    const { data: rpcProfile, error: rpcError } = await supabase.rpc('get_my_profile')
    if (!rpcError && rpcProfile) return rpcProfile as Profile

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) return data as Profile

    if (error) {
      console.error('Error fetching profile by ID:', error.message)
    }

    if (rpcError) console.error('Error fetching profile with get_my_profile:', rpcError.message)

    if (!email) return null

    const { data: emailData, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (emailError) console.error('Error fetching profile by email:', emailError.message)

    return (emailData as Profile) || null
  }

  const signUp = async (data: SignUpData) => {
    const assignedRole: UserRole = data.role || 'student'

    if (!supabase) {
      saveLocalSession({
        email: data.email,
        fullName: data.fullName,
        studentId: data.studentId,
        role: assignedRole,
      })

      return {
        user: { id: 'local-user', email: data.email, role: assignedRole },
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          student_id: data.studentId,
          role: assignedRole,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed.')

    saveLocalSession({
      email: data.email,
      fullName: data.fullName,
      studentId: data.studentId,
      role: assignedRole,
    })

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        role: assignedRole,
      },
      session: authData.session,
    }
  }


  const logIn = async (email: string, password: string) => {
    // Fallback mode when Supabase isn't configured
    if (!supabase) {
      const session = getLocalSession()
      if (session && session.email.toLowerCase() === email.toLowerCase()) {
        return {
          user: { id: 'local-user', email: session.email, role: session.role || 'student' },
        }
      }
      throw new Error('Invalid login credentials')
    }

    // A. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Authentication failed.')

    // B. Fetch profile from 'profiles' table using authData.user.id
    const profile = await fetchUserProfile(authData.user.id, authData.user.email || email)

    const userRole = normalizeRole(profile?.role)
    if (!profile || !userRole) {
      await supabase.auth.signOut()
      throw new Error(`No valid profile role was found for ${authData.user.email || email}. Check the profiles table and RLS policy.`)
    }

    const fullName = profile?.full_name || email
    const studentId = profile?.student_id || ''

    // Cache details locally for components reading legacy keys
    saveLocalSession({
      email: authData.user.email!,
      fullName,
      studentId,
      role: userRole,
    })

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        role: userRole,
      },
      session: authData.session,
      profile,
    }
  }


  const logOut = async () => {
    clearLocalSession()
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  }


  const getCurrentUser = async () => {
    if (!supabase) {
      const session = getLocalSession()
      return session ? { id: 'local-user', email: session.email, role: session.role } : null
    }

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    const profile = await fetchUserProfile(user.id, user.email)

    return {
      ...user,
      role: normalizeRole(profile?.role) || 'student',
      profile,
    }
  }

  const getCurrentSession = async () => {
    if (!supabase) {
      return getLocalSession()
    }

    const { data: { session } } = await supabase.auth.getSession()

    return session
  }

  return {
    signUp,
    logIn,
    logOut,
    getCurrentUser,
    getCurrentSession,
  }
}