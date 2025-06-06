import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface EmbeddingResult {
  content: string
  similarity: number
  category: string
  source: string
  metadata?: any
}

export class SaarlandEmbeddingsService {
  private static instance: SaarlandEmbeddingsService
  
  public static getInstance(): SaarlandEmbeddingsService {
    if (!SaarlandEmbeddingsService.instance) {
      SaarlandEmbeddingsService.instance = new SaarlandEmbeddingsService()
    }
    return SaarlandEmbeddingsService.instance
  }

  // Saarland-spezifische Knowledge Base
  private saarlandKnowledge = [
    {
      content: "Das Saarland hat 52 Gemeinden und ist bekannt für die Saarschleife, ein Wahrzeichen bei Mettlach.",
      category: "geography",
      source: "saarland-facts"
    },
    {
      content: "1. FC Saarbrücken spielt in der 3. Liga, SV Elversberg in der 2. Bundesliga und FC Homburg in der Regionalliga.",
      category: "football",
      source: "saarfussball"
    },
    {
      content: "Die Völklinger Hütte ist UNESCO Welterbe und ein wichtiges Industriedenkmal im Saarland.",
      category: "tourism",
      source: "unesco-heritage"
    },
    {
      content: "Im Saarland gibt es viele Nachhilfe-Anbieter für Mathematik, Deutsch, Englisch und Französisch.",
      category: "education",
      source: "tutoring-services"
    },
    {
      content: "Bostalsee ist der größte Freizeitsee im Saarland mit Wassersport, Baden und Camping-Möglichkeiten.",
      category: "tourism",
      source: "recreation"
    },
    {
      content: "Das Saarland bietet verschiedene Förderprogramme für Startups und KI-Unternehmen bis 150.000€.",
      category: "business",
      source: "funding-programs"
    },
    {
      content: "Saarbrücken hat digitale Bürgerservices mit kurzen Wartezeiten und Online-Terminen.",
      category: "administration",
      source: "digital-services"
    },
    {
      content: "Es gibt über 1000 Vereine im Saarland: Sportvereine, Kulturvereine, Musikvereine und Naturschutzvereine.",
      category: "clubs",
      source: "associations"
    }
  ]

  // Erstelle Embeddings für die Knowledge Base
  async initializeKnowledgeBase() {
    try {
      console.log('🧠 Initializing Saarland Knowledge Base...')
      
      for (const item of this.saarlandKnowledge) {
        const embedding = await this.createEmbedding(item.content)
        
        // Speichere in Supabase (falls verfügbar)
        try {
          await supabase.from('saarland_embeddings').upsert({
            content: item.content,
            category: item.category,
            source: item.source,
            embedding: embedding,
            created_at: new Date().toISOString()
          })
        } catch (dbError) {
          console.log('📝 Database not available, using in-memory storage')
        }
      }
      
      console.log('✅ Knowledge Base initialized successfully')
    } catch (error) {
      console.error('❌ Knowledge Base initialization failed:', error)
    }
  }

  // Erstelle Embedding für Text
  async createEmbedding(text: string): Promise<number[]> {
    try {
      if (!openai) {
        console.log('OpenAI not configured, using fallback embeddings')
        return new Array(1536).fill(0)
      }
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Embedding creation failed:', error)
      // Fallback: Return dummy embedding
      return new Array(1536).fill(0)
    }
  }

  // Similarity Search
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Finde ähnliche Inhalte
  async findSimilarContent(query: string, limit: number = 3): Promise<EmbeddingResult[]> {
    try {
      const queryEmbedding = await this.createEmbedding(query)
      const results: EmbeddingResult[] = []

      // Versuche erst Supabase
      try {
        const { data: dbResults } = await supabase
          .from('saarland_embeddings')
          .select('*')
          .limit(50)

        if (dbResults && dbResults.length > 0) {
          for (const item of dbResults) {
            const similarity = this.cosineSimilarity(queryEmbedding, item.embedding)
            if (similarity > 0.5) { // Threshold für Relevanz
              results.push({
                content: item.content,
                similarity,
                category: item.category,
                source: item.source,
                metadata: item.metadata
              })
            }
          }
        }
      } catch (dbError) {
        console.log('📝 Using fallback in-memory search')
      }

      // Fallback: In-Memory Search
      if (results.length === 0) {
        for (const item of this.saarlandKnowledge) {
          const itemEmbedding = await this.createEmbedding(item.content)
          const similarity = this.cosineSimilarity(queryEmbedding, itemEmbedding)
          
          if (similarity > 0.3) {
            results.push({
              content: item.content,
              similarity,
              category: item.category,
              source: item.source
            })
          }
        }
      }

      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
    } catch (error) {
      console.error('Similarity search failed:', error)
      return []
    }
  }

  // Erweitere Antwort mit Kontext
  async enhanceResponse(query: string, baseResponse: string): Promise<string> {
    try {
      const similarContent = await this.findSimilarContent(query, 2)
      
      if (similarContent.length === 0) {
        return baseResponse
      }

      let enhancedResponse = baseResponse

      // Füge relevanten Kontext hinzu
      const contextInfo = similarContent
        .filter(item => item.similarity > 0.6)
        .map(item => item.content)
        .join(' ')

      if (contextInfo) {
        enhancedResponse += `\n\n💡 **Zusätzliche Info:**\n${contextInfo}`
      }

      return enhancedResponse
    } catch (error) {
      console.error('Response enhancement failed:', error)
      return baseResponse
    }
  }

  // Categorize Query mit Embeddings
  async categorizeQuery(query: string): Promise<string> {
    try {
      const similarContent = await this.findSimilarContent(query, 1)
      
      if (similarContent.length > 0 && similarContent[0].similarity > 0.7) {
        return similarContent[0].category
      }

      // Fallback zu keyword-basierter Kategorisierung
      const keywords = query.toLowerCase()
      
      if (keywords.includes('hey') || keywords.includes('hallo') || keywords.includes('hi') || keywords.includes('guten tag')) return 'greeting'
      if (keywords.includes('agentland') || keywords.includes('lohnt sich') || keywords.includes('was ist das')) return 'agentland'
      if (keywords.includes('wetter') || keywords.includes('temperatur')) return 'weather'
      if (keywords.includes('fußball') || keywords.includes('sport')) return 'football'
      if (keywords.includes('nachhilfe') || keywords.includes('lernen')) return 'education'
      if (keywords.includes('verein') || keywords.includes('club')) return 'clubs'
      if (keywords.includes('schwimm') || keywords.includes('baden')) return 'tourism'
      if (keywords.includes('amt') || keywords.includes('behörde')) return 'administration'
      if (keywords.includes('förder') || keywords.includes('business')) return 'business'
      
      return 'general'
    } catch (error) {
      console.error('Query categorization failed:', error)
      return 'general'
    }
  }

  // Lerne aus User-Interaktionen
  async learnFromInteraction(query: string, response: string, userFeedback?: 'positive' | 'negative') {
    try {
      const embedding = await this.createEmbedding(query)
      
      await supabase.from('user_interactions').insert({
        query,
        response,
        feedback: userFeedback,
        embedding,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('Learning disabled - database not available')
    }
  }
}

// Initialisiere Service
export const embeddingsService = SaarlandEmbeddingsService.getInstance()

// Auto-initialize
if (typeof window === 'undefined') {
  embeddingsService.initializeKnowledgeBase()
}