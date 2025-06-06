import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseBrowser = createClient(supabaseUrl, anonKey)
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey)

// Legacy export for backward compatibility
export const supabase = supabaseServer

export class DatabaseService {
  static async createUser(userData: any) {
    const { data, error } = await supabaseServer
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  static async updateUser(userId: string, updates: any) {
    const { data, error } = await supabaseServer
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  static async getUserById(userId: string) {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  static async trackUserAnalytics(userId: string, event: string, metadata?: any) {
    const { data, error } = await supabaseServer
      .from('user_analytics')
      .insert({
        user_id: userId,
        event,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
    
    if (error) console.error('Analytics tracking error:', error.message)
    return data
  }

  static async getUserAnalytics(userId: string, limit = 100) {
    const { data, error } = await supabaseServer
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw new Error(error.message)
    return data || []
  }
}

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
