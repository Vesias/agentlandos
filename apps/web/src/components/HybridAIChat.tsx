'use client'

import React, { useState, useRef, useEffect } from 'react'
// Import guards for CopilotKit
const CopilotProvider = (() => {
  try {
    return require('@copilotkit/react-core').CopilotProvider
  } catch {
    const Fallback = ({ children }: { children: React.ReactNode }) => <>{children}</>
    Fallback.displayName = 'CopilotProvider'
    return Fallback
  }
})()

const useCopilotAction = (() => {
  try {
    return require('@copilotkit/react-core').useCopilotAction
  } catch {
    return () => {}
  }
})()

const CopilotSidebar = (() => {
  try {
    return require('@copilotkit/react-ui').CopilotSidebar
  } catch {
    const Fallback = () => <div>CopilotKit not available</div>
    Fallback.displayName = 'CopilotSidebar'
    return Fallback
  }
})()
// Import guards for optional dependencies
const AGUIClient = (() => {
  try {
    return require('@ag-ui/client').Client
  } catch {
    return null
  }
})()

const enhancedMobileUtils = (() => {
  try {
    return require('@/lib/mobile-utils').enhancedMobileUtils
  } catch {
    return {
      isMobile: () => false,
      getConnectionType: () => 'unknown',
      getViewport: () => ({ width: 1920, height: 1080 }),
      preventInputZoom: () => {},
      optimizeForLowBattery: () => {}
    }
  }
})()
import { useAnalytics } from '@/components/AnalyticsProvider'

interface HybridAIChatProps {
  initialCategory?: string
  enableVoice?: boolean
  enableWebSearch?: boolean
  mode?: 'embedded' | 'sidebar' | 'fullscreen'
}

// Enhanced Multi-Agent Configuration with AG-UI Protocol
const agUIConfig = {
  apiUrl: '/api/agents/enhanced',
  streaming: true,
  protocols: ['text', 'markdown', 'code', 'data'],
  capabilities: ['reasoning', 'websearch', 'multimodal', 'rag', 'orchestration']
}

