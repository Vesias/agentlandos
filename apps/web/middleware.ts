import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityMiddleware } from './src/middleware/security';

export async function middleware(request: NextRequest) {
  // Apply security middleware
  const securityResponse = await securityMiddleware(request);
  
  // If security middleware returns a response (like rate limiting), use it
  if (securityResponse.status !== 200 || securityResponse.headers.get('x-middleware-override')) {
    return securityResponse;
  }
  
  // Additional custom middleware logic can go here
  const response = NextResponse.next();
  
  // Copy security headers from security middleware
  securityResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  // Add custom headers
  response.headers.set('X-Powered-By', 'AGENTLAND.SAARLAND');
  response.headers.set('X-Region', 'Saarland');
  response.headers.set('X-Version', '2.0.0');
  
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