'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { useAuth } from '@/contexts/AuthContext'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  const mode = searchParams.get('mode') as 'login' | 'register' || 'login'
  const redirectTo = searchParams.get('redirect') || '/chat'

  useEffect(() => {
    // If user is already authenticated, redirect
    if (user && !loading) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#003399' }}>
            agentland.saarland
          </h1>
          <p className="text-gray-600">
            Ihr digitaler Assistent für das Saarland
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm 
          mode={mode}
          redirectPath={redirectTo}
          onSuccess={(user) => {
            console.log('User authenticated:', user.email)
            router.push(redirectTo)
          }}
          onError={(error) => {
            console.error('Authentication error:', error)
          }}
        />

        {/* Features Preview */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-3" style={{ color: '#003399' }}>
            🚀 Mit Ihrem Konto erhalten Sie Zugang zu:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              DeepSeek KI-Planer für personalisierte Empfehlungen
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Echtzeit-Collaboration mit anderen Nutzern
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              Gespeicherte Planungen und Verlauf
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Premium Services für Business & Verwaltung
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Entwickelt für das Saarland mit 💙 und KI
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}