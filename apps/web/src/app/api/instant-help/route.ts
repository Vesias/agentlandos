import { NextRequest, NextResponse } from 'next/server'
import { enhancedAI } from '@/services/ai/enhanced-ai-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface InstantHelpRequest {
  query: string
  category?: string
  urgent?: boolean
  location?: string
}

interface Solution {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  urgency: 'low' | 'medium' | 'high'
  estimatedTime: string
  nextSteps?: string[]
  contacts?: any[]
  relatedLinks?: any[]
  confidence: number
  source: 'knowledge_base' | 'ai_generated' | 'hybrid'
}

// Comprehensive Saarland Knowledge Base
const SAARLAND_KNOWLEDGE_BASE = {
  business: {
    'gewerbe_anmeldung': {
      question: 'Wie melde ich ein Gewerbe im Saarland an?',
      answer: `**Gewerbeanmeldung im Saarland - Kompletter Leitfaden:**

**📋 Vorbereitung (5-10 Minuten):**
• Personalausweis oder Reisepass
• Genaue Geschäftstätigkeit definieren
• Betriebsstätte-Adresse festlegen
• Bei Handwerk: Qualifikationsnachweis

**💻 Online-Anmeldung (15-20 Minuten):**
• Portal: www.saarland.de/gewerbeamt
• Gewerbeamt Saarbrücken: online 24/7 verfügbar
• Andere Gemeinden: Öffnungszeiten beachten
• Gebühr: 15-65€ (je nach Gemeinde)

**📝 Erforderliche Angaben:**
• Persönliche Daten
• Art der Geschäftstätigkeit (detailliert)
• Betriebsstätte und Niederlassung
• Anzahl der Beschäftigten
• Bei Personengesellschaften: alle Gesellschafter

**⚡ Nach der Anmeldung (automatisch):**
• Finanzamt erhält Mitteilung (Steuernummer)
• IHK/HWK-Mitgliedschaft wird geprüft
• Berufsgenossenschaft-Anmeldung erforderlich
• Gewerbeschein per Post oder Download

**🔄 Cross-Border Besonderheiten:**
• EU-Bürger: keine zusätzlichen Voraussetzungen
• Grenzgänger FR/LU: steuerliche Besonderheiten beachten
• Beratung: Grenzgänger-Service verfügbar

**💡 Pro-Tipps:**
• Kleinunternehmerregelung prüfen (bis 22.000€)
• Betriebshaftpflicht sofort abschließen
• Geschäftskonto eröffnen
• Buchhaltungssoftware organisieren`,
      category: 'Business',
      tags: ['gewerbe', 'anmeldung', 'selbstständigkeit', 'unternehmen', 'saarland'],
      urgency: 'medium',
      estimatedTime: '30-45 Min',
      nextSteps: [
        'Unterlagen zusammenstellen',
        'Online-Portal aufrufen',
        'Formular vollständig ausfüllen',
        'Gebühr bezahlen',
        'Gewerbeschein herunterladen',
        'Finanzamt kontaktieren'
      ],
      contacts: [
        { type: 'phone', label: 'Gewerbeamt Saarbrücken', value: '0681 905-1234' },
        { type: 'email', label: 'Gewerbeamt Email', value: 'gewerbeamt@saarbruecken.de' },
        { type: 'web', label: 'Online-Portal', value: 'www.saarland.de/gewerbeamt' }
      ],
      relatedLinks: [
        { label: 'IHK Saarland', url: 'https://www.saarland.ihk.de' },
        { label: 'HWK Saarland', url: 'https://www.hwk-saarland.de' }
      ]
    },
    'finanzierung': {
      question: 'Welche Finanzierungsmöglichkeiten gibt es für Unternehmen im Saarland?',
      answer: `**Finanzierung für Saarländische Unternehmen:**

**🏦 Staatliche Förderungen:**
• **KfW-Gründerkredit:** 0,87% Zinssatz, bis 100.000€
• **SIKB-Förderung:** Saarländische Investitionskreditbank
• **EU-Strukturfonds:** Bis zu 50% Zuschuss
• **EXIST-Gründerstipendium:** 12 Monate Finanzierung

**💰 Regionale Programme:**
• **Saarland Innovation:** Tech-Startups bis 250.000€
• **Digitalisierungsbonus:** 50% Zuschuss für IT-Projekte
• **Cross-Border-Fonds:** FR/LU Grenzregion Förderung

**👥 Private Finanzierung:**
• **Business Angels Saar:** Risikokapital + Mentoring
• **Crowdfunding-Plattformen:** Startnext, Kickstarter
• **P2P-Kredite:** Schnelle Finanzierung ohne Bank

**🎯 Branchenspezifisch:**
• **Automotive:** Zulieferer-Förderung (Ford, ZF)
• **IT/Software:** Digital Hub Förderung
• **Gesundheitswirtschaft:** Life Sciences Fonds
• **Tourismus:** LEADER-Programme

**⚡ Express-Finanzierung (48h):**
• Mikrokredit bis 25.000€
• Factoring für Liquidität
• Leasing-Optionen`,
      category: 'Business',
      tags: ['finanzierung', 'förderung', 'kredit', 'startup', 'kfw'],
      urgency: 'high',
      estimatedTime: '45-60 Min',
      nextSteps: [
        'Finanzierungsbedarf kalkulieren',
        'Businessplan erstellen',
        'Beratungstermin vereinbaren',
        'Anträge vorbereiten',
        'Unterlagen einreichen'
      ],
      contacts: [
        { type: 'phone', label: 'SIKB Hotline', value: '0681 9520-0' },
        { type: 'phone', label: 'KfW Beratung', value: '0800 539-9002' },
        { type: 'email', label: 'Gründungsberatung', value: 'gruendung@saarland.de' }
      ]
    }
  },
  
  tourism: {
    'sehenswuerdigkeiten': {
      question: 'Was sind die Top-Sehenswürdigkeiten im Saarland?',
      answer: `**Die schönsten Orte im Saarland:**

**🏭 UNESCO Welterbe:**
• **Völklinger Hütte:** Industriedenkmal, täglich 10-19 Uhr
• **Führungen:** 11, 14, 16 Uhr (DE), 15 Uhr (EN/FR)
• **Besonderheit:** Einziges Industriedenkmal UNESCO-Status

**🌿 Naturhighlights:**
• **Saarschleife Mettlach:** Wahrzeichen mit Baumwipfelpfad
• **Bliesgau Biosphärenreservat:** 36.000 Hektar Natur
• **Litermont Gipfeltour:** Rundweg mit Aussichtsturm
• **Losheimer Stausee:** Wassersport und Erholung

**🏰 Kultur & Geschichte:**
• **Saarbrücker Schloss:** Barockes Residenzschloss
• **Römermuseum Schwarzenacker:** Antike Siedlung
• **Burg Montclair:** Ruine mit Panoramablick
• **St. Wendeler Dom:** Gotische Basilika

**🍷 Kulinarik & Genuss:**
• **Saarländische Spezialitäten:** Dibbelabbes, Lyoner
• **Weinwanderwege:** Moselweine, 45 Min nach Trier
• **Brauereitouren:** Karlsberg, Püttlinger

**🚗 Cross-Border Highlights:**
• **Metz (FR):** 60 Min, Centre Pompidou
• **Luxemburg Stadt:** 90 Min, europäische Kultur
• **Trier:** 60 Min, älteste Stadt Deutschlands

**📱 Digital erleben:**
• AR-App "Saarland History"
• QR-Code Trails
• GPS-Touren verfügbar`,
      category: 'Tourism',
      tags: ['sehenswürdigkeiten', 'unesco', 'natur', 'kultur', 'ausflug'],
      urgency: 'low',
      estimatedTime: '10 Min',
      contacts: [
        { type: 'phone', label: 'Tourismus-Zentrale', value: '0681 92720-0' },
        { type: 'web', label: 'Saarland Tourismus', value: 'www.urlaub.saarland' }
      ]
    }
  },

  education: {
    'weiterbildung_foerderung': {
      question: 'Welche Weiterbildungsförderung gibt es im Saarland?',
      answer: `**Weiterbildungsförderung im Saarland - Vollständiger Überblick:**

**💰 Bildungsprämie (Bundesweit):**
• **Prämiengutschein:** 50% Übernahme, max. 500€
• **Spargutschein:** Vorzeitige Verwendung Vermögenswirksame Leistungen
• **Voraussetzung:** Jahreseinkommen unter 20.000€ (40.000€ verheiratet)

**🚀 Aufstiegs-BAföG (AFBG):**
• **Vollzeitmaßnahmen:** Bis zu 892€/Monat Unterhaltsbeitrag
• **Lehrgangsgebühren:** 64% Zuschuss + zinsgünstiges Darlehen
• **Prüfungsgebühren:** 64% Zuschuss
• **Meisterbonus:** 4.000€ bei erfolgreichem Abschluss

**📚 Saarländische Programme:**
• **Weiterbildungscheck:** 50% Förderung bis 1.500€
• **Qualifizierungsoffensive:** Branchenspezifische Weiterbildung
• **Digital Skills:** IT-Weiterbildung 80% gefördert

**🌍 EU-Programme:**
• **Erasmus+ Erwachsenenbildung:** Internationale Fortbildung
• **ESF-Förderung:** Europäischer Sozialfonds
• **Interreg:** Grenzüberschreitende Weiterbildung

**⚡ Express-Verfahren:**
• Online-Antrag: www.weiterbildung.saarland.de
• Bearbeitungszeit: 2-3 Wochen
• Sofortiger Kursbeginn nach Bewilligung

**🎯 Branchenspezifisch:**
• **IT/Digital:** Bis zu 90% Förderung
• **Gesundheitswesen:** Spezielle Fachkräfte-Programme
• **Automotive:** Transformation zu E-Mobility
• **Grenzgänger:** Französische/Luxemburger Programme kombinierbar`,
      category: 'Education',
      tags: ['weiterbildung', 'förderung', 'bildung', 'aufstiegs-bafög', 'qualifizierung'],
      urgency: 'medium',
      estimatedTime: '20 Min',
      nextSteps: [
        'Förderfähigkeit prüfen',
        'Kurse recherchieren',
        'Beratungstermin vereinbaren',
        'Antrag stellen',
        'Kurs buchen'
      ],
      contacts: [
        { type: 'phone', label: 'Bildungsberatung Saar', value: '0681 501-2345' },
        { type: 'email', label: 'Weiterbildung Info', value: 'info@weiterbildung.saarland.de' },
        { type: 'web', label: 'Online-Portal', value: 'www.weiterbildung.saarland.de' }
      ]
    }
  },

  administration: {
    'buergerservice_online': {
      question: 'Welche Behördenleistungen kann ich online erledigen?',
      answer: `**Online-Services der Saarländischen Verwaltung:**

**🏛️ Bürgerdienste Online:**
• **Personalausweis:** Verlängerung und Terminbuchung
• **Meldewesen:** Ummeldung, Abmeldung digital
• **Führungszeugnis:** Online beantragen, 13€
• **Gewerbeanmeldung:** Vollständig digital möglich

**🚗 Kfz-Services:**
• **Fahrzeug anmelden:** Online-Reservierung + Vor-Ort-Termin
• **Kennzeichenreservierung:** Wunschkennzeichen
• **Adressänderung:** Bei Umzug automatisch möglich

**💼 Unternehmensservices:**
• **Handelsregister:** Einsicht und Auszüge
• **Steuerliche Anmeldung:** ELSTER-Integration
• **Bauanträge:** Digitale Einreichung möglich
• **Umweltauflagen:** Online-Meldungen

**📋 Sozialleistungen:**
• **Wohngeld:** Antrag und Berechnung online
• **Kindergeld:** Familienkasse digital
• **BAföG:** Online-Antrag für Studierende

**🌐 EU-Services (Cross-Border):**
• **A1-Bescheinigung:** Grenzgänger-Sozialversicherung
• **Europäische Krankenversicherungskarte**
• **EURES:** Jobsuche in FR/LU/DE

**⚡ 24/7 verfügbare Services:**
• Portal: www.saarland.de/buergerservice
• App: "Saarland Digital"
• PayPal/Kreditkarte/Lastschrift

**🔐 Sicherheit:**
• eID-Funktion des Personalausweises
• ELSTER-Zertifikat
• DE-Mail für rechtssichere Kommunikation`,
      category: 'Administration',
      tags: ['bürgerservice', 'online', 'digital', 'behörden', 'e-government'],
      urgency: 'medium',
      estimatedTime: '15 Min',
      nextSteps: [
        'Benutzerkonto erstellen',
        'eID aktivieren',
        'Service auswählen',
        'Online-Antrag ausfüllen',
        'Digital bezahlen'
      ],
      contacts: [
        { type: 'phone', label: 'Digital-Hotline', value: '0681 501-0' },
        { type: 'web', label: 'Online-Portal', value: 'www.saarland.de/buergerservice' }
      ]
    }
  }
}

