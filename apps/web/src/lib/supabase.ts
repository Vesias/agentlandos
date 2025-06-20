import { createClient, User } from '@supabase/supabase-js'

// Production Supabase configuration - hardcoded for immediate deployment fix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgaksxcgedcpvjzqjwjj.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnYWtzeGNnZWRjcHZqenFqd2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzAwNDAsImV4cCI6MjA2Mzk0NjA0MH0.bF1bmBriZlbXJJup_Ynq02MqOi9u6CS2GboFcWpmc3I'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnYWtzeGNnZWRjcHZqenFqd2pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM3MDA0MCwiZXhwIjoyMDYzOTQ2MDQwfQ.-d1TRuyQlm3kwHSBYBn1BrbuJAy2NXQ7sas3ahkrWNs'

console.log('Supabase config loaded:', { 
  url: supabaseUrl?.substring(0, 30) + '...', 
  anonKey: anonKey?.substring(0, 20) + '...',
  hasServiceRole: !!serviceRoleKey 
})

if (!serviceRoleKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - server operations will be limited')
}

// Singleton pattern to prevent multiple GoTrueClient instances
let _supabaseBrowser: ReturnType<typeof createClient> | null = null

// Browser client factory function with graceful degradation
function createBrowserClient() {
  if (_supabaseBrowser) {
    return _supabaseBrowser
  }

  // Graceful degradation if Supabase is not available
  if (!supabaseUrl || !anonKey) {
    console.warn('Supabase configuration missing - creating mock client for development')
    
    // Return a mock client that won't crash the app
    const mockClient = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: { message: 'Authentication not available' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
      })
    }
    
    return mockClient as any
  }

  try {
    _supabaseBrowser = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'agentland-saarland-auth', // Unique storage key
      },
      global: {
        headers: {
          'x-client-info': 'agentland-saarland-web',
        },
      },
    })

    return _supabaseBrowser
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    // Return mock client as fallback
    return {
      auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
      from: () => ({ select: () => Promise.resolve({ data: [], error: null }) })
    } as any
  }
}

// Export browser client with error handling
export const supabaseBrowser = (() => {
  try {
    return createBrowserClient()
  } catch (error) {
    console.error('Supabase browser client initialization failed:', error)
    return null
  }
})()

// Server client for server-side operations (only when service role key is available)
export const supabaseServer = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': 'agentland-saarland-server',
        },
      },
    })
  : null

// Legacy export for backward compatibility - fallback to browser client if no server client
export const supabase = supabaseServer || supabaseBrowser

export class DatabaseService {
  private static getClient() {
    if (!supabaseServer) {
      throw new Error('Database service requires SUPABASE_SERVICE_ROLE_KEY environment variable')
    }
    return supabaseServer
  }

