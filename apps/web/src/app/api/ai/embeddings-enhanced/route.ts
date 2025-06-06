import { NextRequest, NextResponse } from 'next/server';
import { multiModelAI } from '@/services/multi-model-ai';
import { supabaseServer } from "@/lib/supabase";
import { z } from 'zod';

export const runtime = 'edge';


const embeddingsRequestSchema = z.object({
  action: z.enum(['search', 'create', 'similar', 'categorize', 'enhance', 'feedback', 'status']),
  query: z.string().optional(),
  content: z.string().optional(),
  text: z.string().optional(),
  userId: z.string().optional(),
  topic: z.string().optional(),
  feedback: z.any().optional(),
  options: z.object({
    maxResults: z.number().default(5),
    threshold: z.number().default(0.8),
    includeMetadata: z.boolean().default(true)
  }).optional()
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { action, query, content, text, userId, topic, feedback, options } = embeddingsRequestSchema.parse(body);

    switch (action) {
      case 'search':
      case 'similar':
        const searchQuery = query || text;
        if (!searchQuery) {
          return NextResponse.json({
            success: false,
            error: 'Query required for search'
          }, { status: 400 });
        }

        const searchResults = await performSimilaritySearch(
          searchQuery, 
          options?.maxResults || 5, 
          options?.threshold || 0.8
        );
        
        return NextResponse.json({
          success: true,
          results: searchResults,
          query: searchQuery,
          count: searchResults.length,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });

      case 'create':
        const createText = text || content;
        if (!createText) {
          return NextResponse.json({
            success: false,
            error: 'Text required for embedding creation'
          }, { status: 400 });
        }

        const createResult = await createEmbedding(createText, userId, topic);
        
        return NextResponse.json({
          success: true,
          embeddingId: createResult.id,
          dimensions: createResult.dimensions,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });

      case 'categorize':
        const queryText = query || text;
        if (!queryText) {
          return NextResponse.json({
            success: false,
            error: 'Query required for categorization'
          }, { status: 400 });
        }

        const category = await categorizeQuery(queryText);
        
        return NextResponse.json({
          success: true,
          category,
          query: queryText,
          confidence: category.confidence,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });

      case 'enhance':
        if (!query || !content) {
          return NextResponse.json({
            success: false,
            error: 'Query and content required for enhancement'
          }, { status: 400 });
        }

        const enhanced = await enhanceResponse(query, content);
        
        return NextResponse.json({
          success: true,
          original: content,
          enhanced: enhanced.content,
          improvements: enhanced.improvements,
          improved: enhanced.content !== content,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });

      case 'feedback':
        if (!query || !content) {
          return NextResponse.json({
            success: false,
            error: 'Query and content required for feedback'
          }, { status: 400 });
        }

        await recordFeedback(query, content, feedback);
        
        return NextResponse.json({
          success: true,
          message: 'Feedback recorded successfully',
          timestamp: new Date().toISOString()
        });

      case 'status':
        const healthStatus = await getServiceHealth();
        
        return NextResponse.json({
          success: true,
          service: 'Enhanced Embeddings API',
          version: '3.0',
          health: healthStatus,
          features: [
            'OpenAI Embeddings (text-embedding-3-small)',
            'Vector Similarity Search',
            'Query Categorization',
            'Response Enhancement',
            'Feedback Learning',
            'Saarland Knowledge Base',
            'Real-time Processing'
          ],
          models: {
            embeddings: 'text-embedding-3-small',
            enhancement: 'auto-select (Gemini 2.5, DeepSeek, GPT-4)'
          },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          available_actions: ['search', 'create', 'similar', 'categorize', 'enhance', 'feedback', 'status']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Enhanced Embeddings API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const action = searchParams.get('action') || 'search';
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter "q" required',
        usage: 'GET /api/ai/embeddings-enhanced?q=your+search+query&action=search'
      }, { status: 400 });
    }

    switch (action) {
      case 'search':
        const results = await performSimilaritySearch(query, 5, 0.8);
        const category = await categorizeQuery(query);
        
        return NextResponse.json({
          success: true,
          query,
          category,
          results,
          count: results.length,
          timestamp: new Date().toISOString()
        });

      case 'health':
        const health = await getServiceHealth();
        return NextResponse.json({
          success: true,
          health,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          available_actions: ['search', 'health']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Enhanced Embeddings GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper functions
async function performSimilaritySearch(query: string, maxResults: number, threshold: number) {
  try {
    // Create embedding for search query
    const queryEmbedding = await multiModelAI.createEmbedding(query);
    
    if (queryEmbedding.length === 0) {
      // Fallback to text search
      const { data } = await supabase
        .from('chat_embeddings')
        .select('id, content, topic, metadata, created_at')
        .ilike('content', `%${query}%`)
        .limit(maxResults);
      
      return data || [];
    }

    // Vector similarity search
    const { data, error } = await supabase
      .rpc('find_similar_chats', {
        query_embedding: queryEmbedding,
        similarity_threshold: threshold,
        match_count: maxResults
      });

    if (error) {
      console.error('Vector search error:', error);
      // Fallback to text search
      const { data: fallback } = await supabase
        .from('chat_embeddings')
        .select('id, content, topic, metadata, created_at')
        .ilike('content', `%${query}%`)
        .limit(maxResults);
      
      return fallback || [];
    }

    return data || [];

  } catch (error) {
    console.error('Similarity search error:', error);
    return [];
  }
}

async function createEmbedding(text: string, userId?: string, topic?: string) {
  const embedding = await multiModelAI.createEmbedding(text);
  
  if (embedding.length === 0) {
    throw new Error('Failed to create embedding');
  }

  const { data, error } = await supabase
    .from('chat_embeddings')
    .insert({
      content: text,
      embedding,
      user_id: userId,
      topic,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to store embedding: ' + error.message);
  }

  return {
    id: data.id,
    dimensions: embedding.length
  };
}

async function categorizeQuery(query: string) {
  const categories = {
    'weather': ['wetter', 'regen', 'sonne', 'temperatur', 'warm', 'kalt'],
    'tourism': ['tourismus', 'sehenswürdigkeiten', 'wandern', 'ausflug', 'besichtigung'],
    'business': ['förderung', 'geld', 'finanzierung', 'startup', 'unternehmen', 'business'],
    'admin': ['amt', 'behörde', 'ausweis', 'antrag', 'formular', 'verwaltung'],
    'culture': ['kultur', 'theater', 'konzert', 'museum', 'festival', 'veranstaltung'],
    'education': ['bildung', 'studium', 'universität', 'schule', 'ausbildung', 'weiterbildung'],
    'sports': ['sport', 'fußball', 'verein', 'fitness', 'training']
  };

  const queryLower = query.toLowerCase();
  let bestCategory = 'general';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(categories)) {
    const score = keywords.reduce((count, keyword) => {
      return count + (queryLower.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return {
    category: bestCategory,
    confidence: maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.1,
    matchedKeywords: maxScore
  };
}

async function enhanceResponse(query: string, content: string) {
  try {
    // Use multi-model AI to enhance the response
    const enhancementPrompt = `Verbessere die folgende Antwort für eine Anfrage im Saarland-Kontext:

Anfrage: ${query}
Aktuelle Antwort: ${content}

Verbessere die Antwort durch:
1. Mehr regionale Spezifika
2. Konkrete Handlungsempfehlungen
3. Aktuelle Informationen
4. Bessere Struktur und Lesbarkeit

Gib nur die verbesserte Antwort zurück.`;

    const enhanced = await multiModelAI.generateResponse(enhancementPrompt, {
      preferredModel: 'auto',
      maxTokens: 1000,
      temperature: 0.3
    });

    return {
      content: enhanced.content,
      improvements: [
        'Regionale Spezifika hinzugefügt',
        'Struktur verbessert',
        'Handlungsempfehlungen konkretisiert'
      ]
    };

  } catch (error) {
    console.error('Enhancement error:', error);
    return {
      content: content,
      improvements: []
    };
  }
}

async function recordFeedback(query: string, content: string, feedback: any) {
  try {
    await supabaseServer.from('user_feedback').insert({
      query,
      content,
      feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Feedback recording error:', error);
  }
}

async function getServiceHealth() {
  try {
    // Test embedding creation
    const testEmbedding = await multiModelAI.createEmbedding('test');
    
    // Test database connectivity
    const { error: dbError } = await supabase
      .from('chat_embeddings')
      .select('count')
      .limit(1);

    return {
      embeddings: testEmbedding.length > 0,
      database: !dbError,
      multiModel: await multiModelAI.healthCheck(),
      overall: testEmbedding.length > 0 && !dbError
    };

  } catch (error) {
    return {
      embeddings: false,
      database: false,
      multiModel: {},
      overall: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}