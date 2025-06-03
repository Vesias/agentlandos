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

  const generateResponse = (userInput: string): string => {
    const keywords = userInput.toLowerCase()
    const category = currentContext?.category || 
      (keywords.includes('tour') || keywords.includes('sehen') || keywords.includes('reise') || keywords.includes('wandern') || keywords.includes('ausflug') ? 'tourism' :
       keywords.includes('förder') || keywords.includes('business') || keywords.includes('unternehmen') || keywords.includes('gründ') || keywords.includes('startup') ? 'business' :
       keywords.includes('kultur') || keywords.includes('theater') || keywords.includes('konzert') || keywords.includes('karneval') || keywords.includes('kunst') ? 'culture' :
       keywords.includes('amt') || keywords.includes('behörde') || keywords.includes('antrag') || keywords.includes('ausweis') || keywords.includes('gewerbe') ? 'admin' :
       keywords.includes('studium') || keywords.includes('bildung') || keywords.includes('universität') || keywords.includes('stipendium') || keywords.includes('weiterbildung') ? 'education' : 'general')

    switch(category) {
      case 'tourism':
        if (keywords.includes('winter') || keywords.includes('februar')) {
          return `🏞️ Winter-Aktivitäten im Saarland - Stand 02.02.2025:

**Diese Woche verfügbar:**
• Winter-Wanderung Saarschleife am 09.02.2025 (15€)
• Völklinger Hütte bei Nacht am 14.02.2025 (20€, romantisch zum Valentinstag!)

**Ganzjährig geöffnet:**
• Saarschleife Mettlach - Das Wahrzeichen (kostenlos)
• Völklinger Hütte - UNESCO Welterbe (15€)
• Bostalsee - Freizeitsee (kostenlos)

Bei diesem Winterwetter empfehle ich warme Kleidung für Outdoor-Aktivitäten. Kann ich Ihnen bei einer konkreten Reiseplanung helfen?`
        }
        return `🏞️ Tourismus im Saarland - Stand 02.02.2025:

**Top Sehenswürdigkeiten:**
• Saarschleife Mettlach - Das Wahrzeichen (kostenlos)
• Völklinger Hütte - UNESCO Welterbe (15€)
• Bostalsee - Freizeitsee mit vielen Aktivitäten

**Aktuelle Events:**
• Winter-Wanderung Saarschleife (09.02.2025)
• Völklinger Hütte bei Nacht (14.02.2025)

Welche Art von Aktivität interessiert Sie?`

      case 'business':
        if (keywords.includes('ki') || keywords.includes('digital')) {
          return `💼 KI & Digitalisierungs-Förderung Saarland - Stand 02.02.2025:

**TOP FÖRDERPROGRAMM:**
• Saarland Innovation 2025: bis 150.000€ (Focus: KI, Digitalisierung)
  ⚠️ Deadline: 31.03.2025 - JETZT ANMELDEN!

• Digitalisierungsbonus Plus: bis 25.000€ (KI-Integration)
• Green Tech Saarland: bis 200.000€ (Umwelttechnologie)

**2025 Fokus:** KI-Integration wird besonders gefördert!

Für welche Art von KI-Projekt benötigen Sie Förderung?`
        }
        return `💼 Wirtschaftsförderung Saarland - Stand 02.02.2025:

**Aktuelle Förderprogramme:**
• Saarland Innovation 2025: bis 150.000€ (Focus: KI, Digitalisierung)
• Digitalisierungsbonus Plus: bis 25.000€
• Green Tech Saarland: bis 200.000€

**Gründungsberatung:**
• Kostenlose Erstberatung verfügbar
• Business Plan Check & Finanzierung

Für welchen Bereich suchen Sie Unterstützung?`

      case 'culture':
        if (keywords.includes('diese woche') || keywords.includes('aktuell')) {
          return `🎭 Diese Woche im Saarland - Stand 02.02.2025:

**Diese Woche:**
• Romeo und Julia - Staatstheater, 08.02.2025, 19:30 Uhr (22-78€)

**Diesen Monat:**
• Winter Jazz Festival - Congresshalle, 15.02.2025, 20:00 Uhr (38-75€)
• KI und Kunst Ausstellung - Moderne Galerie (läuft bis 20.04.2025)

**Kommender Höhepunkt:**
• Karneval Saarbrücken: 28.02-04.03.2025 (kostenlos!)

Welche Veranstaltung interessiert Sie?`
        }
        return `🎭 Kultur im Saarland - Stand 02.02.2025:

**Aktuelle Highlights:**
• Romeo und Julia - Staatstheater (08.02.2025)
• Winter Jazz Festival (15.02.2025)
• KI und Kunst Ausstellung (bis 20.04.2025)
• Karneval Saarbrücken (28.02-04.03.2025)

**Besonders interessant:**
"KI und Kunst - Digitale Zukunft" mit KI-generierten Audioguides!

Welche Art von Kulturveranstaltung interessiert Sie?`

      case 'admin':
        if (keywords.includes('wartezeit') || keywords.includes('öffnungszeit')) {
          return `🏛️ Aktuelle Service-Zeiten - Stand 02.02.2025:

**Live Wartezeiten:**
• Bürgeramt Saarbrücken: ⏱️ Nur 12 Min Wartezeit!
  Mo-Fr 8:00-18:00, Sa 9:00-13:00
• KFZ-Zulassung: ⏱️ Nur 8 Min Wartezeit!
  Mo-Fr 7:30-15:30

**Online-Services:** 99.2% Verfügbarkeit
Wartung: So 2:00-4:00

Welchen Service benötigen Sie?`
        }
        return `🏛️ Digitale Verwaltung Saarland - Stand 02.02.2025:

**NEU seit 2025:**
• KI-Chatbot für Bürgerservices
• Digitale Unterschrift verfügbar
• Neue Termin-App

**Schnellste Wartezeiten:**
• Bürgeramt: 12 Min | KFZ: 8 Min

**Beliebte Services:**
• Personalausweis beantragen
• Gewerbeanmeldung
• KFZ-Zulassung

Wie kann ich Ihnen helfen?`

      case 'education':
        if (keywords.includes('ki') || keywords.includes('master')) {
          return `🎓 KI-Studium im Saarland - Stand 02.02.2025:

**🔥 NEU für 2025/26:**
KI-Masterstudiengang an der Universität des Saarlandes
• Start: Wintersemester 2025/26
• Bewerbung bis: 15.07.2025
• Zukunftsorientiert & praxisnah

**Finanzierung:**
• Saarland Digital Stipendium: 800€/Monat
• Focus: MINT, Digitalisierung, KI
• Deadline: 30.04.2025

Interessieren Sie sich für den KI-Master?`
        }
        return `🎓 Bildung im Saarland - Stand 02.02.2025:

**Universität des Saarlandes:** 17.000+ Studenten, 120+ Programme

**NEU 2025:**
• KI-Masterstudiengang (Start WS 2025/26)
• Saarland Digital Stipendium: 800€/Monat

**Weiterbildung:**
• Digitaler Wandel (IHK) - Start: 01.03.2025

Für welchen Bereich suchen Sie Bildungsangebote?`

      default:
        return `🤖 AGENTLAND.SAARLAND - Ihr KI-Assistent (Stand: 02.02.2025)

Ich helfe Ihnen gerne bei Fragen zu:
• 🏞️ **Tourismus**: Sehenswürdigkeiten, Events, Aktivitäten
• 💼 **Wirtschaft**: Förderprogramme, Business, Gründung  
• 🎓 **Bildung**: Universitäten, Stipendien, Weiterbildung
• 🏛️ **Verwaltung**: Behördenservices, Formulare, Termine
• 🎭 **Kultur**: Theater, Konzerte, Museen, Festivals

**Was gibt's Neues im Februar 2025?**
• Winter Jazz Festival am 15.02.
• KI-Förderung bis 150.000€ verfügbar
• Neue digitale Bürgerservices online

Stellen Sie mir einfach Ihre Frage zum Saarland!`
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