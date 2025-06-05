'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Euro, Zap, TrendingUp, Globe } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1200,
    activeUsers: 876,
    currentMRR: 2100,
    targetMRR: 25000,
    conversionRate: 8.3,
    apiCalls: 15420,
    performance: 0.08
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const progressPercentage = (stats.currentMRR / stats.targetMRR) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003399] mx-auto mb-4"></div>
          <p className="text-[#003399] font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <div className="w-16 h-16 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-[#003399]" />
          </div>
          <h1 className="text-4xl font-bold mb-2 font-quantum">Admin Dashboard</h1>
          <p className="text-xl opacity-90">AGENTLAND.SAARLAND Systemübersicht</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#003399]" />
              </div>
              <span className="text-green-600 text-sm font-medium">+12.3%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Registered Users</p>
          </div>

          {/* Monthly Recurring Revenue */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+15.7%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">€{stats.currentMRR.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Monthly Recurring Revenue</p>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">Excellent</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.performance}s</h3>
            <p className="text-gray-600 text-sm">Average Load Time</p>
          </div>

          {/* API Calls */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+8.1%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.apiCalls.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">API Calls Today</p>
          </div>
        </div>

        {/* Revenue Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Progress to €25,000 MRR Target</h2>
            <span className="text-[#003399] font-bold">{progressPercentage.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-[#003399] to-[#009FE3] h-4 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current: €{stats.currentMRR.toLocaleString()}</span>
            <span>Target: €{stats.targetMRR.toLocaleString()}</span>
          </div>
        </div>

        {/* Feature Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Features */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mobile Optimization</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">LIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Saarland Knowledge Base</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Premium Subscriptions</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">TESTING</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Government APIs</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">PENDING</span>
              </div>
            </div>
          </div>

          {/* Regional Impact */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Saarland Impact</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Population Reached</span>
                <span className="font-semibold text-[#003399]">0.12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Municipalities Connected</span>
                <span className="font-semibold text-[#003399]">10/52</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Business Partnerships</span>
                <span className="font-semibold text-[#003399]">3 Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cross-border Users</span>
                <span className="font-semibold text-[#003399]">23%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-8 bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-xl p-6 text-white">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 mr-3" />
            <h3 className="text-xl font-bold">Mission: Saarland als KI-Hub</h3>
          </div>
          <p className="text-white/90 leading-relaxed">
            AGENTLAND.SAARLAND entwickelt sich zur führenden regionalen KI-Plattform Deutschlands. 
            Mit {stats.totalUsers.toLocaleString()} Nutzern und €{stats.currentMRR.toLocaleString()} MRR 
            beweisen wir, dass regionale KI-Plattformen erfolgreich sein können.
          </p>
        </div>
      </div>
    </div>
  )
}