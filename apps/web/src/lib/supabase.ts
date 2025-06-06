import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnon)

export class AuthService {
  static signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  static signUp(email: string, password: string, metadata?: Record<string, any>) {
    return supabase.auth.signUp({ email, password, options: { data: metadata } })
  }

  static signOut() {
    return supabase.auth.signOut()
  }

  static getCurrentUser() {
    const { data } = supabase.auth.getUser()
    return data?.user ?? null
  }

  static resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email)
  }

  static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
