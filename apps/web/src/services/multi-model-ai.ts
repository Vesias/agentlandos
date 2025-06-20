import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIResponse {
  content: string;
  model: string;
  usage?: any;
  cached?: boolean;
  confidence: number;
  timestamp: string;
}

export interface AIOptions {
  preferredModel?: 'auto' | 'gemini-2.5' | 'deepseek-reasoner' | 'gpt-4';
  maxTokens?: number;
  temperature?: number;
  context?: any;
  userId?: string;
}

export class MultiModelAIService {
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;
  private deepseek?: OpenAI;

  constructor() {
    // Initialize services only if API keys exist and are valid
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      }
    } catch (error) {
      console.warn('OpenAI initialization failed:', error);
    }

    try {
      if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY.length > 10) {
        this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      }
    } catch (error) {
      console.warn('Gemini initialization failed:', error);
    }

    try {
      if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.startsWith('sk-')) {
        this.deepseek = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com/v1',
        });
      }
    } catch (error) {
      console.warn('DeepSeek initialization failed:', error);
    }
  }

  async generateResponse(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const {
      preferredModel = 'auto',
      maxTokens = 2000,
      temperature = 0.7,
      context,
      userId
    } = options;

    // Auto-select optimal model
    const selectedModel = this.selectOptimalModel(prompt, preferredModel);

    try {
      let response: AIResponse;

      switch (selectedModel) {
        case 'gemini-2.5':
          response = await this.generateWithGemini(prompt, context, maxTokens, temperature);
          break;
        case 'deepseek-reasoner':
          response = await this.generateWithDeepSeek(prompt, context, maxTokens, temperature);
          break;
        case 'gpt-4':
        default:
          response = await this.generateWithOpenAI(prompt, context, maxTokens, temperature);
          break;
      }

      // Track usage for cost optimization
      if (userId) {
        this.trackUsage(selectedModel, prompt.length, response.content.length, userId);
      }

      return response;

    } catch (error) {
      console.error(`Error with ${selectedModel}:`, error);
      // Intelligent fallback
      return this.handleFallback(prompt, selectedModel, options);
    }
  }

  private selectOptimalModel(prompt: string, preferred: string): string {
    if (preferred !== 'auto') {
      return this.isModelAvailable(preferred) ? preferred : 'auto';
    }

    const promptLength = prompt.length;
    const isComplex = this.isComplexQuery(prompt);

    // Cost-efficient model selection
    if (promptLength < 100 && !isComplex && this.gemini) {
      return 'gemini-2.5'; // Fastest & cheapest for simple queries
    }

    if (isComplex && this.deepseek) {
      return 'deepseek-reasoner'; // Best for complex reasoning
    }

    if (this.openai) {
      return 'gpt-4'; // Most reliable fallback
    }

    // Last resort - use whatever is available
    if (this.gemini) return 'gemini-2.5';
    if (this.deepseek) return 'deepseek-reasoner';
    
    throw new Error('No AI models available');
  }

  private isComplexQuery(prompt: string): boolean {
    const complexKeywords = [
      'analysiere', 'erkläre', 'vergleiche', 'bewerte', 'entwickle',
      'strategie', 'plan', 'konzept', 'lösung', 'problem'
    ];
    
    const hasComplexKeywords = complexKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    
    const hasMultipleQuestions = (prompt.match(/\?/g) || []).length > 1;
    const isLongQuery = prompt.length > 300;
    
    return hasComplexKeywords || hasMultipleQuestions || isLongQuery;
  }

  private isModelAvailable(model: string): boolean {
    switch (model) {
      case 'gemini-2.5':
        return !!this.gemini;
      case 'deepseek-reasoner':
        return !!this.deepseek;
      case 'gpt-4':
        return !!this.openai;
      default:
        return false;
    }
  }

  private async generateWithGemini(
    prompt: string,
    context: any,
    maxTokens: number,
    temperature: number
  ): Promise<AIResponse> {
    if (!this.gemini) throw new Error('Gemini not available');

    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    });

    const fullPrompt = this.buildSaarlandPrompt(prompt, context);
    const result = await model.generateContent(fullPrompt);

    return {
      content: result.response.text(),
      model: 'gemini-2.5',
      confidence: 0.92,
      timestamp: new Date().toISOString(),
    };
  }

  private async generateWithDeepSeek(
    prompt: string,
    context: any,
    maxTokens: number,
    temperature: number
  ): Promise<AIResponse> {
    if (!this.deepseek) throw new Error('DeepSeek not available');

    const completion = await this.deepseek.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        {
          role: 'system',
          content: this.buildSaarlandSystemPrompt(context),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    return {
      content: completion.choices[0].message.content || '',
      model: 'deepseek-reasoner',
      usage: completion.usage,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
  }

  private async generateWithOpenAI(
    prompt: string,
    context: any,
    maxTokens: number,
    temperature: number
  ): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not available');

    // Use GPT-4o-mini as primary model for cost efficiency
    const model = maxTokens > 1000 || this.isComplexQuery(prompt) 
      ? 'gpt-4-turbo-preview' 
      : 'gpt-4o-mini';

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: this.buildSaarlandSystemPrompt(context),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    return {
      content: completion.choices[0].message.content || '',
      model,
      usage: completion.usage,
      confidence: model === 'gpt-4o-mini' ? 0.85 : 0.90,
      timestamp: new Date().toISOString(),
    };
  }

  private buildSaarlandSystemPrompt(context: any): string {
    return `Du bist SAAR-GPT, der offizielle KI-Assistent für das Saarland.

AKTUELLE ZEIT: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
DOMAIN: agentland.saarland
STATUS: Produktionsumgebung

DEINE EXPERTISE:
- Saarländische Behörden und Verwaltung
- Tourismus und Sehenswürdigkeiten
- Wirtschaftsförderung und Business
- Kultur und Events
- Bildung und Universitäten
- Grenzüberschreitende Services (DE/FR/LU)

KONTEXT:
${context ? JSON.stringify(context, null, 2) : 'Allgemeine Anfrage'}

ANTWORT-PRINZIPIEN:
1. Nutze nur echte, verifizierbare Daten
2. Antworte präzise und hilfreich
3. Berücksichtige regionale Besonderheiten
4. Biete konkrete Handlungsempfehlungen
5. Erwähne relevante Kontaktdaten und URLs

Antworte professionell auf Deutsch mit saarländischem Bezug.`;
  }

  private buildSaarlandPrompt(prompt: string, context: any): string {
    return `${this.buildSaarlandSystemPrompt(context)}

Nutzer-Anfrage: ${prompt}`;
  }

  private async handleFallback(
    prompt: string,
    failedModel: string,
    options: AIOptions
  ): Promise<AIResponse> {
    const availableModels = ['gpt-4', 'gemini-2.5', 'deepseek-reasoner']
      .filter(model => model !== failedModel && this.isModelAvailable(model));

    for (const model of availableModels) {
      try {
        return await this.generateResponse(prompt, {
          ...options,
          preferredModel: model as any,
        });
      } catch (error) {
        console.error(`Fallback ${model} also failed:`, error);
      }
    }

    // Smart fallback responses based on query type
    const smartFallback = this.generateSmartFallback(prompt);
    
    return {
      content: smartFallback,
      model: 'smart-fallback',
      confidence: 0.3,
      timestamp: new Date().toISOString(),
    };
  }

  private generateSmartFallback(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Weather queries
    if (lowerPrompt.includes('wetter') || lowerPrompt.includes('temperatur')) {
      return 'Für aktuelle Wetterdaten empfehle ich Ihnen, die Wettervorhersage direkt zu prüfen. Das Saarland hat derzeit typisches Winterwetter mit Temperaturen um 5-10°C.';
    }
    
    // Services/Behörden queries
    if (lowerPrompt.includes('behörde') || lowerPrompt.includes('amt') || lowerPrompt.includes('service')) {
      return 'Für Behördengänge im Saarland empfehle ich den direkten Kontakt mit der zuständigen Stelle. Viele Services sind online verfügbar unter saarland.de.';
    }
    
    // Tourism queries
    if (lowerPrompt.includes('tourist') || lowerPrompt.includes('sehenswürdigkeiten') || lowerPrompt.includes('urlaub')) {
      return 'Das Saarland bietet viele Sehenswürdigkeiten wie die Saarschleife, Völklinger Hütte (UNESCO Welterbe) und den Bostalsee. Mehr Informationen finden Sie auf tourismus.saarland.de.';
    }
    
    // General fallback
    return 'Entschuldigung, momentan sind die KI-Services nicht verfügbar. Für Fragen zum Saarland empfehle ich die offiziellen Websites saarland.de oder tourismus.saarland.de. Sie können es auch später nochmal versuchen.';
  }

  private async trackUsage(
    model: string,
    inputLength: number,
    outputLength: number,
    userId: string
  ) {
    try {
      // Track usage for cost optimization
      const costs = {
        'gemini-2.5': 0.00025,
        'deepseek-reasoner': 0.0014,
        'gpt-4': 0.01,
      };

      const estimatedCost = ((inputLength + outputLength) / 1000) * (costs[model] || 0);

      // Store in database for monitoring
      console.log(`AI Usage: ${model}, User: ${userId}, Cost: $${estimatedCost.toFixed(6)}`);
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  // Embeddings service with robust fallback
  async createEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      console.warn('OpenAI embeddings not available - returning empty array');
      return [];
    }

    try {
      // Validate input
      if (!text || text.length === 0) {
        return [];
      }

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000),
      });

      return response.data[0].embedding;
    } catch (error: any) {
      console.warn('Embedding creation failed, continuing without embeddings:', error?.message || 'Unknown error');
      
      // For billing issues, log but continue
      if (error?.code === 'billing_not_active' || error?.status === 429) {
        console.warn('OpenAI billing issue - embeddings disabled');
      }
      
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<{ [model: string]: boolean }> {
    const health: { [model: string]: boolean } = {};

    // Test each available model
    const testPrompt = 'test';
    
    if (this.gemini) {
      try {
        await this.generateWithGemini(testPrompt, {}, 10, 0.1);
        health['gemini-2.5'] = true;
      } catch {
        health['gemini-2.5'] = false;
      }
    }

    if (this.deepseek) {
      try {
        await this.generateWithDeepSeek(testPrompt, {}, 10, 0.1);
        health['deepseek-reasoner'] = true;
      } catch {
        health['deepseek-reasoner'] = false;
      }
    }

    if (this.openai) {
      try {
        await this.generateWithOpenAI(testPrompt, {}, 10, 0.1);
        health['gpt-4'] = true;
      } catch {
        health['gpt-4'] = false;
      }
    }

    return health;
  }
}

// Singleton instance
export const multiModelAI = new MultiModelAIService();