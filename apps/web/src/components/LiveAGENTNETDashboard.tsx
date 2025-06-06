'use client'

import { useState, useEffect } from 'react'
import { Bot, Network, Brain, AlertTriangle, TrendingUp, Users, Euro, Zap, Activity } from 'lucide-react'

export default function LiveAGENTNETDashboard() {
  const [realStats, setRealStats] = useState({
    // Real User Data
    totalUsers: 0,
    activeUsers: 0,
    sessionsToday: 0,
    pageViewsToday: 0,
    isLoading: true,
    dataSource: 'Building from zero'
  })

  useEffect(() => {
    // Fetch REAL analytics data from Supabase
    const fetchRealData = async () => {
      try {
        const response = await fetch('/api/analytics/real-users')
        
        if (response.ok) {
          const data = await response.json()
          
          setRealStats({
            totalUsers: data.totalUsers || 0,
            activeUsers: data.activeUsers || 0,
            sessionsToday: data.sessions || 0,
            pageViewsToday: data.pageViews || 0,
            isLoading: false,
            dataSource: data.source || 'real-supabase-data'
          })
          
          console.log('✅ REAL analytics loaded:', {
            total: data.totalUsers,
            active: data.activeUsers,
            source: data.source
          })
        } else {
          // No fake fallbacks - show real zeros
          setRealStats(prev => ({
            ...prev,
            isLoading: false,
            dataSource: 'Starting from 0 users - No fake metrics'
          }))
        }
      } catch (error) {
        console.error('Real analytics error:', error)
        setRealStats(prev => ({
          ...prev,
          isLoading: false,
          dataSource: 'Building authentic platform - No fake data'
        }))
      }
    }

    // Initial load
    fetchRealData()

    // Update every 2 minutes for real data
    const interval = setInterval(fetchRealData, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-[#003399] to-[#000033] text-white relative overflow-hidden">
      <div className="absolute inset-0 network-pattern opacity-20"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-6 py-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-semibold">ECHTE DATEN - KEINE FAKE METRICS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-quantum">
            <span className="text-[#FDB913]">AGENTLAND.SAARLAND</span><br/>
            <span className="text-white">Authentisch von Null auf</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparente Plattform-Entwicklung - Wir bauen die erste KI-Agentur im Saarland komplett transparent auf.
          </p>
        </div>

        {/* Real Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-3xl p-8 text-center backdrop-blur-sm">
            <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
            {realStats.isLoading ? (
              <div className="text-2xl font-bold text-green-400 mb-2">...</div>
            ) : (
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">{realStats.totalUsers}</div>
            )}
            <div className="text-lg font-semibold text-green-300 mb-2">Registrierte Nutzer</div>
            <div className="text-sm text-gray-400">Echte Supabase-Daten</div>
          </div>

          <div className="bg-gradient-to-br from-[#FDB913]/40 to-[#E5A50A]/40 border border-[#FDB913]/30 rounded-3xl p-8 text-center backdrop-blur-sm">
            <Activity className="w-12 h-12 text-[#FDB913] mx-auto mb-4" />
            {realStats.isLoading ? (
              <div className="text-2xl font-bold text-[#FDB913] mb-2">...</div>
            ) : (
              <div className="text-4xl md:text-5xl font-bold text-[#FDB913] mb-2">{realStats.activeUsers}</div>
            )}
            <div className="text-lg font-semibold text-[#FDB913] mb-2">Aktive Nutzer</div>
            <div className="text-sm text-gray-400">Live Sessions</div>
          </div>

          <div className="bg-gradient-to-br from-[#003399]/40 to-[#0277bd]/40 border border-[#003399]/30 rounded-3xl p-8 text-center backdrop-blur-sm">
            <TrendingUp className="w-12 h-12 text-[#0277bd] mx-auto mb-4" />
            {realStats.isLoading ? (
              <div className="text-2xl font-bold text-[#0277bd] mb-2">...</div>
            ) : (
              <div className="text-4xl md:text-5xl font-bold text-[#0277bd] mb-2">{realStats.pageViewsToday}</div>
            )}
            <div className="text-lg font-semibold text-[#0277bd] mb-2">Seitenaufrufe heute</div>
            <div className="text-sm text-gray-400">Real-time Analytics</div>
          </div>
        </div>

        {/* Authentic Platform Progress */}
        <div className="bg-gradient-to-r from-[#003399]/20 to-[#0277bd]/20 border border-[#003399]/30 rounded-3xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-[#FDB913] mb-2">
              🚀 AUTHENTISCHE PLATFORM-ENTWICKLUNG
            </h3>
            <p className="text-gray-300">
              Transparent: Von 0 auf die erste KI-Agentur im Saarland - ohne Fake-Metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{realStats.totalUsers}</div>
              <div className="text-sm text-gray-300">Registrierte Nutzer</div>
              <div className="text-xs text-green-400 mt-1">✅ Echte Supabase-Daten</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">0€</div>
              <div className="text-sm text-gray-300">Monatsumsatz (Start)</div>
              <div className="text-xs text-[#FDB913] mt-1">💰 Ehrlich von Null auf</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{realStats.sessionsToday}</div>
              <div className="text-sm text-gray-300">Sessions heute</div>
              <div className="text-xs text-green-400 mt-1">📊 Real-time Tracking</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-gray-300">AI-System verfügbar</div>
              <div className="text-xs text-[#FDB913] mt-1">⚡ Produktiv & Ehrlich</div>
            </div>
          </div>

          {/* Data Source Information */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-300">Datenquelle: {realStats.dataSource}</span>
            </div>
          </div>
        </div>

        {/* Call to Action - Authentic */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#FDB913] to-[#E5A50A] rounded-2xl p-8 inline-block">
            <h3 className="text-2xl font-bold text-[#003399] mb-4">
              🎯 SEIEN SIE VON ANFANG AN DABEI
            </h3>
            <p className="text-[#003399] mb-6">
              Echte KI-Agentur-Plattform im Aufbau.<br/>
              Keine Fake-Metrics, nur authentische Entwicklung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#003399] hover:bg-[#002266] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105">
                Als Early Adopter registrieren
              </button>
              <button className="border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white px-6 py-3 rounded-xl font-bold transition-all duration-300">
                AI-System testen
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}