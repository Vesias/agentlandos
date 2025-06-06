import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()
    
    // Validate required fields
    if (!sessionData.session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Create session in database
    const session = await DatabaseService.createSession(sessionData)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Track session start metric
    await DatabaseService.trackUserAnalytics(
      sessionData.user_id || 'anonymous',
      'session_start',
      {
        session_id: sessionData.session_id,
        is_mobile: sessionData.is_mobile,
        utm_source: sessionData.utm_source,
        utm_medium: sessionData.utm_medium,
        utm_campaign: sessionData.utm_campaign,
        referrer: sessionData.referrer,
      }
    )

    return NextResponse.json({
      success: true,
      session_id: sessionData.session_id,
      message: 'Session started successfully'
    })

  } catch (error: any) {
    console.error('Session start error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start session',
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