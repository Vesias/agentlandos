import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

// SAAR-ID & Business-ID Premium Subscription Checkout
export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, planType, metadata } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Price ID and User ID sind erforderlich' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/premium/cancel`,
      customer_email: metadata?.email,
      client_reference_id: userId,
      metadata: {
        userId,
        planType,
        source: 'agentland-saarland',
        ...metadata
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
          saarlandRegion: metadata?.municipality || 'unknown'
        }
      },
      custom_text: {
        submit: {
          message: 'Ihr SAAR-ID Premium Zugang wird sofort aktiviert!'
        }
      },
      phone_number_collection: {
        enabled: true
      },
      tax_id_collection: {
        enabled: true
      }
    });

    // Log checkout attempt
    await supabaseServer.from('checkout_sessions').insert({
      session_id: session.id,
      user_id: userId,
      plan_type: planType,
      price_id: priceId,
      amount: session.amount_total,
      currency: session.currency,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      success: true
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Log error to Supabase
    await supabaseServer.from('payment_errors').insert({
      error_type: 'checkout_creation',
      error_message: error.message,
      error_stack: error.stack,
      user_id: request.json().then(data => data.userId).catch(() => null),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Fehler beim Erstellen der Checkout-Session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Get subscription plans with Saarland-specific pricing
export async function GET() {
  try {
    const plans = [
      {
        id: 'saar-id-premium',
        name: 'SAAR-ID Premium',
        description: 'Digitale Identität für das Saarland',
        price: 10,
        currency: 'EUR',
        interval: 'month',
        priceId: process.env.STRIPE_PRICE_SAAR_ID || 'price_saar_id_premium',
        features: [
          '🆔 Digitale SAAR-ID mit Blockchain-Sicherheit',
          '⚡ 24h Express-Bearbeitung aller Anträge',
          '📱 Mobile App mit Offline-Funktionen',
          '🔔 Real-time Benachrichtigungen',
          '💬 Premium Support via Chat & Telefon',
          '🏛️ Direkte Behörden-API Integration',
          '🌍 Grenzüberschreitende Services (DE/FR/LU)',
          '📊 Persönliche Analytics & Insights'
        ],
        recommended: true,
        badge: 'Beliebteste Wahl',
        savings: 'Spart 5-10h Behördengänge/Monat'
      },
      {
        id: 'business-id-premium',
        name: 'Business-ID Premium',
        description: 'Unternehmens-Services für Saarland',
        price: 25,
        currency: 'EUR',
        interval: 'month',
        priceId: process.env.STRIPE_PRICE_BUSINESS_ID || 'price_business_id_premium',
        features: [
          '🏢 Komplette Firmen-Digitalisierung',
          '💰 Automatische Fördermittel-Suche',
          '📈 Business Analytics & Reporting',
          '🤝 Dedicated Account Manager',
          '⚖️ Rechtsberatung & Compliance',
          '💳 Multi-User Team-Zugang',
          '🌐 API-Zugang für eigene Systeme',
          '📊 Export-Import Unterstützung'
        ],
        recommended: false,
        badge: 'Für Unternehmen',
        savings: 'ROI: 300-500% durch Effizienz'
      },
      {
        id: 'grenzpendler-premium',
        name: 'Grenzpendler Premium',
        description: 'Cross-border Services DE/FR/LU',
        price: 15,
        currency: 'EUR',
        interval: 'month',
        priceId: process.env.STRIPE_PRICE_GRENZPENDLER || 'price_grenzpendler_premium',
        features: [
          '🌍 Tri-nationale Behörden-Integration',
          '💱 Automatische Steuer-Optimierung',
          '🚗 Grenzüberschreitende Mobilität',
          '🏥 Krankenversicherung-Management',
          '💼 Job-Matching in allen 3 Ländern',
          '📱 Mehrsprachige App (DE/FR/EN)',
          '📞 24/7 Grenzpendler-Hotline',
          '🎯 Personalisierte Services'
        ],
        recommended: false,
        badge: 'Cross-Border',
        savings: 'Spart bis zu 20h/Monat'
      }
    ];

    return NextResponse.json({
      plans,
      success: true,
      currency: 'EUR',
      region: 'Saarland',
      vatRate: 19,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Tarife' },
      { status: 500 }
    );
  }
}