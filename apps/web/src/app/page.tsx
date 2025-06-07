import Link from "next/link";
import {
  Bot,
  MessageSquare,
  MapPin,
  Building2,
  GraduationCap,
  Users,
  Palette,
  Zap,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Brain,
} from "lucide-react";
import AGENTNETVisionSection from "@/components/AGENTNETVisionSection";
import LiveAGENTNETDashboard from "@/components/LiveAGENTNETDashboard";
import EnhancedSaarlandServices from "@/components/EnhancedSaarlandServices";
import EnhancedMultiAgentChat from "@/components/EnhancedMultiAgentChat";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003399] via-[#0052CC] to-[#0277bd] opacity-95"></div>
        <div className="absolute inset-0 network-pattern opacity-10"></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 py-16">
          {/* Premium Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl flex items-center justify-center border border-white/20">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center bg-white shadow-inner">
              <Bot className="w-12 h-12 md:w-16 md:h-16 text-[#003399] agent-active" />
            </div>
          </div>

          {/* Title - Professional with proper heading hierarchy */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-white font-quantum">
            <span className="block">AGENTLAND</span>
            <span className="block text-[#FDB913] font-light">.SAARLAND</span>
          </h1>

          {/* New KI-Agentur Value Prop */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl text-[#FDB913] mb-2 max-w-4xl mx-auto font-quantum font-bold leading-tight">
              DIE ERSTE KI-AGENTUR IM SAARLAND
            </h2>
            <h3 className="text-xl sm:text-2xl text-white/90 mb-4 max-w-3xl mx-auto font-nova leading-relaxed">
              Unternehmensumsätze effizient steigern durch Zukunftstechnologie
              HEUTE
            </h3>
          </div>

          {/* Wichtige Nachricht mit Anreizsystem */}
          <div className="relative group mb-8">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDB913]/30 via-[#FDB913]/20 to-[#E5A50A]/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition-all duration-500"></div>

            {/* Main Urgency Container */}
            <div className="relative bg-gradient-to-br from-[#FDB913]/25 via-[#FDB913]/20 to-[#E5A50A]/25 border-2 border-[#FDB913]/40 rounded-3xl p-8 max-w-4xl mx-auto backdrop-blur-md hover:border-[#FDB913]/60 transition-all duration-500 transform hover:scale-[1.02] shadow-2xl hover:shadow-3xl">
              {/* Urgency Header with Enhanced Typography */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-[#FDB913]/30 border border-[#FDB913]/50 rounded-full px-6 py-3 mb-4">
                  <div className="w-3 h-3 bg-[#FDB913] rounded-full"></div>
                  <span className="text-[#FDB913] font-bold text-sm uppercase tracking-wider">
                    PIONIER-PROGRAMM
                  </span>
                  <div className="w-3 h-3 bg-[#FDB913] rounded-full"></div>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 font-quantum leading-tight">
                  <span className="text-[#FDB913]">
                    Gestalten Sie die Zukunft mit
                  </span>
                </h2>

                <p className="text-xl sm:text-2xl text-white/95 font-semibold mb-4 max-w-3xl mx-auto leading-relaxed">
                  Professionelle KI-Integration für saarländische Unternehmen
                </p>
              </div>

              {/* Enhanced Value Proposition Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 border border-[#FDB913]/30 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl font-bold text-[#FDB913] mb-1">
                    50%
                  </div>
                  <div className="text-sm text-white/90">
                    Erstes Jahr Rabatt
                  </div>
                </div>
                <div className="bg-white/10 border border-green-400/30 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    ROI
                  </div>
                  <div className="text-sm text-white/90">Sofort messbar</div>
                </div>
                <div className="bg-white/10 border border-blue-400/30 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    24/7
                  </div>
                  <div className="text-sm text-white/90">KI-Support</div>
                </div>
              </div>

              {/* Urgency Counter & Social Proof */}
              <div className="text-center">
                <p className="text-white/90 text-lg mb-2">
                  <strong className="text-[#FDB913]">
                    Professionelle KI-Implementierung nach deutschen Standards
                  </strong>
                </p>
                <p className="text-white/80 text-base">
                  Bewährte Technologie mit regionaler Expertise und persönlicher
                  Betreuung
                </p>

                {/* Professional Status Indicator */}
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-300 font-semibold text-sm">
                    Betaphase - Jetzt kostenlos testen
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professionelle Aktionsknöpfe mit Anreizsystem */}
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16">
            {/* PRIMARY CTA - AI-Agenten testen */}
            <Link href="/ai-assistant" className="w-full sm:w-auto group">
              <div className="relative">
                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDB913] to-[#E5A50A] rounded-3xl blur-xl opacity-60 group-hover:opacity-100 animate-pulse transition-all duration-500"></div>

                {/* Main Button */}
                <button
                  className="relative bg-gradient-to-r from-[#FDB913] to-[#E5A50A] hover:from-[#E5A50A] hover:to-[#D4940A] text-[#003399] px-10 py-5 rounded-3xl font-bold text-xl transition-all duration-500 flex items-center justify-center w-full sm:w-auto min-w-[320px] shadow-2xl hover:shadow-3xl transform hover:scale-110 touch-manipulation border-2 border-[#FDB913]/50 hover:border-[#FDB913] group-hover:animate-none"
                  aria-label="Starten Sie Ihren AI-Assistenten für sofortige Unternehmensergebnisse"
                >
                  <Brain className="w-7 h-7 mr-4 group-hover:scale-125 transition-transform duration-300 animate-pulse" />
                  <div className="text-left">
                    <div className="text-xl font-bold">
                      🤖 AI-Agenten JETZT testen
                    </div>
                    <div className="text-sm font-medium opacity-90">
                      Sofort ROI für Ihr Unternehmen
                    </div>
                  </div>
                  <div className="ml-4 bg-[#003399]/20 rounded-full px-3 py-1 text-xs font-bold">
                    KOSTENLOS
                  </div>
                </button>

                {/* Success Indicator */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold animate-bounce opacity-0 group-hover:opacity-100 transition-all duration-300">
                  ✓
                </div>
              </div>
            </Link>

            {/* SEKUNDÄRE AKTION - Sofort-Hilfe */}
            <Link href="/instant-help" className="w-full sm:w-auto group">
              <div className="relative">
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-all duration-500"></div>

                {/* Secondary Button */}
                <button
                  className="relative bg-white/10 hover:bg-white/25 text-white border-2 border-white/40 hover:border-white/70 px-10 py-5 rounded-3xl font-bold text-xl transition-all duration-500 flex items-center justify-center w-full sm:w-auto min-w-[320px] backdrop-blur-md hover:backdrop-blur-lg touch-manipulation transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  aria-label="Erhalten Sie sofortige Hilfe von unseren KI-Experten"
                >
                  <Zap className="w-7 h-7 mr-4 group-hover:scale-125 transition-transform duration-300 text-[#FDB913]" />
                  <div className="text-left">
                    <div className="text-xl font-bold">⚡ Sofort-Hilfe</div>
                    <div className="text-sm font-medium opacity-90">
                      Direkter Expert Support
                    </div>
                  </div>
                  <div className="ml-4 bg-[#FDB913]/30 rounded-full px-3 py-1 text-xs font-bold text-[#FDB913]">
                    LIVE
                  </div>
                </button>
              </div>
            </Link>
          </div>

          {/* Enhanced Trust & Social Proof Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12 px-4">
            <div className="flex items-center gap-2 bg-white/10 border border-green-400/30 rounded-full px-6 py-3 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-semibold text-sm">
                ✅ 30-Tage Geld-zurück-Garantie
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-[#FDB913]/30 rounded-full px-6 py-3 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <Star className="w-4 h-4 text-[#FDB913] animate-spin-slow" />
              <span className="text-[#FDB913] font-semibold text-sm">
                ⭐ 100% Saarland Qualität
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-blue-400/30 rounded-full px-6 py-3 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold text-sm">
                🔒 DSGVO-konform & sicher
              </span>
            </div>
          </div>

          {/* KOSTENLOSES Saarland-Angebot mit regionalem Stolz */}
          <div className="relative group mb-8">
            {/* Animated Saarland Pride Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#003399]/30 via-[#0277bd]/20 to-[#003399]/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>

            {/* Main Regional Container */}
            <div className="relative bg-gradient-to-br from-[#003399] via-[#0052CC] to-[#0277bd] rounded-3xl p-8 max-w-3xl mx-auto text-center text-white border-3 border-[#FDB913]/60 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] backdrop-blur-sm">
              {/* Regional Pride Header */}
              <div className="flex items-center justify-center gap-3 mb-6 relative">
                <div className="text-3xl animate-bounce">🆓</div>
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#FDB913] font-quantum mb-1">
                    KOSTENLOS für alle Saarländer!
                  </h3>
                  <div className="inline-flex items-center gap-2 bg-[#FDB913]/20 border border-[#FDB913]/40 rounded-full px-4 py-1">
                    <div className="w-2 h-2 bg-[#FDB913] rounded-full animate-pulse"></div>
                    <span className="text-[#FDB913] font-semibold text-sm">
                      HEIMAT-VORTEIL
                    </span>
                  </div>
                </div>
                <div className="text-3xl animate-bounce delay-75">🏛️</div>
              </div>

              {/* Enhanced Value Proposition */}
              <div className="bg-white/10 border border-[#FDB913]/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <p className="text-lg md:text-xl text-white/95 mb-3 leading-relaxed">
                  Als{" "}
                  <strong className="text-[#FDB913]">
                    erste KI-Agentur im Saarland
                  </strong>{" "}
                  unterstützen wir unsere Heimat
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                    <span className="text-green-300 font-bold text-sm">
                      ✅ 100% KOSTENLOS
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#FDB913]/20 border border-[#FDB913]/30 rounded-full px-4 py-2">
                    <span className="text-[#FDB913] font-bold text-sm">
                      📈 ECHTE DATEN
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2">
                    <span className="text-blue-300 font-bold text-sm">
                      ⚡ ECHTZEIT
                    </span>
                  </div>
                </div>
                <p className="text-white/90 font-semibold">
                  <strong className="text-[#FDB913]">
                    Vollständige KI-Agentur-Services
                  </strong>{" "}
                  - Speziell für das Saarland optimiert
                </p>
              </div>

              {/* Enhanced CTA with Regional Appeal */}
              <Link
                href="/register?plan=saarland-free"
                className="group inline-block"
              >
                <div className="relative">
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FDB913] to-[#E5A50A] rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300"></div>

                  {/* Main Regional CTA Button */}
                  <button
                    className="relative bg-gradient-to-r from-[#FDB913] to-[#E5A50A] hover:from-[#E5A50A] hover:to-[#D4940A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-[#FDB913]/50 hover:border-[#FDB913] min-w-[300px]"
                    aria-label="Registrieren Sie sich kostenlos als Saarländer für vollständige KI-Services"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🏠</span>
                      <div className="text-left">
                        <div className="font-bold">Kostenlos registrieren</div>
                        <div className="text-sm font-medium opacity-90">
                          Als stolzer Saarländer
                        </div>
                      </div>
                      <span className="text-2xl animate-pulse">✨</span>
                    </div>
                  </button>
                </div>
              </Link>

              {/* Regional Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-3 mt-6 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Shield className="w-4 h-4 text-[#FDB913]" />
                  <span>Saarland-Datenschutz</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="w-4 h-4 text-[#FDB913]" />
                  <span>Regional optimiert</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4 text-[#FDB913]" />
                  <span>Sofort aktiv</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authentic Platform Status */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold text-sm">
                  ✅ 100% AUTHENTISCH - KEINE FAKE DATEN
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#FDB913]/20 border border-[#FDB913]/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-[#FDB913] rounded-full animate-pulse"></div>
                <span className="text-[#FDB913] font-semibold text-sm">
                  🚀 VON NULL AUF AUFGEBAUT
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-black/30 border border-green-500/30 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-400">0€</div>
                <div className="text-xs text-green-300">Start-Umsatz</div>
              </div>
              <div className="bg-black/30 border border-[#FDB913]/30 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-[#FDB913]">ECHT</div>
                <div className="text-xs text-[#FDB913]">Nur echte Daten</div>
              </div>
              <div className="bg-black/30 border border-[#003399]/30 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-[#0277bd]">24/7</div>
                <div className="text-xs text-[#0277bd]">AI verfügbar</div>
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
              <span className="text-[#003399] font-semibold">
                KI-AGENTUR SERVICES
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mb-4 font-quantum">
              Ihr Profit durch unsere KI-Services
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-nova">
              Direkter Kundennutzen - Jede Form von Profitabilität durch
              KI-Automatisierung
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
                  SIGNIFIKANTE UMSATZSTEIGERUNG 📈
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
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-[#0277bd]/20 hover:border-[#0277bd]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0277bd]/5 to-transparent rounded-bl-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0277bd] to-[#007BB8] rounded-2xl flex items-center justify-center mb-6">
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
            <div className="bg-gradient-to-br from-[#003399] to-[#0277bd] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden transform scale-110 border-4 border-[#FDB913] transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#FDB913] text-[#003399] px-4 py-2 rounded-bl-xl font-bold text-sm">
                ⭐ STANDARD
              </div>
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold mb-2">🆓 KOSTENLOS</h3>
                <div className="text-3xl font-bold mb-4">
                  0€<span className="text-lg text-blue-100">/Monat</span>
                </div>
                <div className="bg-[#FDB913]/20 border border-[#FDB913]/30 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-[#FDB913]">
                    Standard-Mitgliedschaft
                  </div>
                  <div className="text-sm text-blue-100">
                    Kostenlos für alle Saarländer
                  </div>
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
                <h3 className="text-2xl font-bold text-[#003399] mb-2">
                  💎 STARTER
                </h3>
                <div className="text-3xl font-bold text-[#003399] mb-4">
                  €10<span className="text-lg text-gray-500">/Monat</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-green-800">
                    ROI: 500%+
                  </div>
                  <div className="text-sm text-green-600">
                    €50 gespart pro €10
                  </div>
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
                <h3 className="text-2xl font-bold text-[#003399] mb-2">
                  🚀 BUSINESS
                </h3>
                <div className="text-3xl font-bold text-[#003399] mb-4">
                  €50<span className="text-lg text-gray-500">/Monat</span>
                </div>
                <div className="bg-[#FDB913]/10 border border-[#FDB913]/30 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-[#003399]">
                    ROI: 1000%+
                  </div>
                  <div className="text-sm text-[#003399]">
                    €500+ gespart pro €50
                  </div>
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
                <h3 className="text-2xl font-bold text-[#003399] mb-2">
                  🏆 ENTERPRISE
                </h3>
                <div className="text-3xl font-bold text-[#003399] mb-4">
                  €200<span className="text-lg text-gray-500">/Monat</span>
                </div>
                <div className="bg-[#003399]/10 border border-[#003399]/30 rounded-xl p-3 mb-4">
                  <div className="text-lg font-bold text-[#003399]">
                    ROI: 2000%+
                  </div>
                  <div className="text-sm text-[#003399]">
                    €4000+ gespart pro €200
                  </div>
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
          <div className="bg-gradient-to-r from-[#003399] to-[#0277bd] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
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

      {/* Intelligente KI-Benutzeroberfläche */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#003399]/10 border border-[#003399]/20 rounded-full px-6 py-2 mb-6">
              <Brain className="w-5 h-5 text-[#003399]" />
              <span className="text-[#003399] font-semibold">
                INTELLIGENTE KI-TECHNOLOGIE
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mb-4 font-quantum">
              Intelligente KI ohne Grenzen
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-nova">
              Keine veralteten &quot;Chat Free&quot; vs &quot;Chat Pro&quot;
              Kategorien. Ein adaptiver AI-Assistent, der automatisch erkennt,
              was Sie brauchen.
            </p>
          </div>

          {/* New UX Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Absichtserkennung
              </h3>
              <p className="text-gray-600">
                KI erkennt automatisch, was Sie brauchen - ohne manuelle
                Kategorieauswahl
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Multi-Modal Input
              </h3>
              <p className="text-gray-600">
                Text, Sprache, Bilder, Dokumente - alles in einer einheitlichen
                Oberfläche
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Anpassungsfähige Antworten
              </h3>
              <p className="text-gray-600">
                Intelligente Antworten die sich an Ihren Kontext und Ihre
                Bedürfnisse anpassen
              </p>
            </div>
          </div>

          <EnhancedMultiAgentChat />
        </div>
      </section>

      {/* Live AGENTNET Dashboard */}
      <LiveAGENTNETDashboard />

      {/* AGENTNET Vision Section */}
      <AGENTNETVisionSection />

      {/* Stats Section - Authentic Platform Focus */}
      <section className="py-20 px-4 bg-[#003399] relative overflow-hidden">
        <div className="absolute inset-0 network-pattern opacity-20"></div>
        <div className="max-w-6xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-quantum text-[#FDB913]">
            Ehrliche Platform-Statistiken
          </h2>
          <p className="text-xl mb-16 opacity-90 font-nova">
            Transparenter Aufbau der ersten KI-Agentur im Saarland - von Null
            auf
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-green-500/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-green-400">
                0€
              </div>
              <div className="text-lg opacity-90 font-semibold">
                Start-Umsatz
              </div>
              <div className="text-sm opacity-70 mt-2">
                Ehrlich von Null auf
              </div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-[#FDB913]/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#FDB913]">
                ECHT
              </div>
              <div className="text-lg opacity-90 font-semibold">
                Nur echte Daten
              </div>
              <div className="text-sm opacity-70 mt-2">Keine Fake-Metrics</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-[#0277bd]/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#0277bd]">
                100%
              </div>
              <div className="text-lg opacity-90 font-semibold">
                Transparent
              </div>
              <div className="text-sm opacity-70 mt-2">
                Authentische Entwicklung
              </div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-purple-400">
                24/7
              </div>
              <div className="text-lg opacity-90 font-semibold">
                AI verfügbar
              </div>
              <div className="text-sm opacity-70 mt-2">Produktiv & ehrlich</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA - Authentic Platform */}
      <section className="py-16 px-4 bg-gradient-to-r from-black to-[#003399]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-quantum">
            <span className="text-[#FDB913]">Echte KI-Agentur-Plattform.</span>
            <br />
            <span className="text-white">
              Von Null auf transparent aufgebaut.
            </span>
          </h3>
          <p className="text-xl text-gray-300 mb-8 font-nova">
            Keine Fake-Metrics, keine übertriebenen Versprechen - nur ehrliche
            KI-Services für das Saarland
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?plan=saarland-free">
              <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg min-w-[240px]">
                Kostenlos als Saarländer starten
              </button>
            </Link>
            <Link href="/chat">
              <button className="border-2 border-[#FDB913] text-[#FDB913] hover:bg-[#FDB913] hover:text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 min-w-[240px]">
                AI System testen
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
