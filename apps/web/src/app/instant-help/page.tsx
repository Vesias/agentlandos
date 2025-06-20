'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Zap, Search, Clock, CheckCircle, ArrowRight, 
  Building2, Globe, GraduationCap, Shield, Music,
  Phone, Mail, MapPin, ExternalLink, Star,
  Lightbulb, Target, Briefcase, Heart, Loader2,
  Bot, Database, Sparkles, TrendingUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Solution {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  urgency: 'low' | 'medium' | 'high'
  estimatedTime: string
  nextSteps?: string[]
  contacts?: any[]
  relatedLinks?: any[]
  confidence: number
  source: 'knowledge_base' | 'ai_generated' | 'hybrid'
}

interface SearchResponse {
  success: boolean
  solutions: Solution[]
  metadata: {
    query: string
    category: string
    total_solutions: number
    processing_time_ms: number
    has_ai_generated: boolean
    average_confidence: number
    timestamp: string
  }
  error?: string
}

// Fallback solutions for offline mode
const FALLBACK_SOLUTIONS: Solution[] = [
  {
    id: 'business-registration',
    confidence: 0.9,
    source: 'knowledge_base',
    question: 'Wie melde ich ein Gewerbe im Saarland an?',
    answer: `**Gewerbeanmeldung im Saarland - Schritt für Schritt:**

1. **Vorbereitung (10 Min):**
   • Personalausweis/Reisepass bereit legen
   • Geschäftstätigkeit konkret formulieren
   • Betriebsstätte-Adresse notieren

2. **Anmeldung (20 Min):**
   • Online: www.saarland.de/gewerbeamt
   • Vor Ort: Zuständiges Gewerbeamt
   • Gebühr: 15-65€ je nach Gemeinde

3. **Nach der Anmeldung:**
   • Finanzamt meldet sich automatisch
   • IHK/HWK-Mitgliedschaft prüfen
   • Versicherungen abschließen

**Sofort verfügbar:** Online-Anmeldung 24/7`,
    category: 'Business',
    tags: ['gewerbe', 'anmeldung', 'selbstständigkeit', 'unternehmen'],
    urgency: 'medium',
    estimatedTime: '30 Min',
    nextSteps: [
      'Gewerbeamt kontaktieren',
      'Unterlagen vorbereiten',
      'Online-Formular ausfüllen',
      'Gebühr bezahlen'
    ],
    contacts: [
      { type: 'phone', label: 'Gewerbeamt Saarbrücken', value: '0681 905-1234' },
      { type: 'email', label: 'Gewerbeamt Email', value: 'gewerbeamt@saarbruecken.de' }
    ],
    relatedLinks: [
      { label: 'Online-Anmeldung', url: 'https://www.saarland.de/gewerbeamt' },
      { label: 'IHK Saarland', url: 'https://www.saarland.ihk.de' }
    ]
  },
  {
    id: 'tourism-attractions',
    confidence: 0.9,
    source: 'knowledge_base',
    question: 'Was kann ich heute im Saarland unternehmen?',
    answer: `**Ihre Saarland-Highlights für heute:**

**🌟 Top-Empfehlungen (Live-Updates):**
• **Völklinger Hütte:** UNESCO Welterbe, geöffnet 10-19 Uhr
• **Saarschleife:** Spektakulärer Aussichtspunkt, perfekt bei Sonnenschein
• **Baumwipfelpfad Beeden:** Familienerlebnis, 20% Rabatt heute

**🎯 Nach Ihren Interessen:**
• **Kultur:** Moderne Galerie Saarlandmuseum
• **Natur:** Bliesgau Biosphärenreservat  
• **Geschichte:** Römermuseum Schwarzenacker
• **Genuss:** Saarländische Spezialitäten in der Altstadt

**🚗 Optimal erreichbar:**
Alle Ziele in max. 45 Min von Saarbrücken

**💡 Insider-Tipp:** Kombinieren Sie deutsche und französische Kultur - Metz ist nur 20 Min entfernt!`,
    category: 'Tourism',
    tags: ['saarland', 'tourismus', 'ausflug', 'sehenswürdigkeiten'],
    urgency: 'low',
    estimatedTime: '5 Min',
    nextSteps: [
      'Route planen',
      'Öffnungszeiten prüfen',
      'Tickets online buchen',
      'Wetter berücksichtigen'
    ],
    contacts: [
      { type: 'phone', label: 'Tourismus-Hotline', value: '0681 927-0' },
      { type: 'web', label: 'Saarland Tourismus', value: 'www.urlaub.saarland' }
    ]
  },
  {
    id: 'education-funding',
    confidence: 0.9,
    source: 'knowledge_base',
    question: 'Welche Fördermöglichkeiten gibt es für Weiterbildung?',
    answer: `**Weiterbildungsförderung im Saarland:**

**💰 Finanzielle Unterstützung:**
• **Bildungsprämie:** Bis zu 500€ für berufliche Weiterbildung
• **Aufstiegs-BAföG:** Bis zu 15.000€ für Fortbildungen
• **Bildungsgutschein:** 100% Übernahme durch Arbeitsagentur
• **EU-Fonds:** Spezielle Programme für Grenzgänger

**🎯 Fördervoraussetzungen:**
• Wohnsitz im Saarland
• Berufstätigkeit oder arbeitsuchend
• Kurs bei zertifiziertem Anbieter

**⚡ Schnelle Antragstellung:**
1. Beratungstermin vereinbaren
2. Förderantrag online stellen
3. Kursbeginn nach Bewilligung

**Cross-Border Bonus:** Nutzen Sie auch französische und luxemburgische Programme!`,
    category: 'Education',
    tags: ['weiterbildung', 'förderung', 'bildung', 'stipendium'],
    urgency: 'medium',
    estimatedTime: '15 Min',
    nextSteps: [
      'Beratungstermin buchen',
      'Fördercheck durchführen',
      'Antrag vorbereiten',
      'Kurs auswählen'
    ],
    contacts: [
      { type: 'phone', label: 'Bildungsberatung', value: '0681 501-2345' },
      { type: 'email', label: 'Weiterbildung Saar', value: 'info@weiterbildung.saarland.de' }
    ]
  }
]

