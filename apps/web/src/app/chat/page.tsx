'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Star, MessageSquare, Zap, Brain, Search, FileText } from 'lucide-react'
import VoiceRecording from '@/components/VoiceRecording'
import HybridAIChat, { useHybridAIChat } from '@/components/HybridAIChat'

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
      content: '👋 Willkommen bei SAAR-GPT Enhanced! Ich bin Ihr KI-Assistent mit DeepSeek R1 + Gemini 2.5 + Vector RAG. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'chat' | 'artifact' | 'rag' | 'websearch'>('chat')
  const [useHybridMode, setUseHybridMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendMessage } = useHybridAIChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript)
  }

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
    const currentInput = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      let aiResponse = 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es erneut.'
      
      if (useHybridMode) {
        // Use hybrid AI chat with Copilot Kit + AG-UI
        const data = await sendMessage(currentInput, {
          mode: chatMode,
          category: 'general',
          webSearch: chatMode === 'websearch'
        })
        aiResponse = data.response || data.artifact?.content || aiResponse
      } else {
        // Use enhanced AI API directly
        const response = await fetch('/api/ai/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: currentInput,
            mode: chatMode,
            category: 'general',
            web_search: chatMode === 'websearch'
          })
        })

        if (response.ok) {
          const data = await response.json()
          aiResponse = data.response || data.artifact?.content || aiResponse
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#003399] via-[#0066CC] to-[#0277bd] py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FDB913] to-[#FFD700] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform">
            <Bot className="w-12 h-12 text-[#003399]" />
          </div>
          <h1 className="text-5xl font-bold mb-3 font-quantum bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">SAAR-GPT Enhanced</h1>
          <p className="text-xl opacity-90 mb-4">DeepSeek R1 + Gemini 2.5 + Vector RAG + Copilot Kit + AG-UI</p>
          
          {/* AI Mode Selector */}
          <div className="flex justify-center space-x-3 mb-6">
            {[
              { mode: 'chat', icon: MessageSquare, label: 'Chat', color: 'bg-blue-500' },
              { mode: 'artifact', icon: FileText, label: 'Dokument', color: 'bg-green-500' },
              { mode: 'rag', icon: Brain, label: 'RAG Vector', color: 'bg-purple-500' },
              { mode: 'websearch', icon: Search, label: 'Web Search', color: 'bg-orange-500' }
            ].map(({ mode, icon: Icon, label, color }) => (
              <button
                key={mode}
                onClick={() => setChatMode(mode as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  chatMode === mode
                    ? `${color} text-white shadow-lg transform scale-105`
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Hybrid Mode Toggle */}
          <div className="flex justify-center items-center space-x-3 mb-4">
            <span className="text-sm opacity-80">Standard AI</span>
            <button
              onClick={() => setUseHybridMode(!useHybridMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useHybridMode ? 'bg-yellow-500' : 'bg-white/30'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                useHybridMode ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white/80'
              }`} />
            </button>
            <span className="text-sm opacity-80">Hybrid AI</span>
            {useHybridMode && <Zap className="w-4 h-4 text-yellow-400" />}
          </div>

          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live-Daten</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Vector RAG</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Multi-Agent</span>
            </div>
          </div>
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
                      ? 'bg-[#0277bd] ml-3' 
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
                      ? 'bg-[#0277bd] text-white'
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
            {/* Current Mode Status */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  chatMode === 'chat' ? 'bg-blue-500' :
                  chatMode === 'artifact' ? 'bg-green-500' :
                  chatMode === 'rag' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {chatMode.toUpperCase()} Modus
                </span>
                {useHybridMode && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    HYBRID AI
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {useHybridMode ? 'Copilot Kit + AG-UI' : 'Enhanced AI'}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-4">
              <div className="flex-1 flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`${chatMode === 'websearch' ? 'Durchsuchen Sie das Web...' : 
                    chatMode === 'artifact' ? 'Erstellen Sie ein Dokument...' : 
                    chatMode === 'rag' ? 'Fragen Sie die Saarland-Datenbank...' : 
                    'Stellen Sie Ihre Frage über das Saarland...'}`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent text-base"
                  disabled={isLoading}
                />
                <VoiceRecording
                  onTranscript={handleVoiceTranscript}
                  autoSend={false}
                  showLanguageSelector={false}
                  disabled={isLoading}
                  className="flex-shrink-0"
                />
              </div>
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
        <div className="mt-8 bg-gradient-to-r from-[#003399] to-[#0277bd] rounded-3xl p-8 text-center text-white">
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