'use client'

import { useEffect } from 'react'

// CLIENT-COMPONENT für automatisches Analytics-Tracking
export default function RealAnalyticsTracker() {
  useEffect(() => {
    // Dynamically import client tracker to avoid SSR issues
    const initTracker = async () => {
      try {
        const { clientTracker } = await import('@/lib/clientTracker')
        
        // Tracker ist bereits global initialisiert
        console.log('🎯 AGENTLAND REAL ANALYTICS: Client tracker loaded')
        
        // Optional: Track app initialization
        clientTracker.trackCustomEvent('app_loaded', {
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        })
        
      } catch (error) {
        console.error('Failed to initialize analytics tracker:', error)
      }
    }

    initTracker()
  }, [])

  // Invisible component - nur für Tracking
  return null
}