import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Premium Saarland Services Pricing & Features
const PREMIUM_TIERS = {
  basic: {
    name: 'Saarland Basic',
    price: 0,
    monthly: '0€',
    features: [
      'Grundlegende Behördeninfos',
      'Öffentliche Veranstaltungen',
      'Basis-Navigation',
      'Community-Zugang'
    ],
    limits: {
      api_calls: 100,
      bookmarks: 10,
      notifications: 5
    }
  },
  premium: {
    name: 'Saarland Premium',
    price: 999, // 9.99€ in cents
    monthly: '9,99€',
    features: [
      '⚡ Express-Terminbuchung bei Behörden',
      '📋 Dokumente-Upload & Vorausfüllung',
      '🔔 Premium-Benachrichtigungen',
      '⚽ Exklusive Saar-Fußball Insider',
      '📰 Personalisierte Saarnews',
      '🎯 Premium-Support (24h)',
      '📊 Erweiterte Services',
      '🏆 Community-Badges & VIP-Status'
    ],
    limits: {
      api_calls: 1000,
      bookmarks: 100,
      notifications: 50,
      express_booking: true,
      document_upload: true,
      vip_support: true
    }
  },
  business: {
    name: 'Saarland Business',
    price: 4999, // 49.99€ in cents
    monthly: '49,99€',
    features: [
      '🏢 Business-Profile im Saarland-Netzwerk',
      '💼 Jobbörse-Zugang (Stellenanzeigen)',
      '🤝 Partner-Verzeichnis Premium-Listing',
      '📈 Analytics & Reichweiten-Tracking',
      '🎯 Zielgruppen-Marketing Tools',
      '⚡ API-Zugang für eigene Services',
      '📞 Direkter Business-Support',
      '🏆 Verified Business Badge'
    ],
    limits: {
      api_calls: 10000,
      job_postings: 5,
      analytics: true,
      api_access: true,
      priority_support: true,
      verified_badge: true
    }
  }
}

// Saar-specific monetization features
const SAAR_FEATURES = {
  football: {
    premium: [
      'Live-Ticker 1. FC Saarbrücken',
      'SV Elversberg Insider-News',
      'Amateur-Fußball Livescores',
      'Exklusive Interviews & Berichte',
      'Ticket-Vorverkauf Benachrichtigungen'
    ],
    vip: [
      'Meet & Greet Gewinnspiele',
      'VIP-Bereiche bei Spielen',
      'Autogramm-Sessions Zugang'
    ]
  },
  news: {
    premium: [
      'Personalisierte Saarnews',
      'Breaking News Push-Notifications',
      'Lokale Politik Insider',
      'Wirtschafts-Updates Saarland',
      'Kultur & Events Früh-Zugang'
    ],
    business: [
      'PR-Artikel Platzierung',
      'Unternehmens-News Distribution',
      'Pressemitteilungen-Service'
    ]
  },
  government: {
    premium: [
      'Express-Behördentermine',
      'Dokumenten-Vorausfüllung',
      'Status-Tracking Anträge',
      'Direkte Beratungshotline'
    ],
    business: [
      'Gewerbeanmeldung Express',
      'Behörden-Compliance Check',
      'Förderungen-Matching Service'
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier')
    
    if (tier && PREMIUM_TIERS[tier as keyof typeof PREMIUM_TIERS]) {
      return NextResponse.json({
        tier: PREMIUM_TIERS[tier as keyof typeof PREMIUM_TIERS],
        saar_features: SAAR_FEATURES,
        success: true
      })
    }
    
    return NextResponse.json({
      tiers: PREMIUM_TIERS,
      saar_features: SAAR_FEATURES,
      success: true,
      message: 'Saarland Premium Services - Emotional verankert, lokal verwurzelt'
    })
  } catch (error) {
    console.error('Premium services error:', error)
    return NextResponse.json({
      error: 'Premium services temporarily unavailable',
      success: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tier, user_id, payment_method } = await request.json()
    
    if (!tier || !user_id) {
      return NextResponse.json({
        error: 'Tier and user_id required',
        success: false
      }, { status: 400 })
    }
    
    const selectedTier = PREMIUM_TIERS[tier as keyof typeof PREMIUM_TIERS]
    if (!selectedTier) {
      return NextResponse.json({
        error: 'Invalid tier selected',
        success: false
      }, { status: 400 })
    }
    
    // Mock subscription creation (integrate with Stripe later)
    const subscription = {
      id: `sub_${Date.now()}`,
      user_id,
      tier,
      price: selectedTier.price,
      status: 'active',
      created_at: new Date().toISOString(),
      next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: selectedTier.features,
      limits: selectedTier.limits
    }
    
    // TODO: Store in database
    // TODO: Send confirmation email
    // TODO: Activate premium features
    
    return NextResponse.json({
      subscription,
      message: `Willkommen im ${selectedTier.name}! Saarland-Power aktiviert! ⚽`,
      success: true
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json({
      error: 'Subscription creation failed',
      success: false
    }, { status: 500 })
  }
}