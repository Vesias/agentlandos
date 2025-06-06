/**
 * OpenAI Embeddings API für AGENTLAND.SAARLAND
 * /api/ai/embeddings - Embeddings Generation & Semantic Search
 */

import { NextRequest, NextResponse } from 'next/server';
import { openaiEmbeddings } from '@/services/openai-embeddings';

export const runtime = 'edge';

interface EmbeddingRequest {
  text: string | string[];
  type?: 'content' | 'query' | 'research';
  options?: {
    model?: 'text-embedding-3-small' | 'text-embedding-3-large';
    dimensions?: number;
  };
}

interface SearchRequest {
  query: string;
  searchIn: 'saarland' | 'verwaltung' | 'tourismus' | 'wirtschaft' | 'bildung';
  options?: {
    topK?: number;
    threshold?: number;
    boost?: {
      regional?: number;
      recency?: number;
      authority?: number;
    };
  };
}

interface ResearchRequest {
  research: {
    title: string;
    content: string;
    category: 'verwaltung' | 'tourismus' | 'wirtschaft' | 'bildung';
    tags?: string[];
    priority: 'low' | 'medium' | 'high';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    switch (action) {
      case 'generate':
        return await handleGenerateEmbeddings(payload as EmbeddingRequest);
      
      case 'search':
        return await handleSemanticSearch(payload as SearchRequest);
      
      case 'research':
        return await handleResearchEmbeddings(payload as ResearchRequest);
      
      case 'health':
        return await handleHealthCheck();
      
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action. Supported: generate, search, research, health' 
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generiert Embeddings für beliebige Texte
 */
async function handleGenerateEmbeddings(request: EmbeddingRequest) {
  const { text, type = 'content', options = {} } = request;

  if (!text || (Array.isArray(text) && text.length === 0)) {
    return NextResponse.json(
      { success: false, error: 'Text input required' },
      { status: 400 }
    );
  }

  const embeddings = await openaiEmbeddings.createEmbeddings(text, options);

  if (!embeddings) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate embeddings - check OpenAI configuration',
        fallback: 'Using fallback semantic analysis'
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    embeddings,
    type,
    dimensions: embeddings[0]?.length || 0,
    count: embeddings.length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Führt semantische Suche in Saarland-Inhalten durch
 */
async function handleSemanticSearch(request: SearchRequest) {
  const { query, searchIn, options = {} } = request;

  if (!query?.trim()) {
    return NextResponse.json(
      { success: false, error: 'Query required' },
      { status: 400 }
    );
  }

  // Mock Saarland Content Database (in Produktion: echte Datenbank)
  const saarlandContentDB = getSaarlandContentDatabase(searchIn);

  const results = await openaiEmbeddings.searchSaarlandContent(
    query,
    saarlandContentDB,
    {
      topK: options.topK || 5,
      threshold: options.threshold || 0.7,
      boostFactors: options.boost || {
        regional: 1.2,
        recency: 1.1,
        authority: 1.3,
      },
    }
  );

  return NextResponse.json({
    success: true,
    query,
    searchIn,
    results,
    count: results.length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Erstellt Research-optimierte Embeddings
 */
async function handleResearchEmbeddings(request: ResearchRequest) {
  const { research } = request;

  if (!research?.title || !research?.content) {
    return NextResponse.json(
      { success: false, error: 'Research title and content required' },
      { status: 400 }
    );
  }

  const embeddings = await openaiEmbeddings.createSaarlandResearchEmbeddings(research);

  return NextResponse.json({
    success: true,
    research: {
      title: research.title,
      category: research.category,
      priority: research.priority,
    },
    embeddings: {
      title: embeddings.titleEmbedding ? 'generated' : 'failed',
      content: embeddings.contentEmbedding ? 'generated' : 'failed',
      combined: embeddings.combinedEmbedding ? 'generated' : 'failed',
    },
    dimensions: embeddings.titleEmbedding?.length || 0,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Health Check für Embeddings Service
 */
async function handleHealthCheck() {
  const health = await openaiEmbeddings.healthCheck();

  return NextResponse.json({
    success: health.status === 'healthy',
    status: health.status,
    details: health.details,
    service: 'OpenAI Embeddings',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Mock Content Database für Saarland (in Produktion: echte DB)
 */
function getSaarlandContentDatabase(category: string) {
  const baseContent = [
    {
      id: 'saar-1',
      content: 'Das Saarland ist ein Bundesland im Südwesten Deutschlands mit der Hauptstadt Saarbrücken. Es grenzt an Frankreich und Luxemburg.',
      embedding: undefined, // Würde in echter DB bereits existieren
      metadata: {
        category: 'allgemein',
        isRegional: true,
        isOfficial: true,
        publishedDate: '2024-01-15',
        authority: 'Staatskanzlei Saarland',
      },
    },
    {
      id: 'saar-2',
      content: 'Die Völklinger Hütte ist ein UNESCO-Weltkulturerbe und wichtiges Industriedenkmal im Saarland.',
      embedding: undefined,
      metadata: {
        category: 'tourismus',
        isRegional: true,
        isOfficial: false,
        publishedDate: '2024-02-10',
        authority: 'Tourismus Zentrale Saarland',
      },
    },
    {
      id: 'saar-3',
      content: 'Bürgerdienste und Verwaltungsleistungen der saarländischen Kommunen sind digital über das Serviceportal verfügbar.',
      embedding: undefined,
      metadata: {
        category: 'verwaltung',
        isRegional: true,
        isOfficial: true,
        publishedDate: '2024-03-01',
        authority: 'Digitale Verwaltung Saarland',
      },
    },
  ];

  // Filter by category if specified
  if (category !== 'saarland') {
    return baseContent.filter(item => item.metadata.category === category);
  }

  return baseContent;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'health') {
    return await handleHealthCheck();
  }

  return NextResponse.json({
    service: 'AGENTLAND.SAARLAND Embeddings API',
    version: '1.0.0',
    endpoints: {
      POST: {
        '/api/ai/embeddings': {
          actions: ['generate', 'search', 'research', 'health'],
          description: 'OpenAI embeddings for Saarland content'
        }
      },
      GET: {
        '/api/ai/embeddings?action=health': 'Health check endpoint'
      }
    },
    documentation: 'https://agentland.saarland/docs/api/embeddings',
    timestamp: new Date().toISOString(),
  });
}