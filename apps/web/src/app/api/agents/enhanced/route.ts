import { NextRequest, NextResponse } from 'next/server'
import { CopilotBackend, OpenAIAdapter } from '@copilotkit/backend'
import { saarlandOrchestrator } from '@/lib/ai/multi-agent-orchestrator'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Enhanced Multi-Agent API with Copilot Kit integration
const copilotBackend = new CopilotBackend({
  actions: [
    {
      name: 'saarland_multi_agent_query',
      description: 'Process queries using enhanced multi-agent orchestrator with DeepSeek R1, Gemini 2.5, and OpenAI embeddings',
      parameters: [
        { name: 'query', type: 'string', description: 'User query for Saarland information' },
        { name: 'category', type: 'string', description: 'Query category (tourism, business, admin, etc.)', required: false },
        { name: 'mode', type: 'string', description: 'Processing mode (chat, artifact, rag, websearch)', required: false },
        { name: 'preferredModel', type: 'string', description: 'Preferred AI model (deepseek-r1, gemini-2.5, openai-gpt4o)', required: false }
      ],
      handler: async ({ query, category, mode, preferredModel }) => {
        try {
          const startTime = Date.now()
          
          const result = await saarlandOrchestrator.processQuery(
            query, 
            category as any || 'general',
            {},
            {
              mode: mode as any || 'chat',
              preferredModel: preferredModel as any,
              enableVectorSearch: true
            }
          )

          const processingTime = Date.now() - startTime

          return {
            success: true,
            response: result.finalResponse,
            confidence: result.confidence,
            metadata: {
              ...result.metadata,
              totalProcessingTime: processingTime,
              agentOrchestration: 'enhanced-langchain',
              vectorContext: result.vectorContext ? 'enriched' : 'none'
            },
            agentInteractions: result.responses.map((r: any) => ({
              agent: r.agent,
              model: r.model || 'static',
              responseLength: r.response?.length || 0
            })),
            recommendations: await generateFollowUpRecommendations(query, category, result.finalResponse)
          }

        } catch (error) {
          console.error('Multi-agent orchestrator error:', error)
          
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown orchestration error',
            fallback: 'Die KI-Agenten sind momentan überlastet. Bitte versuchen Sie es in wenigen Minuten erneut.',
            timestamp: new Date().toISOString()
          }
        }
      }
    },
    {
      name: 'saarland_reasoning_analysis',
      description: 'Deep reasoning analysis using DeepSeek R1 for complex Saarland queries',
      parameters: [
        { name: 'analysisQuery', type: 'string', description: 'Complex query requiring deep reasoning' },
        { name: 'context', type: 'string', description: 'Additional context for analysis', required: false }
      ],
      handler: async ({ analysisQuery, context }) => {
        try {
          const result = await saarlandOrchestrator.processQuery(
            analysisQuery,
            'general',
            { additionalContext: context },
            {
              mode: 'rag',
              preferredModel: 'deepseek-r1',
              enableVectorSearch: true
            }
          )

          return {
            success: true,
            analysis: result.finalResponse,
            confidence: result.confidence,
            reasoningSteps: result.metadata.reasoningSteps,
            llmInteractions: result.metadata.llmInteractions.filter((i: any) => i.model.includes('deepseek')),
            methodology: 'DeepSeek R1 Chain-of-Thought Reasoning'
          }

        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Reasoning analysis failed',
            fallback: 'Eine vereinfachte Analyse ist momentan nicht möglich.'
          }
        }
      }
    },
    {
      name: 'saarland_document_generation',
      description: 'Generate documents using Gemini 2.5 optimized for speed and quality',
      parameters: [
        { name: 'documentType', type: 'string', description: 'Type of document to generate' },
        { name: 'content', type: 'string', description: 'Content requirements and specifications' },
        { name: 'template', type: 'string', description: 'Document template preference', required: false }
      ],
      handler: async ({ documentType, content, template }) => {
        try {
          const documentPrompt = `Erstelle ein professionelles ${documentType} für das Saarland mit folgendem Inhalt: ${content}${template ? ` Template: ${template}` : ''}`
          
          const result = await saarlandOrchestrator.processQuery(
            documentPrompt,
            'admin',
            { documentType, template },
            {
              mode: 'artifact',
              preferredModel: 'gemini-2.5',
              enableVectorSearch: false
            }
          )

          return {
            success: true,
            document: result.finalResponse,
            type: documentType,
            metadata: {
              generated_at: new Date().toISOString(),
              model_used: 'gemini-2.0-flash',
              processing_time: result.metadata.processingTime,
              template_used: template || 'standard'
            }
          }

        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Document generation failed',
            fallback: `Ein Standard-${documentType} konnte nicht erstellt werden.`
          }
        }
      }
    },
    {
      name: 'saarland_vector_search',
      description: 'Search Saarland knowledge base using OpenAI embeddings and vector similarity',
      parameters: [
        { name: 'searchQuery', type: 'string', description: 'Search query for knowledge base' },
        { name: 'maxResults', type: 'number', description: 'Maximum number of results', required: false },
        { name: 'category', type: 'string', description: 'Search category filter', required: false }
      ],
      handler: async ({ searchQuery, maxResults = 5, category }) => {
        try {
          const result = await saarlandOrchestrator.processQuery(
            searchQuery,
            category as any || 'general',
            {},
            {
              mode: 'rag',
              preferredModel: 'openai-gpt4o',
              enableVectorSearch: true
            }
          )

          return {
            success: true,
            results: result.finalResponse,
            vectorResults: result.metadata.vectorSearchResults,
            confidence: result.confidence,
            searchMetadata: {
              query: searchQuery,
              resultsFound: result.metadata.vectorSearchResults,
              category: category || 'all',
              embeddingModel: 'text-embedding-3-large'
            }
          }

        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Vector search failed',
            fallback: 'Die Suche in der Saarland-Wissensdatenbank ist momentan nicht verfügbar.'
          }
        }
      }
    }
  ]
})

