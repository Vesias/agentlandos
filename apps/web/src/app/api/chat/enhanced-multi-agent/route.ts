import { NextRequest, NextResponse } from 'next/server'

// Enhanced Multi-Agent Chat Service with Advanced Input Capabilities
interface EnhancedChatRequest {
  message: string
  inputType: 'text' | 'voice' | 'image' | 'file' | 'multi-modal'
  agentType: 'navigator' | 'tourism' | 'business' | 'admin' | 'education' | 'culture' | 'auto'
  conversationId?: string
  userId?: string
  attachments?: Array<{
    type: 'image' | 'document' | 'audio' | 'video'
    url: string
    metadata?: any
  }>
  context?: {
    location?: { lat: number, lng: number, municipality: string }
    userProfile?: { age?: number, interests?: string[], language?: string }
    previousContext?: any[]
    urgency?: 'low' | 'medium' | 'high' | 'emergency'
  }
  features?: {
    realTimeData?: boolean
    documentAnalysis?: boolean
    crossBorderInfo?: boolean
    voiceResponse?: boolean
    collaborativeMode?: boolean
  }
}

interface AgentCapability {
  name: string
  description: string
  inputTypes: string[]
  specializations: string[]
  tools: string[]
}

// Specialized Agent Definitions with Enhanced Capabilities
const SAARLAND_AGENTS: Record<string, AgentCapability> = {
  navigator: {
    name: 'Navigator Agent',
    description: 'Intelligente Weiterleitung und Koordination aller Anfragen',
    inputTypes: ['text', 'voice', 'multi-modal'],
    specializations: ['routing', 'context-analysis', 'multi-agent-coordination'],
    tools: ['real-time-data', 'service-discovery', 'emergency-routing']
  },
  tourism: {
    name: 'Saarland Tourism Expert',
    description: 'Spezialist für Tourismus, Attraktionen und regionale Erlebnisse',
    inputTypes: ['text', 'voice', 'image'],
    specializations: ['attractions', 'events', 'weather', 'accommodation', 'restaurants'],
    tools: ['image-recognition', 'weather-integration', 'event-calendar', 'route-planning']
  },
  business: {
    name: 'Business & Wirtschaft Agent',
    description: 'Experte für Unternehmensgründung, Förderungen und Wirtschaftsstandort',
    inputTypes: ['text', 'file', 'document'],
    specializations: ['company-formation', 'funding', 'regulations', 'tax-advice', 'cross-border-business'],
    tools: ['document-analysis', 'funding-calculator', 'legal-research', 'form-filling']
  },
  admin: {
    name: 'Verwaltungs-Assistent',
    description: 'Behördenangelegenheiten und Verwaltungsverfahren',
    inputTypes: ['text', 'file', 'document'],
    specializations: ['documents', 'appointments', 'procedures', 'legal-requirements'],
    tools: ['document-assistant', 'appointment-booking', 'form-validation', 'process-tracking']
  },
  education: {
    name: 'Bildungs-Berater',
    description: 'Bildungseinrichtungen, Kurse und Weiterbildungsmöglichkeiten',
    inputTypes: ['text', 'voice'],
    specializations: ['schools', 'universities', 'courses', 'certifications', 'career-guidance'],
    tools: ['course-search', 'application-assistance', 'career-planning']
  },
  culture: {
    name: 'Kultur-Guide',
    description: 'Kulturelle Veranstaltungen, Geschichte und Traditionen',
    inputTypes: ['text', 'voice', 'image'],
    specializations: ['events', 'history', 'museums', 'traditions', 'arts'],
    tools: ['event-calendar', 'cultural-search', 'historical-database']
  }
}

