import { NextRequest, NextResponse } from 'next/server';

// Supabase client - only create if needed
function getSupabaseClient() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  } catch (error) {
    console.warn('Supabase not available in middleware');
    return null;
  }
}

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://hcaptcha.com https://*.hcaptcha.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.deepseek.com https://generativelanguage.googleapis.com https://hcaptcha.com",
    "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessful?: boolean;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth/secure': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  '/api/chat': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
  '/api/chat/fast': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  '/api/stripe': { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 requests per 5 minutes
  '/api/registration': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  'default': { windowMs: 60 * 1000, maxRequests: 100 } // Default rate limit
};

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(pathname: string): RateLimitConfig {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

function checkRateLimit(identifier: string, config: RateLimitConfig): {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || current.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime
    };
  }
  
  if (current.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  current.count++;
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime
  };
}

async function validateJWT(token: string): Promise<{ valid: boolean; user?: any }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { valid: false };
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { valid: false };
    }
    
    return { valid: true, user };
  } catch (error) {
    return { valid: false };
  }
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || 'unknown';
  
  // Include User-Agent for more specific identification
  const userAgent = request.headers.get('user-agent') || '';
  const deviceId = request.headers.get('x-device-id') || '';
  
  return `${ip}:${deviceId}:${userAgent.substring(0, 50)}`;
}

export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Get client identifier for rate limiting
  const clientId = getClientIdentifier(request);
  const rateConfig = getRateLimit(pathname);
  const rateLimitResult = checkRateLimit(clientId, rateConfig);
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
  
  // Block if rate limit exceeded
  if (!rateLimitResult.success) {
    // Log rate limit violation
    await logSecurityEvent('rate_limit_exceeded', {
      clientId,
      pathname,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  // Enhanced security for API routes
  if (pathname.startsWith('/api/')) {
    // CORS configuration
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://agentland.saarland',
      'https://www.agentland.saarland',
      process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
    ].filter(Boolean);
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Device-ID');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: Object.fromEntries(response.headers.entries())
      });
    }
    
    // Validate Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid Content-Type' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionCsrf = request.cookies.get('csrf-token')?.value;
      
      // Skip CSRF for specific endpoints (like auth login)
      const csrfExemptPaths = ['/api/auth/secure'];
      const isExempt = csrfExemptPaths.some(path => pathname.startsWith(path));
      
      if (!isExempt && (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf)) {
        await logSecurityEvent('csrf_violation', {
          pathname,
          clientId,
          hasToken: !!csrfToken,
          hasSession: !!sessionCsrf
        });
        
        return new NextResponse(
          JSON.stringify({ error: 'CSRF token invalid' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }
  
  // Authentication checks for protected routes
  const protectedPaths = ['/api/premium', '/api/analytics', '/api/admin'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    const sessionToken = request.cookies.get('session-token')?.value ||
                        request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { valid, user } = await validateJWT(sessionToken);
    
    if (!valid) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add user info to headers for downstream use
    response.headers.set('X-User-ID', user.id);
    response.headers.set('X-User-Email', user.email);
  }
  
  return response;
}

async function logSecurityEvent(eventType: string, metadata: any) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Security event not logged - Supabase unavailable:', eventType);
      return;
    }
    
    await supabase.from('security_events').insert({
      event_type: eventType,
      metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Export for use in middleware.ts
export { securityMiddleware as default };