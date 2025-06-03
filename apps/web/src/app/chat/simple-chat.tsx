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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/saartasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          language: 'de',
          context: currentContext ? {
            id: currentContext.id,
            category: currentContext.category,
            agentType: currentContext.agentType
          } : undefined
        })
      })

      const data = await response.json()
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message || data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es später erneut.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
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