// AI-Enhanced Solution Matching
async function findBestSolutions(query: string, category?: string): Promise<Solution[]> {
  const startTime = Date.now()
  const solutions: Solution[] = []
  
  // 1. Exact Knowledge Base Match
  const knowledgeMatches = searchKnowledgeBase(query, category)
  solutions.push(...knowledgeMatches)
  
  // 2. AI-Enhanced Search if no perfect matches
  if (solutions.length === 0 || query.length > 50) {
    try {
      const aiSolution = await generateAISolution(query, category)
      if (aiSolution) {
        solutions.push(aiSolution)
      }
    } catch (error) {
      console.error('AI solution generation failed:', error)
    }
  }
  
  // 3. Fuzzy search for partial matches
  if (solutions.length < 3) {
    const fuzzyMatches = fuzzySearchKnowledgeBase(query)
    solutions.push(...fuzzyMatches.slice(0, 3 - solutions.length))
  }
  
  // Sort by confidence and relevance
  return solutions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5) // Max 5 solutions
}

function searchKnowledgeBase(query: string, category?: string): Solution[] {
  const solutions: Solution[] = []
  const queryLower = query.toLowerCase()
  
  Object.entries(SAARLAND_KNOWLEDGE_BASE).forEach(([cat, items]) => {
    if (category && category !== 'all' && cat !== category.toLowerCase()) return
    
    Object.entries(items).forEach(([key, item]) => {
      const relevanceScore = calculateRelevance(queryLower, item)
      
      if (relevanceScore > 0.3) {
        solutions.push({
          id: `kb_${cat}_${key}`,
          ...item,
          confidence: relevanceScore,
          source: 'knowledge_base'
        })
      }
    })
  })
  
  return solutions
}

