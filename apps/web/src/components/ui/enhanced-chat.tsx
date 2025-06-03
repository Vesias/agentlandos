'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Bot, User, Loader2, Globe, Sparkles, 
  Shield, Building2, GraduationCap, Landmark, Music, 
  Info, Copy, ThumbsUp, ThumbsDown, RefreshCw, Mic,
  MicOff, PaperclipIcon, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { saarTasks } from '@/lib/api-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  isTyping?: boolean
  attachments?: { name: string; size: number; type: string }[]
  feedback?: 'positive' | 'negative'
}

const AGENTS = {
  NavigatorAgent: {
    name: 'Navigator',
    color: '#009FE3',
    icon: Globe,
    description: 'Zentrale KI-Koordination'
  },
  TourismAgent: {
    name: 'Tourismus',
    color: '#00A54A',
    icon: Sparkles,
    description: 'Reise & Freizeit Experte'
  },
  BusinessAgent: {
    name: 'Wirtschaft',
    color: '#003399',
    icon: Building2,
    description: 'Business & Förderung'
  },
  EducationAgent: {
    name: 'Bildung',
    color: '#FFB300',
    icon: GraduationCap,
    description: 'Studium & Weiterbildung'
  },
  AdminAgent: {
    name: 'Verwaltung',
    color: '#E30613',
    icon: Shield,
    description: 'Behörden & Services'
  },
  CultureAgent: {
    name: 'Kultur',
    color: '#8B008B',
    icon: Music,
    description: 'Kunst & Veranstaltungen'
  }
}

export default function EnhancedChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [attachments, setAttachments] = useState<{ name: string; size: number; type: string }[]>([])
  const [showAgentInfo, setShowAgentInfo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: [...attachments]
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)

    // Typing indicator with agent detection
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      isTyping: true,
      timestamp: new Date(),
      agent: 'NavigatorAgent'
    }
    setMessages(prev => [...prev, typingMessage])

    // Make actual API call
    try {
      const response = await saarTasks.ask(input, 'de')
      
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          agent: response.agent_name || 'NavigatorAgent',
          confidence: response.confidence,
          sources: response.thought_process || []
        }
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.',
          timestamp: new Date(),
          agent: 'NavigatorAgent',
          confidence: 0,
          sources: []
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ))
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    // Could add toast notification here
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Would implement actual speech recognition here
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <motion.header 
        className="bg-white shadow-sm border-b"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-saarland-blue to-innovation-cyan rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">AGENTLAND.SAARLAND</h1>
                <p className="text-xs md:text-sm text-gray-600">Ihre KI-Assistenz für das Saarland</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {Object.entries(AGENTS).map(([key, agent]) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        onMouseEnter={() => setShowAgentInfo(key)}
                        onMouseLeave={() => setShowAgentInfo(null)}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                          style={{ backgroundColor: `${agent.color}20` }}
                        >
                          {React.createElement(agent.icon, {
                            className: "w-5 h-5",
                            style: { color: agent.color }
                          })}
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{agent.name}-Agent</p>
                      <p className="text-xs">{agent.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Agent Info Bar */}
      <AnimatePresence>
        {showAgentInfo && AGENTS[showAgentInfo] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 border-b overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${AGENTS[showAgentInfo].color}20` }}
                >
                  {React.createElement(AGENTS[showAgentInfo].icon, {
                    className: "w-5 h-5",
                    style: { color: AGENTS[showAgentInfo].color }
                  })}
                </div>
                <div>
                  <p className="font-semibold text-sm">{AGENTS[showAgentInfo].name}-Agent aktiv</p>
                  <p className="text-xs text-gray-600">{AGENTS[showAgentInfo].description}</p>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-saarland-blue to-innovation-cyan rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Willkommen bei AGENTLAND.SAARLAND!</h2>
              <p className="text-gray-600 mb-6">Ich bin Ihre KI-Assistenz für alle Fragen rund um das Saarland.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <Sparkles className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-semibold mb-1">Tourismus</h3>
                  <p className="text-sm text-gray-600">Entdecken Sie Sehenswürdigkeiten</p>
                </Card>
                <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <Building2 className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="font-semibold mb-1">Wirtschaft</h3>
                  <p className="text-sm text-gray-600">Förderprogramme & Business</p>
                </Card>
                <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <Shield className="w-8 h-8 text-red-500 mb-2" />
                  <h3 className="font-semibold mb-1">Verwaltung</h3>
                  <p className="text-sm text-gray-600">Behördengänge digital</p>
                </Card>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-3 max-w-[80%]`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gray-200' 
                      : message.agent && AGENTS[message.agent]
                        ? `bg-gradient-to-br`
                        : 'bg-gradient-to-br from-saarland-blue to-innovation-cyan'
                  }`} style={
                    message.role === 'assistant' && message.agent && AGENTS[message.agent]
                      ? { backgroundColor: `${AGENTS[message.agent].color}20` }
                      : {}
                  }>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-gray-700" />
                    ) : message.isTyping ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : message.agent && AGENTS[message.agent] ? (
                      React.createElement(AGENTS[message.agent].icon, {
                        className: "w-5 h-5",
                        style: { color: AGENTS[message.agent].color }
                      })
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    {message.agent && AGENTS[message.agent] && (
                      <p className="text-xs font-medium mb-1" style={{ color: AGENTS[message.agent].color }}>
                        {AGENTS[message.agent].name}-Agent
                      </p>
                    )}
                    <Card className={`p-4 ${
                      message.role === 'user' 
                        ? 'bg-gray-100 border-gray-200' 
                        : 'bg-white border-gray-200 shadow-sm'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex space-x-2">
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <PaperclipIcon className="w-4 h-4" />
                                  <span>{attachment.name}</span>
                                  <span className="text-xs">({(attachment.size / 1024).toFixed(1)} KB)</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {message.confidence !== undefined && (
                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Konfidenz: {(message.confidence * 100).toFixed(0)}%</span>
                              {message.sources && message.sources.length > 0 && (
                                <span>Quellen: {message.sources.join(', ')}</span>
                              )}
                            </div>
                          )}
                          {message.role === 'assistant' && (
                            <div className="mt-3 flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(message.content)}
                                className="h-8 px-2"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(message.id, 'positive')}
                                className={`h-8 px-2 ${message.feedback === 'positive' ? 'text-green-600' : ''}`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(message.id, 'negative')}
                                className={`h-8 px-2 ${message.feedback === 'negative' ? 'text-red-600' : ''}`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </Card>
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t bg-white">
        <div className="container mx-auto max-w-4xl p-4">
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <PaperclipIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700"
            >
              <PaperclipIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceInput}
              className={`text-gray-500 hover:text-gray-700 ${isListening ? 'text-red-500' : ''}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Stellen Sie Ihre Frage zum Saarland..."
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saarland-blue focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              className="bg-gradient-to-r from-saarland-blue to-innovation-cyan text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by AGENTLAND.SAARLAND - KI für das Saarland
          </p>
        </div>
      </div>
    </div>
  )
}