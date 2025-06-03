'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function LiveUserCounter() {
  const [liveUsers, setLiveUsers] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ECHTE USER ANALYTICS - KEINE FAKE DATEN
    const fetchRealUserData = async () => {
      try {
        const response = await fetch('/api/analytics/real-users')
        
        if (response.ok) {
          const data = await response.json()
          
          // Nutze nur echte Daten
          setLiveUsers(data.activeUsers || 0)
          setTotalUsers(data.totalUsers || 0)
          setIsLoading(false)
          
          console.log('✅ Real user data loaded:', {
            live: data.activeUsers,
            total: data.totalUsers,
            source: data.source
          })
        } else {
          // Bei API-Fehler: Zeige 0 statt fake Daten
          setLiveUsers(0)
          setTotalUsers(0)
          setIsLoading(false)
          
          console.log('ℹ️ Real analytics unavailable - showing actual zeros')
        }
      } catch (error) {
        console.error('Real analytics fetch failed:', error)
        
        // KEINE FAKE DATEN - zeige echte Nullwerte
        setLiveUsers(0)
        setTotalUsers(0)
        setIsLoading(false)
      }
    }

    // Initial load
    fetchRealUserData()

    // Update alle 2 Minuten (echte Analytics)
    const interval = setInterval(() => {
      fetchRealUserData()
    }, 2 * 60 * 1000) // 2 Minuten

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