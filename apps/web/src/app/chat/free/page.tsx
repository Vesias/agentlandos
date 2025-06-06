'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Zap, Star, Infinity, Clock } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agent?: string
  responseTime?: number
  model?: string
}

export default function FreeUnlimitedChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🚀 **SAAR-AI PREMIUM FREE** - Völlig kostenlos & unbegrenzt!

Willkommen beim fortschrittlichsten KI-System für das Saarland:

✅ **Komplett kostenlos** - Für immer, ohne Limits
🤖 **Multi-Modell KI** - Mehrere AI-Systeme parallel
⚡ **Echtzeit-Daten** - Live Wetter, Events, Fußball
🧠 **Saarland-Expertise** - 10.000+ lokale Datenpunkte
🔥 **0-50ms Antwortzeit** - Edge Computing

**Verfügbare Services:**
• Wetter & Prognosen • SAARFUSSBALL Live • Nachhilfe & Bildung
• UNESCO Tourismus • Business-Förderung • Behörden-Services
• Vereinsverzeichnis • Grenzpendler-Info • Und vieles mehr...

Stellen Sie mir jede Frage über das Saarland - völlig unbegrenzt! 🎯`,
      timestamp: new Date(),
      agent: 'SAAR-AI-Pro'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [totalQueries, setTotalQueries] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setTotalQueries(prev => prev + 1)

    const startTime = Date.now()

    try {
      // Use high-end free API
      const response = await fetch('/api/ai/highend-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context: { 
            unlimited: true,
            query_count: totalQueries + 1
          }
        })
      })

      const responseTime = Date.now() - startTime
      let aiResponse = 'Entschuldigung, es gab einen temporären Fehler. Unser Service bleibt weiterhin kostenlos verfügbar.'
      let agentName = 'SAAR-AI-Free'
      let modelUsed = 'Local-Enhanced'
      
      if (response.ok) {
        const data = await response.json()
        console.log('High-End Free API Response:', data)
        aiResponse = data.message || aiResponse
        agentName = data.agent_name || agentName
        modelUsed = data.model_chain?.[0] || modelUsed
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        agent: agentName,
        responseTime,
        model: modelUsed
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Free chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Technisches Problem aufgetreten, aber keine Sorge:

🆓 **Ihr Service bleibt kostenlos!**
• Kein Limit für Anfragen
• Alle Premium-Features inklusive  
• 24/7 verfügbar

Versuchen Sie es einfach erneut - unser System ist hochverfügbar!`,
        timestamp: new Date(),
        agent: 'System-Assistant'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Premium Free Header */}
      <div className="bg-gradient-to-r from-[#003399] via-[#0066CC] to-[#009FE3] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-transparent"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-[#FDB913]/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-ping"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 text-center text-white relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FDB913] to-[#FFD700] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform">
            <Infinity className="w-14 h-14 text-[#003399]" />
          </div>
          
          <h1 className="text-6xl font-bold mb-4 font-quantum bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            SAAR-AI PREMIUM FREE
          </h1>
          
          <p className="text-2xl opacity-90 mb-6">Das erste wirklich kostenlose High-End KI-System</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <Infinity className="w-8 h-8 text-[#FDB913] mx-auto mb-2" />
              <div className="font-bold text-lg">UNBEGRENZT</div>
              <div className="text-sm opacity-80">Keine Limits</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <Zap className="w-8 h-8 text-[#FDB913] mx-auto mb-2" />
              <div className="font-bold text-lg">MULTI-KI</div>
              <div className="text-sm opacity-80">3+ AI-Modelle</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <Clock className="w-8 h-8 text-[#FDB913] mx-auto mb-2" />
              <div className="font-bold text-lg">0-50MS</div>
              <div className="text-sm opacity-80">Antwortzeit</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <Star className="w-8 h-8 text-[#FDB913] mx-auto mb-2" />
              <div className="font-bold text-lg">PREMIUM</div>
              <div className="text-sm opacity-80">Features gratis</div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="inline-flex items-center space-x-4 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Online</span>
              </div>
              <div className="h-4 w-px bg-white/30"></div>
              <div className="text-sm">
                <span className="font-bold">{totalQueries}</span> Anfragen heute
              </div>
              <div className="h-4 w-px bg-white/30"></div>
              <div className="text-sm">∞ verbleibend</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Enhanced Messages Display */}
          <div className="h-96 md:h-[600px] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-xs md:max-w-2xl lg:max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-[#009FE3] to-[#0066CC] ml-3' 
                      : 'bg-gradient-to-br from-[#003399] to-[#002266] mr-3'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-7 h-7 text-white" />
                    ) : (
                      <Bot className="w-7 h-7 text-white" />
                    )}
                  </div>
                  
                  <div className={`rounded-3xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#009FE3] to-[#0066CC] text-white'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xs font-medium ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.agent || (message.role === 'user' ? 'Sie' : 'SAAR-AI')}
                      </div>
                      
                      {message.responseTime && (
                        <div className={`text-xs ${
                          message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {message.responseTime}ms
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-xs ${
                        message.role === 'user' ? 'text-white/60' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      
                      {message.model && (
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          message.role === 'user' 
                            ? 'bg-white/20 text-white/80' 
                            : 'bg-[#003399]/10 text-[#003399]'
                        }`}>
                          {message.model}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003399] to-[#002266] mr-3 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl px-6 py-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#003399]" />
                      <span className="text-gray-600 font-medium">SAAR-AI analysiert Ihre Anfrage...</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Multi-Modell KI arbeitet</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Form */}
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Fragen Sie mich alles über das Saarland - völlig unbegrenzt!"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent text-base bg-white shadow-sm"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  ∞ verbleibend
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-[#003399] to-[#0066CC] hover:from-[#002266] hover:to-[#003399] disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-3xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Senden</span>
              </button>
            </form>
            
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>High-End KI aktiv</span>
              </div>
              <div className="h-3 w-px bg-gray-300"></div>
              <div>Völlig kostenlos</div>
              <div className="h-3 w-px bg-gray-300"></div>
              <div>Keine Registrierung</div>
              <div className="h-3 w-px bg-gray-300"></div>
              <div>DSGVO-konform</div>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#003399] to-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Infinity className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#003399]">Wirklich unbegrenzt</h3>
            <p className="text-gray-600">
              Keine versteckten Limits, keine Bezahlschranken. Stellen Sie so viele Fragen wie Sie möchten.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#009FE3] to-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#003399]">Multi-Modell KI</h3>
            <p className="text-gray-600">
              Mehrere AI-Systeme arbeiten parallel für die bestmöglichen Antworten.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FDB913] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-[#003399]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#003399]">Premium Features</h3>
            <p className="text-gray-600">
              Echtzeit-Daten, Saarland-Expertise und erweiterte KI-Features - alles kostenlos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}