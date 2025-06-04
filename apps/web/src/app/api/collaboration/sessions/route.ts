import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, title, category, userId, userName, userColor } = await request.json()
    
    if (!sessionId || !userId) {
      return NextResponse.json({ error: 'Session ID and User ID required' }, { status: 400 })
    }

    if (supabase) {
      try {
        // Create or update collaboration session
        const { data: existingSession } = await supabase
          .from('collaboration_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        const sessionData = {
          id: sessionId,
          title: title || 'Collaborative Planning Session',
          category: category || 'general',
          elements: existingSession?.elements || [],
          users: existingSession?.users || [],
          updated_at: new Date().toISOString()
        }

        if (!existingSession) {
          sessionData['created_at'] = new Date().toISOString()
          await supabase
            .from('collaboration_sessions')
            .insert(sessionData)
        } else {
          await supabase
            .from('collaboration_sessions')
            .update(sessionData)
            .eq('id', sessionId)
        }

        // Add user to session participants
        const user = {
          id: userId,
          name: userName || 'Anonymous User',
          color: userColor || '#3b82f6',
          joined_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        }

        await supabase
          .from('collaboration_participants')
          .upsert({
            session_id: sessionId,
            user_id: userId,
            user_name: user.name,
            user_color: user.color,
            joined_at: user.joined_at,
            last_seen: user.last_seen,
            is_active: true
          })

        return NextResponse.json({ 
          success: true, 
          session: sessionData,
          user
        })

      } catch (supabaseError) {
        console.error('Supabase session error:', supabaseError)
        // Continue without Supabase
      }
    }

    // Fallback without Supabase
    return NextResponse.json({ 
      success: true, 
      session: {
        id: sessionId,
        title: title || 'Collaborative Planning Session',
        category: category || 'general',
        elements: [],
        users: []
      },
      user: {
        id: userId,
        name: userName || 'Anonymous User',
        color: userColor || '#3b82f6'
      }
    })

  } catch (error) {
    console.error('Collaboration session error:', error)
    return NextResponse.json({ 
      error: 'Failed to create/join collaboration session' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    if (supabase) {
      try {
        // Get session data
        const { data: session } = await supabase
          .from('collaboration_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        // Get active participants
        const { data: participants } = await supabase
          .from('collaboration_participants')
          .select('*')
          .eq('session_id', sessionId)
          .eq('is_active', true)
          .order('joined_at', { ascending: true })

        return NextResponse.json({
          success: true,
          session: session || null,
          participants: participants || []
        })

      } catch (supabaseError) {
        console.error('Supabase session fetch error:', supabaseError)
      }
    }

    return NextResponse.json({
      success: true,
      session: null,
      participants: []
    })

  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch session data' 
    }, { status: 500 })
  }
}