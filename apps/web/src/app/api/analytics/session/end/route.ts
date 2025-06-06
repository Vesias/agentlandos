import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json()
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // End session in database
    const session = await DatabaseService.endSession(session_id)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or already ended' },
        { status: 404 }
      )
    }

    // Track session end metric
    await DatabaseService.trackUserAnalytics(
      session.user_id || 'anonymous',
      'session_end',
      {
        session_id: session_id,
        duration_seconds: session.duration_seconds,
        pages_visited: session.pages_visited,
      }
    )

    return NextResponse.json({
      success: true,
      session_id: session_id,
      duration_seconds: session.duration_seconds,
      pages_visited: session.pages_visited,
      message: 'Session ended successfully'
    })

  } catch (error: any) {
    console.error('Session end error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to end session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}