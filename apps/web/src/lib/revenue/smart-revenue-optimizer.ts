import { supabase } from '@/lib/supabase'

export interface PricingTier {
  id: string
  name: string
  base_price: number
  currency: 'EUR' | 'USD'
  billing_cycle: 'monthly' | 'yearly' | 'one-time'
  features: string[]
  user_limits: {
    max_users: number
    max_projects: number
    max_storage_gb: number
    max_api_calls: number
  }
  target_segment: 'individual' | 'small_business' | 'enterprise' | 'government'
  discount_eligible: boolean
  trial_days: number
}

export interface RevenueMetrics {
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churn_rate: number
  ltv: number // Customer Lifetime Value
  cac: number // Customer Acquisition Cost
  nps: number // Net Promoter Score
  conversion_rate: number
  average_deal_size: number
  time_to_value: number // Days to first value realization
  expansion_revenue: number
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  characteristics: {
    company_size: string
    industry: string[]
    location: string[]
    budget_range: {
      min: number
      max: number
    }
    technical_sophistication: 'low' | 'medium' | 'high'
    decision_making_speed: 'fast' | 'medium' | 'slow'
  }
  preferred_pricing: PricingTier['id']
  conversion_probability: number
  expected_ltv: number
  engagement_patterns: {
    preferred_channels: string[]
    peak_usage_hours: number[]
    feature_preferences: string[]
  }
}

export interface PricingOptimization {
  current_pricing: PricingTier[]
  recommended_pricing: PricingTier[]
  optimization_factors: {
    market_elasticity: number
    competitor_analysis: CompetitorPricing[]
    customer_feedback: CustomerFeedback[]
    usage_patterns: UsagePattern[]
    revenue_impact: RevenueImpact
  }
  confidence_score: number
  implementation_priority: 'immediate' | 'short_term' | 'long_term'
  estimated_revenue_lift: number
}

export interface CompetitorPricing {
  competitor_name: string
  pricing_tiers: {
    name: string
    price: number
    features: string[]
  }[]
  positioning: string
  market_share: number
  strengths: string[]
  weaknesses: string[]
}

export interface CustomerFeedback {
  customer_id: string
  segment: string
  feedback_type: 'pricing_too_high' | 'pricing_fair' | 'pricing_low' | 'feature_request' | 'cancellation'
  content: string
  sentiment: 'positive' | 'neutral' | 'negative'
  priority_score: number
  created_at: string
}

export interface UsagePattern {
  customer_segment: string
  feature_usage: Record<string, number>
  peak_hours: number[]
  session_duration: number
  frequency: number
  seasonal_patterns: Record<string, number>
}

export interface RevenueImpact {
  short_term: {
    new_customers: number
    upgraded_customers: number
    churned_customers: number
    revenue_change: number
  }
  long_term: {
    market_penetration: number
    brand_positioning: string
    competitive_advantage: string[]
    estimated_arr_growth: number
  }
}

export interface DynamicPricingRule {
  id: string
  name: string
  conditions: {
    customer_segment?: string[]
    usage_threshold?: number
    time_period?: string
    geographic_region?: string[]
    company_size?: string
    industry?: string[]
  }
  action: {
    type: 'discount' | 'premium' | 'custom_tier' | 'feature_unlock'
    value: number
    duration_days?: number
    max_applications?: number
  }
  active: boolean
  performance_metrics: {
    applications: number
    conversion_rate: number
    revenue_impact: number
  }
}

