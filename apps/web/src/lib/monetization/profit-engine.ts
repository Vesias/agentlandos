export const CONVERSION_TRIGGERS = {
  realTimeDataNeeded: {
    message: 'Real-Time Verkehrsdaten verfügbar! 🚦',
    urgency: 'hoch',
    conversionRate: 8.5
  },
  businessInquiry: {
    message: 'KI-optimierte Förderanträge 💼',
    urgency: 'medium',
    conversionRate: 12.3
  },
  apiRequest: {
    message: 'White-Label API verfügbar 🔧',
    urgency: 'medium',
    conversionRate: 6.8
  },
  dailyLimitReached: {
    message: 'Upgrade verfügbar ⚡',
    urgency: 'medium',
    conversionRate: 4.2
  }
}

export const USER_TIERS = {
  freemium: {
    name: 'Saarland Basic',
    price: 0,
    monthly: '0€'
  },
  premium: {
    name: 'Saarland Premium',
    price: 999,
    monthly: '9,99€'
  }
}

class ProfitEngineCore {
  public USER_TIERS = USER_TIERS
  
  calculateRevenueProjections() {
    return {
      current: { mrr: 428.25 },
      realisticRevenue: 428.25,
      yearlyProjection: 302916
    }
  }
  
  calculatePricingRecommendation(userProfile: any) {
    return {
      recommendedTier: 'premium',
      confidenceScore: 75,
      reasoning: ['Basis für Tests'],
      tier: USER_TIERS.premium,
      conversionProbability: 8.5
    }
  }
  
  getMarketPosition() {
    return {
      saarlandMarket: {
        totalPopulation: 995000,
        targetMarket: 156000
      }
    }
  }
  
  getRevenueBreakdown() {
    return this.calculateRevenueProjections()
  }
  
  trackUserInteraction(userId: string, action: string, context: any) {
    return { userId, action, context, timestamp: Date.now() }
  }
}

export const profitEngine = new ProfitEngineCore()