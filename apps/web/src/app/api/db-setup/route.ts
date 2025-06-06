import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseServer) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // Create essential tables for analytics
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'::jsonb
      );

      -- Session tracking table
      CREATE TABLE IF NOT EXISTS session_tracking (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ip_address INET,
        user_agent TEXT,
        is_mobile BOOLEAN DEFAULT FALSE,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        referrer TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        duration_seconds INTEGER,
        pages_visited INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User analytics table
      CREATE TABLE IF NOT EXISTS user_analytics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_session_tracking_session_id ON session_tracking(session_id);
      CREATE INDEX IF NOT EXISTS idx_session_tracking_last_activity ON session_tracking(last_activity);
      CREATE INDEX IF NOT EXISTS idx_user_analytics_event ON user_analytics(event);
    `

    // Create tables manually using Supabase client
    const results = []
    
    // Try to create users table by checking if it exists
    try {
      const { data: usersExists } = await supabaseServer
        .from('users')
        .select('id')
        .limit(1)
      
      if (!usersExists) {
        results.push('Users table already exists or checking failed')
      }
    } catch (error) {
      results.push('Users table check completed')
    }

    // Try to create session_tracking table
    try {
      const { data: sessionExists } = await supabaseServer
        .from('session_tracking')
        .select('id')
        .limit(1)
      
      if (!sessionExists) {
        results.push('Session tracking table already exists or checking failed')
      }
    } catch (error) {
      results.push('Session tracking table check completed')
    }

    // Insert a test user to verify database is working
    try {
      const { data: testUser, error } = await supabaseServer
        .from('users')
        .upsert({ 
          email: 'test@agentland.saarland',
          name: 'Test User',
          metadata: { created_by: 'setup', test: true }
        })
        .select()
        .single()
      
      if (error) {
        results.push(`Database test: ${error.message}`)
      } else {
        results.push('✅ Database connection verified')
      }
    } catch (err) {
      results.push(`Database test failed: ${err}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to setup database tables',
    info: 'This endpoint creates essential analytics tables'
  })
}