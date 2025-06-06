import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from './src/lib/supabase'

export async function middleware(request: NextRequest) {
  const protectedPaths = ['/chat', '/admin']
  const { pathname } = request.nextUrl

  if (protectedPaths.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('sb:token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/auth?mode=login', request.url))
    }
    const { data: { user } } = await supabaseServer.auth.getUser(token)
    if (!user) {
      return NextResponse.redirect(new URL('/auth?mode=login', request.url))
    }
  }

  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Powered-By', 'AGENTLAND.SAARLAND')
  response.headers.set('X-Region', 'Saarland')
  response.headers.set('X-Version', '2.0.0')
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
