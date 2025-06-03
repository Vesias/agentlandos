'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Globe } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  timestamp: Date
}

export default function SimpleChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Guten Tag! Ich bin Ihr persönlicher KI-Assistent für das Saarland. Wie kann ich Ihnen heute helfen?',
      agent: 'NavigatorAgent',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Demo response
    setTimeout(() => {
      const demoResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Demo-Antwort: Ich würde Ihnen gerne bei '${input}' helfen. In der Vollversion kann ich mit DeepSeek KI detaillierte Antworten zum Saarland geben.`,
        agent: 'NavigatorAgent (Demo)',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, demoResponse])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#003399] flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AGENTLAND.SAARLAND Chat</h1>
              <p className="text-sm text-gray-600">KI-Assistenz für das Saarland</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-[#FDB913]' : 'bg-[#003399]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-100' : 'bg-white border border-gray-200'
                }`}>
                  {message.agent && (
                    <p className="text-xs text-gray-500 mb-1">{message.agent}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2 p-4 bg-white rounded-lg border border-gray-200">
                <Loader2 className="w-4 h-4 animate-spin text-[#003399]" />
                <span className="text-sm text-gray-600">Agent denkt nach...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stellen Sie Ihre Frage..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-[#003399] text-white rounded-md hover:bg-[#002266] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Senden</span>
            </button>
          </form>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              'Was sind die Top-Sehenswürdigkeiten im Saarland?',
              'Welche Behördengänge kann ich online erledigen?',
              'Gibt es Förderprogramme für Startups im Saarland?',
              'Welche Bildungsangebote gibt es in meiner Nähe?'
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}