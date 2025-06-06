'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Home, Sparkles, Building2, GraduationCap, Shield, Music, 
  Globe, MapPin, Newspaper, Palette, Brain, Bot, Zap, Star, User,
  MessageCircle, FileText, Mic, Camera, Search, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import LiveUserCounter from '@/components/ui/live-user-counter'

// Moderne KI: Intelligente Schnellaktionen
const quickActions = [
  { 
    id: 'smart-chat',
    name: 'AI Assistent', 
    icon: Brain, 
    description: 'Intelligenter KI-Assistent für alle Anfragen',
    gradient: 'from-blue-500 to-purple-600',
    href: '/ai-assistant',
    features: ['Anpassungsfähige Antworten', 'Multimodale Eingabe', 'Echtzeit-Daten']
  },
  { 
    id: 'instant-help',
    name: 'Sofort-Hilfe', 
    icon: Zap, 
    description: 'Schnelle Antworten auf häufige Fragen',
    gradient: 'from-green-500 to-teal-600',
    href: '/instant-help',
    features: ['Spracheingabe', 'Bild-Upload', 'Dokumentenanalyse']
  },
  { 
    id: 'smart-services',
    name: 'Services', 
    icon: Star, 
    description: 'Saarland Services mit KI-Unterstützung',
    gradient: 'from-orange-500 to-red-600',
    href: '/services',
    features: ['Business', 'Tourism', 'Education', 'Administration']
  },
  { 
    id: 'community',
    name: 'Community', 
    icon: User, 
    description: 'Saarland Community Hub',
    gradient: 'from-indigo-500 to-blue-600',
    href: '/community',
    features: ['SAARBRETT', 'Regional Updates', 'Local Events']
  }
]

// Legacy services for contextual access
const saarlandServices = [
  { name: 'Tourismus', href: '/services/tourism', icon: Sparkles, color: '#00A54A' },
  { name: 'Wirtschaft', href: '/services/business', icon: Building2, color: '#003399' },
  { name: 'Bildung', href: '/services/education', icon: GraduationCap, color: '#FFB300' },
  { name: 'Verwaltung', href: '/services/admin', icon: Shield, color: '#E30613' },
  { name: 'Kultur', href: '/services/culture', icon: Music, color: '#8B008B' }
]