function calculateRelevance(query: string, item: any): number {
  let score = 0
  
  // Question match (highest weight)
  if (item.question.toLowerCase().includes(query)) score += 0.8
  
  // Tags match (high weight)
  const tagMatches = item.tags.filter((tag: string) => 
    query.includes(tag.toLowerCase()) || tag.toLowerCase().includes(query)
  )
  score += tagMatches.length * 0.3
  
  // Answer content match (medium weight)
  if (item.answer.toLowerCase().includes(query)) score += 0.2
  
  // Category boost
  if (item.category.toLowerCase().includes(query)) score += 0.1
  
  return Math.min(score, 1.0)
}

function fuzzySearchKnowledgeBase(query: string): Solution[] {
  const solutions: Solution[] = []
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 3)
  
  Object.entries(SAARLAND_KNOWLEDGE_BASE).forEach(([cat, items]) => {
    Object.entries(items).forEach(([key, item]) => {
      let wordMatches = 0
      queryWords.forEach(word => {
        if (item.question.toLowerCase().includes(word) || 
            item.tags.some((tag: string) => tag.toLowerCase().includes(word))) {
          wordMatches++
        }
      })
      
      if (wordMatches > 0) {
        const confidence = wordMatches / queryWords.length * 0.6
        solutions.push({
          id: `fuzzy_${cat}_${key}`,
          ...item,
          confidence,
          source: 'knowledge_base'
        })
      }
    })
  })
  
  return solutions
}

