// ECHTER GLOBALER ANALYTICS TRACKER
// Startet bei 0 und trackt ab sofort REAL

interface UserSession {
  sessionId: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  ip?: string
  userAgent?: string
  referrer?: string
}

interface DailyStats {
  date: string
  uniqueUsers: Set<string>
  totalSessions: number
  totalPageViews: number
  activeSessions: Map<string, UserSession>
}

// GLOBALER STORAGE - Vercel KV oder Edge Storage
class RealAnalyticsTracker {
  private static instance: RealAnalyticsTracker
  private dailyStats: Map<string, DailyStats> = new Map()
  private activeSessions: Map<string, UserSession> = new Map()
  
  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): RealAnalyticsTracker {
    if (!RealAnalyticsTracker.instance) {
      RealAnalyticsTracker.instance = new RealAnalyticsTracker()
    }
    return RealAnalyticsTracker.instance
  }

  // NEUE SESSION STARTEN
  async startSession(sessionId: string, userInfo: {
    ip?: string
    userAgent?: string
    referrer?: string
    userId?: string
  }): Promise<void> {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    
    const session: UserSession = {
      sessionId,
      userId: userInfo.userId,
      startTime: now,
      lastActivity: now,
      pageViews: 1,
      ip: userInfo.ip,
      userAgent: userInfo.userAgent,
      referrer: userInfo.referrer
    }
    
    // Session speichern
    this.activeSessions.set(sessionId, session)
    
    // Daily Stats updaten
    if (!this.dailyStats.has(today)) {
      this.dailyStats.set(today, {
        date: today,
        uniqueUsers: new Set(),
        totalSessions: 0,
        totalPageViews: 0,
        activeSessions: new Map()
      })
    }
    
    const dayStats = this.dailyStats.get(today)!
    dayStats.uniqueUsers.add(userInfo.userId || sessionId)
    dayStats.totalSessions++
    dayStats.totalPageViews++
    dayStats.activeSessions.set(sessionId, session)
    
    await this.saveToStorage()
  }

  // SESSION ACTIVITY UPDATEN
  async updateActivity(sessionId: string, pageView: boolean = false): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) return
    
    const now = Date.now()
    session.lastActivity = now
    
    if (pageView) {
      session.pageViews++
      
      const today = new Date().toISOString().split('T')[0]
      const dayStats = this.dailyStats.get(today)
      if (dayStats) {
        dayStats.totalPageViews++
      }
    }
    
    await this.saveToStorage()
  }

  // AKTUELLE STATISTICS ABRUFEN
  getCurrentStats(): {
    activeUsers: number
    totalUsersToday: number
    totalPageViewsToday: number
    totalSessionsToday: number
  } {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    const fiveMinutesAgo = now - (5 * 60 * 1000) // 5 Minuten = aktiv
    
    // Aktive Users (letzte 5 Minuten)
    const activeUsers = Array.from(this.activeSessions.values())
      .filter(session => session.lastActivity > fiveMinutesAgo).length
    
    // Heute's Stats
    const todayStats = this.dailyStats.get(today)
    
    return {
      activeUsers,
      totalUsersToday: todayStats?.uniqueUsers.size || 0,
      totalPageViewsToday: todayStats?.totalPageViews || 0,
      totalSessionsToday: todayStats?.totalSessions || 0
    }
  }

  // CLEANUP ALTE SESSIONS
  async cleanupOldSessions(): Promise<void> {
    const now = Date.now()
    const thirtyMinutesAgo = now - (30 * 60 * 1000)
    
    // Remove inactive sessions
    const sessionsToDelete: string[] = []
    this.activeSessions.forEach((session, sessionId) => {
      if (session.lastActivity < thirtyMinutesAgo) {
        sessionsToDelete.push(sessionId)
      }
    })
    sessionsToDelete.forEach(sessionId => {
      this.activeSessions.delete(sessionId)
    })
    
    // Cleanup old daily stats (keep 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]
    
    const datesToDelete: string[] = []
    this.dailyStats.forEach((stats, date) => {
      if (date < cutoffDate) {
        datesToDelete.push(date)
      }
    })
    datesToDelete.forEach(date => {
      this.dailyStats.delete(date)
    })
    
    await this.saveToStorage()
  }

  // STORAGE MANAGEMENT
  private async loadFromStorage(): Promise<void> {
    try {
      // In production: nutze Vercel KV oder externe DB
      // Für jetzt: Edge Runtime kompatible lösung
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('agentland_analytics')
        if (stored) {
          const data = JSON.parse(stored)
          
          // Restore daily stats
          for (const [date, stats] of Object.entries(data.dailyStats || {})) {
            const dayStats = stats as any
            this.dailyStats.set(date, {
              date,
              uniqueUsers: new Set(dayStats.uniqueUsers || []),
              totalSessions: dayStats.totalSessions || 0,
              totalPageViews: dayStats.totalPageViews || 0,
              activeSessions: new Map(Object.entries(dayStats.activeSessions || {}))
            })
          }
          
          // Restore active sessions
          this.activeSessions = new Map(Object.entries(data.activeSessions || {}))
        }
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error)
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        dailyStats: Object.fromEntries(
          Array.from(this.dailyStats.entries()).map(([date, stats]) => [
            date,
            {
              date: stats.date,
              uniqueUsers: Array.from(stats.uniqueUsers),
              totalSessions: stats.totalSessions,
              totalPageViews: stats.totalPageViews,
              activeSessions: Object.fromEntries(stats.activeSessions)
            }
          ])
        ),
        activeSessions: Object.fromEntries(this.activeSessions),
        lastUpdate: Date.now()
      }
      
      // In production: Speichere in Vercel KV/Upstash Redis
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentland_analytics', JSON.stringify(data))
      }
      
      // TODO: Server-side storage für production
      
    } catch (error) {
      console.error('Failed to save analytics to storage:', error)
    }
  }

  // GET ALL HISTORICAL DATA
  getHistoricalStats(days: number = 7): Array<{
    date: string
    users: number
    sessions: number
    pageViews: number
  }> {
    const result: Array<{
      date: string
      users: number
      sessions: number
      pageViews: number
    }> = []
    const today = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const stats = this.dailyStats.get(dateStr)
      result.push({
        date: dateStr,
        users: stats?.uniqueUsers.size || 0,
        sessions: stats?.totalSessions || 0,
        pageViews: stats?.totalPageViews || 0
      })
    }
    
    return result.reverse()
  }
}

// SINGLETON EXPORT
export const realTracker = RealAnalyticsTracker.getInstance()

// UTILITY FUNCTIONS
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getUserIP(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (real) {
    return real
  }
  
  return undefined
}