class SmartRevenueOptimizer {
  private deepseekApiKey: string

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || ''
  }

  async analyzeCurrentRevenue(): Promise<RevenueMetrics> {
    try {
      // Get subscription data
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')

      if (subError) throw subError

      // Get churn data (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: churnedCustomers, error: churnError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'cancelled')
        .gte('cancelled_at', thirtyDaysAgo.toISOString())

      if (churnError) throw churnError

      // Calculate MRR
      const mrr = subscriptions.reduce((total, sub) => {
        const monthlyValue = sub.billing_cycle === 'yearly' 
          ? sub.amount / 12 
          : sub.amount
        return total + monthlyValue
      }, 0)

      // Calculate ARR
      const arr = mrr * 12

      // Calculate churn rate
      const totalActiveCustomers = subscriptions.length
      const churnedThisMonth = churnedCustomers.length
      const churnRate = totalActiveCustomers > 0 ? churnedThisMonth / totalActiveCustomers : 0

      // Get customer acquisition cost and lifetime value
      const cac = await this.calculateCAC()
      const ltv = await this.calculateLTV()
      const nps = await this.calculateNPS()

      return {
        mrr,
        arr,
        churn_rate: churnRate,
        ltv,
        cac,
        nps,
        conversion_rate: await this.calculateConversionRate(),
        average_deal_size: mrr / totalActiveCustomers || 0,
        time_to_value: await this.calculateTimeToValue(),
        expansion_revenue: await this.calculateExpansionRevenue()
      }
    } catch (error) {
      console.error('Revenue analysis failed:', error)
      throw error
    }
  }

  async optimizePricing(currentMetrics: RevenueMetrics): Promise<PricingOptimization> {
    try {
      // Analyze competitor pricing
      const competitorAnalysis = await this.analyzeCompetitorPricing()
      
      // Get customer feedback
      const customerFeedback = await this.getCustomerFeedback()
      
      // Analyze usage patterns
      const usagePatterns = await this.analyzeUsagePatterns()
      
      // Calculate market elasticity
      const marketElasticity = await this.calculateMarketElasticity()

      // Use AI to generate pricing recommendations
      const aiRecommendations = await this.generateAIPricingRecommendations({
        current_metrics: currentMetrics,
        competitor_analysis: competitorAnalysis,
        customer_feedback: customerFeedback,
        usage_patterns: usagePatterns,
        market_elasticity: marketElasticity
      })

      return {
        current_pricing: await this.getCurrentPricingTiers(),
        recommended_pricing: aiRecommendations.pricing_tiers,
        optimization_factors: {
          market_elasticity: marketElasticity,
          competitor_analysis: competitorAnalysis,
          customer_feedback: customerFeedback,
          usage_patterns: usagePatterns,
          revenue_impact: aiRecommendations.revenue_impact
        },
        confidence_score: aiRecommendations.confidence_score,
        implementation_priority: aiRecommendations.priority,
        estimated_revenue_lift: aiRecommendations.revenue_lift
      }
    } catch (error) {
      console.error('Pricing optimization failed:', error)
      throw error
    }
  }

  private async calculateCAC(): Promise<number> {
    try {
      // Get marketing spend (last 30 days)
      const { data: marketingSpend } = await supabase
        .from('marketing_expenses')
        .select('amount')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const totalSpend = marketingSpend?.reduce((sum, expense) => sum + expense.amount, 0) || 0

      // Get new customers (last 30 days)
      const { data: newCustomers } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const newCustomerCount = newCustomers?.length || 1

      return totalSpend / newCustomerCount
    } catch (error) {
      console.error('CAC calculation failed:', error)
      return 0
    }
  }

  private async calculateLTV(): Promise<number> {
    try {
      const { data: customers } = await supabase
        .from('subscriptions')
        .select('amount, created_at, cancelled_at')

      if (!customers || customers.length === 0) return 0

      const averageLifetimeMonths = customers.reduce((sum, customer) => {
        const startDate = new Date(customer.created_at)
        const endDate = customer.cancelled_at ? new Date(customer.cancelled_at) : new Date()
        const monthsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return sum + monthsDiff
      }, 0) / customers.length

      const averageMonthlyRevenue = customers.reduce((sum, customer) => {
        return sum + customer.amount
      }, 0) / customers.length

      return averageLifetimeMonths * averageMonthlyRevenue
    } catch (error) {
      console.error('LTV calculation failed:', error)
      return 0
    }
  }

  private async calculateNPS(): Promise<number> {
    try {
      const { data: surveys } = await supabase
        .from('customer_surveys')
        .select('nps_score')
        .not('nps_score', 'is', null)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

      if (!surveys || surveys.length === 0) return 0

      const promoters = surveys.filter(s => s.nps_score >= 9).length
      const detractors = surveys.filter(s => s.nps_score <= 6).length
      const total = surveys.length

      return ((promoters - detractors) / total) * 100
    } catch (error) {
      console.error('NPS calculation failed:', error)
      return 0
    }
  }

  private async calculateConversionRate(): Promise<number> {
    try {
      const { data: trials } = await supabase
        .from('trial_users')
        .select('id, converted_to_paid')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (!trials || trials.length === 0) return 0

      const converted = trials.filter(t => t.converted_to_paid).length
      return (converted / trials.length) * 100
    } catch (error) {
      console.error('Conversion rate calculation failed:', error)
      return 0
    }
  }

  private async calculateTimeToValue(): Promise<number> {
    try {
      const { data: customers } = await supabase
        .from('customer_onboarding')
        .select('signup_date, first_value_date')
        .not('first_value_date', 'is', null)

      if (!customers || customers.length === 0) return 0

      const totalDays = customers.reduce((sum, customer) => {
        const signupDate = new Date(customer.signup_date)
        const valueDate = new Date(customer.first_value_date)
        const daysDiff = (valueDate.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
        return sum + daysDiff
      }, 0)

      return totalDays / customers.length
    } catch (error) {
      console.error('Time to value calculation failed:', error)
      return 0
    }
  }

  private async calculateExpansionRevenue(): Promise<number> {
    try {
      const { data: upgrades } = await supabase
        .from('subscription_changes')
        .select('old_amount, new_amount')
        .eq('change_type', 'upgrade')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (!upgrades || upgrades.length === 0) return 0

      return upgrades.reduce((sum, upgrade) => {
        return sum + (upgrade.new_amount - upgrade.old_amount)
      }, 0)
    } catch (error) {
      console.error('Expansion revenue calculation failed:', error)
      return 0
    }
  }

  private async analyzeCompetitorPricing(): Promise<CompetitorPricing[]> {
    // This would integrate with competitor analysis tools
    // For now, return sample data
    return [
      {
        competitor_name: 'Competitor A',
        pricing_tiers: [
          { name: 'Basic', price: 9, features: ['feature1', 'feature2'] },
          { name: 'Pro', price: 29, features: ['feature1', 'feature2', 'feature3'] },
          { name: 'Enterprise', price: 99, features: ['all_features'] }
        ],
        positioning: 'Premium solution',
        market_share: 0.25,
        strengths: ['Brand recognition', 'Feature completeness'],
        weaknesses: ['Higher pricing', 'Complex onboarding']
      }
    ]
  }

  private async getCustomerFeedback(): Promise<CustomerFeedback[]> {
    try {
      const { data: feedback } = await supabase
        .from('customer_feedback')
        .select('*')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

      return feedback || []
    } catch (error) {
      console.error('Customer feedback fetch failed:', error)
      return []
    }
  }

  private async analyzeUsagePatterns(): Promise<UsagePattern[]> {
    try {
      const { data: usage } = await supabase
        .from('feature_usage')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Group by customer segment and analyze patterns
      const patterns: Record<string, any> = {}
      
      usage?.forEach(record => {
        const segment = record.customer_segment || 'unknown'
        if (!patterns[segment]) {
          patterns[segment] = {
            feature_usage: {},
            sessions: [],
            total_usage: 0
          }
        }
        
        patterns[segment].feature_usage[record.feature_name] = 
          (patterns[segment].feature_usage[record.feature_name] || 0) + 1
        patterns[segment].total_usage += 1
      })

      return Object.entries(patterns).map(([segment, data]: [string, any]) => ({
        customer_segment: segment,
        feature_usage: data.feature_usage,
        peak_hours: [9, 10, 11, 14, 15, 16], // Simplified
        session_duration: 45, // minutes
        frequency: data.total_usage,
        seasonal_patterns: { Q1: 1.0, Q2: 1.2, Q3: 0.8, Q4: 1.1 }
      }))
    } catch (error) {
      console.error('Usage pattern analysis failed:', error)
      return []
    }
  }

  private async calculateMarketElasticity(): Promise<number> {
    // Simplified price elasticity calculation
    // In reality, this would use historical price/demand data
    return -1.5 // Price elastic
  }

  private async getCurrentPricingTiers(): Promise<PricingTier[]> {
    try {
      const { data: tiers } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('active', true)

      return tiers || []
    } catch (error) {
      console.error('Pricing tiers fetch failed:', error)
      return []
    }
  }

  private async generateAIPricingRecommendations(data: any): Promise<any> {
    try {
      const prompt = `
Als Experte für Revenue Optimization und Pricing Strategy für AGENTLAND.SAARLAND, analysiere die folgenden Daten und erstelle optimierte Preisempfehlungen:

Aktuelle Metriken:
- MRR: €${data.current_metrics.mrr}
- Churn Rate: ${(data.current_metrics.churn_rate * 100).toFixed(2)}%
- LTV: €${data.current_metrics.ltv}
- CAC: €${data.current_metrics.cac}

Marktbedingungen:
- Preiselastizität: ${data.market_elasticity}
- Konkurrenzanalyse verfügbar
- Kundenfeedback: ${data.customer_feedback.length} Einträge

Erstelle eine optimierte Pricing-Strategie mit:
1. 3-4 Preisstufen für verschiedene Kundensegmente
2. Begründung für jede Preisänderung
3. Erwartete Revenue-Steigerung
4. Implementierungspriorität
5. Risikobewertung

Fokus auf:
- Saarland-Region (Deutschland/Frankreich/Luxemburg)
- B2B SaaS mit €25.000+ MRR Ziel
- Enterprise-Features für Automatisierung
- Cross-Border Services Premium-Pricing

Format als JSON mit detaillierten Empfehlungen.
`

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner-r1-0528',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.3,
          max_tokens: 3000
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const apiResponse = await response.json()
      return JSON.parse(apiResponse.choices[0].message.content)
    } catch (error) {
      console.error('AI pricing recommendations failed:', error)
      // Return fallback recommendations
      return {
        pricing_tiers: [
          {
            id: 'basic',
            name: 'Basic',
            base_price: 10,
            currency: 'EUR',
            billing_cycle: 'monthly',
            features: ['basic_ai', 'document_templates', 'email_support'],
            target_segment: 'individual'
          },
          {
            id: 'premium',
            name: 'Premium',
            base_price: 50,
            currency: 'EUR',
            billing_cycle: 'monthly',
            features: ['advanced_ai', 'collaboration', 'api_access', 'priority_support'],
            target_segment: 'small_business'
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            base_price: 200,
            currency: 'EUR',
            billing_cycle: 'monthly',
            features: ['white_label', 'custom_integrations', 'dedicated_support', 'sla'],
            target_segment: 'enterprise'
          }
        ],
        confidence_score: 0.75,
        priority: 'short_term',
        revenue_lift: 0.35,
        revenue_impact: {
          short_term: {
            new_customers: 150,
            upgraded_customers: 75,
            churned_customers: 25,
            revenue_change: 8750
          },
          long_term: {
            market_penetration: 0.15,
            brand_positioning: 'Premium AI automation platform',
            competitive_advantage: ['Local expertise', 'Cross-border compliance'],
            estimated_arr_growth: 0.45
          }
        }
      }
    }
  }

  async implementDynamicPricing(rules: DynamicPricingRule[]): Promise<void> {
    try {
      for (const rule of rules) {
        const { error } = await supabase
          .from('dynamic_pricing_rules')
          .upsert({
            id: rule.id,
            name: rule.name,
            conditions: rule.conditions,
            action: rule.action,
            active: rule.active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Dynamic pricing implementation failed:', error)
      throw error
    }
  }

  async getPersonalizedPricing(customerId: string): Promise<PricingTier[]> {
    try {
      // Get customer profile
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (!customer) throw new Error('Customer not found')

      // Get applicable dynamic pricing rules
      const { data: rules } = await supabase
        .from('dynamic_pricing_rules')
        .select('*')
        .eq('active', true)

      // Apply rules and personalize pricing
      const basePricing = await this.getCurrentPricingTiers()
      const personalizedPricing = basePricing.map(tier => {
        let adjustedPrice = tier.base_price
        
        rules?.forEach(rule => {
          if (this.ruleApplies(rule, customer)) {
            switch (rule.action.type) {
              case 'discount':
                adjustedPrice *= (1 - rule.action.value / 100)
                break
              case 'premium':
                adjustedPrice *= (1 + rule.action.value / 100)
                break
            }
          }
        })

        return {
          ...tier,
          base_price: Math.round(adjustedPrice * 100) / 100,
          personalized: true
        }
      })

      return personalizedPricing
    } catch (error) {
      console.error('Personalized pricing failed:', error)
      return this.getCurrentPricingTiers()
    }
  }

  private ruleApplies(rule: DynamicPricingRule, customer: any): boolean {
    // Simplified rule matching logic
    if (rule.conditions.customer_segment && 
        !rule.conditions.customer_segment.includes(customer.segment)) {
      return false
    }
    
    if (rule.conditions.company_size && 
        rule.conditions.company_size !== customer.company_size) {
      return false
    }

    if (rule.conditions.geographic_region && 
        !rule.conditions.geographic_region.includes(customer.country)) {
      return false
    }

    return true
  }

  async generateRevenueReport(timeframe: '7d' | '30d' | '90d' | '1y'): Promise<any> {
    try {
      const metrics = await this.analyzeCurrentRevenue()
      const optimization = await this.optimizePricing(metrics)
      
      return {
        period: timeframe,
        current_metrics: metrics,
        optimization_recommendations: optimization,
        action_items: [
          'Implement tier-based pricing for enterprise customers',
          'Launch limited-time promotion for annual subscriptions',
          'Optimize onboarding to reduce time-to-value',
          'Introduce usage-based pricing for API services'
        ],
        revenue_forecast: {
          conservative: metrics.mrr * 1.15,
          optimistic: metrics.mrr * 1.35,
          aggressive: metrics.mrr * 1.55
        },
        generated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Revenue report generation failed:', error)
      throw error
    }
  }
}

export default SmartRevenueOptimizer