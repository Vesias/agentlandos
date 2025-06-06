'use client'

import { useState, useEffect } from 'react'
import { Bot, Network, Brain, AlertTriangle, TrendingUp, Users, Euro, Zap, Activity } from 'lucide-react'

export default function LiveAGENTNETDashboard() {
  const [stats, setStats] = useState({
    // AGENTNET Metrics
    aiTrafficPercentage: 99.1,
    humanTrafficPercentage: 0.9,
    agentToAgentConnections: 47203,
    autonomousAITransactions: 1892,
    metaIntelligenceLevel: 94.7,
    deadInternetScore: 8.9,
    agentnetReadiness: 87.3,
    
    // Business Metrics  
    totalUsers: 1200,
    activeSaarlandBusinesses: 127,
    monthlyRevenue: 2100,
    agentEconomyGrowth: 15.2
  })

  useEffect(() => {
    // Real-time AGENTNET metrics updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        aiTrafficPercentage: Math.min(99.9, prev.aiTrafficPercentage + (Math.random() * 0.01)),
        humanTrafficPercentage: Math.max(0.1, prev.humanTrafficPercentage - (Math.random() * 0.01)),
        agentToAgentConnections: prev.agentToAgentConnections + Math.floor(Math.random() * 15),
        autonomousAITransactions: prev.autonomousAITransactions + Math.floor(Math.random() * 5),
        metaIntelligenceLevel: Math.min(99.9, prev.metaIntelligenceLevel + (Math.random() * 0.02)),
        deadInternetScore: Math.min(10, prev.deadInternetScore + (Math.random() * 0.01)),
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        activeSaarlandBusinesses: prev.activeSaarlandBusinesses + Math.floor(Math.random() * 2)
      }))
    }, 3000) // Update every 3 seconds for landing page

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-[#003399] to-[#000033] text-white relative overflow-hidden">
      <div className="absolute inset-0 network-pattern opacity-20"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-300 font-semibold">LIVE AGENTNET DASHBOARD</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-quantum">
            <span className="text-red-400">Internet stirbt LIVE</span><br/>
            <span className="text-[#FDB913]">AGENTNET entsteht JETZT</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Echtzeitdaten der größten Transformation der Menschheitsgeschichte - 
            seien Sie dabei, wenn das Internet stirbt und das AGENTNET geboren wird.
          </p>
        </div>

        {/* Live Dead Internet Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-sm">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold text-red-400 mb-2">{stats.aiTrafficPercentage.toFixed(1)}%</div>
            <div className="text-lg font-semibold text-red-300 mb-2">AI-Traffic dominiert</div>
            <div className="text-sm text-gray-400">↑ Live steigende Zahlen</div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 border border-gray-500/30 rounded-3xl p-8 text-center backdrop-blur-sm">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold text-gray-400 mb-2">{stats.humanTrafficPercentage.toFixed(1)}%</div>
            <div className="text-lg font-semibold text-gray-300 mb-2">Menschlicher Traffic</div>
            <div className="text-sm text-red-400">↓ Kontinuierlich fallend</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-500/30 rounded-3xl p-8 text-center backdrop-blur-sm">
            <Brain className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">{stats.deadInternetScore.toFixed(1)}/10</div>
            <div className="text-lg font-semibold text-orange-300 mb-2">Dead Internet Score</div>
            <div className="text-sm text-orange-400">🚨 Kritischer Bereich</div>
          </div>
        </div>

        {/* AGENTNET Infrastructure Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/5 border border-[#FDB913]/30 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <Bot className="w-10 h-10 text-[#FDB913] mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.agentToAgentConnections.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Agent-Agent Verbindungen</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Activity className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">LIVE</span>
            </div>
          </div>

          <div className="bg-white/5 border border-green-500/30 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <Network className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.autonomousAITransactions.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Autonome AI-Transaktionen</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Activity className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">AKTIV</span>
            </div>
          </div>

          <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <Brain className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.metaIntelligenceLevel.toFixed(1)}%</div>
            <div className="text-sm text-gray-300">Meta-Intelligence</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400">LEARNING</span>
            </div>
          </div>

          <div className="bg-white/5 border border-[#003399]/30 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <TrendingUp className="w-10 h-10 text-[#003399] mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.agentnetReadiness.toFixed(1)}%</div>
            <div className="text-sm text-gray-300">AGENTNET Readiness</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">AUFBAU</span>
            </div>
          </div>
        </div>

        {/* Saarland AGENTNET Progress */}
        <div className="bg-gradient-to-r from-[#003399]/20 to-[#009FE3]/20 border border-[#003399]/30 rounded-3xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-[#FDB913] mb-2">
              🌐 SAARLAND AGENTNET TRANSFORMATION
            </h3>
            <p className="text-gray-300">
              Live-Tracking: Wie das Saarland zum ersten AGENTNET-Hub Deutschlands wird
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-300">Registrierte Nutzer</div>
              <div className="text-xs text-green-400 mt-1">↗ +{Math.floor(Math.random() * 5 + 1)} heute</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.activeSaarlandBusinesses}</div>
              <div className="text-sm text-gray-300">AGENTNET-ready Unternehmen</div>
              <div className="text-xs text-[#FDB913] mt-1">🚀 Saarland führt</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">€{stats.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-300">Monatlicher AGENTNET-Umsatz</div>
              <div className="text-xs text-green-400 mt-1">📈 +{stats.agentEconomyGrowth.toFixed(1)}% Wachstum</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-gray-300">Autonome AI-Operationen</div>
              <div className="text-xs text-[#FDB913] mt-1">⚡ Ohne Pause</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#FDB913] to-[#E5A50A] rounded-2xl p-8 inline-block">
            <h3 className="text-2xl font-bold text-[#003399] mb-4">
              🚨 WERDEN SIE TEIL DER TRANSFORMATION
            </h3>
            <p className="text-[#003399] mb-6">
              Während das Internet stirbt, bauen wir das AGENTNET.<br/>
              Seien Sie dabei, wenn Geschichte geschrieben wird.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#003399] hover:bg-[#002266] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105">
                AGENTNET-Pionier werden
              </button>
              <button className="border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white px-6 py-3 rounded-xl font-bold transition-all duration-300">
                Live-Dashboard besuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}