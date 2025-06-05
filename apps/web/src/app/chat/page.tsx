'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Star, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Willkommen bei SAAR-GPT! Ich bin Ihr KI-Assistent für das Saarland. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

    try {
      const response = await fetch('/api/ai/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          mode: 'chat',
          category: 'general'
        })
      })

      let aiResponse = 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es erneut.'
      
      if (response.ok) {
        const data = await response.json()
        aiResponse = data.response || aiResponse
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Es gab ein technisches Problem. Bitte versuchen Sie es später erneut.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <div className="w-16 h-16 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-10 h-10 text-[#003399]" />
          </div>
          <h1 className="text-4xl font-bold mb-2 font-quantum">SAAR-GPT</h1>
          <p className="text-xl opacity-90">Ihr KI-Assistent für das Saarland</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Messages */}
          <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-[#009FE3] ml-3' 
                      : 'bg-[#003399] mr-3'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#009FE3] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <div className="w-10 h-10 rounded-full bg-[#003399] mr-3 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#003399]" />
                      <span className="text-gray-600">SAAR-GPT denkt...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stellen Sie Ihre Frage über das Saarland..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#003399] hover:bg-[#002266] disabled:bg-gray-300 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Premium CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-3xl p-8 text-center text-white">
          <div className="w-16 h-16 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-[#003399]" />
          </div>
          <h3 className="text-2xl font-bold mb-2 font-quantum">Premium SAAR-GPT</h3>
          <p className="text-lg mb-6 opacity-90">
            Erweiterte KI-Features für nur €9,99/Monat
          </p>
          <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#FDB913] rounded-full mr-3"></div>
              Unbegrenzte Chat-Nachrichten
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#FDB913] rounded-full mr-3"></div>
              Erweiterte Saarland-Datenbank
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#FDB913] rounded-full mr-3"></div>
              Prioritäts-Support
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#FDB913] rounded-full mr-3"></div>
              KI-Canvas für Dokumente
            </li>
          </ul>
          <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
            Premium aktivieren
          </button>
        </div>
      </div>
    </div>
  )
}