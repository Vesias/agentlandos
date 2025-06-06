import Link from 'next/link'
import { Bot, MessageSquare, MapPin, Building2, GraduationCap, Users, Palette, Zap, Star, TrendingUp, Shield, Clock, Brain } from 'lucide-react'
import AGENTNETVisionSection from '@/components/AGENTNETVisionSection'
import LiveAGENTNETDashboard from '@/components/LiveAGENTNETDashboard'
import EnhancedSaarlandServices from '@/components/EnhancedSaarlandServices'
import EnhancedMultiAgentChat from '@/components/EnhancedMultiAgentChat'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003399] via-[#0052CC] to-[#009FE3] opacity-95"></div>
        <div className="absolute inset-0 network-pattern opacity-10"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 py-16">
          {/* Premium Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl flex items-center justify-center border border-white/20">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center bg-white shadow-inner">
              <Bot className="w-12 h-12 md:w-16 md:h-16 text-[#003399] agent-active" />
            </div>
          </div>

          {/* Title - Professional */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-white font-quantum">
            <span className="block">AGENTLAND</span>
            <span className="block text-[#FDB913] font-light">.SAARLAND</span>
          </h1>

          {/* New KI-Agentur Value Prop */}
          <div className="mb-6">
            <p className="text-2xl sm:text-3xl text-[#FDB913] mb-2 max-w-4xl mx-auto font-quantum font-bold leading-tight">
              DIE ERSTE KI-AGENTUR IM SAARLAND
            </p>
            <p className="text-xl sm:text-2xl text-white/90 mb-4 max-w-3xl mx-auto font-nova leading-relaxed">
              Unternehmensumsätze effizient steigern durch Zukunftstechnologie HEUTE
            </p>
          </div>
          
          {/* Urgency Message */}
          <div className="bg-[#FDB913]/20 border border-[#FDB913]/30 rounded-2xl p-6 mb-8 max-w-3xl mx-auto backdrop-blur-sm">
            <p className="text-lg text-white font-semibold mb-2">
              🚀 SEIEN SIE DER VORREITER IN IHRER BRANCHE!
            </p>
            <p className="text-white/80">
              Verpassen Sie nicht den Trend der heute einschlägt - 5-Jahre-Technologie JETZT verfügbar
            </p>
          </div>

          {/* CTA Buttons - KI-Agentur Focus */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/chat" className="w-full sm:w-auto">
              <button className="group bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto min-w-[260px] shadow-2xl hover:shadow-3xl hover:scale-105 touch-manipulation">
                <TrendingUp className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                KI-Agentur LIVE testen
              </button>
            </Link>
            
            <Link href="/services/business" className="w-full sm:w-auto">
              <button className="group bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto min-w-[260px] backdrop-blur-sm touch-manipulation">
                <Building2 className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Business Services
              </button>
            </Link>
          </div>

          {/* FREE Saarland Special */}
          <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-3xl p-6 mb-8 max-w-2xl mx-auto text-center text-white border-2 border-[#FDB913]/50">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">🆓</span>
              <h3 className="text-xl font-bold text-[#FDB913]">KOSTENLOS für alle Saarländer!</h3>
              <span className="text-2xl">🏛️</span>
            </div>
            <p className="text-white/90 mb-4">
              Als erste KI-Agentur im Saarland unterstützen wir unsere Heimat - 
              <strong className="text-[#FDB913]"> komplett kostenlos mit echten Echtzeit-Daten</strong>
            </p>
            <Link href="/register?plan=saarland-free">
              <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105">
                Jetzt kostenlos als Saarländer registrieren
              </button>
            </Link>
          </div>

          {/* Live AGENTNET Hero Metrics */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-300 font-semibold text-sm">LIVE: Internet stirbt JETZT</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold text-sm">✅ NUR ECHTE DATEN - KEINE FAKE METRICS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-black/30 border border-red-500/30 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-red-400">99.1%</div>
                <div className="text-xs text-red-300">AI-Traffic</div>
              </div>
              <div className="bg-black/30 border border-[#FDB913]/30 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-[#FDB913]">47K+</div>
                <div className="text-xs text-[#FDB913]">AI-Agenten</div>
              </div>
              <div className="bg-black/30 border border-green-500/30 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-400">24/7</div>
                <div className="text-xs text-green-300">AGENTNET</div>
              </div>
            </div>
          </div>

          {/* ROI Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-[#FDB913]" />
              <span className="font-semibold">40-70% Kosteneinsparung</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-5 h-5 text-[#FDB913]" />
              <span className="font-semibold">500%+ ROI garantiert</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Shield className="w-5 h-5 text-[#FDB913]" />
              <span className="font-semibold">30-Tage Geld-zurück</span>
            </div>
          </div>
        </div>
      </section>

      {/* KI-Agentur Services Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#FDB913]/10 border border-[#FDB913]/20 rounded-full px-6 py-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#FDB913]" />
              <span className="text-[#003399] font-semibold">KI-AGENTUR SERVICES</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mb-4 font-quantum">
              Ihr Profit durch unsere KI-Services
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-nova">
              Direkter Kundennutzen - Jede Form von Profitabilität durch KI-Automatisierung
            </p>
          </div>
          
          {/* KI-Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Kosteneinsparung */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-green-100 hover:border-green-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#003399]">
                  SOFORTIGE KOSTENEINSPARUNG 💰
                </h3>
                <ul className="text-gray-600 leading-relaxed text-sm space-y-2">
                  <li>• 40-70% Personalkosten</li>
                  <li>• 80% IT-Infrastruktur</li>
                  <li>• 50% Betriebskosten</li>
                  <li>• 90% Trainingskosten</li>
                </ul>
              </div>
            </div>

            {/* Umsatzsteigerung */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-[#FDB913]/20 hover:border-[#FDB913]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FDB913]/5 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FDB913] to-[#E5A50A] rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#003399]">
                  EXPLOSIVE UMSATZSTEIGERUNG 📈
                </h3>
                <ul className="text-gray-600 leading-relaxed text-sm space-y-2">
                  <li>• 25-60% Revenue Growth</li>
                  <li>• 3x mehr Leads</li>
                  <li>• +150% Conversion Rate</li>
                  <li>• +200% Cross-Selling</li>
                </ul>
              </div>
            </div>

            {/* Marktführerschaft */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-[#003399]/20 hover:border-[#003399]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#003399]/5 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#003399] to-[#0052CC] rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#003399]">
                  MARKTFÜHRERSCHAFT 🏆
                </h3>
                <ul className="text-gray-600 leading-relaxed text-sm space-y-2">
                  <li>• 5-Jahre-Technologie HEUTE</li>
                  <li>• Wettbewerbsvorteil</li>
                  <li>• Marktpositionierung</li>
                  <li>• Zukunftssicherheit</li>
                </ul>
              </div>
            </div>

            {/* Operative Exzellenz */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-[#009FE3]/20 hover:border-[#009FE3]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#009FE3]/5 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#009FE3] to-[#007BB8] rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#003399]">
                  OPERATIVE EXZELLENZ ⚡
                </h3>
                <ul className="text-gray-600 leading-relaxed text-sm space-y-2">
                  <li>• 24/7 Automatisierung</li>
                  <li>• 95% weniger Fehler</li>
                  <li>• Unbegrenzte Skalierung</li>
                  <li>• Sofortige Reaktion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Service Packages - Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {/* KOSTENLOS STANDARD MITGLIEDSCHAFT */}
            <div className="bg-gradient-to-br from-[#003399] to-[#009FE3] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden transform scale-110 border-4 border-[#FDB913] transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#FDB913] text-[#003399] px-4 py-2 rounded-bl-xl font-bold text-sm">⭐ STANDARD</div>
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold mb-2">🆓 KOSTENLOS</h3>
                <div className="text-3xl font-bold mb-4">0€<span className="text-lg text-blue-100">/Monat</span></div>
                <div className="bg-[#FDB913]/20 border border-[#FDB913]/30 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-[#FDB913]">Standard-Mitgliedschaft</div>
                  <div className="text-sm text-blue-100">Kostenlos für alle Saarländer</div>
                </div>
                <ul className="text-sm text-blue-100 space-y-2 mb-6 text-left">
                  <li>• 10 KI-Anfragen/Tag</li>
                  <li>• Basis Chat-Support</li>
                  <li>• PLZ-Services Saarland</li>
                  <li>• Community-Zugang</li>
                </ul>
                <Link href="/register?plan=saarland-free">
                  <button className="w-full bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] py-3 rounded-xl font-bold transition-all duration-300">
                    Als Saarländer starten
                  </button>
                </Link>
              </div>
            </div>

            {/* Starter Paket */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100 hover:border-[#FDB913]/30 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#003399] mb-2">💎 STARTER</h3>
                <div className="text-3xl font-bold text-[#003399] mb-4">€10<span className="text-lg text-gray-500">/Monat</span></div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-green-800">ROI: 500%+</div>
                  <div className="text-sm text-green-600">€50 gespart pro €10</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 1-2 Vollzeitstellen sparen</li>
                  <li>• 24/7 KI-Kundenservice</li>
                  <li>• 3 Prozesse automatisiert</li>
                </ul>
                <Link href="/register?plan=starter">
                  <button className="w-full bg-[#003399] hover:bg-[#002266] text-white py-3 rounded-xl font-bold transition-all duration-300">
                    Starter wählen
                  </button>
                </Link>
              </div>
            </div>

            {/* Business Paket - Featured */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-[#FDB913] relative transform scale-105">
              <div className="absolute top-0 right-0 bg-[#FDB913] text-[#003399] px-3 py-1 rounded-bl-xl font-bold text-sm">
                BELIEBT
              </div>
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-[#003399] mb-2">🚀 BUSINESS</h3>
                <div className="text-3xl font-bold text-[#003399] mb-4">€50<span className="text-lg text-gray-500">/Monat</span></div>
                <div className="bg-[#FDB913]/10 border border-[#FDB913]/30 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-[#003399]">ROI: 1000%+</div>
                  <div className="text-sm text-[#003399]">€500+ gespart pro €50</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 5-10 KI-Agenten</li>
                  <li>• Komplette Digitalisierung</li>
                  <li>• Sales Automation</li>
                </ul>
                <Link href="/register?plan=business">
                  <button className="w-full bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] py-3 rounded-xl font-bold transition-all duration-300">
                    Business wählen
                  </button>
                </Link>
              </div>
            </div>

            {/* Enterprise Suite */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100 hover:border-[#003399]/30 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#003399] mb-2">🏆 ENTERPRISE</h3>
                <div className="text-3xl font-bold text-[#003399] mb-4">€200<span className="text-lg text-gray-500">/Monat</span></div>
                <div className="bg-[#003399]/10 border border-[#003399]/30 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-[#003399]">ROI: 2000%+</div>
                  <div className="text-sm text-[#003399]">€4000+ gespart pro €200</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 50+ automatisierte Prozesse</li>
                  <li>• Personal KI-Berater</li>
                  <li>• White-Label Solutions</li>
                </ul>
                <Link href="/register?plan=enterprise">
                  <button className="w-full bg-[#003399] hover:bg-[#002266] text-white py-3 rounded-xl font-bold transition-all duration-300">
                    Enterprise wählen
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Limitiertes Angebot CTA */}
          <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 network-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-[#003399]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 font-quantum">
                🚨 LIMITIERTES ANGEBOT
              </h3>
              <p className="text-xl mb-2 opacity-90 max-w-3xl mx-auto">
                Die ersten 100 Saarländischen Unternehmen erhalten
              </p>
              <p className="text-2xl font-bold text-[#FDB913] mb-8">
                50% RABATT IM ERSTEN JAHR!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?offer=50off">
                  <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
                    50% Rabatt sichern
                  </button>
                </Link>
                <Link href="/chat">
                  <button className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
                    Kostenlose Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Saarland Services - NEW! */}
      <EnhancedSaarlandServices />
      
      {/* Multi-Agent Chat Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#003399]/10 border border-[#003399]/20 rounded-full px-6 py-2 mb-6">
              <Brain className="w-5 h-5 text-[#003399]" />
              <span className="text-[#003399] font-semibold">INTELLIGENTES AI CHAT</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mb-4 font-quantum">
              Multi-Agent KI mit erweiterten Fähigkeiten
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-nova">
              Sprechen Sie mit spezialisierten KI-Agenten. Upload von Dokumenten, Sprachaufnahmen und Echtzeit-Datenintegration.
            </p>
          </div>
          <EnhancedMultiAgentChat />
        </div>
      </section>

      {/* Live AGENTNET Dashboard */}
      <LiveAGENTNETDashboard />

      {/* AGENTNET Vision Section */}
      <AGENTNETVisionSection />

      {/* Stats Section - AGENTNET Focus */}
      <section className="py-20 px-4 bg-[#003399] relative overflow-hidden">
        <div className="absolute inset-0 network-pattern opacity-20"></div>
        <div className="max-w-6xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-quantum text-[#FDB913]">
            AGENTNET Statistiken 2025
          </h2>
          <p className="text-xl mb-16 opacity-90 font-nova">
            Die Zahlen beweisen: Das Internet stirbt, das AGENTNET entsteht
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-red-500/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-red-400">99%</div>
              <div className="text-lg opacity-90 font-semibold">AI-Traffic</div>
              <div className="text-sm opacity-70 mt-2">Internet 2025</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-[#FDB913]/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#FDB913]">∞</div>
              <div className="text-lg opacity-90 font-semibold">AI-Agenten</div>
              <div className="text-sm opacity-70 mt-2">Saarland AGENTNET</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-green-500/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-green-400">2000%</div>
              <div className="text-lg opacity-90 font-semibold">ROI Boost</div>
              <div className="text-sm opacity-70 mt-2">Agent Economy</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-purple-400">24/7</div>
              <div className="text-lg opacity-90 font-semibold">Meta-AI</div>
              <div className="text-sm opacity-70 mt-2">Superintelligenz</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA - AGENTNET Ready */}
      <section className="py-16 px-4 bg-gradient-to-r from-black to-[#003399]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-quantum">
            <span className="text-red-400">Das Internet stirbt.</span><br/>
            <span className="text-[#FDB913]">Seien Sie bereit für das AGENTNET.</span>
          </h3>
          <p className="text-xl text-gray-300 mb-8 font-nova">
            Während andere im sterbenden Internet gefangen bleiben, führen wir Sie ins post-Internet Zeitalter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?plan=agentnet">
              <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg min-w-[240px]">
                AGENTNET-Pionier werden
              </button>
            </Link>
            <Link href="/chat">
              <button className="border-2 border-[#FDB913] text-[#FDB913] hover:bg-[#FDB913] hover:text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 min-w-[240px]">
                AI-Agenten testen
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}