'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, Download, Share2, RefreshCw, Bot, User, FileText, Map, Calculator, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  canvas?: CanvasData
  metadata?: any
}

interface CanvasData {
  type: 'roadmap' | 'business_canvas' | 'checklist' | 'timeline' | 'map'
  title: string
  data: any
  exportable: boolean
}

interface DeepSeekServiceChatProps {
  serviceType: 'tourismus' | 'wirtschaft' | 'verwaltung' | 'bildung'
  className?: string
  initialMessage?: string
  showHeader?: boolean
}

const serviceConfig = {
  tourismus: {
    title: '🏰 Saarland Reiseplanung',
    subtitle: 'Schritt-für-Schritt Reiseplanung mit lokalen Geheimtipps',
    placeholder: 'Frag mich nach Reisezielen, Events oder Routen im Saarland...',
    color: 'from-green-500 to-emerald-600',
    icon: '🏰'
  },
  wirtschaft: {
    title: '💼 Business & Förderung',
    subtitle: 'Gründungsberatung und Fördermittel für das Saarland',
    placeholder: 'Frag mich nach Förderprogrammen, Gründung oder Business-Plänen...',
    color: 'from-blue-500 to-blue-600',
    icon: '💼'
  },
  verwaltung: {
    title: '🏛️ Behörden & Verwaltung',
    subtitle: 'PLZ-basierte Behördenzuordnung und Formularhilfe',
    placeholder: 'Frag mich nach Behörden, Formularen oder Verwaltungsangelegenheiten...',
    color: 'from-red-500 to-red-600',
    icon: '🏛️'
  },
  bildung: {
    title: '🎓 Bildung & Weiterbildung',
    subtitle: 'Bildungswege, Stipendien und Qualifikationen',
    placeholder: 'Frag mich nach Studiengängen, Weiterbildung oder Stipendien...',
    color: 'from-yellow-500 to-orange-600',
    icon: '🎓'
  }
}

function DeepSeekServiceChatComponent({
  serviceType,
  className = '',
  initialMessage,
  showHeader = true
}: DeepSeekServiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = serviceConfig[serviceType]

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hallo! Ich bin dein KI-Assistent für ${config.title}. ${config.subtitle}\n\nWie kann ich dir heute helfen?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])

    if (initialMessage) {
      setTimeout(() => handleSendMessage(initialMessage), 1000)
    }
  }, [serviceType, initialMessage])

  // Send message to DeepSeek API
  const handleSendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call DeepSeek API through our service endpoint
      const response = await fetch('/api/agents/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          serviceType,
          sessionId,
          context: messages.slice(-5) // Last 5 messages for context
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.content || data.message || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
        canvas: data.canvas,
        metadata: data.metadata
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Entschuldigung, es gab einen Fehler beim Verarbeiten deiner Anfrage. Bitte versuche es erneut.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, serviceType, sessionId])

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Export canvas data
  const handleExportCanvas = useCallback((canvas: CanvasData) => {
    const blob = new Blob([JSON.stringify(canvas, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${canvas.title.replace(/\s+/g, '_')}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Render canvas component based on type
  const renderCanvas = useCallback((canvas: CanvasData) => {
    switch (canvas.type) {
      case 'roadmap':
        return <RoadmapCanvas data={canvas.data} title={canvas.title} />
      case 'business_canvas':
        return <BusinessCanvas data={canvas.data} title={canvas.title} />
      case 'checklist':
        return <ChecklistCanvas data={canvas.data} title={canvas.title} />
      case 'timeline':
        return <TimelineCanvas data={canvas.data} title={canvas.title} />
      case 'map':
        return <MapCanvas data={canvas.data} title={canvas.title} />
      default:
        return <GenericCanvas data={canvas.data} title={canvas.title} />
    }
  }, [])

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className={`bg-gradient-to-r ${config.color} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center font-quantum">
                <span className="text-2xl mr-2">{config.icon}</span>
                {config.title}
              </h2>
              <p className="text-sm opacity-90 mt-1">{config.subtitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  setMessages([])
                  setTimeout(() => {
                    const welcomeMessage: Message = {
                      id: 'welcome_reset',
                      role: 'assistant',
                      content: `Chat wurde zurückgesetzt. Wie kann ich dir bei ${config.title} helfen?`,
                      timestamp: new Date()
                    }
                    setMessages([welcomeMessage])
                  }, 100)
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Message bubble */}
              <div className={`p-3 rounded-lg font-nova ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas rendering */}
              {message.canvas && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Presentation className="w-4 h-4 mr-2" />
                      {message.canvas.title}
                    </h4>
                    {message.canvas.exportable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportCanvas(message.canvas!)}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    )}
                  </div>
                  {renderCanvas(message.canvas)}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-gray-500 text-sm">Denke nach...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholder}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Canvas Components
const RoadmapCanvas = ({ data, title }: { data: any; title: string }) => (
  <div className="space-y-3">
    <h5 className="font-medium text-gray-900">{title}</h5>
    {data.steps?.map((step: any, index: number) => (
      <div key={index} className="flex items-start space-x-3">
        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="font-medium">{step.title}</div>
          <div className="text-sm text-gray-600">{step.description}</div>
          {step.duration && <div className="text-xs text-gray-500 mt-1">⏱️ {step.duration}</div>}
        </div>
      </div>
    ))}
  </div>
)

const BusinessCanvas = ({ data, title }: { data: any; title: string }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {Object.entries(data).map(([key, value]: [string, any]) => (
      <div key={key} className="p-3 bg-white border rounded-lg">
        <div className="font-medium text-sm text-gray-900 mb-1">{key}</div>
        <div className="text-xs text-gray-600">{Array.isArray(value) ? value.join(', ') : value}</div>
      </div>
    ))}
  </div>
)

const ChecklistCanvas = ({ data, title }: { data: any; title: string }) => (
  <div className="space-y-2">
    {data.items?.map((item: any, index: number) => (
      <div key={index} className="flex items-center space-x-2">
        <input type="checkbox" className="rounded border-gray-300" defaultChecked={item.completed} />
        <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {item.text}
        </span>
        {item.deadline && (
          <span className="text-xs text-red-500 ml-auto">📅 {item.deadline}</span>
        )}
      </div>
    ))}
  </div>
)

const TimelineCanvas = ({ data, title }: { data: any; title: string }) => (
  <div className="space-y-4">
    {data.events?.map((event: any, index: number) => (
      <div key={index} className="flex items-start space-x-3">
        <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
        <div className="flex-1">
          <div className="font-medium">{event.title}</div>
          <div className="text-sm text-gray-600">{event.date}</div>
          <div className="text-xs text-gray-500">{event.description}</div>
        </div>
      </div>
    ))}
  </div>
)

const MapCanvas = ({ data, title }: { data: any; title: string }) => (
  <div className="space-y-3">
    <div className="font-medium">{title}</div>
    {data.locations?.map((location: any, index: number) => (
      <div key={index} className="p-2 bg-gray-50 rounded-lg">
        <div className="font-medium text-sm">{location.name}</div>
        <div className="text-xs text-gray-600">{location.address}</div>
        {location.website && (
          <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
            Website besuchen
          </a>
        )}
      </div>
    ))}
  </div>
)

const GenericCanvas = ({ data, title }: { data: any; title: string }) => (
  <div className="space-y-2">
    <div className="font-medium">{title}</div>
    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
)

export default React.memo(DeepSeekServiceChatComponent)
