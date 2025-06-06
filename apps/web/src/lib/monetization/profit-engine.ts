export const CONVERSION_TRIGGERS = {
  realTimeDataNeeded: { message: 'Echtzeitdaten verfügbar!' },
  businessInquiry: { message: 'Geschäftsanfrage erkannt!' },
  apiRequest: { message: 'API Zugriff anfragen' },
  dailyLimitReached: { message: 'Tageslimit erreicht' }
}

export const profitEngine = {
  USER_TIERS: ['free', 'pro', 'business', 'gov'],

  calculatePricingRecommendation(_profile: any) {
    return 'pro'
  },

  getRevenueBreakdown() {
    return { realisticRevenue: 0, yearlyProjection: 0 }
  },

  getMarketPosition() {
    return { rank: 1 }
  },

  trackUserInteraction(_userId: string, _action: string, _context: any) {
    // no-op
  }
}
