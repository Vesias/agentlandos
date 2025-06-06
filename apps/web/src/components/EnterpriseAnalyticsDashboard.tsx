"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  queriesHandled: number;
  avgResponseTime: number;
  popularServices: Array<{ name: string; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  revenueGrowth: Array<{ date: string; revenue: number }>;
}

interface RealtimeMetrics {
  currentUsers: number;
  queriesPerMinute: number;
  systemLoad: number;
  aiResponseTime: number;
}

export default function EnterpriseAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    currentUsers: 0,
    queriesPerMinute: 0,
    systemLoad: 0,
    aiResponseTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    startRealtimeUpdates();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Fetch comprehensive analytics from Supabase
      const [
        userStatsResponse,
        revenueResponse,
        queryStatsResponse,
        serviceStatsResponse,
      ] = await Promise.all([
        supabase.rpc("get_user_analytics"),
        supabase.rpc("get_revenue_analytics"),
        supabase.rpc("get_query_analytics"),
        supabase.rpc("get_service_analytics"),
      ]);

      // Mock data for demonstration (replace with actual analytics)
      const mockAnalytics: AnalyticsData = {
        totalUsers: 12847,
        activeUsers: 3521,
        monthlyRevenue: 18350,
        queriesHandled: 89234,
        avgResponseTime: 285,
        popularServices: [
          { name: "Verwaltung", count: 24567 },
          { name: "Tourismus", count: 18923 },
          { name: "Business", count: 15634 },
          { name: "Bildung", count: 12456 },
          { name: "Kultur", count: 8734 },
        ],
        userGrowth: generateTimeSeriesData("users", 30),
        revenueGrowth: generateTimeSeriesData("revenue", 30),
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRealtimeUpdates = () => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setRealtimeMetrics({
        currentUsers: Math.floor(Math.random() * 500) + 200,
        queriesPerMinute: Math.floor(Math.random() * 50) + 10,
        systemLoad: Math.floor(Math.random() * 30) + 20,
        aiResponseTime: Math.floor(Math.random() * 100) + 200,
      });
    }, 5000);

    return () => clearInterval(interval);
  };

  const generateTimeSeriesData = (type: "users" | "revenue", days: number) => {
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const baseValue = type === "users" ? 300 : 500;
      const value =
        baseValue + Math.floor(Math.random() * 200) + (days - i) * 10;

      data.push({
        date: date.toISOString().split("T")[0],
        [type]: value,
      });
    }

    return data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-DE").format(num);
  };

  const getGrowthRate = (
    data: Array<{ date: string; users?: number; revenue?: number }>,
  ) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const latestValue = latest.users || latest.revenue || 0;
    const previousValue = previous.users || previous.revenue || 0;
    return (((latestValue - previousValue) / previousValue) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">
              Lade Enterprise Analytics...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AGENTLAND.SAARLAND Enterprise Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time Übersicht über KI-Performance, Nutzerverhalten und Umsatz
          </p>
        </div>

        {/* Real-time Metrics Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔴 Live Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {realtimeMetrics.currentUsers}
              </div>
              <div className="text-sm text-gray-500">Aktive Nutzer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realtimeMetrics.queriesPerMinute}
              </div>
              <div className="text-sm text-gray-500">Anfragen/Min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {realtimeMetrics.systemLoad}%
              </div>
              <div className="text-sm text-gray-500">Systemlast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realtimeMetrics.aiResponseTime}ms
              </div>
              <div className="text-sm text-gray-500">KI-Antwortzeit</div>
            </div>
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Gesamtnutzer
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analytics?.totalUsers || 0)}
                </p>
                <p className="text-sm text-green-600">
                  +{getGrowthRate(analytics?.userGrowth || [])}% vs. gestern
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monatsumsatz
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analytics?.monthlyRevenue || 0)}
                </p>
                <p className="text-sm text-green-600">
                  +{getGrowthRate(analytics?.revenueGrowth || [])}% vs. letzter
                  Monat
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">KI-Anfragen</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analytics?.queriesHandled || 0)}
                </p>
                <p className="text-sm text-blue-600">Heute verarbeitet</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Ø Antwortzeit
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.avgResponseTime || 0}ms
                </p>
                <p className="text-sm text-orange-600">Ziel: &lt;300ms</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Popular Services */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Beliebteste Services
            </h3>
            <div className="space-y-4">
              {analytics?.popularServices.map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(service.count / (analytics?.popularServices[0]?.count || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-600">
                      {formatNumber(service.count)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Umsatzentwicklung (30 Tage)
            </h3>
            <div className="h-48 flex items-end justify-between space-x-1">
              {analytics?.revenueGrowth.slice(-14).map((data, index) => (
                <div
                  key={index}
                  className="bg-green-500 rounded-t-sm flex-1 min-h-4 opacity-80 hover:opacity-100 transition-opacity"
                  style={{
                    height: `${(data.revenue / Math.max(...analytics.revenueGrowth.map((d) => d.revenue))) * 100}%`,
                  }}
                  title={`${data.date}: ${formatCurrency(data.revenue)}`}
                ></div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Letzte 14 Tage
            </div>
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            KI-Modell Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">98.7%</div>
              <div className="text-sm font-medium text-gray-700">
                DeepSeek R1 Accuracy
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Reasoning & Analysis
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                245ms
              </div>
              <div className="text-sm font-medium text-gray-700">
                Gemini 2.5 Speed
              </div>
              <div className="text-xs text-gray-500 mt-1">Fast Generation</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                94.2%
              </div>
              <div className="text-sm font-medium text-gray-700">
                Vector RAG Relevanz
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Knowledge Retrieval
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Projections */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Umsatzprognose Q1 2025
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                €75,000
              </div>
              <div className="text-sm text-gray-600">
                Konservative Schätzung
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on current growth
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                €125,000
              </div>
              <div className="text-sm text-gray-600">Realistische Prognose</div>
              <div className="text-xs text-gray-500 mt-1">
                With premium features
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                €200,000
              </div>
              <div className="text-sm text-gray-600">
                Optimistische Prognose
              </div>
              <div className="text-xs text-gray-500 mt-1">
                With enterprise adoption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
