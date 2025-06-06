import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id } = await request.json()
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      )
    }

    // Update session with user ID
    const { data, error } = await supabaseServer
      .from('session_tracking')
      .update({ user_id })
      .eq('session_id', session_id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update session user:', error)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session_id: session_id,
      user_id: user_id,
      message: 'Session user updated successfully'
    })

  } catch (error: any) {
    console.error('Session update error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update session user',
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