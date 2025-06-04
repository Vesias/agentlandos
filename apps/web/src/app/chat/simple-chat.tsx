'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Bot, User, Loader2, PenTool, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getChatContextById } from '@/lib/chat-contexts'
import OpenCanvas from '@/components/OpenCanvas'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex flex-col h-screen-safe max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-scroll safe-area">
        {/* Modern Chat Header */}
        <div className="py-6 sm:py-8 border-b border-white/10 bg-white/5 backdrop-blur-xl rounded-t-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              {currentContext ? (
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20"
                    style={{ 
                      background: 'linear-gradient(135deg, #0066cc 0%, #003d7a 100%)',
                      boxShadow: '0 10px 25px rgba(0, 51, 153, 0.3)'
                    }}
                  >
                    <div className="text-2xl text-white">
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{currentContext.title}</h1>
                    <p className="text-lg text-blue-200">
                      Spezialisierte KI für {currentContext.category === 'tourism' ? 'Tourismus' :
                      currentContext.category === 'business' ? 'Wirtschaft' :
                      currentContext.category === 'education' ? 'Bildung' :
                      currentContext.category === 'admin' ? 'Verwaltung' :
                      currentContext.category === 'culture' ? 'Kultur' : 'Services'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/20"
                       style={{ 
                         background: 'linear-gradient(135deg, #0066cc 0%, #003d7a 100%)',
                         boxShadow: '0 15px 35px rgba(0, 51, 153, 0.4)'
                       }}>
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">SAAR-GPT Premium</h1>
                  <p className="text-lg text-blue-200 mb-6">Die fortschrittlichste KI für das Saarland • Powered by DeepSeek R1</p>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-white font-medium">Live Daten</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                      <span className="text-white font-medium">RAG System</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                      <span className="text-white font-medium">Autonome Agents</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modern Canvas Toggle Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCanvas(!showCanvas)}
                variant={showCanvas ? "default" : "outline"}
                size="lg"
                className={`flex items-center gap-3 font-semibold transition-all duration-300 ${
                  showCanvas 
                    ? 'bg-white text-blue-900 hover:bg-blue-50 shadow-xl' 
                    : 'border-white/30 text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
              >
                <PenTool className="w-5 h-5" />
                {showCanvas ? 'Chat Modus' : 'Canvas AI'}
              </Button>
              {showCanvas && (
                <Button
                  onClick={() => {
                    setPlanningPrompt('Neue Planung erstellen')
                    setCanvasServiceCategory('general')
                  }}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-medium"
                >
                  <Layout className="w-5 h-5 mr-2" />
                  Neues Canvas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {showCanvas ? (
          /* Canvas View */
          <div className="flex-1 p-6 bg-white/5 backdrop-blur-xl rounded-2xl margin-2">
            <OpenCanvas 
              initialPrompt={planningPrompt}
              serviceCategory={canvasServiceCategory}
              onArtifactGenerated={(artifact) => {
                console.log('Artifact generated:', artifact)
                // Add artifact result to chat messages
                const artifactMessage = {
                  id: Date.now().toString(),
                  role: 'assistant' as const,
                  content: `🎨 **${artifact.type === 'code' ? 'Code' : 'Dokument'} erstellt**: ${artifact.title}\n\nType: ${artifact.type}\n${artifact.language ? `Language: ${artifact.language}\n` : ''}Content Length: ${artifact.content.length} characters`,
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, artifactMessage])
              }}
            />
          </div>
        ) : (
          /* Premium Chat Messages Area */
          <div className="flex-1 overflow-y-auto py-6 sm:py-8 space-y-6">
            {messages.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/20"
                   style={{ 
                     background: 'linear-gradient(135deg, #009FE3 0%, #0066cc 100%)',
                     boxShadow: '0 20px 40px rgba(0, 159, 227, 0.3)'
                   }}>
                <Bot className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Willkommen bei SAAR-GPT Premium!</h2>
              <p className="text-lg text-blue-100 max-w-lg mx-auto mb-8 leading-relaxed">
                Ihre fortschrittlichste KI-Assistenz für das Saarland. Premium Features mit DeepSeek R1 Reasoning.
              </p>
              
              {/* Modern Quick Action Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-8">
                {[
                  { emoji: '🏰', label: 'Tourismus', desc: 'Live Events & Ausflüge', color: 'from-emerald-500 to-teal-600' },
                  { emoji: '💼', label: 'Business', desc: 'KI-Förderungen & Startups', color: 'from-blue-500 to-indigo-600' },
                  { emoji: '🏛️', label: 'Verwaltung', desc: 'Express-Services', color: 'from-purple-500 to-violet-600' },
                  { emoji: '🎓', label: 'Bildung', desc: 'KI-Master & Stipendien', color: 'from-orange-500 to-red-600' },
                  { emoji: '🎭', label: 'Kultur', desc: 'Digital Art & Events', color: 'from-pink-500 to-rose-600' }
                ].map((item) => (
                  <div key={item.label} 
                       className={`group p-4 bg-gradient-to-br ${item.color} rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl backdrop-blur-sm border border-white/20`}
                       onClick={() => setInput(`Was gibt es Neues im Bereich ${item.label}?`)}>
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                    <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                    <div className="text-xs text-white/80 leading-tight">{item.desc}</div>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-blue-200 bg-white/10 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Powered by DeepSeek R1 • RAG System aktiv • Autonome Agents verfügbar
              </div>
            </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4 max-w-[90%] sm:max-w-[85%] lg:max-w-[75%]`}>
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.role === 'user' 
                        ? 'bg-white/20 backdrop-blur-sm border border-white/30' 
                        : ''
                    }`}
                    style={{ 
                      background: message.role === 'assistant' 
                        ? 'linear-gradient(135deg, #0066cc 0%, #003d7a 100%)' 
                        : undefined,
                      boxShadow: message.role === 'assistant' 
                        ? '0 8px 20px rgba(0, 51, 153, 0.3)' 
                        : undefined
                    }}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                    </div>
                    <Card className={`p-4 sm:p-6 border-0 shadow-xl backdrop-blur-xl ${
                      message.role === 'user' 
                        ? 'bg-white/15 text-white' 
                        : 'bg-white/95 text-gray-800'
                    }`}
                    style={{
                      borderRadius: '1.5rem',
                      backdropFilter: 'blur(20px)',
                      boxShadow: message.role === 'user' 
                        ? '0 8px 25px rgba(255, 255, 255, 0.1)' 
                        : '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }}>
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                      <p className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
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

        {/* Premium Suggested Questions - Only in Chat Mode */}
        {!showCanvas && currentContext && currentContext.suggestedQuestions && (
            <div className="border-t border-white/10 py-4 bg-white/5 backdrop-blur-xl">
              <p className="text-sm text-blue-200 mb-3 px-2 font-medium">💡 Beliebte Anfragen:</p>
              <div className="flex flex-wrap gap-3">
                {currentContext.suggestedQuestions.map((question: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question)
                    }}
                    className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 hover:border-white/40 transition-all duration-200 backdrop-blur-sm hover:scale-105 font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Modern Canvas Instructions */}
        {showCanvas && (
          <div className="border-t border-white/10 py-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base">Canvas AI aktiv</span>
                <span className="text-blue-200 ml-2">• Nutzen Sie die Tools zum visuellen Planen</span>
              </div>
              <div className="ml-auto text-cyan-300 font-medium">
                💡 Tipp: Drag & Drop für Objekte
              </div>
            </div>
          </div>
        )}

        {/* Premium Input Area - Only in Chat Mode */}
        {!showCanvas && (
          <div className="border-t border-white/10 py-6 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Fragen Sie SAAR-GPT alles über das Saarland..."
                  className="w-full px-6 py-4 text-base bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 focus:border-white/40 focus:bg-white/15 text-white placeholder-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  disabled={isLoading}
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm font-medium">
                  {input.length > 0 && `${input.length}/1000`}
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="lg"
                className="w-14 h-14 rounded-2xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-xl"
                style={{ 
                  background: isLoading 
                    ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' 
                    : 'linear-gradient(135deg, #009FE3 0%, #0066cc 100%)',
                  boxShadow: '0 10px 25px rgba(0, 159, 227, 0.3)'
                }}
                aria-label="Nachricht senden"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>DeepSeek R1 aktiv</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>RAG System bereit</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>4 Agents online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}