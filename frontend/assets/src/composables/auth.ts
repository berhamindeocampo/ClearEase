import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const LOCAL_SESSION_KEY = 'clearease-local-session'
const LEGACY_USER_NAME_KEY = 'clearease-user-name'
const LEGACY_USER_EMAIL_KEY = 'clearease-user-email'

export type UserRole = 'student' | 'admin' | 'school_personnel'

const getLocalSession = () => {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

const saveLocalSession = (user: { email: string; fullName: string; studentId: string; role?: UserRole }) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user))
  localStorage.setItem(LEGACY_USER_NAME_KEY, user.fullName)
  localStorage.setItem(LEGACY_USER_EMAIL_KEY, user.email)
}

const resolveUserRole = async (email: string): Promise<UserRole> => {
  if (!supabase) {
    const session = getLocalSession()
    return session?.role === 'admin' ? 'admin' : session?.role === 'school_personnel' ? 'school_personnel' : 'student'
  }

  const { data, error } = await supabase
    .from('clearease_personnel')
    .select('role')
    .eq('role', email)
    .maybeSingle()

  if (!error && data?.role === 'admin') {
    return 'admin'
  }

  if (error && !['42P01', '42703'].includes(error.code || '')) {
    console.warn('Personnel role check failed:', error.message)
  }

  if (!error && data?.role === 'schoolpersonnel') {
    return 'school_personnel'
  }

  return 'student'
}

const clearLocalSession = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LOCAL_SESSION_KEY)
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export interface SignUpData {
  email: string
  password: string
  fullName: string
  studentId: string
}

export const useAuth = () => {
  const signUp = async (data: SignUpData) => {
    if (!supabase) {
      const existing = getLocalSession()
      if (existing?.email?.toLowerCase() === data.email.toLowerCase()) {
        throw new Error('An account with this email already exists.')
      }

      const role = 'student'

      saveLocalSession({
        email: data.email,
        fullName: data.fullName,
        studentId: data.studentId,
        role,
      })

      return {
        user: {
          id: 'local-user',
          email: data.email,
          role,
        },
      }
    }

    const { data: inserted, error } = await supabase
      .from('users')
      .insert([
        {
          email: data.email,
          password: data.password,
          full_name: data.fullName,
          student_id: data.studentId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      throw error
    }

    const role = await resolveUserRole(data.email)

    saveLocalSession({
      email: data.email,
      fullName: data.fullName,
      studentId: data.studentId,
      role,
    })

    return { user: { id: inserted?.[0]?.id ?? 'supabase-user', email: data.email, role } }
  }

  const logIn = async (email: string, password: string, requestedRole: UserRole = 'student') => {
    if (!supabase) {
      const session = getLocalSession()

      if (session && session.email.toLowerCase() === email.toLowerCase()) {
        const role: UserRole = session.role === 'admin'
          ? 'admin'
          : session.role === 'school_personnel'
            ? 'school_personnel'
            : 'student'
        saveLocalSession({
          email: session.email,
          fullName: session.fullName,
          studentId: session.studentId,
          role,
        })

        return {
          user: {
            id: 'local-user',
            email,
            role,
          },
        }
      }

      throw new Error('Invalid login credentials')
    }

    const normalizedIdentifier = email.toLowerCase().replace(/[^a-z]/g, '')
    const inferredRole = normalizedIdentifier.includes('schoolpersonnel')
      ? 'school_personnel'
      : normalizedIdentifier.includes('admin')
        ? 'admin'
        : requestedRole
    const roleTable = inferredRole === 'admin' || inferredRole === 'school_personnel' ? 'clearease_personnel' : null
    if (roleTable && !email.includes('@')) {
      const { data: roleData, error: roleError } = await supabase
        .from(roleTable)
        .select('*')
        .eq('role', inferredRole === 'school_personnel' ? 'schoolpersonnel' : 'admin')
        .eq('password', password)
        .maybeSingle()

      if (roleError && !['42P01', '42703'].includes(roleError.code || '')) {
        throw roleError
      }

      if (roleData) {
        const roleEmail = roleData.email || `${email}@clearease.local`
        const roleName = roleData.full_name || roleData.fullName || roleData.name || roleData.username || roleData.user_name || email
        saveLocalSession({
          email: roleEmail,
          fullName: roleName,
          studentId: roleData.student_id || roleData.id || inferredRole.toUpperCase(),
          role: inferredRole,
        })

        return { user: { id: roleData.id, email: roleEmail, role: inferredRole } }
      }
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (data) {
      const role = await resolveUserRole(data.email)

      saveLocalSession({
        email: data.email,
        fullName: data.full_name,
        studentId: data.student_id,
        role,
      })

      return {
        user: {
          id: data.id,
          email: data.email,
          role,
        },
      }
    }

    const { data: personnelData, error: personnelError } = await supabase
      .from('clearease_personnel')
      .select('*')
      .eq('role', 'schoolpersonnel')
      .eq('password', password)
      .maybeSingle()

    if (personnelError && !['42P01', '42703'].includes(personnelError.code || '')) {
      throw personnelError
    }

    if (!personnelData) {
      throw new Error('Invalid login credentials')
    }

    const personnelEmail = personnelData.email || 'schoolpersonnel@clearease.local'
    const personnelName = personnelData.full_name || personnelData.fullName || personnelData.name || personnelData.username || personnelData.user_name || personnelEmail
    saveLocalSession({
      email: personnelEmail,
      fullName: personnelName,
      studentId: personnelData.student_id || personnelData.id || 'PERSONNEL',
      role: 'school_personnel',
    })

    return {
      user: {
        id: personnelData.id,
        email: personnelEmail,
        role: 'school_personnel',
      },
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
    const session = getLocalSession()
    if (session) {
      return { id: 'local-user', email: session.email, role: session.role || 'student' }
    }

    if (!supabase) {
      return null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  }

  const getCurrentSession = async () => {
    const localSession = getLocalSession()
    if (localSession) {
      return localSession
    }

    if (!supabase) {
      return null
    }

    const {
      data: { session: supabaseSession },
    } = await supabase.auth.getSession()

    return supabaseSession
  }

  return {
    signUp,
    logIn,
    logOut,
    getCurrentUser,
    getCurrentSession,
  }
}