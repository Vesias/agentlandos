/**
 * OpenAI Embeddings Service für AGENTLAND.SAARLAND
 * Optimized für Research, RAG und Semantic Search
 */

import OpenAI from 'openai';

// Best Practice: Singleton Pattern für OpenAI Client
class OpenAIEmbeddingsService {
  private static instance: OpenAIEmbeddingsService;
  private openai: OpenAI | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeClient();
  }

  public static getInstance(): OpenAIEmbeddingsService {
    if (!OpenAIEmbeddingsService.instance) {
      OpenAIEmbeddingsService.instance = new OpenAIEmbeddingsService();
    }
    return OpenAIEmbeddingsService.instance;
  }

  private initializeClient(): void {
    try {
      // Best Practice: Server-side nur, niemals Client-side API Keys
      if (typeof window === 'undefined') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          console.warn('⚠️ OPENAI_API_KEY not configured - embeddings disabled');
          return;
        }

        this.openai = new OpenAI({
          apiKey: apiKey,
          timeout: 30000, // 30s timeout
          maxRetries: 3,  // Auto-retry für Robustheit
        });
        this.isInitialized = true;
        console.log('✅ OpenAI Embeddings Service initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error);
    }
  }

  /**
   * Erstellt Embeddings für Saarland-spezifische Inhalte
   */
  async createEmbeddings(
    text: string | string[],
    options: {
      model?: 'text-embedding-3-small' | 'text-embedding-3-large';
      dimensions?: number;
      encoding_format?: 'float' | 'base64';
    } = {}
  ): Promise<number[][] | null> {
    if (!this.isInitialized || !this.openai) {
      console.warn('OpenAI not initialized - falling back to null embeddings');
      return null;
    }

    try {
      const {
        model = 'text-embedding-3-small', // Best Practice: Kosten-optimiert
        dimensions = 1536, // Standard für text-embedding-3-small
        encoding_format = 'float'
      } = options;

      // Best Practice: Input Validation & Preprocessing
      const inputs = Array.isArray(text) ? text : [text];
      const validInputs = inputs
        .filter(input => input && input.trim().length > 0)
        .map(input => input.trim().substring(0, 8000)); // OpenAI Token Limit

      if (validInputs.length === 0) {
        throw new Error('No valid input text provided');
      }

      // Best Practice: Batch Processing für Effizienz
      const response = await this.openai.embeddings.create({
        model,
        input: validInputs,
        dimensions,
        encoding_format,
      });

      // Extract embeddings from response
      const embeddings = response.data.map(item => item.embedding);
      
      // Best Practice: Usage Tracking für Kosten-Kontrolle
      console.log(`📊 Generated ${embeddings.length} embeddings (${response.usage.total_tokens} tokens)`);
      
      return embeddings;

    } catch (error) {
      console.error('❌ OpenAI Embeddings error:', error);
      
      // Best Practice: Graceful Degradation
      return null;
    }
  }

  /**
   * Saarland-optimierte Semantic Search
   */
  async searchSaarlandContent(
    query: string,
    contentDatabase: Array<{
      id: string;
      content: string;
      embedding?: number[];
      metadata?: any;
    }>,
    options: {
      topK?: number;
      threshold?: number;
      boostFactors?: {
        regional?: number;
        recency?: number;
        authority?: number;
      };
    } = {}
  ): Promise<Array<{
    id: string;
    content: string;
    score: number;
    metadata?: any;
  }>> {
    try {
      const { topK = 5, threshold = 0.7 } = options;

      // Generate query embedding
      const queryEmbeddings = await this.createEmbeddings(query);
      if (!queryEmbeddings || queryEmbeddings.length === 0) {
        throw new Error('Failed to generate query embedding');
      }

      const queryEmbedding = queryEmbeddings[0];

      // Calculate similarities with content database
      const results = contentDatabase
        .filter(item => item.embedding)
        .map(item => {
          const similarity = this.cosineSimilarity(queryEmbedding, item.embedding!);
          
          // Best Practice: Saarland-spezifische Boost-Faktoren
          let boostedScore = similarity;
          
          if (options.boostFactors) {
            const { regional = 1, recency = 1, authority = 1 } = options.boostFactors;
            
            // Regional relevance boost
            if (item.metadata?.isRegional) {
              boostedScore *= regional;
            }
            
            // Recency boost (neuere Inhalte bevorzugen)
            if (item.metadata?.publishedDate) {
              const daysSincePublished = (Date.now() - new Date(item.metadata.publishedDate).getTime()) / (1000 * 60 * 60 * 24);
              if (daysSincePublished < 30) {
                boostedScore *= recency;
              }
            }
            
            // Authority boost (offizielle Quellen bevorzugen)
            if (item.metadata?.isOfficial) {
              boostedScore *= authority;
            }
          }

          return {
            id: item.id,
            content: item.content,
            score: boostedScore,
            metadata: item.metadata,
          };
        })
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return results;

    } catch (error) {
      console.error('❌ Saarland content search error:', error);
      return [];
    }
  }

  /**
   * Berechnet Cosine Similarity zwischen zwei Vektoren
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Health Check für Service-Verfügbarkeit
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
  }> {
    if (!this.isInitialized || !this.openai) {
      return {
        status: 'unhealthy',
        details: 'OpenAI client not initialized - check API key configuration'
      };
    }

    try {
      // Test mit kleinem Embedding
      const testEmbedding = await this.createEmbeddings('Saarland test');
      
      if (testEmbedding && testEmbedding.length > 0) {
        return {
          status: 'healthy',
          details: 'OpenAI embeddings service operational'
        };
      } else {
        return {
          status: 'degraded',
          details: 'OpenAI API responding but embeddings failing'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Erstellt Research-optimierte Embeddings für Saarland-Themen
   */
  async createSaarlandResearchEmbeddings(
    research: {
      title: string;
      content: string;
      category: 'verwaltung' | 'tourismus' | 'wirtschaft' | 'bildung';
      tags?: string[];
      priority: 'low' | 'medium' | 'high';
    }
  ): Promise<{
    titleEmbedding: number[] | null;
    contentEmbedding: number[] | null;
    combinedEmbedding: number[] | null;
  }> {
    try {
      // Best Practice: Multi-level Embeddings für bessere Granularität
      const tasks = [
        this.createEmbeddings(research.title),
        this.createEmbeddings(research.content),
        this.createEmbeddings(`${research.title}\n\n${research.content}`)
      ];

      const [titleResult, contentResult, combinedResult] = await Promise.all(tasks);

      return {
        titleEmbedding: titleResult?.[0] || null,
        contentEmbedding: contentResult?.[0] || null,
        combinedEmbedding: combinedResult?.[0] || null,
      };

    } catch (error) {
      console.error('❌ Saarland research embeddings error:', error);
      return {
        titleEmbedding: null,
        contentEmbedding: null,
        combinedEmbedding: null,
      };
    }
  }
}

// Export singleton instance
export const openaiEmbeddings = OpenAIEmbeddingsService.getInstance();

// Types für TypeScript Best Practices
export interface EmbeddingResult {
  embedding: number[];
  text: string;
  tokens: number;
}

export interface SaarlandSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: {
    category?: string;
    isRegional?: boolean;
    isOfficial?: boolean;
    publishedDate?: string;
    authority?: string;
  };
}

export interface ResearchEmbeddings {
  titleEmbedding: number[] | null;
  contentEmbedding: number[] | null;
  combinedEmbedding: number[] | null;
}