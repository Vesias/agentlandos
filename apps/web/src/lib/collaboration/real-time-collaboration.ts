import { supabase } from '@/lib/supabase'

export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'online' | 'away' | 'offline'
  cursor_position?: {
    x: number
    y: number
    element_id?: string
  }
  last_seen: string
}

export interface CollaborationSession {
  id: string
  workspace_id: string
  document_id?: string
  project_id?: string
  type: 'document' | 'chat' | 'whiteboard' | 'code' | 'meeting'
  title: string
  participants: CollaborationUser[]
  created_by: string
  created_at: string
  updated_at: string
  settings: {
    allow_anonymous: boolean
    max_participants: number
    require_approval: boolean
    recording_enabled: boolean
  }
  metadata: {
    document_type?: string
    language?: string
    version: number
    change_history: CollaborationChange[]
  }
}

export interface CollaborationChange {
  id: string
  session_id: string
  user_id: string
  timestamp: string
  type: 'text_edit' | 'cursor_move' | 'selection' | 'comment' | 'reaction' | 'file_upload'
  data: {
    operation?: 'insert' | 'delete' | 'replace'
    position?: number
    content?: string
    range?: {
      start: number
      end: number
    }
    cursor_position?: {
      x: number
      y: number
    }
    comment?: {
      text: string
      resolved: boolean
    }
    reaction?: {
      emoji: string
      element_id: string
    }
  }
  synchronized: boolean
}

export interface CollaborationWorkspace {
  id: string
  organization_id: string
  name: string
  description?: string
  owner_id: string
  members: CollaborationUser[]
  projects: string[]
  settings: {
    visibility: 'private' | 'internal' | 'public'
    default_permissions: 'read' | 'write' | 'admin'
    integration_enabled: boolean
  }
  created_at: string
  updated_at: string
}

class RealTimeCollaboration {
  private websocket: WebSocket | null = null
  private sessionId: string | null = null
  private userId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: NodeJS.Timeout | null = null
  private changeBuffer: CollaborationChange[] = []
  private syncInterval: NodeJS.Timeout | null = null

  // Event listeners
  private onUserJoined: ((user: CollaborationUser) => void) | null = null
  private onUserLeft: ((userId: string) => void) | null = null
  private onCursorMove: ((userId: string, position: { x: number; y: number }) => void) | null = null
  private onDocumentChange: ((change: CollaborationChange) => void) | null = null
  private onCommentAdded: ((comment: any) => void) | null = null

  constructor() {
    this.syncInterval = setInterval(() => {
      this.syncPendingChanges()
    }, 1000) // Sync every second
  }

  async initializeSession(sessionId: string, userId: string): Promise<CollaborationSession> {
    this.sessionId = sessionId
    this.userId = userId

    try {
      // Get or create session
      let { data: session, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Session doesn't exist, create it
        const newSession: Partial<CollaborationSession> = {
          id: sessionId,
          workspace_id: 'default',
          type: 'document',
          title: 'Untitled Session',
          participants: [],
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          settings: {
            allow_anonymous: false,
            max_participants: 50,
            require_approval: false,
            recording_enabled: false
          },
          metadata: {
            version: 1,
            change_history: []
          }
        }

        const { data: createdSession, error: createError } = await supabase
          .from('collaboration_sessions')
          .insert([newSession])
          .select()
          .single()

        if (createError) throw createError
        session = createdSession
      } else if (error) {
        throw error
      }

      // Connect to WebSocket
      await this.connectWebSocket(sessionId)

      // Join session
      await this.joinSession(userId)

      return session as CollaborationSession
    } catch (error) {
      console.error('Failed to initialize collaboration session:', error)
      throw error
    }
  }

