import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs'

async function baseMiddleware(request: NextRequest) {
  const response = NextResponse.next()

  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Custom headers
  response.headers.set('X-Powered-By', 'AGENTLAND.SAARLAND')
  response.headers.set('X-Region', 'Saarland')
  response.headers.set('X-Version', '2.0.0')

  return response
}

export const middleware = withMiddlewareAuth(baseMiddleware)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
