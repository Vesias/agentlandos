import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { z } from 'zod';

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  captcha: z.string().optional(),
  deviceFingerprint: z.string().optional()
});

const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string()
    .min(12, 'Passwort muss mindestens 12 Zeichen haben')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Passwort muss Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen enthalten'),
  passwordConfirm: z.string(),
  municipality: z.string().min(1, 'Gemeinde ist erforderlich'),
  acceptTerms: z.boolean().refine(val => val === true, 'AGB müssen akzeptiert werden'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Datenschutz muss akzeptiert werden'),
  captcha: z.string().min(1, 'CAPTCHA ist erforderlich'),
  gdprConsent: z.boolean().refine(val => val === true, 'DSGVO-Einwilligung erforderlich')
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['passwordConfirm']
});

// Rate limiting storage (use Redis in production)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const limit = rateLimits.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxAttempts) {
    return false;
  }
  
  limit.count++;
  return true;
}

function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Secure login endpoint
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Rate limiting per IP
    if (!checkRateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000)) {
      await logSecurityEvent('rate_limit_exceeded', clientIP, { endpoint: 'login' });
      return NextResponse.json({
        error: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.',
        retryAfter: 900
      }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { email, password, captcha, deviceFingerprint } = validatedData;

    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionCsrf = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
      await logSecurityEvent('csrf_validation_failed', clientIP, { email });
      return NextResponse.json({
        error: 'Sicherheitsfehler. Bitte laden Sie die Seite neu.'
      }, { status: 403 });
    }

    // Verify CAPTCHA (implement with your CAPTCHA provider)
    if (captcha && !await verifyCaptcha(captcha)) {
      await logSecurityEvent('captcha_failed', clientIP, { email });
      return NextResponse.json({
        error: 'CAPTCHA-Verifizierung fehlgeschlagen'
      }, { status: 400 });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      await logSecurityEvent('login_failed', clientIP, { 
        email, 
        error: authError.message,
        deviceFingerprint
      });
      
      // Generic error message to prevent user enumeration
      return NextResponse.json({
        error: 'Ungültige Anmeldedaten'
      }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json({
        error: 'Anmeldung fehlgeschlagen'
      }, { status: 401 });
    }

    // Check if user is verified
    if (!authData.user.email_confirmed_at) {
      return NextResponse.json({
        error: 'Bitte bestätigen Sie Ihre E-Mail-Adresse'
      }, { status: 401 });
    }

    // Update user metadata
    await supabaseServer.from('user_profiles').upsert({
      id: authData.user.id,
      email: authData.user.email,
      last_login: new Date().toISOString(),
      login_count: supabaseServer.sql`COALESCE(login_count, 0) + 1`,
      last_ip: clientIP,
      device_fingerprint: deviceFingerprint
    });

    // Log successful login
    await logSecurityEvent('login_success', clientIP, {
      userId: authData.user.id,
      email: authData.user.email,
      deviceFingerprint
    });

    // Generate new CSRF token for session
    const newCsrfToken = generateCSRFToken();
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: authData.user.user_metadata?.role || 'user'
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at
      },
      responseTime: Date.now() - startTime
    });

    // Set secure session cookies
    response.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    response.cookies.set('session-token', authData.session?.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;

  } catch (error: any) {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    
    await logSecurityEvent('login_error', clientIP, {
      error: error.message,
      stack: error.stack
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Eingabedaten ungültig',
        details: error.errors.map(e => ({ field: e.path[0], message: e.message }))
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'
    }, { status: 500 });
  }
}

// Secure registration endpoint
export async function PUT(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting for registration
    if (!checkRateLimit(`register:${clientIP}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json({
        error: 'Zu viele Registrierungsversuche. Bitte warten Sie 1 Stunde.'
      }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    const { 
      email, 
      password, 
      municipality, 
      captcha,
      gdprConsent 
    } = validatedData;

    // Verify CAPTCHA
    if (!await verifyCaptcha(captcha)) {
      return NextResponse.json({
        error: 'CAPTCHA-Verifizierung fehlgeschlagen'
      }, { status: 400 });
    }

    // Check for existing user
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Don't reveal if user exists (security)
      return NextResponse.json({
        success: true,
        message: 'Registrierung erfolgreich. Bitte prüfen Sie Ihre E-Mails.'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email,
      password,
      options: {
        data: {
          municipality,
          gdpr_consent: gdprConsent,
          registration_ip: clientIP,
          registration_date: new Date().toISOString()
        }
      }
    });

    if (authError) {
      await logSecurityEvent('registration_failed', clientIP, {
        email,
        error: authError.message
      });
      
      return NextResponse.json({
        error: 'Registrierung fehlgeschlagen'
      }, { status: 400 });
    }

    // Create user profile
    if (authData.user) {
      await supabaseServer.from('user_profiles').insert({
        id: authData.user.id,
        email: authData.user.email,
        municipality,
        registration_ip: clientIP,
        gdpr_consent: gdprConsent,
        created_at: new Date().toISOString()
      });

      await logSecurityEvent('registration_success', clientIP, {
        userId: authData.user.id,
        email: authData.user.email,
        municipality
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse.'
    });

  } catch (error: any) {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    
    await logSecurityEvent('registration_error', clientIP, {
      error: error.message
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Eingabedaten ungültig',
        details: error.errors.map(e => ({ field: e.path[0], message: e.message }))
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Registrierung fehlgeschlagen'
    }, { status: 500 });
  }
}

// Secure logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;
    
    if (sessionToken) {
      // Invalidate session in Supabase
      await supabaseServer.auth.admin.signOut(sessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });

    // Clear all auth cookies
    response.cookies.delete('session-token');
    response.cookies.delete('csrf-token');
    response.cookies.delete('refresh-token');

    return response;

  } catch (error) {
    return NextResponse.json({
      error: 'Abmeldung fehlgeschlagen'
    }, { status: 500 });
  }
}

// Security event logging
async function logSecurityEvent(
  eventType: string, 
  clientIP: string, 
  metadata: any = {}
) {
  try {
    await supabaseServer.from('security_events').insert({
      event_type: eventType,
      client_ip: clientIP,
      user_agent: metadata.userAgent,
      metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// CAPTCHA verification (implement with your provider)
async function verifyCaptcha(captcha: string): Promise<boolean> {
  if (!captcha) return false;
  
  try {
    // Example with hCaptcha/reCAPTCHA
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: captcha
      })
    });
    
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('CAPTCHA verification failed:', error);
    return false;
  }
}