async function selectBestAgent(message: string, inputType: string, context?: any): Promise<string> {
  // Intelligent agent selection based on content analysis
  const keywords = {
    tourism: ['urlaub', 'ausflug', 'sehenswürdigkeiten', 'hotel', 'restaurant', 'wetter', 'events'],
    business: ['unternehmen', 'gründung', 'förderung', 'steuer', 'gewerbe', 'finanzierung'],
    admin: ['amt', 'behörde', 'antrag', 'personalausweis', 'anmeldung', 'dokument'],
    education: ['schule', 'studium', 'ausbildung', 'kurs', 'weiterbildung', 'universität'],
    culture: ['kultur', 'museum', 'konzert', 'theater', 'geschichte', 'tradition']
  }
  
  const messageLower = message.toLowerCase()
  
  // Score each agent based on keyword matches
  const scores = Object.entries(keywords).map(([agent, words]) => ({
    agent,
    score: words.filter(word => messageLower.includes(word)).length
  }))
  
  // Sort by score and return best match
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0]
  
  // If no clear match, use navigator for routing
  return bestMatch.score > 0 ? bestMatch.agent : 'navigator'
}

async function processWithAgent(
  agentType: string, 
  message: string, 
  inputType: string, 
  attachments: any[], 
  context: any,
  features: any
): Promise<any> {
  const agent = SAARLAND_AGENTS[agentType]
  
  if (!agent) {
    throw new Error(`Agent type ${agentType} not found`)
  }
  
  // Prepare enhanced prompt with agent context
  const enhancedPrompt = `
Du bist der ${agent.name} für AGENTLAND.SAARLAND.

Beschreibung: ${agent.description}
Spezialisierungen: ${agent.specializations.join(', ')}
Verfügbare Tools: ${agent.tools.join(', ')}

Input-Typ: ${inputType}
${attachments.length > 0 ? `Anhänge: ${attachments.map(a => a.type).join(', ')}` : ''}

Benutzer-Kontext:
${context.location ? `Standort: ${context.location.municipality}` : ''}
${context.userProfile ? `Profil: ${JSON.stringify(context.userProfile)}` : ''}
${context.urgency ? `Dringlichkeit: ${context.urgency}` : ''}

Aktivierte Features:
${features.realTimeData ? '✅ Real-time Daten' : ''}
${features.documentAnalysis ? '✅ Dokument-Analyse' : ''}
${features.crossBorderInfo ? '✅ Grenzüberschreitende Informationen' : ''}

Benutzer-Anfrage: "${message}"

Antworte als Experte für das Saarland mit regionaler Kompetenz. Nutze die verfügbaren Tools und beziehe Real-time Daten ein wenn möglich.
`
  
  // Call enhanced AI service
  try {
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/ai/enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: enhancedPrompt,
        mode: 'chat',
        context: agentType
      })
    })
    
    if (!aiResponse.ok) {
      throw new Error('AI service unavailable')
    }
    
    const result = await aiResponse.json()
    
    return {
      response: result.response || 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten.',
      agent: agent.name,
      agentType,
      capabilities: agent.specializations,
      toolsUsed: agent.tools.filter(tool => 
        features.realTimeData && tool.includes('real-time') ||
        features.documentAnalysis && tool.includes('document') ||
        message.toLowerCase().includes(tool.split('-')[0])
      ),
      confidence: result.reasoning ? 0.9 : 0.7,
      reasoning: result.reasoning || 'Standard-Antwort generiert'
    }
    
  } catch (error) {
    console.error(`Agent ${agentType} processing error:`, error)
    return {
      response: `Als ${agent.name} kann ich Ihnen mit ${agent.specializations.join(', ')} helfen. Leider ist der KI-Service momentan nicht verfügbar. Bitte versuchen Sie es später erneut.`,
      agent: agent.name,
      agentType,
      error: 'AI service temporarily unavailable',
      fallback: true
    }
  }
}

