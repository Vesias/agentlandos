'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, Mic, Image, Paperclip, Bot, User, MapPin, Clock, 
  Zap, Brain, Building2, GraduationCap, Palette, Users,
  Volume2, Download, Copy, ThumbsUp, RefreshCw, Settings,
  MicOff
} from 'lucide-react'
import VoiceRecording from './VoiceRecording'

interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  agent?: {
    type: string
    name: string
    capabilities: string[]
    confidence: number
  }
  attachments?: any[]
  realTimeData?: any
  timestamp: Date
  processingTime?: number
}

interface AgentInfo {
  id: string
  name: string
  description: string
  inputTypes: string[]
  specializations: string[]
  icon: any
}

const AGENT_ICONS: Record<string, any> = {
  navigator: Bot,
  tourism: MapPin,
  business: Building2,
  admin: Users,
  education: GraduationCap,
  culture: Palette
}

const AGENT_COLORS: Record<string, string> = {
  navigator: 'bg-[#003399] text-white',
  tourism: 'bg-green-500 text-white',
  business: 'bg-blue-500 text-white',
  admin: 'bg-gray-600 text-white',
  education: 'bg-purple-500 text-white',
  culture: 'bg-pink-500 text-white'
}

export default function EnhancedMultiAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('auto')
  const [availableAgents, setAvailableAgents] = useState<AgentInfo[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [features, setFeatures] = useState({
    realTimeData: true,
    documentAnalysis: true,
    crossBorderInfo: false,
    voiceResponse: false,
    collaborativeMode: false
  })
  const [conversationId] = useState(`conv_${Date.now()}`)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadAvailableAgents()
    // Add welcome message
    setMessages([{
      id: 'welcome',
      type: 'agent',
      content: 'Willkommen bei AGENTLAND.SAARLAND! Ich bin Ihr intelligenter Assistent für alle Fragen rund um das Saarland. Sie können mit mir sprechen, Bilder senden oder Dokumente hochladen. Wie kann ich Ihnen helfen?',
      agent: {
        type: 'navigator',
        name: 'Navigator Agent',
        capabilities: ['routing', 'coordination'],
        confidence: 1.0
      },
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadAvailableAgents = async () => {
    try {
      const response = await fetch('/api/chat/enhanced-multi-agent')
      const data = await response.json()
      if (data.success) {
        setAvailableAgents(data.agents.map((agent: any) => ({
          ...agent,
          icon: AGENT_ICONS[agent.id] || Bot
        })))
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      attachments: attachments.map(file => ({
        type: getFileType(file),
        name: file.name,
        size: file.size
      })),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setInputMessage('')
    setAttachments([])

    try {
      const formData = new FormData()
      
      // Prepare request
      const requestData = {
        message: inputMessage,
        inputType: attachments.length > 0 ? getInputType() : 'text',
        agentType: selectedAgent,
        conversationId,
        attachments: attachments.map(file => ({
          type: getFileType(file),
          name: file.name,
          size: file.size
        })),
        context: {
          location: { municipality: 'Saarbrücken' }, // Would get from geolocation
          urgency: 'medium'
        },
        features
      }

      const response = await fetch('/api/chat/enhanced-multi-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (data.success) {
        const agentMessage: ChatMessage = {
          id: `agent_${Date.now()}`,
          type: 'agent',
          content: data.data.response,
          agent: data.data.agent,
          realTimeData: data.data.realTimeData,
          timestamp: new Date(),
          processingTime: data.meta.processingTime
        }

        setMessages(prev => [...prev, agentMessage])

        // Play voice response if enabled
        if (data.data.voiceResponse?.available && features.voiceResponse) {
          playVoiceResponse(data.data.voiceResponse.url)
        }
      } else {
        throw new Error(data.error || 'Chat failed')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'agent',
        content: 'Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Nachricht. Bitte versuchen Sie es erneut.',
        agent: {
          type: 'system',
          name: 'System',
          capabilities: ['error-handling'],
          confidence: 0
        },
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.includes('pdf') || file.type.includes('document')) return 'document'
    return 'file'
  }

  const getInputType = (): string => {
    const types = attachments.map(getFileType)
    if (types.includes('image') && types.includes('document')) return 'multi-modal'
    if (types.includes('image')) return 'image'
    if (types.includes('audio')) return 'voice'
    if (types.includes('document')) return 'file'
    return 'text'
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files].slice(0, 5)) // Max 5 files
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const startVoiceRecording = async () => {
    if (isRecording) {
      setIsRecording(false)
      return
    }

    try {
      // Check if speech recognition is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Chrome, Safari oder Edge.')
        return
      }

      setIsRecording(true)
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'de-DE'
      recognition.maxAlternatives = 1
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript)
        setIsRecording(false)
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        
        let errorMessage = 'Spracherkennung fehlgeschlagen'
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff.'
            break
          case 'no-speech':
            errorMessage = 'Keine Sprache erkannt. Bitte versuchen Sie es erneut.'
            break
          case 'network':
            errorMessage = 'Netzwerkfehler bei der Spracherkennung.'
            break
        }
        alert(errorMessage)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
      }
      
      recognition.start()
      
    } catch (error) {
      console.error('Voice recording error:', error)
      setIsRecording(false)
      alert('Fehler beim Starten der Spracherkennung')
    }
  }

  const playVoiceResponse = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] p-6 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-8 h-8" />
              Enhanced Multi-Agent Chat
            </h2>
            <p className="text-white/80 text-sm">
              KI-Agenten mit erweiterten Input-Fähigkeiten
            </p>
          </div>
          
          {/* Agent Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm backdrop-blur-sm"
            >
              <option value="auto">🤖 Auto-Select</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setFeatures(prev => ({ ...prev, realTimeData: !prev.realTimeData }))}
              className={`p-2 rounded-lg transition-all duration-200 ${
                features.realTimeData ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'
              }`}
              title="Real-time Data"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Agent Info */}
              {message.type === 'agent' && message.agent && (
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    AGENT_COLORS[message.agent.type] || 'bg-gray-500 text-white'
                  }`}>
                    {React.createElement(AGENT_ICONS[message.agent.type] || Bot, { className: 'w-4 h-4' })}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{message.agent.name}</span>
                  <span className="text-xs text-gray-500">
                    {(message.agent.confidence * 100).toFixed(0)}% confident
                  </span>
                  {message.processingTime && (
                    <span className="text-xs text-gray-400">
                      ({message.processingTime}ms)
                    </span>
                  )}
                </div>
              )}
              
              {/* Message Content */}
              <div className={`rounded-2xl p-4 ${
                message.type === 'user' 
                  ? 'bg-[#003399] text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Paperclip className="w-4 h-4" />
                        <span>{attachment.name}</span>
                        <span className="text-xs opacity-70">({attachment.type})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Real-time Data */}
                {message.realTimeData && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Live-Daten:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {message.realTimeData.weather && (
                        <div>
                          <strong>Wetter:</strong> {message.realTimeData.weather[0]?.temperature}°C in {message.realTimeData.weather[0]?.municipality}
                        </div>
                      )}
                      {message.realTimeData.transport && (
                        <div>
                          <strong>ÖPNV:</strong> {message.realTimeData.transport[0]?.line} nach {message.realTimeData.transport[0]?.destination}
                        </div>
                      )}
                      {message.realTimeData.events && (
                        <div>
                          <strong>Events:</strong> {message.realTimeData.events[0]?.title}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message Actions */}
              {message.type === 'agent' && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Like"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  {features.voiceResponse && (
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#003399]"></div>
                <span className="text-gray-600">Agent antwortet...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-sm">
                <span>{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Input Controls */}
        <div className="flex items-center gap-2">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            title="Datei anhängen"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Image Upload */}
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || [])
                setAttachments(prev => [...prev, ...files])
              }
              input.click()
            }}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            title="Bild hochladen"
          >
            <Image className="w-5 h-5" />
          </button>
          
          {/* Voice Recording */}
          <VoiceRecording
            onTranscript={(text) => setInputMessage(prev => prev + (prev ? ' ' : '') + text)}
            autoSend={false}
            showLanguageSelector={false}
            disabled={isLoading}
            className="flex-shrink-0"
          />
          
          {/* Message Input */}
          <div className="flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Schreiben Sie Ihre Nachricht..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003399] focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
            className="p-3 bg-[#003399] text-white rounded-xl hover:bg-[#002266] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Feature Toggles */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={features.realTimeData}
              onChange={(e) => setFeatures(prev => ({ ...prev, realTimeData: e.target.checked }))}
              className="rounded"
            />
            <span>Real-time Daten</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={features.documentAnalysis}
              onChange={(e) => setFeatures(prev => ({ ...prev, documentAnalysis: e.target.checked }))}
              className="rounded"
            />
            <span>Dokument-Analyse</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={features.voiceResponse}
              onChange={(e) => setFeatures(prev => ({ ...prev, voiceResponse: e.target.checked }))}
              className="rounded"
            />
            <span>Sprach-Antwort</span>
          </label>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Audio Element for Voice Responses */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}