'use client'

import { supabaseBrowser } from './supabase'

class SessionTracker {
  private sessionId: string | null = null
  private userId: string | null = null
  private isTracking = false
  private activityTimer: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId()
    
    // Get current user if logged in
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    this.userId = session?.user?.id || null

    // Start tracking
    await this.startSession()
    
    // Listen for auth changes
    supabaseBrowser.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null
      if (newUserId !== this.userId) {
        this.userId = newUserId
        this.updateSessionUser()
      }
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTracking()
      } else {
        this.resumeTracking()
      }
    })

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })

    // Track page views
    this.trackPageView()
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('agentland_session_id')
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('agentland_session_id', sessionId)
    }
    
    return sessionId
  }

  private async startSession() {
    if (!this.sessionId) return

    try {
      const sessionData = {
        session_id: this.sessionId,
        user_id: this.userId,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        is_mobile: this.isMobile(),
        utm_source: this.getUTMParam('utm_source'),
        utm_medium: this.getUTMParam('utm_medium'),
        utm_campaign: this.getUTMParam('utm_campaign'),
        referrer: document.referrer || null,
      }

      await fetch('/api/analytics/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })

      this.isTracking = true
      this.startActivityTimer()
    } catch (error) {
      console.error('Failed to start session tracking:', error)
    }
  }

  private async endSession() {
    if (!this.sessionId || !this.isTracking) return

    try {
      await fetch('/api/analytics/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: this.sessionId }),
      })
      
      this.isTracking = false
      if (this.activityTimer) {
        clearInterval(this.activityTimer)
      }
    } catch (error) {
      console.error('Failed to end session tracking:', error)
    }
  }

  private async updateSessionUser() {
    if (!this.sessionId) return

    try {
      await fetch('/api/analytics/session/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: this.sessionId,
          user_id: this.userId 
        }),
      })
    } catch (error) {
      console.error('Failed to update session user:', error)
    }
  }

  private startActivityTimer() {
    // Send activity ping every 30 seconds
    this.activityTimer = setInterval(() => {
      this.trackActivity()
    }, 30000)
  }

  private pauseTracking() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
      this.activityTimer = null
    }
  }

  private resumeTracking() {
    if (this.isTracking && !this.activityTimer) {
      this.startActivityTimer()
      this.trackActivity()
    }
  }

  public async trackPageView(pagePath?: string) {
    if (!this.sessionId) return

    try {
      await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_id: this.userId,
          page_path: pagePath || window.location.pathname,
          page_title: document.title,
          referrer: document.referrer || null,
        }),
      })
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  public async trackEvent(eventName: string, eventData?: any) {
    if (!this.sessionId) return

    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_id: this.userId,
          event_name: eventName,
          event_data: eventData || {},
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  private async trackActivity() {
    if (!this.sessionId) return

    try {
      await fetch('/api/analytics/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error('Failed to track activity:', error)
    }
  }

  private async getClientIP(): Promise<string | null> {
    try {
      // Use a public IP service or extract from headers
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || null
    } catch {
      return null
    }
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  private getUTMParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  }

  // Public methods for manual tracking
  public getSessionId(): string | null {
    return this.sessionId
  }

  public getUserId(): string | null {
    return this.userId
  }

  public isSessionActive(): boolean {
    return this.isTracking
  }
}

// Create singleton instance
export const sessionTracker = new SessionTracker()

// Export for components that need direct access
export default sessionTracker