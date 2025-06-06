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
    if (current > previous) return <ArrowUp className=\"w-4 h-4 text-green-500\" />;
    if (current < previous) return <ArrowDown className=\"w-4 h-4 text-red-500\" />;
    return <Minus className=\"w-4 h-4 text-gray-500\" />;
  };

  if (isLoading) {
    return (
      <div className=\"p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl\">
        <div className=\"animate-pulse space-y-6\">
          <div className=\"h-8 bg-gray-200 rounded w-1/3\"></div>
          <div className=\"grid grid-cols-4 gap-4\">
            {[...Array(4)].map((_, i) => (
              <div key={i} className=\"h-32 bg-gray-200 rounded-xl\"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className=\"p-8 text-center\">
        <p className=\"text-gray-600\">Fehler beim Laden der Revenue-Daten</p>
      </div>
    );
  }

  return (
    <div className=\"space-y-8\">
      {/* Header */}
      <div className=\"bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 text-white p-8 rounded-2xl\">
        <div className=\"flex items-center justify-between\">
          <div>
            <h1 className=\"text-3xl font-bold mb-2 flex items-center gap-3\">
              <Crown className=\"w-8 h-8 text-yellow-400\" />
              Revenue Growth Dashboard
            </h1>
            <p className=\"text-blue-200 text-lg\">
              AGENTLAND.SAARLAND • Weg zu €25k+ MRR
            </p>
          </div>
          <div className=\"text-right\">
            <div className=\"text-4xl font-bold text-yellow-400\">
              {formatCurrency(metrics.currentMRR)}
            </div>
            <div className=\"text-blue-200\">Aktueller MRR</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6\">
        {/* Current MRR */}
        <div className=\"bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg\">
          <div className=\"flex items-center justify-between mb-4\">
            <DollarSign className=\"w-8 h-8\" />
            <div className=\"text-right\">
              <div className=\"text-2xl font-bold\">{formatCurrency(metrics.currentMRR)}</div>
              <div className=\"text-green-100 text-sm\">Monthly Recurring Revenue</div>
            </div>
          </div>
          <div className=\"bg-white/20 rounded-lg p-3\">
            <div className=\"text-sm font-medium mb-1\">Ziel €25k Progress</div>
            <div className=\"w-full bg-white/30 rounded-full h-2\">
              <div 
                className=\"bg-white rounded-full h-2 transition-all duration-500\"
                style={{ width: `${Math.min(metrics.goalProgress.target25k, 100)}%` }}
              ></div>
            </div>
            <div className=\"text-xs mt-1\">{formatPercent(metrics.goalProgress.target25k)}</div>
          </div>
        </div>

        {/* Total Users */}
        <div className=\"bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg\">
          <div className=\"flex items-center justify-between mb-4\">
            <Users className=\"w-8 h-8\" />
            <div className=\"text-right\">
              <div className=\"text-2xl font-bold\">{metrics.totalUsers.toLocaleString()}</div>
              <div className=\"text-blue-100 text-sm\">Premium Users</div>
            </div>
          </div>
          <div className=\"bg-white/20 rounded-lg p-3\">
            <div className=\"text-sm font-medium mb-1\">Ziel 50k Progress</div>
            <div className=\"w-full bg-white/30 rounded-full h-2\">
              <div 
                className=\"bg-white rounded-full h-2 transition-all duration-500\"
                style={{ width: `${Math.min(metrics.goalProgress.target50kUsers, 100)}%` }}
              ></div>
            </div>
            <div className=\"text-xs mt-1\">{formatPercent(metrics.goalProgress.target50kUsers)}</div>
          </div>
        </div>

        {/* ARPU */}
        <div className=\"bg-gradient-to-br from-purple-500 to-violet-600 text-white p-6 rounded-xl shadow-lg\">
          <div className=\"flex items-center justify-between mb-4\">
            <Target className=\"w-8 h-8\" />
            <div className=\"text-right\">
              <div className=\"text-2xl font-bold\">{formatCurrency(metrics.averageRevenuePerUser)}</div>
              <div className=\"text-purple-100 text-sm\">ARPU</div>
            </div>
          </div>
          <div className=\"space-y-2 text-sm\">
            <div className=\"flex justify-between\">
              <span>Conversion Rate:</span>
              <span className=\"font-bold\">{formatPercent(metrics.conversionRate)}</span>
            </div>
            <div className=\"flex justify-between\">
              <span>Churn Rate:</span>
              <span className=\"font-bold\">{formatPercent(metrics.churnRate)}</span>
            </div>
          </div>
        </div>

        {/* Real-time Today */}
        <div className=\"bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg\">
          <div className=\"flex items-center justify-between mb-4\">
            <Zap className=\"w-8 h-8\" />
            <div className=\"text-right\">
              <div className=\"text-2xl font-bold\">{formatCurrency(metrics.realTimeStats.revenueToday)}</div>
              <div className=\"text-orange-100 text-sm\">Revenue Heute</div>
            </div>
          </div>
          <div className=\"space-y-2 text-sm\">
            <div className=\"flex justify-between\">
              <span>Neue User:</span>
              <span className=\"font-bold\">{metrics.realTimeStats.newUsersToday}</span>
            </div>
            <div className=\"flex justify-between\">
              <span>Upgrades (7d):</span>
              <span className=\"font-bold\">{metrics.realTimeStats.upgradesThisWeek}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projections */}
      {projections && (
        <div className=\"bg-white rounded-2xl shadow-xl p-8\">
          <h2 className=\"text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3\">
            <Sparkles className=\"w-6 h-6 text-yellow-500\" />
            Revenue Projections
          </h2>
          
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8\">
            <div className=\"text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl\">
              <div className=\"text-3xl font-bold text-blue-800 mb-2\">
                {formatCurrency(projections.mrr3Months)}
              </div>
              <div className=\"text-blue-600 font-medium\">3 Monate</div>
              <div className=\"text-sm text-blue-500 mt-1\">
                +{formatPercent(((projections.mrr3Months - metrics.currentMRR) / metrics.currentMRR) * 100)}
              </div>
            </div>
            
            <div className=\"text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl\">
              <div className=\"text-3xl font-bold text-green-800 mb-2\">
                {formatCurrency(projections.mrr6Months)}
              </div>
              <div className=\"text-green-600 font-medium\">6 Monate</div>
              <div className=\"text-sm text-green-500 mt-1\">
                +{formatPercent(((projections.mrr6Months - metrics.currentMRR) / metrics.currentMRR) * 100)}
              </div>
            </div>
            
            <div className=\"text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl\">
              <div className=\"text-3xl font-bold text-purple-800 mb-2\">
                {formatCurrency(projections.mrr12Months)}
              </div>
              <div className=\"text-purple-600 font-medium\">12 Monate</div>
              <div className=\"text-sm text-purple-500 mt-1\">
                +{formatPercent(((projections.mrr12Months - metrics.currentMRR) / metrics.currentMRR) * 100)}
              </div>
            </div>
          </div>

          {/* Target Achievement */}
          <div className=\"bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl\">
            <div className=\"flex items-center justify-between\">
              <div>
                <h3 className=\"text-xl font-bold mb-2\">🎯 €25k MRR Ziel</h3>
                <p className=\"text-yellow-100\">
                  Voraussichtlich erreicht am: {' '}
                  <span className=\"font-bold\">
                    {new Date(projections.targetDate25k).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
              <Award className=\"w-12 h-12 text-yellow-200\" />
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className=\"bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl\">
        <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">🚀 Nächste Schritte für Wachstum</h2>
        
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
          <div className=\"space-y-4\">
            <h3 className=\"text-lg font-semibold text-gray-800\">Kurzziele (30 Tage)</h3>
            <ul className=\"space-y-2 text-gray-700\">
              <li className=\"flex items-center gap-2\">
                <div className=\"w-2 h-2 bg-green-500 rounded-full\"></div>
                Launch A/B Tests für Conversion Optimization
              </li>
              <li className=\"flex items-center gap-2\">
                <div className=\"w-2 h-2 bg-blue-500 rounded-full\"></div>
                Implement Referral Program
              </li>
              <li className=\"flex items-center gap-2\">
                <div className=\"w-2 h-2 bg-purple-500 rounded-full\"></div>
                Enhanced Onboarding Flow
              </li>
            </ul>
          </div>
          
          <div className=\"space-y-4\">
            <h3 className=\"text-lg font-semibold text-gray-800\">Mittelfristig (90 Tage)</h3>
            <ul className=\"space-y-2 text-gray-700\">
              <li className=\"flex items-center gap-2\">
                <div className=\"w-2 h-2 bg-yellow-500 rounded-full\"></div>
                Cross-border DE/FR/LU Expansion
              </li>
              <li className=\"flex items-center gap-2\">
                <div className=\"w-2 h-2 bg-red-500 rounded-full\"></div>
                Enterprise B2B Sales
              </li>
              <li className=\"flex items-center gap-2\">
                <div className=\"w-2 h-2 bg-indigo-500 rounded-full\"></div>
                API Marketplace Launch
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};"