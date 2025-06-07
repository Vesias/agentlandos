import { NextRequest, NextResponse } from 'next/server'
import SmartRevenueOptimizer from '@/lib/revenue/smart-revenue-optimizer'

export const runtime = 'edge'

// Smart revenue optimization and pricing intelligence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, customer_id, optimization_type, timeframe } = body

    const optimizer = new SmartRevenueOptimizer()

    switch (action) {
      case 'analyze_revenue':
        const currentMetrics = await optimizer.analyzeCurrentRevenue()
        
        return NextResponse.json({
          success: true,
          data: {
            current_metrics: currentMetrics,
            analysis_timestamp: new Date().toISOString()
          },
          message: 'Revenue analysis completed',
          timestamp: new Date().toISOString()
        })

      case 'optimize_pricing':
        const metrics = await optimizer.analyzeCurrentRevenue()
        const optimization = await optimizer.optimizePricing(metrics)
        
        return NextResponse.json({
          success: true,
          data: {
            optimization,
            implementation_timeline: {
              immediate: optimization.implementation_priority === 'immediate',
              estimated_days: optimization.implementation_priority === 'immediate' ? 7 : 
                             optimization.implementation_priority === 'short_term' ? 30 : 90
            }
          },
          message: 'Pricing optimization completed',
          timestamp: new Date().toISOString()
        })

      case 'personalized_pricing':
        if (!customer_id) {
          return NextResponse.json({
            success: false,
            error: 'Customer ID is required for personalized pricing'
          }, { status: 400 })
        }

        const personalizedPricing = await optimizer.getPersonalizedPricing(customer_id)
        
        return NextResponse.json({
          success: true,
          data: {
            pricing_tiers: personalizedPricing,
            customer_id,
            personalization_factors: ['segment', 'usage_history', 'company_size', 'geographic_location']
          },
          message: 'Personalized pricing generated',
          timestamp: new Date().toISOString()
        })

      case 'revenue_forecast':
        const forecastTimeframe = timeframe || '30d'
        const revenueReport = await optimizer.generateRevenueReport(forecastTimeframe)
        
        return NextResponse.json({
          success: true,
          data: revenueReport,
          message: 'Revenue forecast generated',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: analyze_revenue, optimize_pricing, personalized_pricing, revenue_forecast'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Revenue optimization error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Revenue optimization failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Get revenue analytics and insights
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const timeframe = url.searchParams.get('timeframe') as '7d' | '30d' | '90d' | '1y' || '30d'

    const optimizer = new SmartRevenueOptimizer()

    switch (action) {
      case 'dashboard':
        const metrics = await optimizer.analyzeCurrentRevenue()
        
        return NextResponse.json({
          success: true,
          data: {
            kpis: {
              mrr: {
                value: metrics.mrr,
                change: '+12.5%',
                trend: 'up'
              },
              arr: {
                value: metrics.arr,
                change: '+18.2%',
                trend: 'up'
              },
              churn_rate: {
                value: metrics.churn_rate,
                change: '-2.1%',
                trend: 'down'
              },
              ltv_cac_ratio: {
                value: metrics.ltv / metrics.cac,
                change: '+8.7%',
                trend: 'up'
              }
            },
            revenue_breakdown: {
              new_customers: metrics.mrr * 0.3,
              expansion: metrics.expansion_revenue,
              renewals: metrics.mrr * 0.6,
              churn: metrics.mrr * metrics.churn_rate
            },
            growth_metrics: {
              monthly_growth_rate: 0.125,
              customer_acquisition_velocity: 25,
              expansion_rate: 0.08,
              net_revenue_retention: 1.15
            }
          },
          timeframe,
          timestamp: new Date().toISOString()
        })

      case 'pricing_analysis':
        const currentMetrics = await optimizer.analyzeCurrentRevenue()
        const pricingOptimization = await optimizer.optimizePricing(currentMetrics)
        
        return NextResponse.json({
          success: true,
          data: {
            current_pricing_performance: {
              conversion_by_tier: {
                basic: 0.15,
                premium: 0.08,
                enterprise: 0.25
              },
              revenue_by_tier: {
                basic: currentMetrics.mrr * 0.2,
                premium: currentMetrics.mrr * 0.5,
                enterprise: currentMetrics.mrr * 0.3
              },
              churn_by_tier: {
                basic: 0.08,
                premium: 0.05,
                enterprise: 0.02
              }
            },
            optimization_opportunities: pricingOptimization.optimization_factors,
            recommended_changes: pricingOptimization.recommended_pricing,
            impact_projection: {
              revenue_lift: pricingOptimization.estimated_revenue_lift,
              confidence: pricingOptimization.confidence_score,
              timeline: pricingOptimization.implementation_priority
            }
          },
          timestamp: new Date().toISOString()
        })

      case 'customer_segments':
        return NextResponse.json({
          success: true,
          data: {
            segments: [
              {
                name: 'Enterprise Automation',
                size: 125,
                avg_revenue: 250,
                growth_rate: 0.18,
                characteristics: ['Large companies', 'Complex workflows', 'High LTV']
              },
              {
                name: 'SMB Digital Transformation',
                size: 450,
                avg_revenue: 75,
                growth_rate: 0.22,
                characteristics: ['Growing businesses', 'Cost-conscious', 'Quick adoption']
              },
              {
                name: 'Cross-Border Specialists',
                size: 89,
                avg_revenue: 180,
                growth_rate: 0.31,
                characteristics: ['International focus', 'Compliance needs', 'Premium features']
              },
              {
                name: 'Government & Public Sector',
                size: 23,
                avg_revenue: 500,
                growth_rate: 0.12,
                characteristics: ['Security focus', 'Long sales cycles', 'High value']
              }
            ],
            segment_trends: {
              fastest_growing: 'Cross-Border Specialists',
              highest_value: 'Government & Public Sector',
              largest_volume: 'SMB Digital Transformation',
              most_profitable: 'Enterprise Automation'
            }
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            available_actions: ['dashboard', 'pricing_analysis', 'customer_segments'],
            supported_timeframes: ['7d', '30d', '90d', '1y'],
            revenue_kpis: ['MRR', 'ARR', 'LTV', 'CAC', 'Churn Rate', 'NPS'],
            optimization_features: [
              'Dynamic pricing',
              'Customer segmentation',
              'A/B testing',
              'Predictive analytics',
              'Competitive intelligence'
            ]
          },
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('Revenue analytics error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Revenue analytics failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}