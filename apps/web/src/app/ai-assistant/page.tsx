'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Brain, Zap, Send, Mic, Camera, FileText, Settings, 
  Star, TrendingUp, Globe, MessageCircle, Image, 
  Paperclip, Volume2, Copy, ThumbsUp, RotateCcw,
  Lightbulb, Target, CheckCircle, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceRecording from '@/components/VoiceRecording'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  capabilities?: string[]
  confidence?: number
  sources?: any[]
  actions?: any[]
  inputType?: 'text' | 'voice' | 'image' | 'document'
}

interface QuickAction {
  id: string
  label: string
  icon: any
  prompt: string
  category: string
  gradient: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'business-analysis',
    label: 'Business Analyse',
    icon: TrendingUp,
    prompt: 'Analysiere mein Unternehmen und gib mir konkrete Verbesserungsvorschläge für mehr Umsatz',
    category: 'Business',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'saarland-tourism',
    label: 'Saarland Tourismus',
    icon: Globe,
    prompt: 'Plane mir den perfekten Tag im Saarland mit aktuellen Events und Sehenswürdigkeiten',
    category: 'Tourism',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'document-help',
    label: 'Dokument Hilfe',
    icon: FileText,
    prompt: 'Hilf mir bei Behördengängen und erkläre mir alle notwendigen Schritte',
    category: 'Administration',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'education-advisor',
    label: 'Bildungsberatung',
    icon: Lightbulb,
    prompt: 'Berate mich zu Bildungsmöglichkeiten und Förderprogrammen im Saarland',
    category: 'Education',
    gradient: 'from-orange-500 to-red-600'
  }
]

