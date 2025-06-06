'use client'
import { useState } from 'react'
import { useTutorial } from '@/contexts/TutorialContext'
import { Button } from '@/components/ui/button'

export default function GlobalTutorial() {
  const { showTutorial, finishTutorial } = useTutorial()
  const [step, setStep] = useState(0)

  if (!showTutorial) return null

  const steps = [
    'Willkommen bei AGENTLAND.SAARLAND! Dieses Tutorial zeigt Ihnen die wichtigsten Bereiche.',
    'Oben finden Sie das Menü mit Zugriff auf Chat, Canvas und Services.',
    'Viel Spaß beim Entdecken unserer KI-Angebote!'
  ]

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      finishTutorial()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl max-w-sm text-center space-y-4">
        <p>{steps[step]}</p>
        <Button onClick={next}>{step < steps.length - 1 ? 'Weiter' : 'Fertig'}</Button>
      </div>
    </div>
  )
}
