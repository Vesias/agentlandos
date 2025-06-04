'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/lib/supabase'

interface User {
  id: string
  email?: string
  name?: string
  email_confirmed_at?: string
  user_metadata?: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: any; error?: string }>
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ user: any; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await AuthService.signIn(email, password)
      if (result.user && !result.error) {
        setUser(result.user)
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
    setLoading(true)
    try {
      const result = await AuthService.signUp(email, password, metadata)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Benutzerinformationen...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return null
    }

    return <Component {...props} />
  }
}