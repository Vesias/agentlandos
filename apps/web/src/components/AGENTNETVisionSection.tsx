'use client'

import Link from 'next/link'
import { Network, Zap, Brain, Bot, Globe, TrendingUp, Shield, ArrowRight } from 'lucide-react'

export default function AGENTNETVisionSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-[#003399] to-[#000033] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,51,153,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 network-pattern opacity-30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-300 font-semibold">DEAD INTERNET THEORY 2025</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-quantum">
            <span className="text-red-400">Das Internet stirbt</span><br/>
            <span className="text-[#FDB913]">Das AGENTNET wird real</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Wir erkannten frühzeitig, was heute Realität ist: 99% des Internet-Traffics sind bereits KI-generiert. 
            Während andere noch im sterbenden Internet denken, bauen wir das AGENTNET.
          </p>
          
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 max-w-3xl mx-auto backdrop-blur-sm">
            <h3 className="text-lg font-bold text-[#FDB913] mb-3">🚨 AKTUELLE FORSCHUNG 2025:</h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>• Meta entwickelt autonome AI-Accounts mit eigenen Profilen</li>
              <li>• China's Manus-Agent führt selbständig Aufgaben ohne menschliche Kontrolle aus</li>
              <li>• Google bestätigt: Such-Ergebnisse von AI-generierten Websites dominiert</li>
              <li>• 50.4% menschlicher Traffic 2023 → Minderheit 2025</li>
            </ul>
          </div>
        </div>

        {/* AGENTNET Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          
          {/* Agent-zu-Agent Kommunikation */}
          <div className="bg-gray-900/50 border border-[#FDB913]/30 rounded-3xl p-8 hover:border-[#FDB913]/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FDB913] to-[#E5A50A] rounded-2xl flex items-center justify-center mb-6">
              <Network className="w-8 h-8 text-[#003399]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#FDB913]">
              🤖 Agent-zu-Agent Kommunikation
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Direkte AI-Vernetzung ohne menschliche Interfaces. KI-Agenten verhandeln, kooperieren und optimieren autonom.
            </p>
          </div>

          {/* Post-Internet Infrastruktur */}
          <div className="bg-gray-900/50 border border-[#003399]/30 rounded-3xl p-8 hover:border-[#003399]/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-[#003399] to-[#0052CC] rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#003399]">
              🌐 Post-Internet Infrastruktur
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Dezentrales Netzwerk autonomer KI-Agenten ersetzt traditionelle Websites und menschliche Interfaces.
            </p>
          </div>

          {/* Autonome AI-Economy */}
          <div className="bg-gray-900/50 border border-green-500/30 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-green-400">
              💰 Autonome AI-Economy
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              KI-Agenten handeln, verkaufen und optimieren eigenständig. Vollautomatische Umsatzgenerierung 24/7.
            </p>
          </div>

          {/* Meta-Intelligence */}
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-purple-400">
              🧠 Meta-Intelligence
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Kollektive KI-Intelligenz übertrifft menschliche Kapazitäten. Emergente Superintelligenz durch Vernetzung.
            </p>
          </div>
        </div>

        {/* Vicious Cycle Visualization */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-3xl p-8 md:p-12 mb-16 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-red-400">
              🔄 Der Teufelskreis des Sterbenden Internets
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              AI-Agenten generieren Content → AI-Agenten interagieren damit → Menschen werden verdrängt → Internet wird lebloser aber aktiver denn je
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-red-400" />
              </div>
              <h4 className="font-bold text-red-300 mb-2">AI-Content Generation</h4>
              <p className="text-sm text-gray-400">99% der Inhalte von KI erstellt</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500/20 border border-orange-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-10 h-10 text-orange-400" />
              </div>
              <h4 className="font-bold text-orange-300 mb-2">AI-AI Interaction</h4>
              <p className="text-sm text-gray-400">Agenten sprechen nur mit Agenten</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-500/20 border border-gray-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-300 mb-2">Human Displacement</h4>
              <p className="text-sm text-gray-400">Menschen verlassen das Internet</p>
            </div>
          </div>
        </div>

        {/* AGENTLAND als Gateway */}
        <div className="bg-gradient-to-r from-[#003399] to-[#0277bd] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 network-pattern opacity-20"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-[#FDB913] rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Bot className="w-12 h-12 text-[#003399]" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-6 font-quantum">
              AGENTLAND.SAARLAND<br/>
              <span className="text-[#FDB913]">Gateway zum AGENTNET</span>
            </h3>
            
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Seien Sie Pionier des post-Internet Zeitalters. Während andere im sterbenden Internet gefangen sind, 
              führen wir Sie ins AGENTNET - wo autonome KI-Agenten Ihr Unternehmen exponentiell wachsen lassen.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="font-bold text-[#FDB913] mb-2">🚀 HEUTE VERFÜGBAR</h4>
                <p className="text-sm">Multi-Agent Systeme für Business-Automatisierung</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="font-bold text-[#FDB913] mb-2">⚡ AGENTNET-READY</h4>
                <p className="text-sm">Vorbereitung auf vollautonome AI-Economy</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?plan=agentnet">
                <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
                  AGENTNET-Pionier werden
                </button>
              </Link>
              <Link href="/chat">
                <button className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
                  AI-Agenten testen
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}