const AI_CAPABILITIES = [
  'Anpassungsfähige Antworten basierend auf Kontext',
  'Multimodale Eingabe (Text, Sprache, Bilder)',
  'Echtzeit-Datenintegration',
  'Dokumentenanalyse und -verarbeitung',
  'Cross-Border Informationen DE/FR/LU',
  'Intelligente Handlungsempfehlungen'
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'image' | 'document'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [aiMode, setAiMode] = useState<'adaptive' | 'focused' | 'creative'>('adaptive')
  const [showCapabilities, setShowCapabilities] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: `Willkommen bei AGENTLAND.SAARLAND! 🚀

Ich bin Ihr intelligenter AI-Assistent der nächsten Generation. Hier gibt es keine veralteten "Chat Free" oder "Chat Pro" Kategorien - ich passe mich automatisch an Ihre Bedürfnisse an.

**Was macht mich besonders?**
• Ich erkenne automatisch, was Sie brauchen
• Ich arbeite mit Text, Sprache, Bildern und Dokumenten
• Ich nutze Echtzeit-Daten aus dem Saarland
• Ich gebe Ihnen konkrete Handlungsempfehlungen

**Einfach loslegen:** Beschreiben Sie mir, womit ich Ihnen helfen kann, oder wählen Sie eine der Quick Actions unten.`,
      timestamp: new Date(),
      capabilities: ['intent-detection', 'multi-modal', 'real-time-data'],
      confidence: 1.0
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText
    if (!messageText.trim() && !selectedFile) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      inputType: selectedFile ? getFileInputType(selectedFile) : inputMode
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setSelectedFile(null)
    setIsLoading(true)

    try {
      // Simulate AI processing with intent detection
      await new Promise(resolve => setTimeout(resolve, 1500))

      const aiResponse = generateAIResponse(messageText, inputMode)
      
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        capabilities: aiResponse.capabilities,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        actions: aiResponse.actions
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI processing error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (input: string, mode: string) => {
    const lowerInput = input.toLowerCase()
    
    // Business intent detection
    if (lowerInput.includes('business') || lowerInput.includes('unternehmen') || lowerInput.includes('umsatz')) {
      return {
        content: `🚀 **Business Intelligence Analyse**

Basierend auf Ihrer Anfrage habe ich eine KI-gestützte Unternehmensanalyse durchgeführt:

**Sofortige Optimierungsmöglichkeiten:**
• **Kosteneinsparung:** 40-60% durch KI-Automatisierung möglich
• **Umsatzsteigerung:** 25-45% durch optimierte Geschäftsprozesse
• **Effizienzgewinn:** 24/7 Betrieb ohne zusätzliches Personal

**Konkrete nächste Schritte:**
1. **Prozessanalyse:** Welche wiederkehrenden Aufgaben können automatisiert werden?
2. **KI-Integration:** Implementierung von AI-Agents für Kundenservice
3. **ROI-Messung:** Tracking der Verbesserungen in Echtzeit

**Saarland-spezifische Förderungen:**
• Digital-Bonus Saarland: Bis zu 10.000€ für Digitalisierung
• EU-Förderprogramme für grenzüberschreitende Innovation

Möchten Sie eine detaillierte Analyse Ihres spezifischen Geschäftsmodells?`,
        capabilities: ['business-analysis', 'roi-calculation', 'funding-research'],
        confidence: 0.95,
        sources: [
          { type: 'real-time', source: 'Saarland Wirtschaftsförderung', updated: 'heute' },
          { type: 'ai-analysis', source: 'Business Intelligence Engine', confidence: 0.95 }
        ],
        actions: [
          { type: 'schedule-consultation', label: 'Kostenlose Beratung buchen' },
          { type: 'funding-application', label: 'Förderantrag vorbereiten' }
        ]
      }
    }
    
    // Tourism intent
    if (lowerInput.includes('tour') || lowerInput.includes('reise') || lowerInput.includes('saarland')) {
      return {
        content: `🌟 **Ihr perfekter Saarland-Tag**

Ich habe einen personalisierten Tagesplan für Sie erstellt, basierend auf aktuellen Daten:

**Heute im Saarland (Live-Daten):**
• **Wetter:** 18°C, sonnig - perfekt für Outdoor-Aktivitäten
• **Aktuelle Events:** Saarbrücker Schloss Konzert um 19:00 Uhr
• **Geheimtipp:** Baumwipfelpfad Beeden - wenig besucht heute

**Empfohlene Route:**
🕐 **10:00** - Völklinger Hütte (UNESCO Welterbe)
🕐 **12:30** - Mittagessen in der Saarbrücker Altstadt
🕐 **14:00** - Saarschleife Aussichtspunkt
🕐 **16:30** - Baumwipfelpfad Beeden
🕐 **19:00** - Konzert im Saarbrücker Schloss

**Cross-Border Bonus:**
• Nur 20 Min nach Metz, Frankreich
• Kombinieren Sie deutsche und französische Kultur

Soll ich Ihnen Tickets buchen oder Restaurants reservieren?`,
        capabilities: ['real-time-data', 'route-optimization', 'cross-border'],
        confidence: 0.92,
        sources: [
          { type: 'weather-api', source: 'Live Wetterdaten', updated: 'vor 5 Min' },
          { type: 'events-api', source: 'Saarland Events Portal', updated: 'heute' }
        ],
        actions: [
          { type: 'book-tickets', label: 'Tickets buchen' },
          { type: 'restaurant-reservation', label: 'Restaurant reservieren' }
        ]
      }
    }

    // Default adaptive response
    return {
      content: `🤖 **Intelligente Antwort**

Ich habe Ihre Anfrage analysiert und folgende Erkenntnisse gewonnen:

**Automatische Intent-Erkennung:**
• Kategorie: Allgemeine Anfrage
• Kontext: Saarland-spezifisch
• Präferierte Antwortart: Informativ mit Handlungsempfehlungen

**Meine Empfehlung:**
Basierend auf Ihrer Anfrage kann ich Ihnen in folgenden Bereichen besonders gut helfen:
• **Business & Wirtschaft:** KI-gestützte Unternehmensberatung
• **Tourismus & Freizeit:** Personalisierte Saarland-Erlebnisse
• **Verwaltung & Behörden:** Digitale Unterstützung bei Amtsgängen
• **Bildung & Kultur:** Weiterbildungsmöglichkeiten im Saarland

Haben Sie eine spezifischere Frage, oder soll ich Ihnen bei einem konkreten Problem helfen?`,
      capabilities: ['intent-detection', 'adaptive-responses', 'contextual-understanding'],
      confidence: 0.87,
      sources: [
        { type: 'ai-analysis', source: 'Intent Detection Engine', confidence: 0.87 }
      ],
      actions: [
        { type: 'refine-query', label: 'Frage präzisieren' },
        { type: 'explore-capabilities', label: 'Alle Funktionen erkunden' }
      ]
    }
  }

  const getFileInputType = (file: File): 'image' | 'document' => {
    return file.type.startsWith('image/') ? 'image' : 'document'
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInputText(transcript)
    setInputMode('voice')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setInputMode(getFileInputType(file))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                Intelligenter KI-Assistent
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligente Unterstützung ohne Grenzen - Ein AI für alle Ihre Bedürfnisse
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="adaptive">🤖 Adaptive AI</option>
                <option value="focused">🎯 Fokussiert</option>
                <option value="creative">🎨 Kreativ</option>
              </select>
              
              <button
                onClick={() => setShowCapabilities(!showCapabilities)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Capabilities Sidebar */}
          <AnimatePresence>
            {showCapabilities && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-32">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    KI-Fähigkeiten
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {AI_CAPABILITIES.map((capability, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Moderne KI-Standards
                    </h4>
                    <p className="text-sm text-gray-600">
                      Keine veralteten Chat-Kategorien. Eine intelligente KI, die sich an Sie anpasst.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className={`${showCapabilities ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-[70vh] flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      {/* AI Info Header */}
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">AI Assistant</div>
                            {message.confidence && (
                              <div className="text-xs text-gray-500">
                                {(message.confidence * 100).toFixed(0)}% Confident
                                {message.capabilities && ` • ${message.capabilities.length} Capabilities`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className={`rounded-2xl p-4 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : 'bg-gray-50 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Input Type Indicator */}
                        {message.inputType && message.inputType !== 'text' && (
                          <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                            {message.inputType === 'voice' && <Mic className="w-3 h-3" />}
                            {message.inputType === 'image' && <Camera className="w-3 h-3" />}
                            {message.inputType === 'document' && <FileText className="w-3 h-3" />}
                            <span>{message.inputType} input</span>
                          </div>
                        )}
                      </div>
                      
                      {/* AI Sources & Actions */}
                      {message.type === 'ai' && message.sources && (
                        <div className="mt-4 space-y-3">
                          {/* Sources */}
                          <div className="bg-blue-50 rounded-xl p-3">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 Datenquellen:</h4>
                            <div className="space-y-1">
                              {message.sources.map((source, index) => (
                                <div key={index} className="text-xs text-blue-700 flex items-center justify-between">
                                  <span>{source.source}</span>
                                  <span className="opacity-75">{source.updated}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          {message.actions && (
                            <div className="flex flex-wrap gap-2">
                              {message.actions.map((action, index) => (
                                <button
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mt-3">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 rounded-2xl p-4 max-w-[85%]">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="text-gray-600">AI analysiert und antwortet...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="border-t border-gray-100 p-4">
                {/* File Preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedFile.type.startsWith('image/') ? 
                        <Image className="w-5 h-5 text-blue-600" /> : 
                        <FileText className="w-5 h-5 text-blue-600" />
                      }
                      <span className="text-sm text-blue-900">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* Input Controls */}
                <div className="flex items-center gap-3">
                  {/* Input Method Buttons */}
                  <div className="flex items-center gap-2">
                    <VoiceRecording
                      onTranscript={handleVoiceTranscript}
                      autoSend={false}
                      showLanguageSelector={false}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    />
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.pdf,.doc,.docx,.txt'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) setSelectedFile(file)
                        }
                        input.click()
                      }}
                      className="p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-lg transition-all"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Text Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Beschreiben Sie einfach, was Sie brauchen..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  
                  {/* Send Button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || (!inputText.trim() && !selectedFile)}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Quick Actions - Sofort starten
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 mb-2">{action.label}</h4>
                      <p className="text-sm text-gray-600 mb-3">{action.category}</p>
                      <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Klicken zum Starten →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}