export default function HybridAIChat({ 
  initialCategory = 'general',
  enableVoice = true,
  enableWebSearch = true,
  mode = 'embedded'
}: HybridAIChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState<'chat' | 'artifact' | 'rag' | 'websearch'>('chat')
  const [agUIClient, setAGUIClient] = useState<any>(null)
  const { trackEvent } = useAnalytics()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize AG-UI Client
  useEffect(() => {
    if (AGUIClient) {
      const client = new AGUIClient(agUIConfig)
      setAGUIClient(client)
    }
    
    // Track hybrid chat initialization
    trackEvent('hybrid_chat_init', {
      mode,
      category: initialCategory,
      voice_enabled: enableVoice,
      websearch_enabled: enableWebSearch
    })
  }, [mode, initialCategory, enableVoice, enableWebSearch, trackEvent])

  // Copilot Kit Actions for LLM Orchestration
  useCopilotAction({
    name: 'saarland_business_query',
    description: 'Process Saarland business-related queries with enhanced AI',
    parameters: [
      { name: 'query', type: 'string', description: 'The business query to process' },
      { name: 'category', type: 'string', description: 'Business category (verwaltung, wirtschaft, etc.)' }
    ],
    handler: async ({ query, category }) => {
      return await processEnhancedQuery(query, category, 'rag')
    }
  })

  useCopilotAction({
    name: 'saarland_realtime_data',
    description: 'Get real-time Saarland data (weather, events, transport)',
    parameters: [
      { name: 'dataType', type: 'string', description: 'Type of real-time data needed' },
      { name: 'location', type: 'string', description: 'Saarland location or PLZ' }
    ],
    handler: async ({ dataType, location }) => {
      return await fetchRealtimeData(dataType, location)
    }
  })

  useCopilotAction({
    name: 'create_saarland_document',
    description: 'Create AI-powered documents for Saarland services',
    parameters: [
      { name: 'type', type: 'string', description: 'Document type (application, guide, etc.)' },
      { name: 'content', type: 'string', description: 'Document content requirements' }
    ],
    handler: async ({ type, content }) => {
      return await processEnhancedQuery(content, 'verwaltung', 'artifact')
    }
  })

  // Enhanced Multi-Agent Query Processing with LangChain Orchestrator
  const processEnhancedQuery = async (query: string, category: string, mode: string) => {
    setIsLoading(true)
    
    try {
      // Track query start
      trackEvent('hybrid_chat_query', {
        mode,
        category,
        query_length: query.length,
        has_websearch: enableWebSearch,
        orchestrator: 'enhanced-multi-agent'
      })

      const startTime = Date.now()
      
      // Enhanced Multi-Agent API call with LangChain orchestration
      const response = await fetch('/api/agents/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          category,
          mode,
          preferredModel: mode === 'rag' ? 'deepseek-r1' : 
                         mode === 'artifact' ? 'gemini-2.5' : 
                         'openai-gpt4o',
          directCall: true, // Bypass Copilot Kit for direct orchestrator access
          context: {
            mobile: enhancedMobileUtils ? enhancedMobileUtils.isMobile() : false,
            connection: enhancedMobileUtils ? enhancedMobileUtils.getConnectionType() : 'unknown',
            viewport: enhancedMobileUtils ? enhancedMobileUtils.getViewport() : { width: 1920, height: 1080 },
            sessionId: Date.now().toString()
          }
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      
      // Track successful response with orchestrator metrics
      trackEvent('hybrid_chat_response', {
        mode,
        category,
        processing_time: Date.now() - startTime,
        response_length: data.response?.length || 0,
        agents_used: data.metadata?.agentsUsed?.length || 0,
        llm_interactions: data.metadata?.llmInteractions?.length || 0,
        vector_results: data.metadata?.vectorSearchResults || 0,
        confidence: data.confidence,
        success: true
      })

      // Update UI state with orchestrator metadata if available
      if (data.metadata?.agentsUsed?.length > 1) {
        const agentSummary = `🤖 Multi-Agent Response: ${data.metadata.agentsUsed.join(', ')} (${data.metadata.processingTime}ms)`
        console.log(agentSummary)
      }

      return data
    } catch (error) {
      console.error('Enhanced orchestrator error:', error)
      trackEvent('hybrid_chat_error', {
        mode,
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
        orchestrator: 'enhanced-multi-agent'
      })
      
      // Fallback to basic AI if orchestrator fails
      try {
        const fallbackResponse = await fetch('/api/ai/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            mode: 'chat',
            category
          })
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          trackEvent('hybrid_chat_fallback', { success: true })
          return fallbackData
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time data fetching
  const fetchRealtimeData = async (dataType: string, location: string) => {
    try {
      const response = await fetch(`/api/realtime/${dataType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      })
      return await response.json()
    } catch (error) {
      console.error('Realtime data error:', error)
      return { error: 'Failed to fetch real-time data' }
    }
  }

  // Voice input integration
  const handleVoiceInput = async () => {
    if (!enableVoice) return

    try {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'de-DE'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        trackEvent('voice_input_success', { transcript_length: transcript.length })
        
        // Process voice input through enhanced AI
        await processEnhancedQuery(transcript, initialCategory, currentMode)
      }

      recognition.onerror = (error: any) => {
        trackEvent('voice_input_error', { error: error.error })
      }

      recognition.start()
    } catch (error) {
      console.error('Voice input not supported:', error)
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mobile optimization
  useEffect(() => {
    if (enhancedMobileUtils && enhancedMobileUtils.isMobile()) {
      enhancedMobileUtils.preventInputZoom()
      enhancedMobileUtils.optimizeForLowBattery()
    }
  }, [])

  const renderChatInterface = () => (
    <div className="hybrid-ai-chat flex flex-col h-full">
      {/* Chat Header with Mode Switching */}
      <div className="chat-header p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            SAAR-GPT Enhanced Chat
          </h3>
          <div className="flex gap-2">
            {/* Mode Switch Buttons */}
            {['chat', 'artifact', 'rag', 'websearch'].map((modeOption) => (
              <button
                key={modeOption}
                onClick={() => setCurrentMode(modeOption as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  currentMode === modeOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {modeOption.toUpperCase()}
              </button>
            ))}
            
            {/* Voice Input Button */}
            {enableVoice && (
              <button
                onClick={handleVoiceInput}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Voice Input (Deutsch)"
              >
                🎤
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4">
              <span className="text-4xl">🤖</span>
            </div>
            <p className="text-lg font-medium mb-2">SAAR-GPT Enhanced Assistant</p>
            <p className="text-sm">
              Powered by DeepSeek R1 + Gemini 2.5 + Vector RAG
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 max-w-md mx-auto text-xs">
              <div className="p-2 bg-blue-50 rounded">💬 Smart Chat</div>
              <div className="p-2 bg-green-50 rounded">📄 Documents</div>
              <div className="p-2 bg-purple-50 rounded">🔍 Web Search</div>
              <div className="p-2 bg-yellow-50 rounded">🧠 RAG Vector</div>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">SAAR-GPT denkt...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  )

  if (mode === 'sidebar') {
    return (
      <CopilotProvider>
        <CopilotSidebar
          defaultOpen={false}
          instructions="Du bist SAAR-GPT, ein spezialisierter KI-Assistent für das Saarland. Hilf bei Verwaltung, Wirtschaft, Tourismus und allen Saarland-spezifischen Anfragen."
          labels={{
            title: "SAAR-GPT Assistant",
            initial: "Wie kann ich Ihnen bei Saarland-Services helfen?"
          }}
        />
      </CopilotProvider>
    )
  }

  return (
    <CopilotProvider>
      <div className={`hybrid-chat-container ${mode === 'fullscreen' ? 'fixed inset-0 z-50' : 'h-96'}`}>
        {renderChatInterface()}
        
        {/* AG-UI Protocol Integration - Hidden but active */}
        {agUIClient && (
          <div className="hidden">
            <div id="ag-ui-protocol-container" />
          </div>
        )}
      </div>
    </CopilotProvider>
  )
}

// Enhanced Chat Hook for external components
export function useHybridAIChat() {
  const { trackEvent } = useAnalytics()
  
  const sendMessage = async (message: string, options?: {
    category?: string
    mode?: 'chat' | 'artifact' | 'rag' | 'websearch'
    webSearch?: boolean
  }) => {
    const { category = 'general', mode = 'chat', webSearch = false } = options || {}
    
    try {
      const response = await fetch('/api/ai/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          mode,
          category,
          web_search: webSearch
        })
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      
      trackEvent('hybrid_chat_api_call', {
        mode,
        category,
        success: true,
        response_time: data.processing_time
      })
      
      return data
    } catch (error) {
      trackEvent('hybrid_chat_api_error', {
        mode,
        category,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  return { sendMessage }
}