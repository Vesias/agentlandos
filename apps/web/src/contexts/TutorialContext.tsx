'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/lib/supabase'

interface TutorialContextValue {
  showTutorial: boolean
  finishTutorial: () => void
}

const TutorialContext = createContext<TutorialContextValue>({
  showTutorial: false,
  finishTutorial: () => {}
})

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const user = await AuthService.getCurrentUser()
        const visited = localStorage.getItem('tutorial_seen')
        if (!visited || !user) {
          setShowTutorial(true)
        }
      } catch {
        setShowTutorial(true)
      }
    }
    check()
  }, [])

  const finishTutorial = () => {
    localStorage.setItem('tutorial_seen', 'true')
    setShowTutorial(false)
  }

  return (
    <TutorialContext.Provider value={{ showTutorial, finishTutorial }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  return useContext(TutorialContext)
}
