// CLIENT-SIDE REAL TRACKER
// Automatisches Session-Management und Activity-Tracking

class ClientTracker {
  private sessionId: string | null = null
  private lastActivity: number = 0
  private activityTimer: NodeJS.Timeout | null = null
  private pageViewTimer: NodeJS.Timeout | null = null
  private isTracking: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    // Session aus localStorage wiederherstellen oder neue erstellen
    const stored = localStorage.getItem('agentland_session')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        const now = Date.now()
        
        // Session ist noch gültig (< 30 Minuten alt)
        if (now - session.lastActivity < 30 * 60 * 1000) {
          this.sessionId = session.sessionId
          this.lastActivity = session.lastActivity
        }
      } catch (e) {
        // Invalid session, start new
      }
    }

    if (!this.sessionId) {
      await this.startNewSession()
    } else {
      // Existing session - update activity
      await this.updateActivity()
    }

    this.setupActivityTracking()
    this.setupPageViewTracking()
  }

  private async startNewSession() {
    try {
      const response = await fetch('/api/analytics/real-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start_session',
          userId: this.getUserId(),
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        this.sessionId = data.sessionId
        this.lastActivity = Date.now()
        this.isTracking = true
        
        // Session speichern
        localStorage.setItem('agentland_session', JSON.stringify({
          sessionId: this.sessionId,
          lastActivity: this.lastActivity,
          startTime: this.lastActivity
        }))

        console.log('🚀 AGENTLAND REAL TRACKING STARTED:', this.sessionId)
      }
    } catch (error) {
      console.error('Failed to start tracking session:', error)
    }
  }

  private async trackPageView() {
    if (!this.sessionId || !this.isTracking) return

    try {
      await fetch('/api/analytics/real-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'page_view',
          sessionId: this.sessionId,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      })

      console.log('📄 Page view tracked:', window.location.pathname)
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  private async updateActivity() {
    if (!this.sessionId || !this.isTracking) return

    this.lastActivity = Date.now()
    
    // Update localStorage
    const session = JSON.parse(localStorage.getItem('agentland_session') || '{}')
    session.lastActivity = this.lastActivity
    localStorage.setItem('agentland_session', JSON.stringify(session))

    try {
      await fetch('/api/analytics/real-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'activity',
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to update activity:', error)
    }
  }

  private setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const throttledUpdate = this.throttle(() => {
      this.updateActivity()
    }, 30000) // Alle 30 Sekunden maximal

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true })
    })

    // Regelmäßige Updates alle 2 Minuten
    this.activityTimer = setInterval(() => {
      this.updateActivity()
    }, 2 * 60 * 1000)
  }

  private setupPageViewTracking() {
    // Track initial page view
    this.trackPageView()

    // Track page changes in SPA
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(() => clientTracker.trackPageView(), 100)
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(() => clientTracker.trackPageView(), 100)
    }

    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageView(), 100)
    })
  }

  private getUserId(): string | undefined {
    // Check for existing user ID (könnte aus Auth kommen)
    const stored = localStorage.getItem('agentland_user_id')
    if (stored) return stored

    // Generate anonymous user ID
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('agentland_user_id', anonymousId)
    return anonymousId
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // PUBLIC METHODS
  public trackCustomEvent(eventName: string, data?: any) {
    if (!this.sessionId || !this.isTracking) return

    fetch('/api/realtime/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activity_type: eventName,
        sessionId: this.sessionId,
        metadata: data,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to track custom event:', error)
    })
  }

  public getCurrentSessionId(): string | null {
    return this.sessionId
  }

  public destroy() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
    }
    if (this.pageViewTimer) {
      clearInterval(this.pageViewTimer)
    }
    this.isTracking = false
  }
}

// GLOBAL INSTANCE
export const clientTracker = new ClientTracker()

// AUTO-INIT bei Window Load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('🎯 AGENTLAND REAL ANALYTICS: Client tracker initialized')
  })

  // Cleanup bei Page Unload
  window.addEventListener('beforeunload', () => {
    clientTracker.destroy()
  })
}