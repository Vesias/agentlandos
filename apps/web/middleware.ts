import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from './src/lib/supabase'

export async function middleware(request: NextRequest) {
  const protectedPaths = ['/chat', '/admin']
  const { pathname } = request.nextUrl
  if (!protectedPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('sb:token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth?mode=login', request.url))
  }

  const { data: { user } } = await supabaseServer.auth.getUser(token)
  if (!user) {
    return NextResponse.redirect(new URL('/auth?mode=login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*']
}
