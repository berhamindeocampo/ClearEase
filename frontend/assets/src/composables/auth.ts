import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface SignUpData {
  email: string
  password: string
  fullName: string
  studentId: string
}

export const useAuth = () => {
  const signUp = async (data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw error
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            student_id: data.studentId,
            created_at: new Date().toISOString(),
          },
        ])

      if (profileError) {
        throw profileError
      }
    }

    return authData
  }

  const logIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }

  const logOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  }

  const getCurrentSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

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