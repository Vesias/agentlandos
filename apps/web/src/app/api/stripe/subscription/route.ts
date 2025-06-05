import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

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

    // Mock Stripe subscription
    const subscriptionId = `sub_${Date.now()}_agentland`
    
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        plan: selectedPlan,
        status: 'requires_payment',
        amount: selectedPlan.price,
        currency: selectedPlan.currency
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