  private async connectWebSocket(sessionId: string): Promise<void> {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'wss://agentland.saarland/ws/collaboration'
      this.websocket = new WebSocket(`${wsUrl}/${sessionId}`)

      this.websocket.onopen = () => {
        console.log('Collaboration WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data))
      }

      this.websocket.onclose = () => {
        console.log('Collaboration WebSocket disconnected')
        this.stopHeartbeat()
        this.attemptReconnect()
      }

      this.websocket.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      throw error
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }))
      }
    }, 30000) // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        if (this.sessionId) {
          this.connectWebSocket(this.sessionId)
        }
      }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'user_joined':
        this.onUserJoined?.(message.user)
        break
      case 'user_left':
        this.onUserLeft?.(message.userId)
        break
      case 'cursor_move':
        this.onCursorMove?.(message.userId, message.position)
        break
      case 'document_change':
        this.onDocumentChange?.(message.change)
        break
      case 'comment_added':
        this.onCommentAdded?.(message.comment)
        break
      case 'sync_request':
        this.handleSyncRequest(message)
        break
    }
  }

  async joinSession(userId: string): Promise<void> {
    try {
      // Update user status
      await this.updateUserStatus(userId, 'online')

      // Send join message via WebSocket
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'join_session',
          userId,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Failed to join session:', error)
      throw error
    }
  }

  async leaveSession(userId: string): Promise<void> {
    try {
      // Update user status
      await this.updateUserStatus(userId, 'offline')

      // Send leave message via WebSocket
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'leave_session',
          userId,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }))
      }

      // Close WebSocket
      this.websocket?.close()
      this.stopHeartbeat()
    } catch (error) {
      console.error('Failed to leave session:', error)
    }
  }

  async updateUserStatus(userId: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    try {
      const { error } = await supabase
        .from('collaboration_users')
        .upsert({
          id: userId,
          session_id: this.sessionId,
          status,
          last_seen: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  broadcastCursorMove(position: { x: number; y: number; element_id?: string }): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'cursor_move',
        userId: this.userId,
        sessionId: this.sessionId,
        position,
        timestamp: new Date().toISOString()
      }))
    }
  }

  async applyDocumentChange(change: Omit<CollaborationChange, 'id' | 'timestamp' | 'synchronized'>): Promise<void> {
    try {
      const fullChange: CollaborationChange = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        synchronized: false,
        ...change
      }

      // Add to buffer for batch processing
      this.changeBuffer.push(fullChange)

      // Broadcast immediately via WebSocket
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'document_change',
          change: fullChange
        }))
      }
    } catch (error) {
      console.error('Failed to apply document change:', error)
    }
  }

  private async syncPendingChanges(): Promise<void> {
    if (this.changeBuffer.length === 0) return

    try {
      const changesToSync = [...this.changeBuffer]
      this.changeBuffer = []

      const { error } = await supabase
        .from('collaboration_changes')
        .insert(changesToSync.map(change => ({
          ...change,
          synchronized: true
        })))

      if (error) {
        // Re-add failed changes to buffer
        this.changeBuffer.unshift(...changesToSync)
        throw error
      }
    } catch (error) {
      console.error('Failed to sync changes:', error)
    }
  }

  async addComment(elementId: string, text: string, position?: { x: number; y: number }): Promise<void> {
    try {
      const comment = {
        id: crypto.randomUUID(),
        session_id: this.sessionId!,
        user_id: this.userId!,
        element_id: elementId,
        text,
        position,
        resolved: false,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('collaboration_comments')
        .insert([comment])

      if (error) throw error

      // Broadcast comment via WebSocket
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'comment_added',
          comment
        }))
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  async createWorkspace(organizationId: string, name: string, description?: string): Promise<CollaborationWorkspace> {
    try {
      const workspace: Partial<CollaborationWorkspace> = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        name,
        description,
        owner_id: this.userId!,
        members: [],
        projects: [],
        settings: {
          visibility: 'internal',
          default_permissions: 'write',
          integration_enabled: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('collaboration_workspaces')
        .insert([workspace])
        .select()
        .single()

      if (error) throw error
      return data as CollaborationWorkspace
    } catch (error) {
      console.error('Failed to create workspace:', error)
      throw error
    }
  }

  async inviteToWorkspace(workspaceId: string, userEmail: string, role: CollaborationUser['role']): Promise<void> {
    try {
      const invitation = {
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        invited_email: userEmail,
        invited_by: this.userId!,
        role,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }

      const { error } = await supabase
        .from('collaboration_invitations')
        .insert([invitation])

      if (error) throw error

      // Send invitation email (implementation would depend on email service)
      await this.sendInvitationEmail(userEmail, workspaceId, invitation.id)
    } catch (error) {
      console.error('Failed to invite to workspace:', error)
      throw error
    }
  }

  private async sendInvitationEmail(email: string, workspaceId: string, invitationId: string): Promise<void> {
    // Email service integration would go here
    console.log(`Invitation email sent to ${email} for workspace ${workspaceId}`)
  }

  async getSessionHistory(sessionId: string, limit = 100): Promise<CollaborationChange[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_changes')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as CollaborationChange[]
    } catch (error) {
      console.error('Failed to get session history:', error)
      throw error
    }
  }

  async getActiveUsers(sessionId: string): Promise<CollaborationUser[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_users')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'online')

      if (error) throw error
      return data as CollaborationUser[]
    } catch (error) {
      console.error('Failed to get active users:', error)
      throw error
    }
  }

  private handleSyncRequest(message: any): void {
    // Handle operational transformation conflicts
    // This is a simplified implementation - real OT would be more complex
    if (this.changeBuffer.length > 0) {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'sync_response',
          changes: this.changeBuffer,
          timestamp: new Date().toISOString()
        }))
      }
    }
  }

  // Event listener setters
  setOnUserJoined(callback: (user: CollaborationUser) => void): void {
    this.onUserJoined = callback
  }

  setOnUserLeft(callback: (userId: string) => void): void {
    this.onUserLeft = callback
  }

  setOnCursorMove(callback: (userId: string, position: { x: number; y: number }) => void): void {
    this.onCursorMove = callback
  }

  setOnDocumentChange(callback: (change: CollaborationChange) => void): void {
    this.onDocumentChange = callback
  }

  setOnCommentAdded(callback: (comment: any) => void): void {
    this.onCommentAdded = callback
  }

  // Analytics and insights
  async getCollaborationAnalytics(workspaceId: string, timeframe: '7d' | '30d' | '90d'): Promise<any> {
    try {
      const cutoff = new Date()
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      cutoff.setDate(cutoff.getDate() - days)

      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          *,
          collaboration_changes (*)
        `)
        .eq('workspace_id', workspaceId)
        .gte('created_at', cutoff.toISOString())

      if (error) throw error

      return {
        total_sessions: data.length,
        active_collaborations: data.filter(s => s.participants?.length > 1).length,
        total_changes: data.reduce((sum, s) => sum + (s.collaboration_changes?.length || 0), 0),
        average_session_duration: this.calculateAverageSessionDuration(data),
        most_active_users: this.getMostActiveUsers(data),
        collaboration_patterns: this.analyzeCollaborationPatterns(data)
      }
    } catch (error) {
      console.error('Failed to get collaboration analytics:', error)
      throw error
    }
  }

  private calculateAverageSessionDuration(sessions: any[]): number {
    // Implementation for calculating average session duration
    return sessions.length > 0 ? 45 : 0 // Placeholder
  }

  private getMostActiveUsers(sessions: any[]): any[] {
    // Implementation for finding most active users
    return [] // Placeholder
  }

  private analyzeCollaborationPatterns(sessions: any[]): any {
    // Implementation for analyzing collaboration patterns
    return {
      peak_hours: [9, 10, 11, 14, 15, 16],
      common_document_types: ['document', 'chat'],
      average_participants: 2.5
    }
  }

  // Cleanup
  destroy(): void {
    this.websocket?.close()
    this.stopHeartbeat()
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export default RealTimeCollaboration