import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseBrowser = createClient(supabaseUrl, anonKey)
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey)

export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    return { user: data?.user ?? null, error: error?.message }
  }

  static async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabaseBrowser.auth.signUp({ email, password, options: { data: metadata } })
    return { user: data?.user ?? null, error: error?.message }
  }

  static async signInWithMagicLink(email: string) {
    const { data, error } = await supabaseBrowser.auth.signInWithOtp({ email })
    return { user: data?.user ?? null, error: error?.message }
  }

  static async signOut() {
    await supabaseBrowser.auth.signOut()
  }

  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession()
    return session?.user ?? null
  }

  static onAuthStateChange(callback: Parameters<typeof supabaseBrowser.auth.onAuthStateChange>[0]) {
    return supabaseBrowser.auth.onAuthStateChange(callback)
  }
}

export class DatabaseService {
  static async getTotalUsers() {
    return 0
  }
  static async getUsersRegisteredToday() {
    return 0
  }
  static async getActiveSessions() {
    return 0
  }
}
