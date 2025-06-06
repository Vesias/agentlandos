import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, supabaseBrowser } from '@/lib/supabase'

export const runtime = 'nodejs' // Use Node.js runtime for better database connectivity

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Testing database connection...')
    
    const results = {
      server_client: null as any,
      browser_client: null as any,
      environment_check: {
        has_server_client: !!supabaseServer,
        has_browser_client: !!supabaseBrowser,
        url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon_key_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }

    // Test server client if available
    if (supabaseServer) {
      console.log('Testing server client...')
      try {
        const { data, error } = await supabaseServer
          .from('users')
          .select('count')
          .limit(1)
        
        results.server_client = {
          status: error ? 'error' : 'success',
          error: error?.message,
          data_available: !!data,
          connection_test: 'completed'
        }
      } catch (err: any) {
        results.server_client = {
          status: 'exception',
          error: err.message,
          connection_test: 'failed'
        }
      }
    } else {
      results.server_client = {
        status: 'not_configured',
        error: 'Service role key not available'
      }
    }

    // Test browser client
    console.log('Testing browser client...')
    try {
      const { data, error } = await supabaseBrowser
        .from('users')
        .select('count')
        .limit(1)
      
      results.browser_client = {
        status: error ? 'error' : 'success',
        error: error?.message,
        data_available: !!data,
        connection_test: 'completed'
      }
    } catch (err: any) {
      results.browser_client = {
        status: 'exception',
        error: err.message,
        connection_test: 'failed'
      }
    }

    console.log('Database connection test results:', results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      runtime: 'nodejs',
      message: 'Database connection test completed'
    })

  } catch (error: any) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}