  static async createUser(userData: any) {
    const client = this.getClient()
    const { data, error } = await client
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  static async updateUser(userId: string, updates: any) {
    const client = this.getClient()
    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  static async getUserById(userId: string) {
    const client = this.getClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  static async trackUserAnalytics(userId: string, event: string, metadata?: any) {
    try {
      const client = this.getClient()
      const { data, error } = await client
        .from('user_analytics')
        .insert({
          user_id: userId,
          event,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        })
      
      if (error) console.error('Analytics tracking error:', error.message)
      return data
    } catch (err) {
      console.error('Failed to track user analytics:', err)
      return null
    }
  }

  static async getUserAnalytics(userId: string, limit = 100) {
    try {
      const client = this.getClient()
      const { data, error } = await client
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw new Error(error.message)
      return data || []
    } catch (err) {
      console.error('Failed to get user analytics:', err)
      return []
    }
  }

  // Ensure tables exist helper
  static async ensureTablesExist(client: any) {
    try {
      // Check if users table exists by trying to query it
      const { error } = await client
        .from('users')
        .select('id')
        .limit(1)
      
      // If table doesn't exist, that's okay - we'll return fallback data
      if (error && error.message.includes('does not exist')) {
        console.warn('Analytics tables not yet created - using fallback data')
      }
    } catch (err) {
      console.warn('Database check failed:', err)
    }
  }

  // Real user analytics methods - NO FAKE DATA
  static async getTotalUsers(): Promise<number> {
    try {
      const client = this.getClient()
      
      // Check if table exists first
      const { error: checkError } = await client
        .from('users')
        .select('id')
        .limit(1)
      
      if (checkError) {
        console.warn('Users table not available - starting from 0:', checkError.message)
        return 0
      }
      
      const { count, error } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Error getting total users:', error.message)
        return 0
      }
      return count || 0
    } catch (err) {
      console.error('Failed to get total users:', err)
      return 0
    }
  }

  static async getUsersRegisteredToday(): Promise<number> {
    try {
      const client = this.getClient()
      const today = new Date().toISOString().split('T')[0]
      const { count, error } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)
      
      if (error) {
        console.error('Error getting users registered today:', error.message)
        return 0
      }
      return count || 0
    } catch (err) {
      console.error('Failed to get users registered today:', err)
      return 0
    }
  }

  static async getActiveSessions(): Promise<number> {
    try {
      const client = this.getClient()
      // Get sessions active in the last 30 minutes from session_tracking table
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { count, error } = await client
        .from('session_tracking')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity', thirtyMinutesAgo)
        .is('ended_at', null)
      
      if (error) {
        console.error('Error getting active sessions:', error.message)
        return 0
      }
      return count || 0
    } catch (err) {
      console.error('Failed to get active sessions:', err)
      return 0
    }
  }

  // Session tracking methods
  static async createSession(sessionData: {
    session_id: string
    user_id?: string
    ip_address?: string
    user_agent?: string
    is_mobile?: boolean
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    referrer?: string
  }) {
    try {
      const client = this.getClient()
      
      // Create tables if they don't exist (graceful degradation)
      await this.ensureTablesExist(client)
      
      const { data, error } = await client
        .from('session_tracking')
        .insert({
          ...sessionData,
          started_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.warn('Session tracking unavailable:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('Failed to create session:', err)
      return null
    }
  }

  static async updateSessionActivity(sessionId: string, pageVisited = false) {
    try {
      const client = this.getClient()
      
      // Graceful degradation - check if table exists first
      const { error: checkError } = await client
        .from('session_tracking')
        .select('session_id')
        .limit(1)
      
      if (checkError) {
        console.warn('Session tracking table not available:', checkError.message)
        return null
      }
      
      const updateData: any = {
        last_activity: new Date().toISOString()
      }
      
      if (pageVisited) {
        // Increment pages_visited counter
        const { data: currentSession } = await client
          .from('session_tracking')
          .select('pages_visited')
          .eq('session_id', sessionId)
          .single()
        
        updateData.pages_visited = (currentSession?.pages_visited || 0) + 1
      }
      
      const { data, error } = await client
        .from('session_tracking')
        .update(updateData)
        .eq('session_id', sessionId)
        .select()
        .single()
      
      if (error) {
        console.warn('Session update failed:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('Failed to update session activity:', err)
      return null
    }
  }

  static async endSession(sessionId: string) {
    try {
      const client = this.getClient()
      const now = new Date()
      
      // Get session start time to calculate duration
      const { data: session } = await client
        .from('session_tracking')
        .select('started_at')
        .eq('session_id', sessionId)
        .single()
      
      let durationSeconds = 0
      if (session?.started_at) {
        const startTime = new Date(session.started_at)
        durationSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      }
      
      const { data, error } = await client
        .from('session_tracking')
        .update({
          ended_at: now.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('session_id', sessionId)
        .select()
        .single()
      
      if (error) throw new Error(error.message)
      return data
    } catch (err) {
      console.error('Failed to end session:', err)
      return null
    }
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

  static async resetPassword(email: string) {
    const { data, error } = await supabaseBrowser.auth.resetPasswordForEmail(email)
    return { data, error: error?.message }
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
