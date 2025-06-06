import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface CollaborativeEvent {
  type: 'element_added' | 'element_updated' | 'element_deleted' | 'cursor_moved' | 'user_joined' | 'user_left'
  userId: string
  timestamp: number
  data: any
}

interface CollaborationSession {
  id: string
  title: string
  category: string
  elements: any[]
  users: any[]
  created_at: string
  updated_at: string
}

// Store collaborative events in memory with Supabase persistence
const sessionEvents: { [sessionId: string]: CollaborativeEvent[] } = {}
const sessionUsers: { [sessionId: string]: Set<string> } = {}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, event } = await request.json()
    
    if (!sessionId || !event) {
      return NextResponse.json({ error: 'Session ID and event required' }, { status: 400 })
    }

    // Store event in memory for real-time access
    if (!sessionEvents[sessionId]) {
      sessionEvents[sessionId] = []
    }
    sessionEvents[sessionId].push(event)
    
    // Keep only last 100 events per session
    if (sessionEvents[sessionId].length > 100) {
      sessionEvents[sessionId] = sessionEvents[sessionId].slice(-100)
    }

    // Persist to Supabase for durability
    if (supabase) {
      try {
        // Get or create collaboration session
        const { data: existingSession } = await supabase
          .from('collaboration_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (!existingSession) {
          // Create new session
          await supabase
            .from('collaboration_sessions')
            .insert({
              id: sessionId,
              title: event.data.title || 'Collaborative Planning Session',
              category: event.data.category || 'general',
              elements: [],
              users: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        }

        // Store event in Supabase
        await supabase
          .from('collaboration_events')
          .insert({
            session_id: sessionId,
            event_type: event.type,
            user_id: event.userId,
            event_data: event.data,
            timestamp: new Date(event.timestamp).toISOString()
          })

        // Update session activity
        await supabase
          .from('collaboration_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId)

      } catch (supabaseError) {
        console.error('Supabase collaboration error:', supabaseError)
        // Continue without Supabase - collaboration still works in memory
      }
    }

    // Track active users
    if (!sessionUsers[sessionId]) {
      sessionUsers[sessionId] = new Set()
    }
    sessionUsers[sessionId].add(event.userId)

    return NextResponse.json({ 
      success: true, 
      eventCount: sessionEvents[sessionId].length,
      activeUsers: sessionUsers[sessionId].size
    })

  } catch (error) {
    console.error('Collaboration event error:', error)
    return NextResponse.json({ 
      error: 'Failed to process collaboration event' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    const since = parseInt(url.searchParams.get('since') || '0')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Get events from memory first (fastest)
    const memoryEvents = sessionEvents[sessionId] || []
    const recentEvents = memoryEvents.filter(event => event.timestamp > since)

    // If no recent events in memory, check Supabase
    let supabaseEvents: any[] = []
    if (recentEvents.length === 0 && supabase) {
      try {
        const { data } = await supabase
          .from('collaboration_events')
          .select('*')
          .eq('session_id', sessionId)
          .gt('timestamp', new Date(since).toISOString())
          .order('timestamp', { ascending: true })
          .limit(50)

        supabaseEvents = (data || []).map(row => ({
          type: row.event_type,
          userId: row.user_id,
          timestamp: new Date(row.timestamp).getTime(),
          data: row.event_data
        }))
      } catch (supabaseError) {
        console.error('Supabase fetch error:', supabaseError)
      }
    }

    const allEvents = [...recentEvents, ...supabaseEvents]
      .sort((a, b) => a.timestamp - b.timestamp)

    return NextResponse.json({
      events: allEvents,
      activeUsers: sessionUsers[sessionId]?.size || 0,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Collaboration fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch collaboration events' 
    }, { status: 500 })
  }
}