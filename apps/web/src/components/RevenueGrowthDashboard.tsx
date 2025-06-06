'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Users, Target, 
  Calendar, Globe, Zap, Crown, Award,
  ArrowUp, ArrowDown, Minus, Sparkles
} from 'lucide-react';

interface RevenueMetrics {
  currentMRR: number;
  totalUsers: number;
  churnRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  goalProgress: {
    target25k: number;
    target50kUsers: number;
    currentQuarter: number;
  };
  realTimeStats: {
    revenueToday: number;
    newUsersToday: number;
    upgradesThisWeek: number;
    churnThisMonth: number;
  };
}

interface RevenueProjections {
  mrr3Months: number;
  mrr6Months: number;
  mrr12Months: number;
  targetDate25k: string;
}

export const RevenueGrowthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [projections, setProjections] = useState<RevenueProjections | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchRevenueData();
    
    // Update every 30 seconds for real-time data
    const interval = setInterval(fetchRevenueData, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`/api/analytics/revenue?timeframe=${timeframe}&projections=true`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        setProjections(data.projections);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-yellow-500 to-amber-600';
    if (progress >= 25) return 'from-blue-500 to-cyan-600';
    return 'from-red-500 to-rose-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="text-center text-gray-600">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Revenue-Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-saarland-blue to-innovation-cyan rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Revenue Growth Dashboard</h1>
            <p className="text-blue-100">Real-time Einblick in KI-Agentur Performance</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {formatCurrency(metrics.currentMRR)}
            </div>
            <div className="text-blue-100">Monthly Recurring Revenue</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            {getTrendIcon(metrics.currentMRR, metrics.currentMRR * 0.8)}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.currentMRR)}
          </div>
          <div className="text-sm text-gray-600">Current MRR</div>
          <div className="mt-2 text-xs text-gray-500">
            Ziel: €25,000 ({formatPercent((metrics.currentMRR / 25000) * 100)})
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            {getTrendIcon(metrics.totalUsers, metrics.totalUsers * 0.9)}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Aktive Nutzer</div>
          <div className="mt-2 text-xs text-gray-500">
            Ziel: 50,000 ({formatPercent((metrics.totalUsers / 50000) * 100)})
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-purple-500" />
            {getTrendIcon(metrics.conversionRate, 5)}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPercent(metrics.conversionRate)}
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
          <div className="mt-2 text-xs text-gray-500">
            Free → Premium Subscriptions
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            {getTrendIcon(100 - metrics.churnRate, 95)}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPercent(100 - metrics.churnRate)}
          </div>
          <div className="text-sm text-gray-600">Retention Rate</div>
          <div className="mt-2 text-xs text-gray-500">
            Monatliche Kundenbindung
          </div>
        </div>
      </div>

      {/* Revenue Goals Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Revenue Goals 2025
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">€25,000 MRR Ziel</span>
              <span className="text-sm text-gray-600">
                {formatPercent(metrics.goalProgress.target25k)} erreicht
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(metrics.goalProgress.target25k)}`}
                style={{ width: `${Math.min(metrics.goalProgress.target25k, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">50,000 Nutzer Ziel</span>
              <span className="text-sm text-gray-600">
                {formatPercent(metrics.goalProgress.target50kUsers)} erreicht
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(metrics.goalProgress.target50kUsers)}`}
                style={{ width: `${Math.min(metrics.goalProgress.target50kUsers, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          Real-time KI-Agentur Stats
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.realTimeStats.revenueToday)}
            </div>
            <div className="text-sm text-green-700">Revenue Heute</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.realTimeStats.newUsersToday}
            </div>
            <div className="text-sm text-blue-700">Neue Nutzer Heute</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.realTimeStats.upgradesThisWeek}
            </div>
            <div className="text-sm text-purple-700">Upgrades diese Woche</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {metrics.realTimeStats.churnThisMonth}
            </div>
            <div className="text-sm text-red-700">Churn diesen Monat</div>
          </div>
        </div>
      </div>

      {/* Projections */}
      {projections && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            KI-Agentur Revenue Projections
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(projections.mrr3Months)}
              </div>
              <div className="text-sm text-gray-600">Projected MRR (3 Monate)</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(projections.mrr6Months)}
              </div>
              <div className="text-sm text-gray-600">Projected MRR (6 Monate)</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(projections.mrr12Months)}
              </div>
              <div className="text-sm text-gray-600">Projected MRR (12 Monate)</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-900">Prognose für €25k MRR</span>
            </div>
            <p className="text-blue-800">
              Voraussichtliches Erreichen: <strong>{projections.targetDate25k}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueGrowthDashboard;