import { NextRequest, NextResponse } from 'next/server'
import { enhancedAI } from '@/lib/ai/enhanced-ai-service'

export const dynamic = 'force-dynamic'

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
          // Return streaming response
          const encoder = new TextEncoder()
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of enhancedAI.streamResponse(prompt, category)) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
              } catch (error) {
                console.error('Streaming error:', error)
                controller.error(error)
              }
            }
          })

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
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
        
        const artifact = await enhancedAI.processQuery(prompt, 'artifact', category, { artifact_type })
        return NextResponse.json({
          artifact,
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