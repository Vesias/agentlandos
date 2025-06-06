'use client'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { TutorialProvider } from '@/contexts/TutorialContext'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TutorialProvider>
        {children}
      </TutorialProvider>
    </AuthProvider>
  )
}