async function generateFollowUpRecommendations(
  query: string, 
  category: string | undefined, 
  response: string | undefined
): Promise<string[]> {
  const recommendations = []
  
  // Category-based recommendations
  if (category === 'tourism') {
    recommendations.push('Weitere Sehenswürdigkeiten entdecken', 'Übernachtungsmöglichkeiten finden', 'Veranstaltungen checken')
  } else if (category === 'business') {
    recommendations.push('Fördermöglichkeiten erkunden', 'Standortfaktoren analysieren', 'Netzwerke kontaktieren')
  } else if (category === 'admin') {
    recommendations.push('Termine vereinbaren', 'Dokumente vorbereiten', 'Öffnungszeiten prüfen')
  } else {
    recommendations.push('Spezifischere Frage stellen', 'Kategorie wählen', 'Weitere Informationen anfordern')
  }

  return recommendations.slice(0, 3)
}

export async function POST(req: NextRequest) {
  try {
    // Enhanced multi-agent processing endpoint
    const body = await req.json()
    const { query, category, mode, preferredModel, directCall } = body

    if (directCall) {
      // Direct multi-agent call (bypass Copilot Kit)
      const result = await saarlandOrchestrator.processQuery(
        query,
        category || 'general',
        {},
        { mode, preferredModel, enableVectorSearch: true }
      )

      return NextResponse.json({
        success: true,
        response: result.finalResponse,
        metadata: result.metadata,
        agentInteractions: result.responses,
        confidence: result.confidence,
        vectorContext: result.vectorContext ? 'enriched' : 'none',
        timestamp: new Date().toISOString()
      })
    }

    // Copilot Kit integration
    const { handleRequest } = copilotBackend
    
    return await handleRequest(req, new OpenAIAdapter({
      model: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY || 'fallback-key'
    }))

  } catch (error) {
    console.error('Enhanced agents API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Enhanced agent services temporarily unavailable',
      fallback: 'Versuchen Sie es mit einer einfacheren Anfrage oder kontaktieren Sie uns direkt.',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

export async function GET(req: NextRequest) {
  // Agent capabilities and health check
  const capabilities = [
    {
      name: 'Multi-Agent Orchestrator',
      models: ['DeepSeek R1', 'Gemini 2.5 Flash', 'OpenAI GPT-4o'],
      features: ['Chain-of-Thought Reasoning', 'Fast Generation', 'Structured Analysis'],
      specializations: ['Tourism', 'Business', 'Administration']
    },
    {
      name: 'Vector Search Engine',
      embedding: 'OpenAI text-embedding-3-large',
      database: 'Supabase Vector Store',
      capabilities: ['Semantic Search', 'RAG Enhancement', 'Context Enrichment']
    },
    {
      name: 'LangChain Integration',
      framework: 'LangChain with custom LLMs',
      orchestration: 'Agent handoffs and state management',
      monitoring: 'Performance tracking and error handling'
    }
  ]

  return NextResponse.json({
    service: 'Enhanced Saarland Multi-Agent System',
    version: '2.0.0',
    capabilities,
    integration: {
      copilotKit: 'Backend actions with LLM orchestration',
      agUI: 'Protocol-compatible UI components',
      langChain: 'Advanced agent coordination'
    },
    models: {
      reasoning: 'DeepSeek R1 (Chain-of-Thought)',
      generation: 'Gemini 2.5 Flash (Speed optimized)',
      analysis: 'OpenAI GPT-4o (Function calling)',
      embeddings: 'OpenAI text-embedding-3-large (Vector search)'
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  })
}