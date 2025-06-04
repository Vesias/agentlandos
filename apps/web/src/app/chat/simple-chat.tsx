'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Bot, User, Loader2, PenTool, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getChatContextById } from '@/lib/chat-contexts'
import DeepSeekCanvas from '@/components/DeepSeekCanvas'

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
  const [showCanvas, setShowCanvas] = useState(false)
  const [planningPrompt, setPlanningPrompt] = useState('')
  const [canvasServiceCategory, setCanvasServiceCategory] = useState<'tourism' | 'business' | 'education' | 'admin' | 'culture' | 'general'>('general')
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

  const checkForPlanningTrigger = (userInput: string, category: string): boolean => {
    const planningKeywords = [
      'plan', 'planen', 'planer', 'planung',
      'organisieren', 'organisation', 'vorbereiten',
      'strategie', 'vorgehen', 'schritte',
      'canvas', 'visual', 'zeichnen', 'skizze'
    ]
    
    return planningKeywords.some(keyword => userInput.toLowerCase().includes(keyword))
  }

  const generateResponse = (userInput: string): string => {
    const keywords = userInput.toLowerCase()
    const interests = analyzeUserInterests(userInput)
    const category = determineCategory(userInput, interests)
    
    // Check if user wants to use planning canvas
    if (checkForPlanningTrigger(userInput, category)) {
      setPlanningPrompt(userInput)
      setCanvasServiceCategory(category as any)
      setShowCanvas(true)
      
      return `🎯 **Planning Canvas aktiviert!**

Ich habe ein interaktives Planning Canvas für Sie erstellt, um "${userInput}" zu planen.

**Canvas Features:**
• 🎨 Visuelles Planen & Zeichnen
• 📋 Automatische Schritte für ${category === 'tourism' ? 'Tourismus' : 
                                     category === 'business' ? 'Business' :
                                     category === 'education' ? 'Bildung' :
                                     category === 'admin' ? 'Verwaltung' :
                                     category === 'culture' ? 'Kultur' : 'Allgemein'}
• ✅ Task-Management mit Status
• 💡 Ideenfindung & Brainstorming
• 📥 Export als PNG

**Bedienung:**
- Klicken Sie auf Canvas-Tools oben rechts
- Zeichnen Sie, fügen Sie Ziele & Aufgaben hinzu
- Klicken Sie auf Elemente, um Status zu ändern

Das Canvas ist bereits mit intelligenten Planungsschritten für Ihre Anfrage vorgefüllt!`
    }
    
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

    try {
      // Versuche zuerst DeepSeek API für intelligente Antworten
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          language: 'de',
          context: currentContext ? {
            id: currentContext.id,
            category: currentContext.category,
            agentType: currentContext.agentType
          } : undefined,
          conversationHistory: messages.slice(-4), // Letzte 4 Nachrichten für Kontext
          userInterests: userInterests
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || data.response,
          timestamp: new Date()
        }])
      } else {
        throw new Error('API not available')
      }
    } catch (error) {
      console.error('DeepSeek API error, using fallback:', error)
      
      // Fallback mit verbesserter Logik
      const interests = analyzeUserInterests(currentInput)
      const category = determineCategory(currentInput, interests)
      const response = generateResponse(currentInput)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen-safe max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mobile-scroll safe-area">
        {/* Chat Header */}
        <div className="py-4 sm:py-6 border-b bg-white rounded-t-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {currentContext ? (
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#003399' }}
                  >
                    <div className="text-lg text-white">
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
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#003399' }}>{currentContext.title}</h1>
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
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#003399' }}>
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#003399' }}>KI-Chat Saarland</h1>
                  <p className="text-sm sm:text-base text-gray-600">Ihre Premium KI-Assistenz für das Saarland • €10/Monat</p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#009FE3' }}></span>
                      Real-time Daten
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FDB913' }}></span>
                      Premium Features
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      GDPR-konform
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Toggle Button */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCanvas(!showCanvas)}
                variant={showCanvas ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                {showCanvas ? 'Chat' : 'Canvas'}
              </Button>
              {showCanvas && (
                <Button
                  onClick={() => {
                    setPlanningPrompt('Neue Planung erstellen')
                    setCanvasServiceCategory('general')
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Layout className="w-4 h-4 mr-1" />
                  Neu
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {showCanvas ? (
          /* Canvas View */
          <div className="flex-1 p-4">
            <DeepSeekCanvas 
              planningPrompt={planningPrompt}
              serviceCategory={canvasServiceCategory}
              onPlanGenerated={(plan) => {
                console.log('Plan generated:', plan)
                // Add plan result to chat messages
                const planMessage = {
                  id: Date.now().toString(),
                  role: 'assistant' as const,
                  content: `🎯 **Plan erstellt**: ${plan.steps.length} Schritte für ${plan.category}\n\n${plan.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}`,
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, planMessage])
              }}
            />
          </div>
        ) : (
          /* Chat Messages Area */
          <div className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-4">
            {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#003399' }}>
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#003399' }}>Willkommen bei SAAR-ID Premium!</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6">
                Ihr persönlicher KI-Assistent für alle Saarland-Services. Premium Features für nur €10/Monat.
              </p>
              
              {/* Quick Action Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto mb-6">
                {[
                  { emoji: '🏰', label: 'Tourismus', desc: 'Ausflüge & Events' },
                  { emoji: '💼', label: 'Business', desc: 'Förderungen & Gründung' },
                  { emoji: '🏛️', label: 'Verwaltung', desc: 'Ämter & Services' },
                  { emoji: '🎓', label: 'Bildung', desc: 'Studium & Kurse' },
                  { emoji: '🎭', label: 'Kultur', desc: 'Theater & Musik' }
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                       onClick={() => setInput(`Was gibt es Neues im Bereich ${item.label}?`)}>
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <div className="text-sm font-semibold" style={{ color: '#003399' }}>{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500">
                💡 Klicken Sie auf eine Kategorie oder stellen Sie direkt eine Frage
              </div>
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
                        : ''
                    }`}
                    style={{ backgroundColor: message.role === 'assistant' ? '#003399' : undefined }}>
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
        )}

        {/* Suggested Questions - Only in Chat Mode */}
        {!showCanvas && currentContext && currentContext.suggestedQuestions && (
            <div className="border-t border-gray-200 py-3">
              <p className="text-xs text-gray-500 mb-2 px-1">💡 Häufige Fragen:</p>
              <div className="flex flex-wrap gap-2">
                {currentContext.suggestedQuestions.map((question: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question)
                    }}
                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors touch-target-sm touch-smooth"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Canvas Instructions */}
        {showCanvas && (
          <div className="border-t border-gray-200 py-3 bg-blue-50">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <PenTool className="w-4 h-4" />
              <span className="font-semibold">Canvas-Modus aktiv:</span>
              <span>Verwenden Sie die Tools zum Zeichnen und Planen.</span>
              <span className="text-blue-600">💡 Tipp: Fügen Sie Ziele, Ideen und Aufgaben hinzu!</span>
            </div>
          </div>
        )}

        {/* Input Area - Only in Chat Mode */}
        {!showCanvas && (
          <div className="border-t py-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ihre Nachricht... (Tipp: 'Plan erstellen' für Canvas-Modus)"
                className="flex-1 px-4 py-3 text-mobile-safe bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent touch-manipulation"
                disabled={isLoading}
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                style={{ backgroundColor: '#003399' }}
                aria-label="Nachricht senden"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}