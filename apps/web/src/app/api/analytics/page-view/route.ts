import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id, page_path, page_title, referrer } = await request.json()
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Update session activity and increment page count
    await DatabaseService.updateSessionActivity(session_id, true)

    // Track page view event
    await DatabaseService.trackUserAnalytics(
      user_id || 'anonymous',
      'page_view',
      {
        session_id,
        page_path,
        page_title,
        referrer,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      session_id,
      page_path,
      message: 'Page view tracked successfully'
    })

  } catch (error: any) {
    console.error('Page view tracking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to track page view',
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