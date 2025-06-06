import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { session_id, timestamp } = await request.json()
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Update session activity
    await DatabaseService.updateSessionActivity(session_id, false)

    return NextResponse.json({
      success: true,
      session_id,
      timestamp: timestamp || new Date().toISOString(),
      message: 'Activity tracked successfully'
    })

  } catch (error: any) {
    console.error('Activity tracking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to track activity',
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