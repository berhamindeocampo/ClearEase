import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const LOCAL_SESSION_KEY = 'clearease-local-session'
const LEGACY_USER_NAME_KEY = 'clearease-user-name'
const LEGACY_USER_EMAIL_KEY = 'clearease-user-email'

const getLocalSession = () => {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

const saveLocalSession = (user: { email: string; fullName: string; studentId: string }) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user))
  localStorage.setItem(LEGACY_USER_NAME_KEY, user.fullName)
  localStorage.setItem(LEGACY_USER_EMAIL_KEY, user.email)
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

      saveLocalSession({
        email: data.email,
        fullName: data.fullName,
        studentId: data.studentId,
      })

      return {
        user: {
          id: 'local-user',
          email: data.email,
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

    saveLocalSession({
      email: data.email,
      fullName: data.fullName,
      studentId: data.studentId,
    })

    return { user: { id: inserted?.[0]?.id ?? 'supabase-user', email: data.email } }
  }

  const logIn = async (email: string, password: string) => {
    if (!supabase) {
      const session = getLocalSession()

      if (session && session.email.toLowerCase() === email.toLowerCase()) {
        saveLocalSession(session)
        return {
          user: {
            id: 'local-user',
            email,
          },
        }
      }

      throw new Error('Invalid login credentials')
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

    if (!data) {
      throw new Error('Invalid login credentials')
    }

    saveLocalSession({
      email: data.email,
      fullName: data.full_name,
      studentId: data.student_id,
    })

    return {
      user: {
        id: data.id,
        email: data.email,
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
      return { id: 'local-user', email: session.email }
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