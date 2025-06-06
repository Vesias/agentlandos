import { NextRequest, NextResponse } from 'next/server'

// AI Document Assistant with DeepSeek R1 Integration
interface DocumentRequest {
  documentType: string
  userContext: {
    municipality: string
    plz: string
    userType: 'citizen' | 'business' | 'visitor'
    language?: 'de' | 'fr' | 'en'
  }
  formData?: Record<string, any>
  analysisMode: 'fill' | 'analyze' | 'guide' | 'validate'
}

interface DocumentResponse {
  analyzedDocument: {
    summary: string
    requirements: string[]
    estimatedTime: string
    difficulty: 'easy' | 'medium' | 'complex'
    saarlandSpecific: string[]
  }
  prefilledForm?: Record<string, any>
  nextSteps: Array<{
    step: number
    action: string
    authority: string
    estimated_time: string
    required_documents: string[]
    digital_option: boolean
  }>
  requiredDocuments: Array<{
    name: string
    description: string
    where_to_get: string
    cost: string
    validity: string
    alternatives: string[]
  }>
  saarlandGuidance: {
    specificRequirements: string[]
    localContacts: Array<{
      name: string
      phone: string
      email: string
      address: string
      specialization: string[]
    }>
    tips: string[]
    commonMistakes: string[]
  }
}

// Document templates specific to Saarland
const SAARLAND_DOCUMENT_TEMPLATES = {
  'personalausweis': {
    name: 'Personalausweis beantragen',
    category: 'Identitätsdokumente',
    authority: 'Bürgerbüro',
    requirements: [
      'Geburtsurkunde oder beglaubigte Abschrift aus dem Geburtenregister',
      'Aktuelles biometrisches Passfoto',
      'Nachweis der deutschen Staatsangehörigkeit',
      'Bei Erstertrag: Sorgerechtsnachweis (unter 16 Jahren)'
    ],
    cost: '28,80 EUR (unter 24 Jahren), 37,00 EUR (ab 24 Jahren)',
    processingTime: '2-3 Wochen',
    validity: '10 Jahre (unter 24 Jahren: 6 Jahre)',
    saarlandSpecific: [
      'In Saarbrücken: Terminvereinbarung online möglich',
      'Express-Service verfügbar (+32 EUR)',
      'Mobile Erfassung für Senioren in Altenheimen'
    ]
  },
  'gewerbeanmeldung': {
    name: 'Gewerbeanmeldung',
    category: 'Unternehmen',
    authority: 'Gewerbeamt',
    requirements: [
      'Personalausweis oder Reisepass',
      'Bei Ausländern: Aufenthaltstitel mit Erwerbserlaubnis',
      'Nachweis der fachlichen Eignung (bei erlaubnispflichtigen Gewerben)',
      'Gesellschaftsvertrag (bei Personengesellschaften)',
      'Handelsregisterauszug (bei Kapitalgesellschaften)'
    ],
    cost: '20,00 EUR bis 65,00 EUR (je nach Gewerbe)',
    processingTime: '1-3 Tage',
    validity: 'Unbegrenzt (bis zur Abmeldung)',
    saarlandSpecific: [
      'Online-Anmeldung über das Saarländische Unternehmensportal',
      'Beratungsgespräch mit IHK Saarland empfohlen',
      'Saarländische Gründerprämie möglich'
    ]
  },
  'bauantrag': {
    name: 'Bauantrag',
    category: 'Bauen & Wohnen',
    authority: 'Bauaufsichtsbehörde',
    requirements: [
      'Bauantragsformular',
      'Bauzeichnungen (Grundrisse, Schnitte, Ansichten)',
      'Statische Berechnungen',
      'Nachweis über die Standsicherheit',
      'Entwässerungsantrag',
      'Nachweis der Berechtigung (Eigentum/Erbbaurecht)'
    ],
    cost: '0,3% bis 1,5% der Bausumme',
    processingTime: '6-12 Wochen',
    validity: '3 Jahre ab Erteilung',
    saarlandSpecific: [
      'Saarländische Bauordnung (LBO) beachten',
      'Denkmalschutz in historischen Ortskernen',
      'Energieeffizienz-Förderung des Saarlandes verfügbar'
    ]
  },
  'eheschliessung': {
    name: 'Eheschließung anmelden',
    category: 'Familie & Soziales',
    authority: 'Standesamt',
    requirements: [
      'Geburtsurkunden beider Partner',
      'Personalausweise oder Reisepässe',
      'Erweiterte Meldebescheinigungen',
      'Ledigkeitsbescheinigung',
      'Bei Geschiedenen: rechtskräftiges Scheidungsurteil',
      'Bei Verwitweten: Sterbeurkunde des verstorbenen Ehegatten'
    ],
    cost: '40,00 EUR bis 80,00 EUR (je nach Trauort)',
    processingTime: '2-4 Wochen',
    validity: '6 Monate ab Ausstellung',
    saarlandSpecific: [
      'Trauung in besonderen Locations möglich (Völklinger Hütte, Saarbrücker Schloss)',
      'Mehrsprachige Trauungen (Deutsch/Französisch)',
      'Grenzüberschreitende Ehen mit Frankreich/Luxemburg'
    ]
  }
}

