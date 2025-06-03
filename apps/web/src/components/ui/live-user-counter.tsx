'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function LiveUserCounter() {
  const [liveUsers, setLiveUsers] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuliere Live User Count mit realistischen Schwankungen
    const updateUserCount = () => {
      const baseLiveCount = 127 // Basis Live-Nutzeranzahl
      const liveVariation = Math.floor(Math.random() * 23) // 0-22 zusätzliche Live-Nutzer
      const timeBonus = new Date().getHours() >= 9 && new Date().getHours() <= 17 ? 15 : 0 // Arbeitszeit Bonus
      
      const currentLive = baseLiveCount + liveVariation + timeBonus
      setLiveUsers(currentLive)
      
      // Berechne realistische Gesamtnutzer basierend auf Live-Nutzern
      const totalMultiplier = 47 // Realistische Multiplikator für Gesamt vs Live
      const dailyGrowth = Math.floor(new Date().getDate() * 2.3) // Tägliches Wachstum
      const total = currentLive * totalMultiplier + dailyGrowth + 1247 // Basis Gesamtnutzer
      
      setTotalUsers(total)
      setIsLoading(false)
    }

    // Initial load
    updateUserCount()

    // Update alle 30-60 Sekunden mit realistischen Schwankungen
    const interval = setInterval(() => {
      updateUserCount()
    }, Math.random() * 30000 + 30000) // 30-60 Sekunden

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 text-sm text-gray-500">
        <Users className="w-4 h-4 animate-pulse" />
        <span>...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3 text-sm text-gray-600">
      <div className="relative">
        <Users className="w-4 h-4" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-green-600">{liveUsers.toLocaleString()} online</span>
        <span className="text-xs text-gray-500">{totalUsers.toLocaleString()} total</span>
      </div>
    </div>
  )
}