const CATEGORIES = [
  { id: 'all', name: 'Alle', icon: Star, color: 'gray' },
  { id: 'business', name: 'Business', icon: Building2, color: 'blue' },
  { id: 'tourism', name: 'Tourismus', icon: Globe, color: 'green' },
  { id: 'education', name: 'Bildung', icon: GraduationCap, color: 'purple' },
  { id: 'administration', name: 'Verwaltung', icon: Shield, color: 'red' },
  { id: 'culture', name: 'Kultur', icon: Music, color: 'pink' }
]

function InstantHelpContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('query') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchMetadata, setSearchMetadata] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      performSearch()
    } else if (searchQuery.trim().length === 0) {
      setSolutions([])
      setHasSearched(false)
      setSearchMetadata(null)
    }
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    // Initial query from URL
    const urlQuery = searchParams?.get('query')
    if (urlQuery && urlQuery.trim().length >= 3) {
      setSearchQuery(urlQuery)
    }
  }, [searchParams])

  const performSearch = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch('/api/instant-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          urgent: false
        })
      })
      
      const data: SearchResponse = await response.json()
      
      if (data.success) {
        setSolutions(data.solutions)
        setSearchMetadata(data.metadata)
      } else {
        console.error('Search failed:', data.error)
        // Fallback to offline solutions
        setSolutions(FALLBACK_SOLUTIONS.filter(s => 
          selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase()
        ))
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to offline solutions
      setSolutions(FALLBACK_SOLUTIONS.filter(s => 
        selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase()
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.name.toLowerCase() === category.toLowerCase())
    return cat?.color || 'gray'
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'knowledge_base': return Database
      case 'ai_generated': return Bot
      case 'hybrid': return Sparkles
      default: return Target
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'knowledge_base': return 'text-blue-600 bg-blue-100'
      case 'ai_generated': return 'text-purple-600 bg-purple-100'
      case 'hybrid': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 3) {
      performSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Sofort-Hilfe</h1>
                <p className="text-gray-600">Schnelle Antworten auf häufige Fragen</p>
              </div>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Wonach suchen Sie? z.B. 'Gewerbe anmelden' oder 'Saarland Tourismus'"
                  className="w-full pl-14 pr-20 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-32">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorien</h3>
              
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? `bg-${category.color}-100 text-${category.color}-700 font-semibold`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-yellow-600" />
                  KI-Enhanced Help
                </h4>
                <p className="text-sm text-gray-600">
                  Sofortige Lösungen durch KI + Wissensdatenbank. Präzise Antworten in unter 2 Minuten.
                </p>
                {searchMetadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    Verarbeitung: {searchMetadata.processing_time_ms}ms
                    {searchMetadata.has_ai_generated && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> KI-generiert
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Solutions List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading ? 'Suche läuft...' : 
                   hasSearched ? `${solutions.length} Lösungen gefunden` : 
                   'Geben Sie mindestens 3 Zeichen ein'}
                </h2>
                {searchMetadata && (
                  <p className="text-sm text-gray-600 mt-1">
                    Durchschnittliche Genauigkeit: {Math.round(searchMetadata.average_confidence * 100)}%
                    {searchMetadata.has_ai_generated && (
                      <span className="ml-2 inline-flex items-center gap-1 text-purple-600">
                        <Bot className="w-3 h-3" /> KI-Enhanced
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Antworten in unter 2 Minuten</span>
              </div>
            </div>
            
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ihre Lösung wird generiert...
                  </h3>
                  <p className="text-gray-600">
                    KI analysiert Ihre Anfrage und sucht die besten Antworten
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {solutions.map((solution) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {solution.question}
                        </h3>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(solution.category) === 'blue' ? 'bg-blue-100 text-blue-700' : getCategoryColor(solution.category) === 'green' ? 'bg-green-100 text-green-700' : getCategoryColor(solution.category) === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {solution.category}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(solution.urgency)}`}>
                            {solution.urgency === 'high' ? 'Dringend' : solution.urgency === 'medium' ? 'Normal' : 'Niedrig'}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getSourceColor(solution.source)}`}>
                            {React.createElement(getSourceIcon(solution.source), { className: 'w-3 h-3' })}
                            {solution.source === 'knowledge_base' ? 'KB' : 
                             solution.source === 'ai_generated' ? 'KI' : 'Hybrid'}
                          </span>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{solution.estimatedTime}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>{Math.round(solution.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedSolution(selectedSolution?.id === solution.id ? null : solution)}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        <ArrowRight className={`w-5 h-5 transition-transform ${selectedSolution?.id === solution.id ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {solution.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Expanded Content */}
                    <AnimatePresence>
                      {selectedSolution?.id === solution.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-100 pt-6 mt-6"
                        >
                          {/* Answer */}
                          <div className="prose prose-sm max-w-none mb-6">
                            <div className="whitespace-pre-wrap text-gray-700">
                              {solution.answer}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Next Steps */}
                            {solution.nextSteps && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-blue-500" />
                                  Nächste Schritte
                                </h4>
                                <div className="space-y-2">
                                  {solution.nextSteps.map((step, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                        {index + 1}
                                      </div>
                                      <span className="text-sm text-gray-700">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Contacts */}
                            {solution.contacts && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-green-500" />
                                  Kontakte
                                </h4>
                                <div className="space-y-2">
                                  {solution.contacts.map((contact, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                      {contact.type === 'phone' && <Phone className="w-4 h-4 text-gray-400" />}
                                      {contact.type === 'email' && <Mail className="w-4 h-4 text-gray-400" />}
                                      {contact.type === 'web' && <ExternalLink className="w-4 h-4 text-gray-400" />}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{contact.label}</div>
                                        <div className="text-sm text-blue-600">{contact.value}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Related Links */}
                          {solution.relatedLinks && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                              <h4 className="font-semibold text-gray-900 mb-3">Weiterführende Links</h4>
                              <div className="flex flex-wrap gap-2">
                                {solution.relatedLinks.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    {link.label}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {!isLoading && hasSearched && solutions.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Keine Lösungen gefunden
                </h3>
                <p className="text-gray-600 mb-6">
                  Versuchen Sie andere Suchbegriffe oder kontaktieren Sie unseren KI-Assistenten
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => window.open('/chat', '_blank')}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Bot className="w-5 h-5" />
                    KI-Chat starten
                  </button>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Neue Suche
                  </button>
                </div>
              </div>
            )}
            
            {!hasSearched && searchQuery.trim().length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Willkommen bei der Sofort-Hilfe!
                </h3>
                <p className="text-gray-600 mb-6">
                  Stellen Sie eine Frage zu Saarland-Services und erhalten Sie sofort eine KI-unterstützte Antwort
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    { text: 'Gewerbe anmelden', icon: Building2 },
                    { text: 'Tourismus Tipps', icon: Globe },
                    { text: 'Weiterbildung', icon: GraduationCap },
                    { text: 'Behörden Services', icon: Shield }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(example.text)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-lg transition-all flex items-center gap-3 text-left"
                    >
                      <example.icon className="w-6 h-6 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">{example.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InstantHelpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sofort-Hilfe lädt...</h2>
          <p className="text-gray-600">Ihre Lösungen werden vorbereitet</p>
        </div>
      </div>
    }>
      <InstantHelpContent />
    </Suspense>
  )
}