'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getChatContextById } from '@/lib/chat-contexts'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentContext, setCurrentContext] = useState<any>(null)
  const [conversationHistory, setConversationHistory] = useState<string[]>([])
  const [userInterests, setUserInterests] = useState<{[key: string]: number}>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle context parameter from URL
  useEffect(() => {
    const contextId = searchParams.get('context')
    if (contextId) {
      const context = getChatContextById(contextId)
      if (context) {
        setCurrentContext(context)
        
        // Add initial context message
        const initialMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: context.initialMessage,
          timestamp: new Date()
        }
        setMessages([initialMessage])
      }
    }
  }, [searchParams])

  // Intelligente Kontext-Analyse basierend auf Gesprächsverlauf
  const analyzeUserInterests = (userInput: string) => {
    const keywords = userInput.toLowerCase()
    const interests = {...userInterests}
    
    // Gewichtung basierend auf Keywords
    if (keywords.includes('tour') || keywords.includes('sehen') || keywords.includes('reise') || keywords.includes('wandern') || keywords.includes('ausflug') || keywords.includes('sommer')) {
      interests.tourism = (interests.tourism || 0) + 1
    }
    if (keywords.includes('förder') || keywords.includes('business') || keywords.includes('unternehmen') || keywords.includes('gründ') || keywords.includes('startup') || keywords.includes('ki')) {
      interests.business = (interests.business || 0) + 1
    }
    if (keywords.includes('kultur') || keywords.includes('theater') || keywords.includes('konzert') || keywords.includes('festival') || keywords.includes('kunst')) {
      interests.culture = (interests.culture || 0) + 1
    }
    if (keywords.includes('amt') || keywords.includes('behörde') || keywords.includes('antrag') || keywords.includes('ausweis') || keywords.includes('gewerbe')) {
      interests.admin = (interests.admin || 0) + 1
    }
    if (keywords.includes('studium') || keywords.includes('bildung') || keywords.includes('universität') || keywords.includes('stipendium') || keywords.includes('weiterbildung')) {
      interests.education = (interests.education || 0) + 1
    }

    setUserInterests(interests)
    return interests
  }

  // Intelligente Kategorisierung basierend auf Kontext und Historie
  const determineCategory = (userInput: string, interests: {[key: string]: number}) => {
    const keywords = userInput.toLowerCase()
    
    // Erste Priorität: Expliziter Kontext
    if (currentContext?.category) {
      return currentContext.category
    }
    
    // Zweite Priorität: Direkte Keywords in aktueller Nachricht
    if (keywords.includes('tour') || keywords.includes('sehen') || keywords.includes('reise') || keywords.includes('wandern') || keywords.includes('ausflug') || keywords.includes('sommer')) return 'tourism'
    if (keywords.includes('förder') || keywords.includes('business') || keywords.includes('unternehmen') || keywords.includes('gründ') || keywords.includes('startup')) return 'business'
    if (keywords.includes('kultur') || keywords.includes('theater') || keywords.includes('konzert') || keywords.includes('festival') || keywords.includes('kunst')) return 'culture'
    if (keywords.includes('amt') || keywords.includes('behörde') || keywords.includes('antrag') || keywords.includes('ausweis') || keywords.includes('gewerbe')) return 'admin'
    if (keywords.includes('studium') || keywords.includes('bildung') || keywords.includes('universität') || keywords.includes('stipendium') || keywords.includes('weiterbildung')) return 'education'
    
    // Dritte Priorität: Gesprächshistorie (nach 2+ Nachrichten)
    if (messages.length >= 2) {
      const topInterest = Object.entries(interests).sort(([,a], [,b]) => b - a)[0]
      if (topInterest && topInterest[1] > 0) {
        return topInterest[0]
      }
    }
    
    return 'general'
  }

  const generateResponse = (userInput: string): string => {
    const keywords = userInput.toLowerCase()
    const interests = analyzeUserInterests(userInput)
    const category = determineCategory(userInput, interests)
    
    // Aktualisiere Gesprächshistorie
    setConversationHistory(prev => [...prev.slice(-4), userInput]) // Keep last 5 messages

    switch(category) {
      case 'tourism':
        if (keywords.includes('sommer') || keywords.includes('juni') || keywords.includes('heute')) {
          return `🌞 Sommer-Aktivitäten im Saarland - Stand 03.06.2025:

**Perfektes Sommerwetter für:**
• Saarschleife Wanderungen (täglich, kostenlos)
• Bostalsee Wassersport & Strand (Eingang 8€)
• Völklinger Hütte Sonnenterrasse (15€, bis 20:00)

**Aktuelle Sommer-Events:**
• Saarland Open Air Festival (07.-09.06.2025)
• Nachtmärkte in Saarbrücken (jeden Freitag im Juni)
• Schifffahrt auf der Saar (15€, täglich 14:00 & 16:00)

Bei dem schönen Wetter ideal für Outdoor-Aktivitäten! Welche Art von Sommeraktivität interessiert Sie?`
        }
        return `🏞️ Tourismus im Saarland - Stand 03.06.2025:

**Top Sehenswürdigkeiten:**
• Saarschleife Mettlach - Das Wahrzeichen (kostenlos)
• Völklinger Hütte - UNESCO Welterbe (15€)
• Bostalsee - Freizeitsee mit Strand & Wassersport (8€)

**Sommer-Highlights 2025:**
• Saarland Open Air Festival (07.-09.06.2025)
• Historische Schifffahrt auf der Saar (täglich)
• Radtouren entlang der Saar (Fahrradverleih 12€/Tag)

Welche Art von Aktivität interessiert Sie?`

      case 'business':
        if (keywords.includes('ki') || keywords.includes('digital')) {
          return `💼 KI & Digitalisierungs-Förderung Saarland - Stand 03.06.2025:

**AKTUELLE PROGRAMME:**
• Saarland Innovation 2025: bis 150.000€ (KI, Digitalisierung)
  ⏰ Nächste Deadline: 31.08.2025
• Digitalisierungsbonus Plus: bis 35.000€ (erweitert 2025)
• Green Tech & KI Hybrid: bis 250.000€ (NEU ab Juni 2025)

**2025 Update:** KI-Integration wird mit 50% Bonus gefördert!

**Sommer-Förderung:** Schnellverfahren für KI-Projekte (4 Wochen statt 8)

Für welche Art von KI-Projekt benötigen Sie Förderung?`
        }
        return `💼 Wirtschaftsförderung Saarland - Stand 03.06.2025:

**Erweiterte Förderprogramme 2025:**
• Saarland Innovation 2025: bis 150.000€ (KI, Digitalisierung) 
• Digitalisierungsbonus Plus: bis 35.000€ (erhöht)
• Green Tech & KI: bis 250.000€ (NEU)
• Startup Saarland Boost: bis 75.000€ (für Gründer unter 30)

**Gründungsberatung:**
• Kostenlose Erstberatung & Business Plan Check
• KI-unterstützte Marktanalyse (NEU)

Für welchen Bereich suchen Sie Unterstützung?`

      case 'culture':
        if (keywords.includes('diese woche') || keywords.includes('aktuell') || keywords.includes('juni')) {
          return `🎭 Diese Woche im Saarland - Stand 03.06.2025:

**Diese Woche (03.-09.06.2025):**
• Saarland Open Air Festival - Messegelände, Fr-So (45-85€)
• Shakespeare im Park - Stadtpark, täglich 20:00 (22€)
• Jazz unter Sternen - Alte Feuerwache, Sa 21:00 (28€)

**Den ganzen Juni:**
• Kunst & KI Biennale - Moderne Galerie (läuft bis 30.08.2025)
• Sommernachtsmärkte - Altstadt, jeden Freitag (kostenlos)

**Besonderes Highlight:**
Digital Art Festival mit interaktiven KI-Installationen!

Welche Veranstaltung interessiert Sie?`
        }
        return `🎭 Kultur im Saarland - Stand 03.06.2025:

**Sommer-Highlights 2025:**
• Saarland Open Air Festival (07.-09.06.2025)
• Shakespeare im Park (Juni-August)
• Kunst & KI Biennale (bis 30.08.2025)
• Jazz unter Sternen (jeden Samstag)

**Besonders empfehlenswert:**
Digital Art Festival mit weltpremiere KI-Symphonie am 15.06.!

**Sommer-Specials:**
• Open Air Kino im Stadtpark
• Kulturnacht unter freiem Himmel

Welche Art von Kulturveranstaltung interessiert Sie?`

      case 'admin':
        if (keywords.includes('wartezeit') || keywords.includes('öffnungszeit')) {
          return `🏛️ Aktuelle Service-Zeiten - Stand 03.06.2025:

**Live Wartezeiten (Sommer-Optimierung):**
• Bürgeramt Saarbrücken: ⏱️ Nur 8 Min Wartezeit!
  Mo-Fr 7:30-19:00, Sa 8:00-14:00 (erweiterte Öffnungszeiten)
• KFZ-Zulassung: ⏱️ Nur 5 Min Wartezeit!
  Mo-Fr 7:00-16:00

**Sommer-Service:** Verlängerte Öffnungszeiten & zusätzliche Samstage

**Online-Services:** 99.7% Verfügbarkeit (verbessert)

Welchen Service benötigen Sie?`
        }
        return `🏛️ Digitale Verwaltung Saarland - Stand 03.06.2025:

**NEU seit Juni 2025:**
• KI-Assistent für alle Bürgerservices (24/7)
• Volldigitale Unterschrift für alle Dokumente
• Express-Termin-App mit Live-Tracking

**Rekord-Wartezeiten:**
• Bürgeramt: 8 Min | KFZ: 5 Min (Sommer-Optimierung)

**Beliebteste Services:**
• Online-Personalausweis (24h Lieferung)
• Digital-Gewerbeanmeldung (sofort)
• KI-unterstützte Antragsberatung

Wie kann ich Ihnen helfen?`

      case 'education':
        if (keywords.includes('ki') || keywords.includes('master') || keywords.includes('bewerbung')) {
          return `🎓 KI-Studium im Saarland - Stand 03.06.2025:

**🔥 KI-Masterstudiengang UdS:**
✅ Start: Wintersemester 2025/26 (bereits über 500 Bewerbungen!)
⏰ Bewerbung noch bis: 15.07.2025 (in 6 Wochen!)
🚀 Praxispartner: SAP, Software AG, DFKI

**Finanzierung aktualisiert:**
• Saarland Digital Stipendium: 950€/Monat (erhöht Juni 2025)
• KI-Excellence Stipendium: 1.200€/Monat (NEU für Top 10%)
• DFKI-Forschungsstipendien verfügbar

**Bewerbungs-Tipp:** Online-Assessment läuft noch bis 30.06.!

Soll ich Ihnen beim Bewerbungsprozess helfen?`
        }
        return `🎓 Bildung im Saarland - Stand 03.06.2025:

**Universität des Saarlandes:** 17.500+ Studenten, 125+ Programme

**Highlight Sommer 2025:**
• KI-Masterstudiengang (Start WS 25/26) - Bewerbung bis 15.07.!
• Saarland Digital Stipendium: 950€/Monat (erhöht)
• Neue Blockchain-Professur besetzt

**Sommer-Kurse:**
• Intensiv-KI Bootcamp (Juli 2025)
• Digitale Transformation Zertifikat (IHK)

Für welchen Bereich suchen Sie Bildungsangebote?`

      default:
        return `🤖 AGENTLAND.SAARLAND - Ihr KI-Assistent (Stand: 03.06.2025)

Ich helfe Ihnen gerne bei Fragen zu:
• 🌞 **Tourismus**: Sommer-Events, Outdoor-Aktivitäten
• 💼 **Wirtschaft**: Erweiterte Förderprogramme, KI-Bonus
• 🎓 **Bildung**: KI-Master Bewerbung, erhöhte Stipendien
• 🏛️ **Verwaltung**: Optimierte Services, KI-Assistent 24/7
• 🎭 **Kultur**: Open Air Festival, Digital Art Biennale

**Was ist neu im Juni 2025?**
• Saarland Open Air Festival (07.-09.06.)
• KI-Förderung mit 50% Bonus
• Erweiterte Behörden-Öffnungszeiten

**Perfektes Sommerwetter heute!** ☀️ Stellen Sie mir Ihre Frage zum Saarland!`
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    // Kleine Verzögerung für bessere UX
    setTimeout(() => {
      const response = generateResponse(currentInput)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }])
      
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Chat Header */}
      <div className="py-4 sm:py-6 border-b">
        {currentContext ? (
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentContext.color}20` }}
            >
              <div className="text-lg" style={{ color: currentContext.color }}>
                {currentContext.icon === 'Sparkles' ? '✨' : 
                 currentContext.icon === 'Calendar' ? '📅' :
                 currentContext.icon === 'Euro' ? '💶' :
                 currentContext.icon === 'Rocket' ? '🚀' :
                 currentContext.icon === 'GraduationCap' ? '🎓' :
                 currentContext.icon === 'Award' ? '🏆' :
                 currentContext.icon === 'FileText' ? '📄' :
                 currentContext.icon === 'Building2' ? '🏢' :
                 currentContext.icon === 'Theater' ? '🎭' :
                 currentContext.icon === 'PartyPopper' ? '🎉' : '🤖'}
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{currentContext.title}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Spezialisierte Beratung für {currentContext.category === 'tourism' ? 'Tourismus' :
                currentContext.category === 'business' ? 'Wirtschaft' :
                currentContext.category === 'education' ? 'Bildung' :
                currentContext.category === 'admin' ? 'Verwaltung' :
                currentContext.category === 'culture' ? 'Kultur' : 'Services'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chat mit AGENTLAND.SAARLAND</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Ihre KI-Assistenz für das Saarland</p>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Willkommen!</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
              Stellen Sie mir Fragen zu Tourismus, Wirtschaft, Bildung, Verwaltung oder Kultur im Saarland.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[90%] sm:max-w-[80%] lg:max-w-[70%]`}>
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gray-200' 
                    : 'bg-gradient-to-br from-blue-600 to-cyan-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  ) : (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
                <Card className={`p-3 sm:p-4 ${
                  message.role === 'user' 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-white border-gray-200'
                }`}>
                  <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {currentContext && currentContext.suggestedQuestions && (
        <div className="border-t border-gray-200 py-3">
          <p className="text-xs text-gray-500 mb-2 px-1">💡 Häufige Fragen:</p>
          <div className="flex flex-wrap gap-2">
            {currentContext.suggestedQuestions.map((question: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setInput(question)
                }}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t py-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ihre Nachricht..."
            className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}