import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from './src/lib/supabase';

export async function middleware(request: NextRequest) {
  // Apply security headers to all requests
  const response = NextResponse.next();
  
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Custom headers
  response.headers.set('X-Powered-By', 'AGENTLAND.SAARLAND');
  response.headers.set('X-Region', 'Saarland');
  response.headers.set('X-Version', '2.0.0');

  // Check authentication for protected paths
  const protectedPaths = ['/chat', '/admin'];
  const { pathname } = request.nextUrl;
  
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('sb:token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth?mode=login', request.url));
    }

    try {
      const { data: { user } } = await supabaseServer.auth.getUser(token);
      if (!user) {
        return NextResponse.redirect(new URL('/auth?mode=login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth?mode=login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (public health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};