async function callEnhancedAI(prompt: string, mode: string = 'chat'): Promise<any> {
  try {
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/ai/enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: prompt,
        mode: mode,
        stream: false,
        context: 'document-analysis'
      })
    })
    
    if (!aiResponse.ok) {
      throw new Error('AI service unavailable')
    }
    
    return await aiResponse.json()
  } catch (error) {
    console.error('Enhanced AI call failed:', error)
    return {
      response: 'AI-Analyse temporär nicht verfügbar. Nutzen Sie die Standard-Dokumenthilfe.',
      reasoning: 'Fallback wegen Service-Ausfall'
    }
  }
}

function generateProcessSteps(documentType: string, plz: string): Array<any> {
  const template = SAARLAND_DOCUMENT_TEMPLATES[documentType as keyof typeof SAARLAND_DOCUMENT_TEMPLATES]
  
  if (!template) {
    return [{
      step: 1,
      action: 'Dokument-Informationen beim zuständigen Amt erfragen',
      authority: 'Bürgerbüro',
      estimated_time: '1 Tag',
      required_documents: ['Personalausweis'],
      digital_option: false
    }]
  }
  
  return [
    {
      step: 1,
      action: 'Erforderliche Dokumente zusammenstellen',
      authority: 'Selbst',
      estimated_time: '1-3 Tage',
      required_documents: template.requirements.slice(0, 3),
      digital_option: false
    },
    {
      step: 2,
      action: `${template.name} beantragen`,
      authority: template.authority,
      estimated_time: template.processingTime,
      required_documents: template.requirements,
      digital_option: documentType === 'personalausweis' || documentType === 'gewerbeanmeldung'
    },
    {
      step: 3,
      action: 'Bearbeitung abwarten',
      authority: template.authority,
      estimated_time: template.processingTime,
      required_documents: [],
      digital_option: false
    },
    {
      step: 4,
      action: 'Dokument abholen oder erhalten',
      authority: template.authority,
      estimated_time: '1 Tag',
      required_documents: ['Personalausweis', 'Gebührennachweis'],
      digital_option: false
    }
  ]
}

function getRequiredDocuments(documentType: string): Array<any> {
  const template = SAARLAND_DOCUMENT_TEMPLATES[documentType as keyof typeof SAARLAND_DOCUMENT_TEMPLATES]
  
  if (!template) {
    return [{
      name: 'Personalausweis',
      description: 'Gültiger Personalausweis oder Reisepass',
      where_to_get: 'Bürgerbüro',
      cost: '37,00 EUR',
      validity: '10 Jahre',
      alternatives: ['Reisepass']
    }]
  }
  
  return template.requirements.map(req => ({
    name: req,
    description: `Erforderlich für ${template.name}`,
    where_to_get: req.includes('Geburtsurkunde') ? 'Standesamt' : 
                  req.includes('Passfoto') ? 'Fotograf/Automat' :
                  req.includes('Meldebescheinigung') ? 'Bürgerbüro' : 'Zuständige Behörde',
    cost: req.includes('Geburtsurkunde') ? '12,00 EUR' :
          req.includes('Passfoto') ? '8,00 EUR' :
          req.includes('Meldebescheinigung') ? '8,00 EUR' : 'Variabel',
    validity: req.includes('Passfoto') ? '6 Monate' : 'Unbegrenzt',
    alternatives: req.includes('Personalausweis') ? ['Reisepass'] : []
  }))
}