async function handleFileUpload(attachments: any[]): Promise<any[]> {
  // Process different file types
  return attachments.map(attachment => {
    switch (attachment.type) {
      case 'image':
        return {
          ...attachment,
          analysis: 'Bildanalyse verfügbar - Beschreiben Sie was Sie sehen möchten',
          capabilities: ['object-detection', 'text-extraction', 'scene-analysis']
        }
      case 'document':
        return {
          ...attachment,
          analysis: 'Dokument bereit für Analyse - PDF, Word, Excel unterstützt',
          capabilities: ['text-extraction', 'form-filling', 'legal-analysis']
        }
      case 'audio':
        return {
          ...attachment,
          analysis: 'Audio-Transkription verfügbar',
          capabilities: ['speech-to-text', 'language-detection', 'sentiment-analysis']
        }
      default:
        return attachment
    }
  })
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { 
      message, 
      inputType = 'text',
      agentType = 'auto',
      conversationId,
      userId,
      attachments = [],
      context = {},
      features = {}
    }: EnhancedChatRequest = await request.json()
    
    if (!message && attachments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message oder Attachments erforderlich'
      }, { status: 400 })
    }
    
    // Auto-select agent if not specified
    const selectedAgent = agentType === 'auto' ? 
      await selectBestAgent(message, inputType, context) : 
      agentType
    
    // Process attachments if present
    const processedAttachments = attachments.length > 0 ? 
      await handleFileUpload(attachments) : []
    
    // Process with selected agent
    const agentResponse = await processWithAgent(
      selectedAgent,
      message,
      inputType,
      processedAttachments,
      context,
      features
    )
    
    // Enhance response with real-time data if requested
    let realTimeData = null
    if (features.realTimeData) {
      try {
        const rtResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/realtime/saarland-hub?services=weather,transport,events`)
        const rtData = await rtResponse.json()
        if (rtData.success) {
          realTimeData = {
            weather: rtData.data.weather?.slice(0, 3),
            transport: rtData.data.transport?.departures?.slice(0, 3),
            events: rtData.data.events?.events?.slice(0, 3)
          }
        }
      } catch (error) {
        console.error('Real-time data fetch failed:', error)
      }
    }
    
    // Generate voice response URL if requested
    let voiceResponse = null
    if (features.voiceResponse && agentResponse.response) {
      // Would integrate with TTS service
      voiceResponse = {
        available: true,
        url: `/api/tts/generate?text=${encodeURIComponent(agentResponse.response)}`,
        language: context.userProfile?.language || 'de'
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        response: agentResponse.response,
        agent: {
          type: selectedAgent,
          name: agentResponse.agent,
          capabilities: agentResponse.capabilities,
          toolsUsed: agentResponse.toolsUsed,
          confidence: agentResponse.confidence
        },
        conversation: {
          id: conversationId || `conv_${Date.now()}`,
          userId: userId,
          turn: 1,
          inputType,
          processingTime: Date.now() - startTime
        },
        attachments: processedAttachments,
        realTimeData,
        voiceResponse,
        suggestions: {
          followUpQuestions: [
            'Können Sie mir mehr Details dazu geben?',
            'Gibt es aktuelle Informationen dazu?',
            'Welche Alternativen gibt es?'
          ],
          relatedServices: Object.keys(SAARLAND_AGENTS)
            .filter(key => key !== selectedAgent)
            .slice(0, 3)
            .map(key => ({
              agent: key,
              name: SAARLAND_AGENTS[key].name,
              description: SAARLAND_AGENTS[key].description
            }))
        }
      },
      meta: {
        agentSelection: selectedAgent,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '2.0-enhanced',
        fallback: agentResponse.fallback || false
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Agent-Type': selectedAgent,
        'X-Processing-Time': `${Date.now() - startTime}ms`
      }
    })
    
  } catch (error) {
    console.error('Enhanced chat error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Chat service temporarily unavailable',
      fallback: {
        response: 'Entschuldigung, der Chat-Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut oder nutzen Sie unsere anderen Services.',
        agent: 'System',
        suggestions: [
          'Besuchen Sie unsere Service-Übersicht',
          'Nutzen Sie die PLZ-Suche',
          'Kontaktieren Sie uns direkt'
        ]
      },
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return available agents and capabilities
  return NextResponse.json({
    success: true,
    agents: Object.entries(SAARLAND_AGENTS).map(([key, agent]) => ({
      id: key,
      ...agent
    })),
    inputTypes: ['text', 'voice', 'image', 'file', 'multi-modal'],
    features: [
      'realTimeData',
      'documentAnalysis', 
      'crossBorderInfo',
      'voiceResponse',
      'collaborativeMode'
    ]
  })
}