async function generateAISolution(query: string, category?: string): Promise<Solution | null> {
  try {
    const systemPrompt = `Du bist ein Experte für Saarland-Services. Erstelle eine strukturierte, hilfreiche Antwort für die Frage: "${query}"

KONTEXT: ${category ? `Kategorie: ${category}` : 'Allgemeine Anfrage'}

Antworte im folgenden Format:
ANTWORT: [Detaillierte, strukturierte Antwort mit Bulletpoints, praktischen Schritten und konkreten Informationen]
KATEGORIE: [Business|Tourism|Education|Administration|Culture]
DRINGLICHKEIT: [low|medium|high]
ZEITAUFWAND: [z.B. "15 Min"]
NÄCHSTE_SCHRITTE: [3-5 konkrete Schritte, getrennt durch |]
TAGS: [5-7 relevante Tags, getrennt durch |]

Fokussiere auf Saarland-spezifische Informationen, Cross-Border-Aspekte (FR/LU) und praktische Umsetzung.`

    const response = await enhancedAI.processQuery(query, 'chat', category || 'general', { system: systemPrompt })
    
    if (response.response) {
      return parseAIResponse(response.response, query)
    }
  } catch (error) {
    console.error('AI generation error:', error)
  }
  
  return null
}

function parseAIResponse(aiResponse: string, originalQuery: string): Solution {
  const lines = aiResponse.split('\n')
  let answer = ''
  let category = 'General'
  let urgency: 'low' | 'medium' | 'high' = 'medium'
  let estimatedTime = '10 Min'
  let nextSteps: string[] = []
  let tags: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('ANTWORT:')) {
      answer = trimmed.substring(8).trim()
    } else if (trimmed.startsWith('KATEGORIE:')) {
      category = trimmed.substring(10).trim()
    } else if (trimmed.startsWith('DRINGLICHKEIT:')) {
      const urgencyStr = trimmed.substring(14).trim() as 'low' | 'medium' | 'high'
      if (['low', 'medium', 'high'].includes(urgencyStr)) {
        urgency = urgencyStr
      }
    } else if (trimmed.startsWith('ZEITAUFWAND:')) {
      estimatedTime = trimmed.substring(12).trim()
    } else if (trimmed.startsWith('NÄCHSTE_SCHRITTE:')) {
      nextSteps = trimmed.substring(17).trim().split('|').map(s => s.trim()).filter(s => s)
    } else if (trimmed.startsWith('TAGS:')) {
      tags = trimmed.substring(5).trim().split('|').map(s => s.trim()).filter(s => s)
    } else if (!trimmed.includes(':') && trimmed.length > 0) {
      answer += '\n' + trimmed
    }
  })
  
  // Fallback if parsing failed
  if (!answer || answer.length < 50) {
    answer = aiResponse
  }
  
  return {
    id: `ai_${Date.now()}`,
    question: originalQuery,
    answer: answer.trim(),
    category,
    tags: tags.length > 0 ? tags : ['ki-generiert', 'saarland', 'hilfe'],
    urgency,
    estimatedTime,
    nextSteps: nextSteps.length > 0 ? nextSteps : ['Weitere Informationen sammeln', 'Bei Bedarf Experten kontaktieren'],
    confidence: 0.7,
    source: 'ai_generated',
    contacts: [
      { type: 'web', label: 'AGENTLAND.SAARLAND', value: 'https://agentland.saarland' }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, category, urgent, location }: InstantHelpRequest = await request.json()
    
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        error: 'Bitte geben Sie eine Frage mit mindestens 3 Zeichen ein.' 
      }, { status: 400 })
    }
    
    const startTime = Date.now()
    
    // Find best matching solutions
    const solutions = await findBestSolutions(query.trim(), category)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      solutions,
      metadata: {
        query,
        category: category || 'all',
        total_solutions: solutions.length,
        processing_time_ms: processingTime,
        has_ai_generated: solutions.some(s => s.source === 'ai_generated'),
        average_confidence: solutions.length > 0 ? 
          solutions.reduce((sum, s) => sum + s.confidence, 0) / solutions.length : 0,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Instant Help API error:', error)
    return NextResponse.json({ 
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const test = url.searchParams.get('test')
  
  if (test === 'health') {
    try {
      // Test knowledge base
      const kbTest = searchKnowledgeBase('gewerbe anmeldung')
      
      // Test AI generation
      const aiTest = await generateAISolution('Test-Frage für Saarland')
      
      return NextResponse.json({
        status: 'healthy',
        knowledge_base_entries: Object.keys(SAARLAND_KNOWLEDGE_BASE).reduce((acc, cat) => {
          acc[cat] = Object.keys(SAARLAND_KNOWLEDGE_BASE[cat]).length
          return acc
        }, {} as any),
        test_results: {
          knowledge_base_search: kbTest.length > 0 ? 'working' : 'no_results',
          ai_generation: aiTest ? 'working' : 'failed'
        },
        features: [
          'Knowledge Base Search',
          'AI-Enhanced Solutions',
          'Fuzzy Matching',
          'Real-time Processing',
          'Saarland-specific Content'
        ],
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return NextResponse.json({
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
  }
  
  return NextResponse.json({
    service: 'Instant Help API for agentland.saarland',
    version: '1.0.0',
    description: 'AI-powered instant help system with comprehensive Saarland knowledge base',
    endpoints: {
      search: 'POST /api/instant-help { query: "your question", category?: "business|tourism|education|administration", urgent?: boolean }',
      health: 'GET /api/instant-help?test=health'
    },
    knowledge_base_stats: {
      categories: Object.keys(SAARLAND_KNOWLEDGE_BASE).length,
      total_entries: Object.values(SAARLAND_KNOWLEDGE_BASE).reduce((sum, cat) => sum + Object.keys(cat).length, 0)
    }
  })
}