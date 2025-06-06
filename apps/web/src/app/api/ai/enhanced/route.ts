import { NextRequest, NextResponse } from 'next/server'
import { enhancedAI } from '@/services/ai/enhanced-ai-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface EnhancedAIRequest {
  prompt: string
  mode: 'chat' | 'artifact' | 'rag' | 'stream'
  category: string
  artifact_type?: 'text' | 'code' | 'data' | 'visual'
  context?: any
  stream?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      mode, 
      category,
      artifact_type,
      context,
      stream = false
    }: EnhancedAIRequest = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const startTime = Date.now()

    switch (mode) {
      case 'chat':
        if (stream) {
          // Use enhanced streaming service
          const { streamingAI } = await import('@/lib/ai/streaming-ai-service')
          const streamResponse = await streamingAI.createSSEStream(prompt, { 
            category,
            chunkSize: 50,
            delayMs: 30,
            includeMetadata: true
          })

          return new Response(streamResponse, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Cache-Control'
            },
          })
        } else {
          const response = await enhancedAI.processQuery(prompt, 'chat', category, context)
          return NextResponse.json({
            ...response,
            api_version: 'enhanced-v1',
            processing_time: Date.now() - startTime
          })
        }

      case 'artifact':
        if (!artifact_type) {
          return NextResponse.json({ error: 'Artifact type is required' }, { status: 400 })
        }
        
        const artifactResponse = await enhancedAI.processQuery(prompt, 'artifact', category, { artifact_type })
        
        // Create proper artifact structure for OpenCanvas
        const artifact = {
          id: Date.now().toString(),
          type: artifact_type === 'code' ? 'code' : 'text',
          title: generateArtifactTitle(prompt, artifact_type, category),
          content: artifactResponse.response || generateFallbackContent(prompt, artifact_type, category),
          language: artifact_type === 'code' ? detectLanguage(prompt) : undefined,
          created_at: Date.now(),
          updated_at: Date.now()
        }
        
        return NextResponse.json({
          success: true,
          artifact,
          response: artifactResponse.response,
          api_version: 'enhanced-v1',
          processing_time: Date.now() - startTime
        })

      case 'rag':
        const ragResponse = await enhancedAI.ragQuery(prompt, { category })
        return NextResponse.json({
          ...ragResponse,
          api_version: 'enhanced-v1-rag',
          processing_time: Date.now() - startTime
        })

      default:
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

  } catch (error) {
    console.error('Enhanced AI API error:', error)
    return NextResponse.json({ 
      error: 'AI processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const test = url.searchParams.get('test')

  if (test === 'health') {
    try {
      // Quick health check with simple AI call
      const response = await enhancedAI.processQuery(
        'Kurzer Saarland-Test', 
        'chat',
        'general'
      )
      
      return NextResponse.json({
        status: 'healthy',
        ai_models: ['deepseek-reasoner-r1-0528', 'gemini-2.5-flash'],
        test_response: response,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return NextResponse.json({
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
  }

  return NextResponse.json({
    service: 'Enhanced AI Service for agentland.saarland',
    version: '1.0.0',
    models: {
      deepseek: 'deepseek-reasoner-r1-0528',
      gemini: 'gemini-2.5-flash'
    },
    features: [
      'Chain-of-Thought Reasoning',
      'Multi-modal Processing',
      'RAG Vector Search',
      'Real-time Streaming',
      'Saarland-optimized Content'
    ],
    endpoints: {
      chat: 'POST /api/ai/enhanced { mode: "chat", prompt: "...", category: "..." }',
      artifact: 'POST /api/ai/enhanced { mode: "artifact", prompt: "...", artifact_type: "code|text|data|visual" }',
      rag: 'POST /api/ai/enhanced { mode: "rag", prompt: "...", category: "..." }',
      stream: 'POST /api/ai/enhanced { mode: "chat", stream: true, ... }'
    }
  })
}

// Helper functions for artifact generation
function generateArtifactTitle(prompt: string, type: string, category: string): string {
  const keywords = prompt.toLowerCase()
  const categoryPrefix = category.charAt(0).toUpperCase() + category.slice(1)
  
  if (type === 'code') {
    if (keywords.includes('component') || keywords.includes('react')) {
      return `${categoryPrefix} React Component`
    } else if (keywords.includes('api') || keywords.includes('service')) {
      return `${categoryPrefix} API Service`
    } else if (keywords.includes('function') || keywords.includes('util')) {
      return `${categoryPrefix} Utility Functions`
    }
    return `${categoryPrefix} Code Solution`
  } else {
    if (keywords.includes('guide') || keywords.includes('anleitung')) {
      return `${categoryPrefix} Leitfaden`
    } else if (keywords.includes('plan') || keywords.includes('strategie')) {
      return `${categoryPrefix} Strategieplan`
    } else if (keywords.includes('info') || keywords.includes('übersicht')) {
      return `${categoryPrefix} Informationsübersicht`
    }
    return `${categoryPrefix} Dokument`
  }
}

function detectLanguage(prompt: string): string {
  const keywords = prompt.toLowerCase()
  
  if (keywords.includes('react') || keywords.includes('jsx') || keywords.includes('component')) {
    return 'tsx'
  } else if (keywords.includes('python') || keywords.includes('django') || keywords.includes('flask')) {
    return 'python'
  } else if (keywords.includes('javascript') || keywords.includes('node') || keywords.includes('express')) {
    return 'javascript'
  } else if (keywords.includes('typescript') || keywords.includes('ts')) {
    return 'typescript'
  } else if (keywords.includes('html') || keywords.includes('markup')) {
    return 'html'
  } else if (keywords.includes('css') || keywords.includes('style')) {
    return 'css'
  }
  
  return 'javascript' // Default fallback
}

function generateFallbackContent(prompt: string, type: string, category: string): string {
  if (type === 'code') {
    return `// ${category.charAt(0).toUpperCase() + category.slice(1)} Code for: ${prompt}
// Generated by AGENTLAND.SAARLAND AI

export default function Saarland${category.charAt(0).toUpperCase() + category.slice(1)}Component() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#003399' }}>
        Saarland ${category.charAt(0).toUpperCase() + category.slice(1)} Service
      </h2>
      <p className="text-gray-600">
        ${prompt}
      </p>
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          style={{ backgroundColor: '#003399' }}
        >
          Saarland Action
        </button>
      </div>
    </div>
  )
}`
  } else {
    return `# ${category.charAt(0).toUpperCase() + category.slice(1)} Dokument: ${prompt}

## Übersicht
Speziell für das Saarland entwickelte Lösung.

## Details
${prompt}

## Nächste Schritte
Weitere Informationen finden Sie auf agentland.saarland.

---
*Generiert von AGENTLAND.SAARLAND KI-Assistent*`
  }
}