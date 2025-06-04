import { NextRequest, NextResponse } from 'next/server'
import SaarlandMainAgent from '@/lib/agents/saarland-main-agent'
import { saarlandDataConnectors } from '@/lib/connectors/saarland-realtime-connectors'
import * as path from 'path'
import * as fs from 'fs'

export const dynamic = 'force-dynamic'

// DEEPSEEK AGENT API ENDPOINT
// Intelligente Antworten mit Echtzeit-Saarland-Daten + Service-specific Chat

let mainAgent: SaarlandMainAgent | null = null;

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DeepSeekServiceRequest {
  message: string
  serviceType: 'tourismus' | 'wirtschaft' | 'verwaltung' | 'bildung'
  sessionId: string
  context: Message[]
}

interface CanvasData {
  type: 'roadmap' | 'business_canvas' | 'checklist' | 'timeline' | 'map'
  title: string
  data: any
  exportable: boolean
}

// Agent initialisieren
function initializeAgent() {
  if (!mainAgent) {
    const config = {
      apiKey: process.env.DEEPSEEK_API_KEY || 'missing-key',
      model: 'deepseek-r1-0528',
      temperature: 0.1,
      maxTokens: 2000,
      contextCache: true
    };

    mainAgent = new SaarlandMainAgent(config);
    console.log('🤖 SaarlandMainAgent initialisiert');
  }
  return mainAgent;
}

// Load service configurations
async function loadServicePrompt(serviceType: string) {
  try {
    const promptPath = path.join(process.cwd(), '../../ai_docs/prompts/deepseek', `${serviceType}.json`)
    
    if (!fs.existsSync(promptPath)) {
      console.warn(`Prompt file not found: ${promptPath}`)
      return null
    }
    
    const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf8'))
    return promptData
  } catch (error) {
    console.error(`Error loading service prompt for ${serviceType}:`, error)
    return null
  }
}

