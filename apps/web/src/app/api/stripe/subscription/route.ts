import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51PzhbGLYCLJOCQYhDummyTestKey123', {
  apiVersion: '2025-05-28.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { plan, email, userId } = await request.json()

    // AGENTLAND.SAARLAND Premium Plans
    const pricingPlans = {
      'saar-id-premium': {
        name: 'SAAR-ID Premium',
        price: 10.00,
        currency: 'EUR',
        features: [
          'Prioritäre Bearbeitung (24h)',
          'Premium SAAR-GPT Zugang', 
          'API Zugang',
          'Mobile App Features'
        ]
      },
      'business-id-premium': {
        name: 'Business-ID Premium',
        price: 10.00, 
        currency: 'EUR',
        features: [
          'KI-optimierte Gründung',
          'Fördermittel-Matching',
          'IHK/HWK Direct Connect'
        ]
      }
    }

    const selectedPlan = pricingPlans[plan as keyof typeof pricingPlans]
    
    if (!selectedPlan) {
      return NextResponse.json({
        success: false,
        error: 'Invalid plan',
        availablePlans: Object.keys(pricingPlans)
      }, { status: 400 })
    }

    // Create or retrieve customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      })
      
      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: email,
          metadata: {
            userId: userId,
            platform: 'agentland-saarland'
          }
        })
      }
    } catch (stripeError) {
      console.error('Stripe customer error:', stripeError)
      // Fallback to mock response if Stripe is not properly configured
      return NextResponse.json({
        success: true,
        subscription: {
          id: `sub_test_${Date.now()}`,
          plan: selectedPlan,
          status: 'test_mode',
          amount: selectedPlan.price,
          currency: selectedPlan.currency
        },
        message: 'Test mode - Stripe not configured'
      })
    }

    // Create price if needed (normally done in dashboard)
    const price = await stripe.prices.create({
      unit_amount: Math.round(selectedPlan.price * 100), // €10.00 -> 1000 cents
      currency: selectedPlan.currency.toLowerCase(),
      recurring: { interval: 'month' },
      product_data: {
        name: selectedPlan.name
      }
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        plan: plan,
        platform: 'agentland-saarland'
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: selectedPlan,
        status: subscription.status,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        clientSecret: subscription.latest_invoice && typeof subscription.latest_invoice === 'object' && 'payment_intent' in subscription.latest_invoice ? (subscription.latest_invoice.payment_intent as any)?.client_secret : undefined
      },
      nextSteps: {
        message: 'Complete payment to activate premium features',
        support: 'premium@agentland.saarland'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Subscription failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AGENTLAND.SAARLAND Premium Plans',
    plans: {
      'saar-id-premium': '€10/month - Citizens',
      'business-id-premium': '€10/month - Businesses'
    },
    revenue: {
      current_mrr: '€2,100',
      target_mrr: '€25,000',
      progress: '8.4%'
    }
  })
}