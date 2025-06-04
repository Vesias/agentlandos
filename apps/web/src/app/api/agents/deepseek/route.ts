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
    
    // Check if this is a canvas planning request
    if (body.mode === 'canvas_planning') {
      return await handleCanvasPlanning(body, request)
    }
    
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

// Canvas planning handler with DeepSeek reasoning
async function handleCanvasPlanning(body: any, request: NextRequest) {
  const { message, service, context, format } = body
  
  try {
    // Load service-specific prompt for canvas mode
    const serviceConfig = await loadServicePrompt(service)
    
    if (!serviceConfig || !serviceConfig.canvas_mode) {
      return NextResponse.json(
        { error: `Canvas mode not supported for service: ${service}` },
        { status: 400 }
      )
    }

    const agent = initializeAgent()
    
    // Enhanced canvas planning system prompt
    const canvasPrompt = `${serviceConfig.persona}
    
Du bist jetzt im CANVAS PLANNING MODE für ${service.toUpperCase()}.

Deine Aufgabe: Erstelle einen strukturierten, visuellen Plan basierend auf der Nutzer-Anfrage.

SERVICE CONTEXT: ${serviceConfig.context}

CANVAS FEATURES VERFÜGBAR:
${serviceConfig.deepseek_integration.canvas_features.map((feature: string) => `- ${feature}`).join('\n')}

SPEZIELLE TOOLS:
${serviceConfig.tools.map((tool: string) => `- ${tool}`).join('\n')}

DATENQUELLEN FÜR ECHTE INHALTE:
${serviceConfig.data_sources.map((source: string) => `- ${source}`).join('\n')}

OUTPUT FORMAT: Strukturierte Planungsschritte als JSON Array mit folgender Struktur:
{
  "planning_steps": [
    "Schritt 1: Konkrete Aktion mit echten Saarland-Bezügen",
    "Schritt 2: Zeitbasierte Planung mit echten Terminen/Deadlines",
    "Schritt 3: Ressourcen und Tools mit echten Links/Kontakten",
    "Schritt 4: Umsetzung mit praktischen Next Steps",
    "Schritt 5: Monitoring und Erfolgsmessung"
  ],
  "canvas_type": "${service}_planning",
  "enhanced_data": {
    "key_resources": ["echte URLs und Kontakte"],
    "timelines": ["konkrete Deadlines"],
    "costs": ["realistische Kostenangaben"],
    "alternatives": ["Backup-Optionen"]
  }
}

WICHTIG:
- Nutze die ${serviceConfig.special_knowledge.join(', ')} 
- Alle Schritte müssen UMSETZBAR und SPEZIFISCH für das Saarland sein
- Berücksichtige aktuelle Events und Termine (Juni 2025)
- Verwende echte Institutionen und Ansprechpartner
- Erstelle VISUELLE Planungsstrukturen, die im Canvas darstellbar sind

USER ANFRAGE: "${message}"

Antworte NUR mit dem JSON Structure für die Canvas-Darstellung:`

    // Get relevant data for context
    const relevantData = await getRelevantData(message)
    
    // Process with DeepSeek reasoning
    const startTime = Date.now()
    const response = await agent.processUserQuery(canvasPrompt, {
      service,
      mode: 'canvas_planning',
      context,
      relevantData,
      timestamp: new Date().toISOString()
    })
    const processingTime = Date.now() - startTime

    // Try to parse JSON response, fallback to manual parsing
    let planningData
    try {
      planningData = JSON.parse(response)
    } catch (parseError) {
      // Fallback: extract planning steps from text response
      console.warn('Could not parse JSON response, using text extraction fallback')
      planningData = extractPlanningStepsFromText(response, service)
    }

    // Ensure we have proper planning steps
    if (!planningData.planning_steps || !Array.isArray(planningData.planning_steps)) {
      planningData = generateFallbackPlanningSteps(message, service, relevantData)
    }

    // Track canvas usage
    try {
      await fetch(`${request.nextUrl.origin}/api/realtime/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'canvas_planning_generated',
          service,
          prompt: message,
          steps_count: planningData.planning_steps.length,
          timestamp: new Date().toISOString()
        })
      })
    } catch (trackingError) {
      console.warn('Analytics tracking failed:', trackingError)
    }

    return NextResponse.json({
      success: true,
      planning_steps: planningData.planning_steps,
      canvas_type: planningData.canvas_type || `${service}_planning`,
      enhanced_data: planningData.enhanced_data || {},
      metadata: {
        service,
        model: 'deepseek-r1-0528',
        processingTime,
        relevantData,
        ai_enhanced: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Canvas planning error:', error)
    
    // Generate intelligent fallback
    const fallbackPlan = generateFallbackPlanningSteps(message, service, {})
    
    return NextResponse.json({
      success: true,
      planning_steps: fallbackPlan.planning_steps,
      canvas_type: `${service}_planning`,
      enhanced_data: fallbackPlan.enhanced_data || {},
      metadata: {
        service,
        model: 'fallback',
        ai_enhanced: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
}

// Helper function to extract planning steps from text response
function extractPlanningStepsFromText(text: string, service: string) {
  const lines = text.split('\n').filter(line => line.trim())
  const steps = []
  
  for (const line of lines) {
    if (line.match(/^\d+\.|^-|^•/) && line.length > 10) {
      steps.push(line.replace(/^\d+\.\s*|^-\s*|^•\s*/, '').trim())
    }
  }
  
  if (steps.length === 0) {
    return generateFallbackPlanningSteps('Allgemeine Planung', service, {})
  }
  
  return {
    planning_steps: steps.slice(0, 8), // Max 8 steps for canvas clarity
    canvas_type: `${service}_planning`,
    enhanced_data: { source: 'text_extraction' }
  }
}

// Intelligent fallback planning based on service type and prompt analysis
function generateFallbackPlanningSteps(prompt: string, service: string, relevantData: any) {
  const keywords = prompt.toLowerCase()
  
  const serviceSteps = {
    tourism: keywords.includes('sommer') || keywords.includes('outdoor') ? [
      'Aktuelle Wetter-Prognose für Outdoor-Aktivitäten prüfen',
      'Saarschleife & Baumwipfelpfad: Öffnungszeiten & Tickets',
      'Völklinger Hütte Sommer-Programm recherchieren',
      'Bostalsee Wassersport & Strandbad: Anfahrt planen',
      'Saarland Open Air Festival (07.-09.06.) - Tickets prüfen',
      'Restaurant-Reservierungen für Outdoor-Terrassen',
      'Transport & Parkplätze für Sommer-Hotspots',
      'Backup-Pläne bei schlechtem Wetter (Museen, Indoor)'
    ] : [
      'Reiseziele & Sehenswürdigkeiten nach Interessen auswählen',
      'Termine & Öffnungszeiten der gewählten Attraktionen prüfen',
      'Kosten kalkulieren: Eintritt, Transport, Verpflegung',
      'Route optimieren: Anfahrt, Parkplätze, Gehzeiten',
      'Buchungen vornehmen: Hotels, Restaurants, Tickets',
      'Backup-Optionen für schlechtes Wetter definieren',
      'Packliste erstellen: Kamera, bequeme Schuhe, etc.',
      'Lokale Events & Festivals während des Aufenthalts prüfen'
    ],
    
    business: keywords.includes('ki') || keywords.includes('digital') ? [
      'KI-Förderprogramme mit 50% Bonus identifizieren',
      'Saarland Innovation 2025: Antrag bis 31.08.2025 vorbereiten',
      'Green Tech & KI Hybrid Förderung (bis 250.000€) prüfen',
      'Business Plan mit KI-Marktanalyse erstellen',
      'DFKI Saarbrücken: Praxispartnerschaft anfragen',
      'Digitalisierungsbonus Plus beantragen (bis 35.000€)',
      'saar.is Innovation: Kostenlose Erstberatung buchen',
      'Schnellverfahren für KI-Projekte (4 statt 8 Wochen) nutzen'
    ] : [
      'Passende Förderprogramme für Gründung/Expansion identifizieren',
      'IHK Saarland: Kostenlose Erstberatung & Business Plan Check',
      'Rechtliche Anforderungen klären: Rechtsform, Gewerbeanmeldung',
      'Finanzierungsplan erstellen: Eigenkapital, Fördermittel, Kredite',
      'Standort & Räumlichkeiten: Gewerbegebiete, Co-Working Spaces',
      'Team & Fachkräfte: Recruiting-Strategien für das Saarland',
      'Marketing & Vertrieb: Lokale Netzwerke, Cross-Border Chancen',
      'Monitoring & Meilensteine: KPIs, Reporting, Erfolgsmessung'
    ],
    
    education: keywords.includes('ki') || keywords.includes('master') ? [
      'KI-Master UdS: Bewerbungsunterlagen bis 15.07.2025 einreichen',
      'Online-Assessment bis 30.06.2025 absolvieren',
      'Saarland Digital Stipendium (950€/Monat) beantragen',
      'KI-Excellence Stipendium (1.200€/Monat) für Top 10% prüfen',
      'DFKI-Forschungsstipendien & Praktika recherchieren',
      'Praxispartner: SAP, Software AG - Kontakte knüpfen',
      'Finanzierung: Weitere Stipendien & Nebenjobs organisieren',
      'Vorbereitung: Mathematik, Programmierung, KI-Grundlagen auffrischen'
    ] : [
      'Bildungsziele & gewünschte Qualifikationen definieren',
      'Verfügbare Programme: UdS, htw saar, Weiterbildung recherchieren',
      'Finanzierung: Stipendien, BAföG, Bildungsgutschein prüfen',
      'Bewerbungsvoraussetzungen & Deadlines sammeln',
      'Bewerbungsunterlagen vorbereiten: Zeugnisse, Motivation, etc.',
      'Alternative Programme & Backup-Optionen identifizieren',
      'Zeitplanung: Studium/Ausbildung mit Beruf/Familie vereinbaren',
      'Unterstützung: Beratungsstellen, Mentoren, Lerngruppen finden'
    ],
    
    admin: [
      'Zuständige Behörde für Ihr Anliegen identifizieren',
      'Erforderliche Dokumente & Unterlagen sammeln',
      'Express-Termin über neue Saarland-App buchen',
      'KI-Assistent 24/7 für Vorab-Beratung nutzen',
      'Anträge online ausfüllen: Digitale Services bevorzugen',
      'Termine wahrnehmen: Live-Tracking für Wartezeiten',
      'Nachverfolgung: Status-Updates & Bearbeitungsstand prüfen',
      'Digitale Unterschrift aktivieren für künftige Anträge'
    ],
    
    culture: keywords.includes('sommer') || keywords.includes('juni') ? [
      'Saarland Open Air Festival (07.-09.06.): Tickets & Programm',
      'Shakespeare im Park: Abendvorstellungen 20:00 Uhr buchen',
      'Jazz unter Sternen: Samstags 21:00 in Alter Feuerwache',
      'Digital Art Festival: KI-Symphonie Weltpremiere 15.06.',
      'Sommernachtsmärkte: Jeden Freitag in der Altstadt',
      'Open Air Kino im Stadtpark: Filmprogramm prüfen',
      'Transport & Anfahrt für Abendveranstaltungen planen',
      'Wetter-Backup: Indoor-Alternativen für Open Air Events'
    ] : [
      'Kulturkalender Saarland: Events & Termine recherchieren',
      'Tickets & Reservierungen: Frühbucher-Rabatte nutzen',
      'Theater, Konzerte, Museen: Abonnements & Kulturpässe prüfen',
      'Transport & Anfahrt: ÖPNV, Parkplätze, Kulturshuttles',
      'Budget planen: Eintritt, Getränke, evtl. Übernachtung',
      'Begleitprogramm: Führungen, Workshops, Meet & Greets',
      'Alternative Termine: Backup-Events bei Absagen',
      'Kulturreise erweitern: Kombinationen mit Gastronomie & Shopping'
    ]
  }
  
  const steps = serviceSteps[service as keyof typeof serviceSteps] || serviceSteps.admin
  
  return {
    planning_steps: steps,
    canvas_type: `${service}_planning`,
    enhanced_data: {
      key_resources: ['Saarland.de', 'IHK Saarland', 'Tourismus Zentrale Saarland'],
      timelines: ['2-4 Wochen', 'Sofort verfügbar', 'Saison-abhängig'],
      costs: ['Kostenlos bis 50€', 'Förderungen verfügbar', 'Premium Services €10/Monat'],
      alternatives: ['Online-Services', 'Beratungsstellen', 'Mobile Apps']
    }
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