// Generate canvas data based on response and service type
function generateCanvasData(content: string, serviceType: string): CanvasData | null {
  const canvasKeywords = {
    tourismus: ['route', 'plan', 'reise', 'tour', 'besuch'],
    wirtschaft: ['business', 'gründung', 'förder', 'plan', 'canvas'],
    verwaltung: ['schritt', 'antrag', 'formular', 'checkliste', 'behörde'],
    bildung: ['lern', 'studium', 'qualifikation', 'roadmap', 'plan']
  }

  const keywords = canvasKeywords[serviceType as keyof typeof canvasKeywords] || []
  const hasCanvasKeywords = keywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )

  if (!hasCanvasKeywords) return null

  // Generate appropriate canvas based on service type
  switch (serviceType) {
    case 'tourismus':
      return {
        type: 'roadmap',
        title: 'Ihre Saarland-Reiseroute',
        data: {
          steps: [
            { title: 'Anreise planen', description: 'Transport und Unterkunft', duration: '1 Tag' },
            { title: 'Hauptattraktionen', description: 'Saarschleife, Völklinger Hütte', duration: '2-3 Tage' },
            { title: 'Lokale Erlebnisse', description: 'Restaurants, Events, Kultur', duration: '1-2 Tage' }
          ]
        },
        exportable: true
      }

    case 'wirtschaft':
      return {
        type: 'business_canvas',
        title: 'Business Model Canvas - Saarland',
        data: {
          'Zielgruppen': ['KMUs', 'Startups', 'Grenzpendler'],
          'Wertversprechen': ['Lokale Förderung', 'Cross-Border', 'Innovation'],
          'Kanäle': ['Digital', 'Beratungsstellen', 'Events'],
          'Einnahmequellen': ['Produkte/Services', 'Fördermittel', 'Partnerschaften'],
          'Kostenstruktur': ['Personal', 'Marketing', 'Entwicklung'],
          'Ressourcen': ['Team', 'Technologie', 'Netzwerk']
        },
        exportable: true
      }

    case 'verwaltung':
      return {
        type: 'checklist',
        title: 'Behörden-Checkliste',
        data: {
          items: [
            { text: 'Zuständige Behörde ermitteln', completed: false, deadline: 'sofort' },
            { text: 'Erforderliche Dokumente sammeln', completed: false, deadline: '1 Woche' },
            { text: 'Termin vereinbaren', completed: false, deadline: '2 Wochen' },
            { text: 'Antrag einreichen', completed: false, deadline: '1 Monat' }
          ]
        },
        exportable: true
      }

    case 'bildung':
      return {
        type: 'timeline',
        title: 'Ihr Bildungsweg-Plan',
        data: {
          events: [
            { title: 'Analyse der aktuellen Situation', date: 'Woche 1', description: 'Bestandsaufnahme Qualifikationen' },
            { title: 'Recherche Bildungsmöglichkeiten', date: 'Woche 2-3', description: 'Programme und Förderungen finden' },
            { title: 'Bewerbungen vorbereiten', date: 'Woche 4-6', description: 'Unterlagen zusammenstellen' },
            { title: 'Start der Weiterbildung', date: 'Monat 3', description: 'Beginn des gewählten Programms' }
          ]
        },
        exportable: true
      }

    default:
      return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is a service-specific chat request
    if (body.message && body.serviceType && body.sessionId) {
      return await handleServiceChat(body, request)
    }
    
    // Legacy format: general agent query
    const { query, userContext, agentMode } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query ist erforderlich' },
        { status: 400 }
      );
    }

    // Agent initialisieren
    const agent = initializeAgent();

    // Prüfe ob DeepSeek API verfügbar
    const hasDeepSeekKey = !!process.env.DEEPSEEK_API_KEY;

    if (agentMode === 'status') {
      // System Status
      const systemStatus = await agent.getSystemStatus();
      const dataStatus = saarlandDataConnectors.getDataSourcesStatus();

      return NextResponse.json({
        success: true,
        hasDeepSeekKey,
        agentSystem: systemStatus,
        dataSources: dataStatus,
        timestamp: new Date().toISOString()
      });
    }

    if (agentMode === 'data-only') {
      // Nur Daten, keine KI-Verarbeitung
      const allData = await saarlandDataConnectors.fetchAllData();
      
      return NextResponse.json({
        success: true,
        data: allData,
        timestamp: new Date().toISOString()
      });
    }

    // Standard: KI-Verarbeitung mit DeepSeek
    console.log(`🧠 DeepSeek Query: "${query}"`);
    
    const startTime = Date.now();
    const response = await agent.processUserQuery(query, userContext);
    const processingTime = Date.now() - startTime;

    // Sammle relevante Daten für Kontext
    const relevantData = await getRelevantData(query);

    return NextResponse.json({
      success: true,
      response,
      hasDeepSeekKey,
      processingTime,
      relevantData,
      agent: 'deepseek-r1-0528',
      timestamp: new Date().toISOString(),
      userQuery: query
    });

  } catch (error) {
    console.error('DeepSeek Agent API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Agent-System vorübergehend nicht verfügbar',
      fallback: generateFallbackResponse(request),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET für System-Health
export async function GET(request: NextRequest) {
  try {
    const agent = initializeAgent();
    const systemStatus = await agent.getSystemStatus();
    
    return NextResponse.json({
      status: 'healthy',
      hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
      agentSystem: systemStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Service-specific chat handler
async function handleServiceChat(body: DeepSeekServiceRequest, request: NextRequest) {
  const { message, serviceType, sessionId, context } = body

  try {
    // Load service configuration
    const serviceConfig = await loadServicePrompt(serviceType)
    if (!serviceConfig) {
      return NextResponse.json(
        { error: `Service configuration not found for ${serviceType}` },
        { status: 500 }
      )
    }

    // Initialize agent
    const agent = initializeAgent()
    
    // Build context with service-specific persona
    const systemPrompt = `${serviceConfig.persona}

Kontext: ${serviceConfig.context}

Du hilfst bei: ${serviceConfig.service}

Capabilities:
${serviceConfig.capabilities.map((cap: string) => `- ${cap}`).join('\n')}

Aufgaben:
${serviceConfig.tasks.map((task: string) => `- ${task}`).join('\n')}

Datenquellen:
${serviceConfig.data_sources.map((source: string) => `- ${source}`).join('\n')}

Antworte im Stil: ${serviceConfig.response_style}
Sprache: ${serviceConfig.language}

WICHTIG: 
- Verwende nur echte, verlinkte Daten aus den angegebenen Quellen
- Erstelle Canvas-Daten wenn sinnvoll (Roadmaps, Checklisten, etc.)
- Antworte auf Deutsch und benutze lokale saarländische Bezüge
- Sei praktisch und handlungsorientiert`

    // Get relevant data for context
    const relevantData = await getRelevantData(message)

    // Enhanced user context with service type and relevant data
    const enhancedContext = {
      serviceType,
      sessionId,
      relevantData,
      previousMessages: context.slice(-3),
      timestamp: new Date().toISOString()
    }

    // Process with agent
    const startTime = Date.now()
    const response = await agent.processUserQuery(
      `${systemPrompt}\n\nUser Question: ${message}`, 
      enhancedContext
    )
    const processingTime = Date.now() - startTime

    // Generate canvas data if appropriate
    const canvas = generateCanvasData(response, serviceType)

    // Track analytics
    try {
      await fetch(`${request.nextUrl.origin}/api/realtime/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'deepseek_service_chat',
          service: serviceType,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        })
      })
    } catch (trackingError) {
      console.warn('Analytics tracking failed:', trackingError)
    }

    return NextResponse.json({
      content: response,
      canvas,
      metadata: {
        serviceType,
        sessionId,
        model: 'deepseek-r1-0528',
        processingTime,
        relevantData,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Service chat error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process service chat request',
        content: `Entschuldigung, es gab einen Fehler beim Verarbeiten deiner Anfrage zum Thema ${serviceType}. Bitte versuche es erneut.`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Hilfsfunktionen
async function getRelevantData(query: string): Promise<any> {
  const queryLower = query.toLowerCase();
  const relevantData: any = {};

  try {
    // Verkehrsdaten bei entsprechenden Queries
    if (queryLower.includes('verkehr') || queryLower.includes('stau') || 
        queryLower.includes('a6') || queryLower.includes('a620') ||
        queryLower.includes('park')) {
      relevantData.traffic = await saarlandDataConnectors.getTrafficData();
    }

    // Wetterdaten
    if (queryLower.includes('wetter') || queryLower.includes('temperatur') ||
        queryLower.includes('regen') || queryLower.includes('sonnig')) {
      relevantData.weather = await saarlandDataConnectors.getWeatherData();
    }

    // Events
    if (queryLower.includes('event') || queryLower.includes('konzert') ||
        queryLower.includes('heute') || queryLower.includes('veranstaltung')) {
      relevantData.events = await saarlandDataConnectors.getEventsData();
    }

    // Behörden
    if (queryLower.includes('amt') || queryLower.includes('warten') ||
        queryLower.includes('termin') || queryLower.includes('behörd')) {
      relevantData.government = await saarlandDataConnectors.getGovernmentData();
    }

    // Grenzpendler
    if (queryLower.includes('tanken') || queryLower.includes('grenze') ||
        queryLower.includes('pendler') || queryLower.includes('frankreich')) {
      relevantData.border = await saarlandDataConnectors.getPendlerData();
    }

  } catch (error) {
    console.error('Error gathering relevant data:', error);
  }

  return relevantData;
}

function generateFallbackResponse(request: NextRequest): string {
  // Einfacher Fallback ohne KI
  const currentTime = new Date().toLocaleString('de-DE', { 
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `🤖 Entschuldigung, das DeepSeek Agent-System ist gerade nicht verfügbar. 

**Aktuelle Zeit**: ${currentTime}
**Verfügbare Services**: 
- 🏛️ Behördenfinder (funktioniert ohne KI)
- 🗺️ Interaktive Karte 
- 📊 Basis-Datenabfrage

**Tipp**: Versuche es in wenigen Minuten erneut - die KI-Agents werden gerade neu gestartet!`;
}

// OPTIONS für CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}