function getSaarlandGuidance(documentType: string, municipality: string): any {
  return {
    specificRequirements: [
      `Gültig für ${municipality}, Saarland`,
      'Termine können online vereinbart werden',
      'Express-Service gegen Aufpreis verfügbar'
    ],
    localContacts: [
      {
        name: `Bürgerbüro ${municipality}`,
        phone: '0681 905-0', // Would be municipality-specific
        email: `info@${municipality.toLowerCase()}.de`,
        address: `Rathaus ${municipality}`,
        specialization: ['Meldewesen', 'Ausweise', 'Führungszeugnisse']
      }
    ],
    tips: [
      'Termin im Voraus vereinbaren spart Wartezeit',
      'Alle Dokumente im Original mitbringen',
      'Bei Fragen vorab anrufen',
      'Online-Services nutzen wenn verfügbar'
    ],
    commonMistakes: [
      'Abgelaufene Dokumente mitgebracht',
      'Passfoto nicht biometrisch',
      'Termine vergessen',
      'Falsches Amt aufgesucht'
    ]
  }
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { 
      documentType, 
      userContext, 
      formData = {}, 
      analysisMode = 'analyze' 
    }: DocumentRequest = await request.json()
    
    if (!documentType || !userContext) {
      return NextResponse.json({
        success: false,
        error: 'DocumentType und UserContext sind erforderlich'
      }, { status: 400 })
    }
    
    // Prepare AI prompt for enhanced analysis
    const aiPrompt = `
Als Experte für Saarländische Verwaltungsverfahren, analysiere die Beantragung von "${documentType}" für eine Person in ${userContext.municipality} (PLZ: ${userContext.plz}).

Nutzer-Kontext:
- Typ: ${userContext.userType}
- Standort: ${userContext.municipality}, Saarland
- PLZ: ${userContext.plz}

Analysiere besonders:
1. Saarland-spezifische Bestimmungen und Verfahren
2. Lokale Besonderheiten in ${userContext.municipality}
3. Digitale Optionen und Online-Services
4. Typische Herausforderungen und Lösungsansätze
5. Grenzüberschreitende Aspekte (DE/FR/LU) falls relevant

Gib eine strukturierte Analyse mit konkreten Handlungsempfehlungen.
`
    
    // Get AI analysis
    const aiResponse = await callEnhancedAI(aiPrompt, 'rag')
    
    // Get document template
    const template = SAARLAND_DOCUMENT_TEMPLATES[documentType as keyof typeof SAARLAND_DOCUMENT_TEMPLATES]
    
    // Build comprehensive response
    const response: DocumentResponse = {
      analyzedDocument: {
        summary: template ? 
          `${template.name}: ${template.requirements.length} Dokumente erforderlich, Bearbeitungszeit: ${template.processingTime}` :
          'Dokument-Analyse verfügbar nach AI-Verarbeitung',
        requirements: template?.requirements || ['Personalausweis', 'Antragsformular'],
        estimatedTime: template?.processingTime || '1-2 Wochen',
        difficulty: template?.requirements.length > 5 ? 'complex' : template?.requirements.length > 3 ? 'medium' : 'easy',
        saarlandSpecific: template?.saarlandSpecific || [
          'Online-Services verfügbar',
          'Terminvereinbarung empfohlen',
          'Express-Service möglich'
        ]
      },
      nextSteps: generateProcessSteps(documentType, userContext.plz),
      requiredDocuments: getRequiredDocuments(documentType),
      saarlandGuidance: getSaarlandGuidance(documentType, userContext.municipality)
    }
    
    // Add AI insights if successful
    if (aiResponse.response && !aiResponse.response.includes('temporär nicht verfügbar')) {
      response.analyzedDocument.summary = aiResponse.response
      if (aiResponse.reasoning) {
        response.saarlandGuidance.tips.unshift(`AI-Empfehlung: ${aiResponse.reasoning}`)
      }
    }
    
    // Add prefilled form for specific document types
    if (analysisMode === 'fill' && template) {
      response.prefilledForm = {
        documentType: documentType,
        municipality: userContext.municipality,
        plz: userContext.plz,
        estimatedCost: template.cost,
        processingTime: template.processingTime,
        ...formData
      }
    }
    
    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        documentType,
        municipality: userContext.municipality,
        analysisMode,
        aiEnhanced: !aiResponse.response?.includes('temporär nicht verfügbar'),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
        'X-AI-Assistant': 'DOCUMENT-SAARLAND'
      }
    })
    
  } catch (error) {
    console.error('Document Assistant error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Document Assistant temporarily unavailable',
      fallback: {
        message: 'Nutzen Sie die Standard-Dokumenthilfe oder kontaktieren Sie die Behörde direkt.',
        contact: '115 - Einheitliche Behördenrufnummer'
      },
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const documentType = searchParams.get('type')
  const municipality = searchParams.get('municipality') || 'Saarbrücken'
  const plz = searchParams.get('plz') || '66111'
  
  if (!documentType) {
    return NextResponse.json({
      success: false,
      error: 'Document type parameter required'
    }, { status: 400 })
  }
  
  // Convert GET to POST request format
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      documentType, 
      userContext: { municipality, plz, userType: 'citizen' },
      analysisMode: 'analyze'
    })
  })
  
  return POST(postRequest)
}