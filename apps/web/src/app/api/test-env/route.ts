import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }

    // Get URL prefixes (safe to show)
    const urlPrefixes = {
      SUPABASE_URL_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      ANON_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
      SERVICE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...',
    }

    return NextResponse.json({
      success: true,
      environment_variables: envCheck,
      url_prefixes: urlPrefixes,
      timestamp: new Date().toISOString(),
      message: 'Environment variable check - no sensitive data exposed'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check environment variables',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}