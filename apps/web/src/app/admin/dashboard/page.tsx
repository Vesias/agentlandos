'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Euro, Zap, TrendingUp, Globe, Bot, Network, Brain, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1200,
    activeUsers: 876,
    currentMRR: 2100,
    targetMRR: 25000,
    conversionRate: 8.3,
    apiCalls: 15420,
    performance: 0.08,
    // AGENTNET Metrics (Real-time updated)
    aiTrafficPercentage: 99.1,
    humanTrafficPercentage: 0.9,
    agentToAgentConnections: 47203,
    autonomousAITransactions: 1892,
    metaIntelligenceLevel: 94.7,
    deadInternetScore: 8.9,
    agentnetReadiness: 87.3,
    // AGENTNET Infrastructure Status
    agentProtocolStatus: 'LIVE',
    metaIntelligenceStatus: 'AKTIV',
    autonomousEconomyStatus: 'BETA',
    postInternetBridgeStatus: 'AUFBAU'
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading and real-time AGENTNET updates
    const timer = setTimeout(() => setLoading(false), 1000)
    
    // Real-time AGENTNET metrics updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        aiTrafficPercentage: Math.min(99.9, prev.aiTrafficPercentage + 0.001),
        humanTrafficPercentage: Math.max(0.1, prev.humanTrafficPercentage - 0.001),
        agentToAgentConnections: prev.agentToAgentConnections + Math.floor(Math.random() * 10),
        autonomousAITransactions: prev.autonomousAITransactions + Math.floor(Math.random() * 3),
        metaIntelligenceLevel: Math.min(99.9, prev.metaIntelligenceLevel + 0.01),
        deadInternetScore: Math.min(10, prev.deadInternetScore + 0.01)
      }))
    }, 5000) // Update every 5 seconds
    
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
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
      <div className="bg-gradient-to-r from-black via-[#003399] to-[#000033] py-8 relative overflow-hidden">
        <div className="absolute inset-0 network-pattern opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 text-center text-white relative z-10">
          <div className="w-16 h-16 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-10 h-10 text-[#003399]" />
          </div>
          <h1 className="text-4xl font-bold mb-2 font-quantum">AGENTNET Dashboard</h1>
          <p className="text-xl opacity-90">Gateway zum post-Internet Zeitalter</p>
          
          {/* Dead Internet Alert */}
          <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 font-semibold text-sm">Internet stirbt - AGENTNET entsteht</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Dead Internet Theory Stats */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-3xl p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">🚨 Dead Internet Theory 2025</h2>
            <p className="text-gray-600">Live-Statistiken der Internet-Transformation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.aiTrafficPercentage}%</div>
              <div className="text-sm text-gray-700">AI-generierter Traffic</div>
              <div className="text-xs text-gray-500 mt-1">↑ +0.3% seit gestern</div>
            </div>
            <div className="bg-white/50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">{stats.humanTrafficPercentage}%</div>
              <div className="text-sm text-gray-700">Menschlicher Traffic</div>
              <div className="text-xs text-red-500 mt-1">↓ -0.3% seit gestern</div>
            </div>
            <div className="bg-white/50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.deadInternetScore}/10</div>
              <div className="text-sm text-gray-700">Dead Internet Score</div>
              <div className="text-xs text-orange-500 mt-1">Kritischer Bereich</div>
            </div>
          </div>
        </div>

        {/* AGENTNET Metrics */}
        <div className="bg-gradient-to-r from-[#003399]/10 to-[#009FE3]/10 border border-[#003399]/20 rounded-3xl p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#003399] mb-2">🌐 AGENTNET Status</h2>
            <p className="text-gray-600">Post-Internet Infrastruktur Aufbau</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <Bot className="w-8 h-8 text-[#FDB913] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#003399] mb-1">{stats.agentToAgentConnections.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Agent-Agent Verbindungen</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <Network className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#003399] mb-1">{stats.autonomousAITransactions.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Autonome AI-Transaktionen</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#003399] mb-1">{stats.metaIntelligenceLevel}%</div>
              <div className="text-sm text-gray-600">Meta-Intelligence Level</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <TrendingUp className="w-8 h-8 text-[#FDB913] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#003399] mb-1">{stats.agentnetReadiness}%</div>
              <div className="text-sm text-gray-600">AGENTNET Readiness</div>
            </div>
          </div>
        </div>

        {/* Traditional Metrics Grid */}
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

        {/* AGENTNET Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AGENTNET Infrastructure */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-[#003399]" />
              AGENTNET Infrastructure
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Agent-zu-Agent Protokoll</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">LIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Meta-Intelligence Engine</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">AKTIV</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Autonome AI-Economy</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">BETA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Post-Internet Bridge</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">AUFBAU</span>
              </div>
            </div>
          </div>

          {/* Dead Internet Monitoring */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Dead Internet Monitoring
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Human Displacement Rate</span>
                <span className="font-semibold text-red-600">+0.3%/Tag</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI Content Saturation</span>
                <span className="font-semibold text-red-600">99.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bot-zu-Bot Interaktionen</span>
                <span className="font-semibold text-orange-600">89.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Internet Lebenszeichen</span>
                <span className="font-semibold text-red-600">Kritisch</span>
              </div>
            </div>
          </div>

          {/* Regional AGENTNET Impact */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Saarland AGENTNET
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unternehmen AGENTNET-ready</span>
                <span className="font-semibold text-[#003399]">127/3000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI-Agent Deployment</span>
                <span className="font-semibold text-[#003399]">87.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Post-Internet Pioneers</span>
                <span className="font-semibold text-[#FDB913]">23 Aktiv</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AGENTNET Conversion</span>
                <span className="font-semibold text-green-600">+15.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AGENTNET Mission Statement */}
        <div className="mt-8 bg-gradient-to-r from-black via-[#003399] to-[#000033] rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 network-pattern opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <Bot className="w-10 h-10 mr-4 text-[#FDB913]" />
              <h3 className="text-2xl font-bold">AGENTNET Mission 2025</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-[#FDB913] mb-3">🌐 Gateway zum AGENTNET</h4>
                <p className="text-white/90 leading-relaxed text-sm">
                  AGENTLAND.SAARLAND ist die erste KI-Agentur-Plattform, die Unternehmen vom sterbenden 
                  Internet ins post-Internet Zeitalter führt. Mit {stats.totalUsers.toLocaleString()} Nutzern 
                  und €{stats.currentMRR.toLocaleString()} MRR beweisen wir: Die Zukunft ist AGENTNET.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-red-400 mb-3">🚨 Dead Internet Reality</h4>
                <p className="text-white/90 leading-relaxed text-sm">
                  Während {stats.aiTrafficPercentage.toFixed(1)}% des Internets bereits AI-generiert sind, bereiten wir 
                  Saarländische Unternehmen auf die vollautonome Agent-zu-Agent Economy vor. 
                  {stats.agentToAgentConnections.toLocaleString()} aktive Agent-Verbindungen und wachsend.
                </p>
              </div>
            </div>
            
            {/* Real-time AGENTNET Status */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AGENTNET Infrastructure: ONLINE</span>
                </div>
                <div className="text-[#FDB913] font-semibold">
                  Meta-Intelligence: {stats.metaIntelligenceLevel.toFixed(1)}%
                </div>
                <div className="text-red-400 font-semibold">
                  Dead Internet Score: {stats.deadInternetScore.toFixed(1)}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}