export default function MainNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [smartMenuOpen, setSmartMenuOpen] = useState(false)
  const [userIntent, setUserIntent] = useState('')
  const [suggestedActions, setSuggestedActions] = useState<any[]>([])
  const pathname = usePathname()

  // AI-powered intent detection
  useEffect(() => {
    if (userIntent.length > 2) {
      const suggestions = detectUserIntent(userIntent)
      setSuggestedActions(suggestions)
    } else {
      setSuggestedActions([])
    }
  }, [userIntent])

  const detectUserIntent = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    // Business-related intents
    if (lowerQuery.includes('business') || lowerQuery.includes('unternehmen') || lowerQuery.includes('förder')) {
      return [{
        type: 'business',
        action: 'Business AI Agent',
        href: '/ai-assistant?intent=business',
        description: 'KI-gestützte Unternehmensberatung'
      }]
    }
    
    // Tourism intents
    if (lowerQuery.includes('tour') || lowerQuery.includes('reise') || lowerQuery.includes('urlaub')) {
      return [{
        type: 'tourism',
        action: 'Tourism Assistant',
        href: '/ai-assistant?intent=tourism',
        description: 'Reiseplanung und Tourismusinfos'
      }]
    }
    
    // Quick help intents
    if (lowerQuery.includes('hilfe') || lowerQuery.includes('help') || lowerQuery.includes('problem')) {
      return [{
        type: 'help',
        action: 'Sofort-Hilfe',
        href: '/instant-help?query=' + encodeURIComponent(query),
        description: 'Schnelle Lösung für Ihr Anliegen'
      }]
    }
    
    return []
  }

  return (
    <>
      {/* Professional Enterprise Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-lg safe-top">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Professional Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/images/logo-agentland-saarland-professional.svg" 
                  alt="AGENTLAND.SAARLAND" 
                  className="h-14 w-auto transition-all duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-saarland-500 rounded-full animate-pulse"></div>
              </div>
            </Link>

            {/* Professional Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={userIntent}
                  onChange={(e) => setUserIntent(e.target.value)}
                  placeholder="Suchen Sie nach Unternehmenslösungen, Services oder Beratung..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-technical-silver-300 rounded-xl focus:ring-3 focus:ring-saarland-blue-300 focus:border-saarland-blue-600 focus:bg-white transition-all duration-300 text-sm font-professional text-neutral-gray-800 placeholder:text-neutral-gray-500 shadow-sm hover:border-saarland-blue-400"
                  onFocus={() => setSmartMenuOpen(true)}
                  onBlur={() => setTimeout(() => setSmartMenuOpen(false), 200)}
                />
                
                {/* AI-Powered Suggestions */}
                <AnimatePresence>
                  {(smartMenuOpen || suggestedActions.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {suggestedActions.length > 0 ? (
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-500" />
                            AI-Vorschläge für Sie:
                          </h4>
                          {suggestedActions.map((suggestion, index) => (
                            <Link
                              key={index}
                              href={suggestion.href}
                              className="block p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                    {suggestion.action}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {suggestion.description}
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Schnellzugriff - Moderne KI
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action) => (
                              <Link
                                key={action.id}
                                href={action.href}
                                className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
                              >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                  <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                  {action.name}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  {action.description}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {action.features.slice(0, 2).map((feature, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Professional Action Bar */}
            <div className="flex items-center space-x-3">
              <LiveUserCounter />
              
              {/* Professional Service Access */}
              <button className="p-3 bg-saarland-blue-700 hover:bg-saarland-blue-800 text-white rounded-lg hover:shadow-lg transition-all duration-300 group focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 shadow-md border border-saarland-blue-600" aria-label="Voice Input">
                <Mic className="w-5 h-5 group-hover:scale-105 transition-transform" />
              </button>
              
              <button className="p-3 bg-innovation-cyan-600 hover:bg-innovation-cyan-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 group focus:ring-3 focus:ring-innovation-cyan-300 focus:ring-offset-2 shadow-md border border-innovation-cyan-500" aria-label="Camera Input">
                <Camera className="w-5 h-5 group-hover:scale-105 transition-transform" />
              </button>
              
              {/* Professional Community Button */}
              <Link
                href="/community"
                className={`px-5 py-3 rounded-lg font-professional font-semibold transition-all duration-300 flex items-center space-x-2 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 shadow-md border ${
                  pathname === '/community'
                    ? 'bg-saarland-blue-800 text-white shadow-lg border-saarland-blue-700'
                    : 'bg-saarland-blue-700 text-white hover:bg-saarland-blue-800 hover:shadow-lg border-saarland-blue-600'
                }`}
              >
                <User className="w-5 h-5" />
                <span>COMMUNITY</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Verbesserte mobile Navigation - Leistungsoptimiert */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-neutral-200 shadow-lg safe-top will-change-transform">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 touch-manipulation">
            {/* Verbessertes mobiles Logo - Touch-optimiert */}
            <Link href="/" className="flex items-center space-x-2 group min-h-[44px] min-w-[44px] p-2 -m-2 rounded-lg active:scale-95 transition-transform touch-manipulation">
              <div className="relative">
                <img 
                  src="/images/logo-agentland-saarland-professional.svg" 
                  alt="AGENTLAND.SAARLAND" 
                  className="h-8 w-auto transition-transform group-hover:scale-105"
                  loading="eager"
                  decoding="sync"
                />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-saarland-500 rounded-full animate-pulse"></div>
              </div>
            </Link>

            {/* Verbesserte mobile Aktionen - Touch-optimiert */}
            <div className="flex items-center space-x-3">
              {/* Verbesserter KI-Assistent-Button */}
              <Link
                href="/ai-assistant"
                className="min-h-[48px] min-w-[48px] p-3 bg-saarland-blue-700 hover:bg-saarland-blue-800 text-white rounded-xl shadow-md active:scale-95 transition-all duration-200 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 border border-saarland-blue-600 hover:shadow-lg touch-manipulation"
                aria-label="AI Assistant öffnen"
              >
                <Brain className="w-6 h-6" />
              </Link>
              
              {/* Verbesserter Menü-Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative z-50 min-h-[48px] min-w-[48px] p-3 rounded-xl bg-technical-silver-100 hover:bg-technical-silver-200 active:scale-95 transition-all duration-200 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 border border-technical-silver-300 shadow-sm hover:shadow-md touch-manipulation"
                aria-label={mobileMenuOpen ? "Menü schließen" : "Hauptmenü öffnen"}
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-neutral-gray-600" /> : <Menu className="w-6 h-6 text-neutral-gray-600" />}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Verbessertes mobiles Menü-Panel - Leistungsoptimiert */}
        <AnimatePresence mode="wait">
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
              className="fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-xl z-40 overflow-hidden border border-gray-100 will-change-transform"
              style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}
            >
              <div className="p-4 space-y-5 mobile-scroll" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
                {/* Verbesserte mobile Suche */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Suchen Sie Services, Hilfe oder Informationen..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-technical-silver-300 rounded-2xl focus:ring-3 focus:ring-saarland-blue-300 focus:border-saarland-blue-600 transition-all duration-200 text-neutral-gray-800 placeholder:text-neutral-gray-500 shadow-sm text-mobile-safe min-h-[48px] touch-manipulation"
                    inputMode="search"
                    enterKeyHint="search"
                  />
                </div>
                
                {/* Quick Actions Grid - Mobile */}
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.id}
                      href={action.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 active:scale-95"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {action.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {action.description}
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* Verbesserte Community */}
                <Link
                  href="/community"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 w-full shadow-lg active:scale-95 focus:ring-2 focus:ring-saarland-blue-500 focus:ring-offset-2 ${
                    pathname === '/community'
                      ? 'bg-gradient-to-r from-saarland-blue-700 to-saarland-blue-800 text-white'
                      : 'bg-gradient-to-r from-saarland-blue-600 to-saarland-blue-700 text-white'
                  }`}
                >
                  <User className="w-6 h-6" />
                  <div>
                    <div className="text-lg font-bold">COMMUNITY</div>
                    <div className="text-sm opacity-90">Saarland Hub</div>
                  </div>
                </Link>
                
                {/* Contextual Services */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Saarland Services
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {saarlandServices.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="group p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all active:scale-95"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${service.color}20` }}
                        >
                          <service.icon 
                            className="w-5 h-5" 
                            style={{ color: service.color }}
                          />
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {service.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Input Methods */}
                <div className="flex items-center gap-3 pt-4 border-t border-technical-silver-200">
                  <button className="flex-1 p-3 bg-gradient-to-r from-saarland-blue-600 to-innovation-cyan-600 text-white rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all focus:ring-2 focus:ring-saarland-blue-500 focus:ring-offset-2">
                    <Mic className="w-5 h-5" />
                    <span className="text-sm font-medium">Sprechen</span>
                  </button>
                  <button className="flex-1 p-3 bg-gradient-to-r from-success-green-600 to-innovation-cyan-600 text-white rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all focus:ring-2 focus:ring-success-green-500 focus:ring-offset-2">
                    <Camera className="w-5 h-5" />
                    <span className="text-sm font-medium">Foto</span>
                  </button>
                  <button className="flex-1 p-3 bg-gradient-to-r from-warm-gold-500 to-warm-gold-600 text-white rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all focus:ring-2 focus:ring-warm-gold-500 focus:ring-offset-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Dokument</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Verbesserter Abstandshalter für mobile Navigation */}
      <div className="h-16 md:h-20" />
    </>
  )
}