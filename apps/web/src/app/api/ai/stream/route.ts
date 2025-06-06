import { NextRequest, NextResponse } from 'next/server'
import { streamingAI } from '@/lib/ai/streaming-ai-service'

export const dynamic = 'force-dynamic'

interface StreamRequest {
  query: string
  category?: string
  mode?: 'standard' | 'premium'
  chunkSize?: number
  delayMs?: number
}

export async function POST(request: NextRequest) {
  try {
    const { 
      query, 
      category = 'general',
      mode = 'standard',
      chunkSize = 50,
      delayMs = 30
    }: StreamRequest = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Create appropriate stream based on mode
    let streamResponse: ReadableStream<Uint8Array>

    if (mode === 'premium') {
      streamResponse = await streamingAI.createPremiumStream(query, {
        category,
        chunkSize: Math.max(chunkSize, 75), // Premium gets larger chunks
        delayMs: Math.min(delayMs, 15),     // Premium gets faster streaming
        includeMetadata: true
      })
    } else {
      streamResponse = await streamingAI.createSSEStream(query, {
        category,
        chunkSize,
        delayMs,
        includeMetadata: true
      })
    }

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Stream-Mode': mode,
        'X-Category': category
      },
    })

  } catch (error) {
    console.error('Streaming API error:', error)
    return NextResponse.json({ 
      error: 'Streaming failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const test = url.searchParams.get('test')

  if (test === 'health') {
    const stats = streamingAI.getStreamStats()
    
    return NextResponse.json({
      status: 'healthy',
      service: 'Streaming AI Service',
      stats,
      capabilities: [
        'Server-Sent Events (SSE)',
        'WebSocket Support',
        'Multi-Agent Orchestration',
        'Premium Fast Streaming',
        'Real-time Metadata'
      ],
      timestamp: new Date().toISOString()
    })
  }

  return NextResponse.json({
    service: 'Streaming AI Service for agentland.saarland',
    version: '1.0.0',
    endpoints: {
      stream: 'POST /api/ai/stream { query: "...", category: "...", mode: "standard|premium" }',
      health: 'GET /api/ai/stream?test=health'
    },
    features: [
      'Real-time AI Streaming',
      'Multi-Agent Responses', 
      'Premium Fast Mode',
      'Chunked Delivery',
      'Metadata Enrichment'
    ]
  })
}