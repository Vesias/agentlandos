import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id, event_name, event_data, timestamp } = await request.json()
    
    if (!session_id || !event_name) {
      return NextResponse.json(
        { error: 'session_id and event_name are required' },
        { status: 400 }
      )
    }

    // Track custom event
    await DatabaseService.trackUserAnalytics(
      user_id || 'anonymous',
      event_name,
      {
        session_id,
        event_data: event_data || {},
        timestamp: timestamp || new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      session_id,
      event_name,
      message: 'Event tracked successfully'
    })

  } catch (error: any) {
    console.error('Event tracking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to track event',
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