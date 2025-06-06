export function generateSessionId() {
  return Math.random().toString(36).slice(2)
}

export function getUserIP(req: Request) {
  return req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || ''
}

class RealTracker {
  private sessions = new Map<string, { lastActivity: number }>()

  startSession(id: string, _data: any) {
    this.sessions.set(id, { lastActivity: Date.now() })
  }

  updateActivity(id: string, _pageView: boolean) {
    const session = this.sessions.get(id)
    if (session) session.lastActivity = Date.now()
  }

  getCurrentStats() {
    return {
      activeUsers: this.sessions.size,
      totalPageViewsToday: 0,
      totalSessionsToday: this.sessions.size
    }
  }

  async cleanupOldSessions() {
    const now = Date.now()
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > 1000 * 60 * 60) {
        this.sessions.delete(id)
      }
    }
  }
}

export const realTracker = new RealTracker()
