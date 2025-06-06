'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { sessionTracker } from '@/lib/session-tracker'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      sessionTracker.trackPageView(pathname)
    }
  }, [pathname])

  useEffect(() => {
    // Track initial page load
    sessionTracker.trackEvent('page_load', {
      page: pathname,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    })

    // Track when user scrolls (engagement metric)
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        )
        if (scrollPercent > 0) {
          sessionTracker.trackEvent('scroll_engagement', {
            page: pathname,
            scroll_percent: scrollPercent,
          })
        }
      }, 1000) // Debounce scroll events
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [pathname])

  return <>{children}</>
}

// Custom hook for components to track events
export function useAnalytics() {
  const trackEvent = (eventName: string, eventData?: any) => {
    sessionTracker.trackEvent(eventName, eventData)
  }

  const trackPageView = (pagePath?: string) => {
    sessionTracker.trackPageView(pagePath)
  }

  const getSessionInfo = () => ({
    sessionId: sessionTracker.getSessionId(),
    userId: sessionTracker.getUserId(),
    isActive: sessionTracker.isSessionActive(),
  })

  return {
    trackEvent,
    trackPageView,
    getSessionInfo,
  }
}