/**
 * Real-time Collaboration Engine for DeepSeek Canvas
 * Enables multi-user planning sessions with live sync
 */

export interface CollaborativeUser {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: number
}

export interface CollaborativeEvent {
  type: 'element_added' | 'element_updated' | 'element_deleted' | 'cursor_moved' | 'user_joined' | 'user_left'
  userId: string
  timestamp: number
  data: any
}

export interface CollaborativeSession {
  id: string
  title: string
  category: string
  elements: any[]
  users: CollaborativeUser[]
  created: number
  lastActivity: number
}

class CollaborationManager {
  private sessionId: string | null = null
  private userId: string
  private userName: string
  private userColor: string
  private ws: WebSocket | null = null
  private callbacks: { [key: string]: Function[] } = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.userId = this.generateUserId()
    this.userName = this.generateUserName()
    this.userColor = this.generateUserColor()
    
    // Try to get authenticated user info
    this.loadAuthenticatedUser()
  }

  private async loadAuthenticatedUser() {
    try {
      // Import AuthService dynamically to avoid SSR issues
      const { AuthService } = await import('@/lib/supabase')
      const user = await AuthService.getCurrentUser()
      
      if (user) {
        this.userId = user.id
        this.userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Benutzer'
      }
    } catch (error) {
      console.log('No authenticated user, using anonymous mode')
    }
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  private generateUserName(): string {
    const adjectives = ['Clever', 'Smart', 'Creative', 'Brilliant', 'Wise', 'Sharp', 'Quick', 'Bright']
    const nouns = ['Planner', 'Thinker', 'Designer', 'Strategist', 'Architect', 'Innovator', 'Creator', 'Builder']
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
  }

  private generateUserColor(): string {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  async joinSession(sessionId: string, title: string, category: string): Promise<boolean> {
    try {
      this.sessionId = sessionId
      
      // Try WebSocket connection first (for real-time)
      if (this.connectWebSocket()) {
        return true
      }
      
      // Fallback to polling for collaboration
      this.startPolling()
      return true
      
    } catch (error) {
      console.error('Failed to join collaboration session:', error)
      return false
    }
  }

  private connectWebSocket(): boolean {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/collaboration/ws?sessionId=${this.sessionId}&userId=${this.userId}&userName=${encodeURIComponent(this.userName)}&userColor=${encodeURIComponent(this.userColor)}`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('🤝 Collaborative session connected')
        this.reconnectAttempts = 0
        this.emit('connected', { userId: this.userId, userName: this.userName })
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleCollaborativeEvent(message)
        } catch (error) {
          console.error('Error parsing collaboration message:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('🔌 Collaborative session disconnected')
        this.emit('disconnected', {})
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error)
        return false
      }
      
      return true
      
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      return false
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, switching to polling mode')
      this.startPolling()
      return
    }

    setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connectWebSocket()
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
  }

  private startPolling() {
    // Fallback polling mechanism for collaboration
    const pollInterval = setInterval(async () => {
      if (!this.sessionId) {
        clearInterval(pollInterval)
        return
      }

      try {
        const response = await fetch(`/api/collaboration/poll?sessionId=${this.sessionId}&userId=${this.userId}`)
        if (response.ok) {
          const events = await response.json()
          events.forEach((event: CollaborativeEvent) => this.handleCollaborativeEvent(event))
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000) // Poll every 2 seconds
  }

  private handleCollaborativeEvent(event: CollaborativeEvent) {
    // Don't process our own events
    if (event.userId === this.userId) return
    
    switch (event.type) {
      case 'element_added':
        this.emit('elementAdded', event.data)
        break
      case 'element_updated':
        this.emit('elementUpdated', event.data)
        break
      case 'element_deleted':
        this.emit('elementDeleted', event.data)
        break
      case 'cursor_moved':
        this.emit('cursorMoved', event.data)
        break
      case 'user_joined':
        this.emit('userJoined', event.data)
        break
      case 'user_left':
        this.emit('userLeft', event.data)
        break
    }
  }

  broadcastElementAdded(element: any) {
    this.sendEvent('element_added', element)
  }

  broadcastElementUpdated(element: any) {
    this.sendEvent('element_updated', element)
  }

  broadcastElementDeleted(elementId: string) {
    this.sendEvent('element_deleted', { elementId })
  }

  broadcastCursorMoved(x: number, y: number) {
    this.sendEvent('cursor_moved', { x, y, userId: this.userId, userName: this.userName, userColor: this.userColor })
  }

  private sendEvent(type: string, data: any) {
    const event: CollaborativeEvent = {
      type: type as any,
      userId: this.userId,
      timestamp: Date.now(),
      data
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    } else {
      // Fallback to HTTP for events
      this.sendEventHTTP(event)
    }
  }

  private async sendEventHTTP(event: CollaborativeEvent) {
    try {
      await fetch('/api/collaboration/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, event })
      })
    } catch (error) {
      console.error('Failed to send event via HTTP:', error)
    }
  }

  on(eventType: string, callback: Function) {
    if (!this.callbacks[eventType]) {
      this.callbacks[eventType] = []
    }
    this.callbacks[eventType].push(callback)
  }

  off(eventType: string, callback: Function) {
    if (this.callbacks[eventType]) {
      this.callbacks[eventType] = this.callbacks[eventType].filter(cb => cb !== callback)
    }
  }

  private emit(eventType: string, data: any) {
    if (this.callbacks[eventType]) {
      this.callbacks[eventType].forEach(callback => callback(data))
    }
  }

  leaveSession() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.sessionId = null
  }

  getUserInfo() {
    return {
      id: this.userId,
      name: this.userName,
      color: this.userColor
    }
  }

  generateSessionId(prompt: string, category: string): string {
    const hash = prompt.toLowerCase().replace(/\s+/g, '-').substring(0, 20)
    const timestamp = Date.now().toString(36)
    return `${category}-${hash}-${timestamp}`
  }
}

export const collaborationManager = new CollaborationManager()
export default collaborationManager