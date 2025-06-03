import { NextRequest, NextResponse } from 'next/server'
import SaarlandMainAgent from '@/lib/agents/saarland-main-agent'
import { saarlandDataConnectors } from '@/lib/connectors/saarland-realtime-connectors'

// DEEPSEEK AGENT API ENDPOINT
// Intelligente Antworten mit Echtzeit-Saarland-Daten

let mainAgent: SaarlandMainAgent | null = null;

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

export async function POST(request: NextRequest) {
  try {
    const { query, userContext, agentMode } = await request.json();

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