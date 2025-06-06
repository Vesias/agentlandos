import { NextRequest } from 'next/server'
import { CopilotBackend, OpenAIAdapter } from '@copilotkit/backend'
import { enhancedAI } from '@/services/ai/enhanced-ai-service'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Copilot Kit backend configuration with SAAR-GPT integration
const copilotKit = new CopilotBackend({
  actions: [
    {
      name: 'saarland_business_search',
      description: 'Search for Saarland business services and information',
      parameters: [
        { name: 'query', type: 'string', description: 'Business search query' },
        { name: 'category', type: 'string', description: 'Business category (verwaltung, wirtschaft, etc.)' },
        { name: 'plz', type: 'string', description: 'Saarland PLZ code', required: false }
      ],
      handler: async ({ query, category, plz }) => {
        try {
          const response = await enhancedAI.ragQuery(query, { 
            category, 
            location: plz,
            searchType: 'business'
          })
          
          return {
            success: true,
            data: response,
            source: 'saarland_business_database',
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Business search failed',
            fallback: 'Bitte versuchen Sie eine andere Suchanfrage oder kontaktieren Sie uns direkt.'
          }
        }
      }
    },
    {
      name: 'saarland_document_generator',
      description: 'Generate official Saarland documents and forms',
      parameters: [
        { name: 'documentType', type: 'string', description: 'Type of document (application, certificate, etc.)' },
        { name: 'personalInfo', type: 'object', description: 'Personal information for document' },
        { name: 'purpose', type: 'string', description: 'Purpose of the document' }
      ],
      handler: async ({ documentType, personalInfo, purpose }) => {
        try {
          const documentPrompt = `
            Erstelle ein offizielles ${documentType} für das Saarland.
            Zweck: ${purpose}
            Persönliche Informationen: ${JSON.stringify(personalInfo)}
            
            Das Dokument soll professionell, korrekt und vollständig sein.
            Verwende offizielle Saarland-Terminologie und -Formate.
          `
          
          const response = await enhancedAI.processQuery(
            documentPrompt, 
            'artifact', 
            'verwaltung',
            { artifact_type: 'text' }
          )
          
          return {
            success: true,
            document: response.response,
            type: documentType,
            metadata: {
              generated_at: new Date().toISOString(),
              source: 'AGENTLAND.SAARLAND AI',
              compliance: 'Saarland Standards'
            }
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Document generation failed'
          }
        }
      }
    },
    {
      name: 'saarland_realtime_info',
      description: 'Get real-time information about Saarland (weather, events, transport)',
      parameters: [
        { name: 'infoType', type: 'string', description: 'Type of information (weather, events, transport, news)' },
        { name: 'location', type: 'string', description: 'Saarland location or city' },
        { name: 'timeframe', type: 'string', description: 'Time frame (now, today, week)', required: false }
      ],
      handler: async ({ infoType, location, timeframe = 'now' }) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/realtime/${infoType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, timeframe })
          })
          
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          
          const data = await response.json()
          
          return {
            success: true,
            data,
            location,
            infoType,
            timestamp: new Date().toISOString(),
            source: 'Saarland Real-time Data Network'
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Real-time data unavailable',
            fallback: `Aktuelle ${infoType}-Informationen für ${location} sind derzeit nicht verfügbar.`
          }
        }
      }
    },
    {
      name: 'saarland_ai_analysis',
      description: 'Perform AI-powered analysis using DeepSeek R1 reasoning',
      parameters: [
        { name: 'analysisQuery', type: 'string', description: 'What to analyze' },
        { name: 'dataType', type: 'string', description: 'Type of data (business, demographic, economic, etc.)' },
        { name: 'depth', type: 'string', description: 'Analysis depth (quick, detailed, comprehensive)' }
      ],
      handler: async ({ analysisQuery, dataType, depth = 'detailed' }) => {
        try {
          const analysisPrompt = `
            Führe eine ${depth} Analyse durch für: ${analysisQuery}
            Datentyp: ${dataType}
            Fokus: Saarland-spezifische Erkenntnisse und Empfehlungen
            
            Verwende Chain-of-Thought Reasoning und liefere:
            1. Situationsanalyse
            2. Schlüsselerkenntnisse  
            3. Handlungsempfehlungen
            4. Prognosen/Trends
          `
          
          const response = await enhancedAI.processQuery(
            analysisPrompt,
            'chat',
            dataType,
            { reasoning_mode: 'advanced' }
          )
          
          return {
            success: true,
            analysis: response.response,
            confidence: response.confidence || 0.85,
            methodology: 'DeepSeek R1 Chain-of-Thought',
            metadata: {
              query: analysisQuery,
              dataType,
              depth,
              generated_at: new Date().toISOString()
            }
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Analysis failed'
          }
        }
      }
    }
  ]
})

export async function POST(req: NextRequest) {
  try {
    const { handleRequest } = copilotKit
    
    return await handleRequest(req, new OpenAIAdapter({
      model: 'gpt-4o-mini', // Fallback model for Copilot Kit
      apiKey: process.env.OPENAI_API_KEY || 'fallback-key'
    }))
  } catch (error) {
    console.error('Copilot API error:', error)
    
    return new Response(JSON.stringify({
      error: 'Copilot service temporarily unavailable',
      fallback_endpoint: '/api/ai/enhanced',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({
    service: 'SAAR-GPT Copilot Backend',
    version: '1.0.0',
    features: [
      'Business Search Integration',
      'Document Generation',
      'Real-time Data Access',
      'AI-powered Analysis',
      'Saarland-specific Actions'
    ],
    actions: [
      'saarland_business_search',
      'saarland_document_generator', 
      'saarland_realtime_info',
      'saarland_ai_analysis'
    ],
    integration: 'Enhanced AI + Vector RAG + DeepSeek R1',
    status: 'active'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}