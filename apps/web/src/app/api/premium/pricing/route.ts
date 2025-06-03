import { NextRequest, NextResponse } from 'next/server'
import { profitEngine, CONVERSION_TRIGGERS } from '@/lib/monetization/profit-engine'

// PREMIUM PRICING API
// Dynamische Preisgestaltung & Conversion Optimization

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('userId');

    // User-Profile Analysis für Pricing
    const userProfile = await analyzeUserProfile(userId);
    
    // Recommendation Engine
    const recommendedTier = profitEngine.calculatePricingRecommendation(userProfile);
    
    // Revenue Analytics
    const revenueBreakdown = profitEngine.getRevenueBreakdown();
    
    // Market Position
    const marketPosition = profitEngine.getMarketPosition();

    return NextResponse.json({
      success: true,
      userProfile,
      recommendedTier,
      allTiers: profitEngine['USER_TIERS'], // Access private property for API
      conversionTriggers: CONVERSION_TRIGGERS,
      analytics: {
        revenueBreakdown,
        marketPosition,
        projectedMRR: revenueBreakdown.realisticRevenue,
        yearlyProjection: revenueBreakdown.yearlyProjection
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pricing API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Pricing calculation failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, context } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({
        error: 'userId and action required'
      }, { status: 400 });
    }

    // Track Conversion Event
    profitEngine.trackUserInteraction(userId, action, context);

    // Determine Conversion Strategy
    const conversionStrategy = getConversionStrategy(action, context);

    return NextResponse.json({
      success: true,
      conversionStrategy,
      trackingId: `${userId}_${action}_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Conversion Tracking Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Conversion tracking failed'
    }, { status: 500 });
  }
}

// HELPER FUNCTIONS
async function analyzeUserProfile(userId: string | null) {
  // TODO: Implementiere echte User-Analytics
  // Mock-Profile für Demo
  
  if (!userId) {
    return {
      isGrenzpendler: false,
      dailyApiCalls: 0,
      businessQueries: 0,
      governmentAffiliation: false,
      apiInterest: false,
      location: 'unknown'
    };
  }

  // Simuliere User-Analyse basierend auf User-ID
  const isGrenzpendler = userId.includes('pendler') || Math.random() > 0.7;
  const dailyApiCalls = Math.floor(Math.random() * 200);
  const businessQueries = Math.floor(Math.random() * 10);
  const governmentAffiliation = userId.includes('gov') || Math.random() > 0.95;
  const apiInterest = userId.includes('dev') || Math.random() > 0.8;

  return {
    userId,
    isGrenzpendler,
    dailyApiCalls,
    businessQueries,
    governmentAffiliation,
    apiInterest,
    location: isGrenzpendler ? 'border_region' : 'saarland_central',
    estimatedValue: calculateUserValue({ isGrenzpendler, dailyApiCalls, businessQueries, governmentAffiliation }),
    conversionProbability: calculateConversionProbability({ isGrenzpendler, dailyApiCalls, businessQueries })
  };
}

function calculateUserValue(profile: any): number {
  let value = 0;
  
  if (profile.isGrenzpendler) value += 120; // 12 Monate × 9.99€
  if (profile.dailyApiCalls > 100) value += 1200; // Business Tier
  if (profile.businessQueries > 5) value += 600; // Business Interest
  if (profile.governmentAffiliation) value += 60000; // Government Potential
  
  return value;
}

function calculateConversionProbability(profile: any): number {
  let probability = 0.5; // Base 0.5%
  
  if (profile.isGrenzpendler) probability += 2.0; // +2% Grenzpendler
  if (profile.dailyApiCalls > 50) probability += 1.5; // +1.5% Heavy User
  if (profile.businessQueries > 3) probability += 3.0; // +3% Business Interest
  
  return Math.min(probability, 15); // Max 15%
}

function getConversionStrategy(action: string, context: any) {
  const strategies = {
    'traffic_query': {
      trigger: CONVERSION_TRIGGERS.realTimeDataNeeded,
      urgency: 'high',
      personalizedMessage: `Verpasse nie wieder Staus auf der ${context.highway || 'A6'}!`,
      discount: context.isFirstTime ? 50 : 0, // 50% Erstnutzer-Rabatt
      trial: '7 Tage kostenlos'
    },
    
    'business_query': {
      trigger: CONVERSION_TRIGGERS.businessInquiry,
      urgency: 'medium',
      personalizedMessage: 'KI-optimierte Förderanträge = 300% höhere Erfolgsquote',
      demo: 'Kostenlose 30-Min Beratung',
      roi: '20h/Monat gesparte Zeit'
    },
    
    'api_request': {
      trigger: CONVERSION_TRIGGERS.apiRequest,
      urgency: 'medium', 
      personalizedMessage: 'White-Label API für deine Anwendung',
      trial: '1000 kostenlose API-Calls',
      support: 'Dedizierter Developer Support'
    },
    
    'government_query': {
      trigger: { message: 'Government Solutions verfügbar! 🏛️' },
      urgency: 'low',
      personalizedMessage: '40% höhere Bürgerzufriedenheit mit KI-Services',
      pilot: '90-Tage kostenloses Pilot-Projekt',
      compliance: 'DSGVO & BSI konform'
    }
  };

  return strategies[action] || {
    trigger: CONVERSION_TRIGGERS.dailyLimitReached,
    urgency: 'low',
    personalizedMessage: 'Upgrade für erweiterte Features',
    trial: 'Jetzt testen'
  };
}

// OPTIONS für CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}