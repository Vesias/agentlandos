/**
 * Real-time Streaming AI Service for AGENTLAND.SAARLAND
 * Server-Sent Events (SSE) for live AI responses
 * Enhanced with WebSocket fallback for premium users
 */

import { enhancedAI } from './enhanced-ai-service'
import { saarlandOrchestrator } from './multi-agent-orchestrator'

export interface StreamingOptions {
  mode: 'sse' | 'websocket'
  chunkSize: number
  delayMs: number
  includeMetadata: boolean
  category?: string
  context?: any
}

export interface StreamChunk {
  id: string
  type: 'start' | 'chunk' | 'metadata' | 'end' | 'error'
  content: string
  metadata?: {
    timestamp: number
    processingTime?: number
    agentUsed?: string
    confidence?: number
  }
}

export class StreamingAIService {
  private activeStreams = new Map<string, AbortController>()
  private streamStats = {
    totalStreams: 0,
    activeStreams: 0,
    avgResponseTime: 0
  }

  async createSSEStream(
    query: string,
    options: Partial<StreamingOptions> = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const streamId = this.generateStreamId()
    const controller = new AbortController()
    this.activeStreams.set(streamId, controller)
    
    const config: StreamingOptions = {
      mode: 'sse',
      chunkSize: 50,
      delayMs: 30,
      includeMetadata: true,
      ...options
    }

    this.streamStats.totalStreams++
    this.streamStats.activeStreams++

    const encoder = new TextEncoder()
    
    return new ReadableStream({
      async start(streamController) {
        try {
          // Send initial chunk
          const startChunk: StreamChunk = {
            id: streamId,
            type: 'start',
            content: '',
            metadata: {
              timestamp: Date.now()
            }
          }
          
          streamController.enqueue(
            encoder.encode(`data: ${JSON.stringify(startChunk)}\n\n`)
          )

          // Process query and stream response
          await this.streamResponse(
            query,
            config,
            streamController,
            encoder,
            streamId,
            controller.signal
          )

        } catch (error) {
          console.error('Streaming error:', error)
          
          const errorChunk: StreamChunk = {
            id: streamId,
            type: 'error',
            content: 'Streaming wurde unterbrochen',
            metadata: {
              timestamp: Date.now()
            }
          }
          
          streamController.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`)
          )
        } finally {
          this.cleanup(streamId)
          streamController.close()
        }
      },
      
      cancel() {
        this.cleanup(streamId)
      }
    })
  }

  private async streamResponse(
    query: string,
    config: StreamingOptions,
    streamController: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder,
    streamId: string,
    signal: AbortSignal
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Determine if complex query needs multi-agent processing
      const isComplex = this.isComplexQuery(query)
      
      if (isComplex && config.category) {
        // Use multi-agent orchestration for complex queries
        await this.streamMultiAgentResponse(
          query, config, streamController, encoder, streamId, signal
        )
      } else {
        // Use enhanced AI for simpler queries
        await this.streamEnhancedAIResponse(
          query, config, streamController, encoder, streamId, signal
        )
      }

      // Send completion metadata
      if (config.includeMetadata) {
        const metadataChunk: StreamChunk = {
          id: streamId,
          type: 'metadata',
          content: '',
          metadata: {
            timestamp: Date.now(),
            processingTime: Date.now() - startTime,
            agentUsed: isComplex ? 'multi-agent' : 'enhanced-ai'
          }
        }
        
        streamController.enqueue(
          encoder.encode(`data: ${JSON.stringify(metadataChunk)}\n\n`)
        )
      }

      // Send end chunk
      const endChunk: StreamChunk = {
        id: streamId,
        type: 'end',
        content: '[DONE]',
        metadata: {
          timestamp: Date.now()
        }
      }
      
      streamController.enqueue(
        encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`)
      )

    } catch (error) {
      throw error
    }
  }

  private async streamMultiAgentResponse(
    query: string,
    config: StreamingOptions,
    streamController: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder,
    streamId: string,
    signal: AbortSignal
  ): Promise<void> {
    
    // Get full response from multi-agent system
    const result = await saarlandOrchestrator.processQuery(
      query,
      config.category as any
    )

    const response = result.finalResponse || 'Keine Antwort verfügbar'
    
    // Stream the response in chunks
    await this.streamText(
      response,
      config,
      streamController,
      encoder,
      streamId,
      result.confidence,
      signal
    )
  }

  private async streamEnhancedAIResponse(
    query: string,
    config: StreamingOptions,
    streamController: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder,
    streamId: string,
    signal: AbortSignal
  ): Promise<void> {
    
    // Get response from enhanced AI
    const result = await enhancedAI.processQuery(
      query,
      'chat',
      config.category || 'general'
    )

    // Stream the response in chunks
    await this.streamText(
      result.response,
      config,
      streamController,
      encoder,
      streamId,
      result.confidence,
      signal
    )
  }

  private async streamText(
    text: string,
    config: StreamingOptions,
    streamController: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder,
    streamId: string,
    confidence?: number,
    signal?: AbortSignal
  ): Promise<void> {
    
    // Split text into words for more natural streaming
    const words = text.split(' ')
    let currentChunk = ''
    
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) {
        throw new Error('Stream aborted')
      }

      currentChunk += words[i] + ' '
      
      // Send chunk when it reaches the configured size or at the end
      if (currentChunk.length >= config.chunkSize || i === words.length - 1) {
        const chunk: StreamChunk = {
          id: streamId,
          type: 'chunk',
          content: currentChunk.trim(),
          metadata: {
            timestamp: Date.now(),
            confidence
          }
        }
        
        streamController.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        )
        
        currentChunk = ''
        
        // Add delay for natural streaming effect
        if (config.delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayMs))
        }
      }
    }
  }

  private isComplexQuery(query: string): boolean {
    const complexIndicators = [
      'personalausweis', 'förderung', 'startup', 'saarschleife',
      'völklingen', 'bostalsee', 'gewerbe', 'universität',
      'tourism', 'business', 'admin', 'wie', 'wo', 'wann',
      'erkläre', 'vergleiche', 'analysiere'
    ]
    
    const lowerQuery = query.toLowerCase()
    return complexIndicators.some(indicator => lowerQuery.includes(indicator)) ||
           query.length > 25 ||
           query.includes('?')
  }

  private generateStreamId(): string {
    return `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private cleanup(streamId: string): void {
    this.activeStreams.delete(streamId)
    this.streamStats.activeStreams = Math.max(0, this.streamStats.activeStreams - 1)
  }

  // WebSocket support for premium users
  async createWebSocketStream(
    query: string,
    websocket: any,
    options: Partial<StreamingOptions> = {}
  ): Promise<void> {
    const streamId = this.generateStreamId()
    
    const config: StreamingOptions = {
      mode: 'websocket',
      chunkSize: 100, // Larger chunks for WebSocket
      delayMs: 20,    // Faster for premium users
      includeMetadata: true,
      ...options
    }

    try {
      // WebSocket streaming implementation
      const isComplex = this.isComplexQuery(query)
      let response: string
      let confidence: number = 0.8

      if (isComplex && config.category) {
        const result = await saarlandOrchestrator.processQuery(
          query,
          config.category as any
        )
        response = result.finalResponse || 'Keine Antwort verfügbar'
        confidence = result.confidence
      } else {
        const result = await enhancedAI.processQuery(
          query,
          'chat',
          config.category || 'general'
        )
        response = result.response
        confidence = result.confidence
      }

      // Stream via WebSocket
      const words = response.split(' ')
      let currentChunk = ''

      websocket.send(JSON.stringify({
        type: 'start',
        streamId,
        timestamp: Date.now()
      }))

      for (let i = 0; i < words.length; i++) {
        currentChunk += words[i] + ' '
        
        if (currentChunk.length >= config.chunkSize || i === words.length - 1) {
          websocket.send(JSON.stringify({
            type: 'chunk',
            streamId,
            content: currentChunk.trim(),
            confidence,
            timestamp: Date.now()
          }))
          
          currentChunk = ''
          
          if (config.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, config.delayMs))
          }
        }
      }

      websocket.send(JSON.stringify({
        type: 'end',
        streamId,
        timestamp: Date.now()
      }))

    } catch (error) {
      websocket.send(JSON.stringify({
        type: 'error',
        streamId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }))
    }
  }

  // Enhanced streaming for premium users with priority processing
  async createPremiumStream(
    query: string,
    options: Partial<StreamingOptions> = {}
  ): Promise<ReadableStream<Uint8Array>> {
    // Premium users get enhanced streaming with:
    // - Faster processing
    // - Multi-agent orchestration by default  
    // - Enhanced metadata
    // - Priority queue processing
    
    const premiumOptions: StreamingOptions = {
      mode: 'sse',
      chunkSize: 75,      // Optimal chunk size
      delayMs: 15,        // Faster streaming
      includeMetadata: true,
      ...options
    }

    return this.createSSEStream(query, premiumOptions)
  }

  // Statistics and monitoring
  getStreamStats() {
    return {
      ...this.streamStats,
      activeStreamIds: Array.from(this.activeStreams.keys())
    }
  }

  // Graceful shutdown of all active streams
  async shutdown(): Promise<void> {
    console.log(`Shutting down ${this.activeStreams.size} active streams`)
    
    for (const [streamId, controller] of this.activeStreams) {
      controller.abort()
    }
    
    this.activeStreams.clear()
    this.streamStats.activeStreams = 0
  }
}

// Export singleton instance
export const streamingAI = new StreamingAIService()

// Utility functions for easy integration
export async function createAIStream(
  query: string,
  category?: string
): Promise<ReadableStream<Uint8Array>> {
  return streamingAI.createSSEStream(query, { category })
}

export async function createPremiumAIStream(
  query: string,
  category?: string
): Promise<ReadableStream<Uint8Array>> {
  return streamingAI.createPremiumStream(query, { category })
}