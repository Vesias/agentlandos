'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import OpenCanvas from '@/components/OpenCanvas'
import { useAuth } from '@/contexts/AuthContext'

function CanvasContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const service = searchParams.get('service') as 'tourism' | 'business' | 'education' | 'admin' | 'culture' || 'general'
  const prompt = searchParams.get('prompt') || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#003399' }}>
                🎨 Open Canvas
              </h1>
              <p className="text-gray-600">
                KI-gestützte Inhaltserstellung für das Saarland
              </p>
            </div>
            
            {user && (
              <div className="text-sm text-gray-600">
                Angemeldet als {user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="h-[calc(100vh-80px)]">
        <OpenCanvas 
          initialPrompt={prompt}
          serviceCategory={service}
          onArtifactGenerated={(artifact) => {
            console.log('Artifact generated:', artifact)
            // Could save to user's artifacts collection here
          }}
        />
      </div>
    </div>
  )
}

export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Open Canvas...</p>
        </div>
      </div>
    }>
      <CanvasContent />
    </Suspense>
  )
}