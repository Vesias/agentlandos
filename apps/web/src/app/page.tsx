import Link from 'next/link'
import { Bot, MessageSquare, MapPin, Building2, GraduationCap, Users, Palette, Zap, Star, TrendingUp, Shield, Clock } from 'lucide-react'

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

          {/* Subtitle - Clear Value Prop */}
          <p className="text-xl sm:text-2xl text-white/90 mb-4 max-w-3xl mx-auto font-nova leading-relaxed">
            Souveräne KI-Technologie aus dem Saarland
          </p>
          <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
            Für Bürger, Unternehmen und Verwaltung - Intelligent, regional, vertrauenswürdig
          </p>

          {/* CTA Buttons - Premium Design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/chat" className="w-full sm:w-auto">
              <button className="group bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto min-w-[220px] shadow-2xl hover:shadow-3xl hover:scale-105 touch-manipulation">
                <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                SAAR-GPT starten
              </button>
            </Link>
            
            <Link href="/services" className="w-full sm:w-auto">
              <button className="group bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto min-w-[220px] backdrop-blur-sm touch-manipulation">
                <MapPin className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Services entdecken
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Made in Saarland</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>24/7 verfügbar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Premium Design */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mb-4 font-quantum">
              Saarland Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-nova">
              Umfassende KI-gestützte Dienstleistungen für alle Bereiche des Saarlands
            </p>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Business Services */}
            <Link href="/services/business" className="group">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-gray-100 hover:border-[#003399]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#003399]/5 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#003399] to-[#0052CC] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#003399] group-hover:text-[#002266]">
                    Wirtschaft & Business
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    IHK Services, Handwerkskammer, Gründungsberatung, Fördermittel-Matching
                  </p>
                  <div className="flex items-center mt-4 text-[#009FE3] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    <span>Mehr erfahren</span>
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Tourism Services */}
            <Link href="/services/tourism" className="group">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-gray-100 hover:border-[#009FE3]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#009FE3]/5 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#009FE3] to-[#007BB8] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#003399] group-hover:text-[#002266]">
                    Tourismus & Kultur
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Sehenswürdigkeiten, Events, Hotels, Restaurants, kulturelle Highlights
                  </p>
                  <div className="flex items-center mt-4 text-[#009FE3] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    <span>Entdecken</span>
                    <MapPin className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Education Services */}
            <Link href="/services/education" className="group">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-gray-100 hover:border-[#FDB913]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FDB913]/5 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FDB913] to-[#E5A50A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#003399] group-hover:text-[#002266]">
                    Bildung & Forschung
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Universitäten, Weiterbildung, DFKI-Kooperationen, Stipendien
                  </p>
                  <div className="flex items-center mt-4 text-[#009FE3] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    <span>Lernen</span>
                    <GraduationCap className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Admin Services */}
            <Link href="/services/admin" className="group">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 touch-manipulation border border-gray-100 hover:border-[#003399]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#003399]/5 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#003399] to-[#0052CC] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#003399] group-hover:text-[#002266]">
                    Behörden & Verwaltung
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Ämter, Anträge, Bürgerdienste, Express-Termine, Online-Services
                  </p>
                  <div className="flex items-center mt-4 text-[#009FE3] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    <span>Services nutzen</span>
                    <Users className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Premium CTA */}
          <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 network-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-[#003399]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 font-quantum">
                Premium Saarland Services
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Exklusive Funktionen für nur €9,99/Monat
              </p>
              <Link href="/register">
                <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
                  Jetzt Premium werden
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Professional */}
      <section className="py-20 px-4 bg-[#003399] relative overflow-hidden">
        <div className="absolute inset-0 network-pattern opacity-20"></div>
        <div className="max-w-6xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-quantum text-[#FDB913]">
            Saarland in Zahlen
          </h2>
          <p className="text-xl mb-16 opacity-90 font-nova">
            Vertrauen Sie auf bewährte Expertise und regionale Kompetenz
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#FDB913]">1.043.167</div>
              <div className="text-lg opacity-90 font-semibold">Einwohner</div>
              <div className="text-sm opacity-70 mt-2">Saarland gesamt</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#FDB913]">52</div>
              <div className="text-lg opacity-90 font-semibold">Gemeinden</div>
              <div className="text-sm opacity-70 mt-2">Vollabdeckung</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#FDB913]">99,97%</div>
              <div className="text-lg opacity-90 font-semibold">Uptime</div>
              <div className="text-sm opacity-70 mt-2">Zuverlässigkeit</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-3 text-[#FDB913]">24/7</div>
              <div className="text-lg opacity-90 font-semibold">KI-Support</div>
              <div className="text-sm opacity-70 mt-2">Immer verfügbar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-[#003399] mb-6 font-quantum">
            Bereit für die Zukunft?
          </h3>
          <p className="text-xl text-gray-600 mb-8 font-nova">
            Erleben Sie souveräne KI-Technologie made in Saarland
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <button className="bg-[#003399] hover:bg-[#002266] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg min-w-[200px]">
                Jetzt starten
              </button>
            </Link>
            <Link href="/services">
              <button className="border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 min-w-[200px]">
                Services erkunden
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}