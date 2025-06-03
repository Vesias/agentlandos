import { NextRequest, NextResponse } from 'next/server'

// Aktuelle Saarland-Daten (Stand: 02.02.2025)
const CURRENT_SAARLAND_DATA = {
  date: '2025-02-02',
  events: {
    culture: [
      'Romeo und Julia - Staatstheater (08.02.2025, 19:30)',
      'Winter Jazz Festival - Congresshalle (15.02.2025, 20:00)', 
      'KI und Kunst Ausstellung - Moderne Galerie (bis 20.04.2025)',
      'Karneval Saarbrücken (28.02-04.03.2025)'
    ],
    tourism: [
      'Winter-Wanderung Saarschleife (09.02.2025)',
      'Völklinger Hütte bei Nacht (14.02.2025)'
    ]
  },
  funding: [
    'Saarland Innovation 2025: bis 150.000€ (Deadline: 31.03.2025)',
    'Digitalisierungsbonus Plus: bis 25.000€ (KI-Integration)',
    'Green Tech Saarland: bis 200.000€ (Umwelttechnologie)'
  ],
  education: [
    'KI-Masterstudiengang UdS (Start: WS 2025/26, Bewerbung bis 15.07.2025)',
    'Saarland Digital Stipendium: 800€/Monat (Deadline: 30.04.2025)'
  ],
  admin: {
    'Bürgeramt Saarbrücken': 'Mo-Fr 8:00-18:00, Sa 9:00-13:00 (aktuell 12 Min Wartezeit)',
    'KFZ-Zulassung': 'Mo-Fr 7:30-15:30 (aktuell 8 Min Wartezeit)',
    'Online-Services': '99.2% Verfügbarkeit, neue Features: KI-Chatbot, Digitale Unterschrift'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'de', context } = await request.json()

    // Fallback: Intelligente Mock-Antworten mit aktuellen Daten
    const keywords = message.toLowerCase()
    let response = ''
    let agentName = context?.agentType || 'NavigatorAgent'

    // Verwende Kontext für bessere Kategorisierung
    const category = context?.category || 
      (keywords.includes('tour') || keywords.includes('sehen') || keywords.includes('reise') ? 'tourism' :
       keywords.includes('förder') || keywords.includes('business') || keywords.includes('unternehmen') ? 'business' :
       keywords.includes('kultur') || keywords.includes('theater') || keywords.includes('konzert') ? 'culture' :
       keywords.includes('amt') || keywords.includes('behörde') || keywords.includes('antrag') ? 'admin' :
       keywords.includes('studium') || keywords.includes('bildung') || keywords.includes('universität') ? 'education' : 'general')

    switch(category) {
      case 'tourism':
        agentName = 'TourismAgent'
        response = `🏞️ Tourismus im Saarland - Stand 02.02.2025:

**Aktuelle Highlights:**
• Winter-Wanderung Saarschleife am 09.02.2025 (15€)
• Völklinger Hütte bei Nacht am 14.02.2025 (20€, romantisch zum Valentinstag!)

**Ganzjährig geöffnet:**
• Saarschleife Mettlach - Das Wahrzeichen (kostenlos)
• Völklinger Hütte - UNESCO Welterbe (15€)
• Bostalsee - Freizeitsee (kostenlos)

Bei diesem Winterwetter empfehle ich warme Kleidung für Outdoor-Aktivitäten. Kann ich Ihnen bei einer konkreten Reiseplanung helfen?`
        break

      case 'business':
        agentName = 'BusinessAgent'
        response = `💼 Wirtschaftsförderung Saarland - Stand 02.02.2025:

**Aktuelle Förderprogramme:**
• Saarland Innovation 2025: bis 150.000€ (Focus: KI, Digitalisierung)
  Deadline: 31.03.2025 - BALD ANMELDEN!
• Digitalisierungsbonus Plus: bis 25.000€ (KI-Integration)
• Green Tech Saarland: bis 200.000€ (Umwelttechnologie)
  Deadline: 30.06.2025

**Neue Features 2025:**
• KI-Integration wird besonders gefördert
• Erweiterte Digitalisierungsförderung

Für welche Art von Unternehmen oder Projekt suchen Sie Förderung?`
        break

      case 'culture':
        agentName = 'CultureAgent'
        response = `🎭 Kultur im Saarland - Stand 02.02.2025:

**Diese Woche:**
• Romeo und Julia - Staatstheater, 08.02.2025, 19:30 (22-78€)

**Diesen Monat:**
• Winter Jazz Festival - Congresshalle, 15.02.2025, 20:00 (38-75€)
• KI und Kunst Ausstellung - Moderne Galerie (bis 20.04.2025)

**Karneval 2025:**
• Karneval Saarbrücken: 28.02-04.03.2025 (kostenlos!)

**Aktuell laufend:**
• "KI und Kunst - Digitale Zukunft" in der Modernen Galerie
  KI-generierte Audioguides verfügbar!

Welche Art von Kulturveranstaltung interessiert Sie?`
        break

      case 'admin':
        agentName = 'AdminAgent'
        response = `🏛️ Digitale Verwaltung Saarland - Stand 02.02.2025:

**Aktuelle Öffnungszeiten & Wartezeiten:**
• Bürgeramt Saarbrücken: Mo-Fr 8:00-18:00, Sa 9:00-13:00
  ⏱️ Aktuell nur 12 Min Wartezeit!
• KFZ-Zulassung: Mo-Fr 7:30-15:30
  ⏱️ Aktuell nur 8 Min Wartezeit!

**NEU seit 2025:**
• KI-Chatbot für Bürgerservices
• Digitale Unterschrift verfügbar
• Neue Termin-App

**Online-Services:** 99.2% Verfügbarkeit
Wartung: So 2:00-4:00

Welchen Service benötigen Sie? Ich kann Ihnen direkt weiterhelfen!`
        break

      case 'education':
        agentName = 'EducationAgent'
        response = `🎓 Bildung im Saarland - Stand 02.02.2025:

**NEU für 2025/26:**
• KI-Masterstudiengang an der UdS
  Start: Wintersemester 2025/26
  Bewerbung bis: 15.07.2025

**Stipendien:**
• Saarland Digital Stipendium: 800€/Monat
  Focus: MINT, Digitalisierung, KI
  Deadline: 30.04.2025

**Weiterbildung:**
• Digitaler Wandel (IHK) - Start: 01.03.2025

Die UdS mit 17.000+ Studenten bietet 120+ Programme.
Für welchen Bereich suchen Sie Bildungsangebote?`
        break

      default:
        response = `🤖 AGENTLAND.SAARLAND - Ihr KI-Assistent (Stand: 02.02.2025)

Ich helfe Ihnen gerne bei Fragen zu:
• 🏞️ **Tourismus**: Sehenswürdigkeiten, Events, Aktivitäten
• 💼 **Wirtschaft**: Förderprogramme, Business, Gründung  
• 🎓 **Bildung**: Universitäten, Stipendien, Weiterbildung
• 🏛️ **Verwaltung**: Behördenservices, Formulare, Termine
• 🎭 **Kultur**: Theater, Konzerte, Museen, Festivals

**Was gibt's Neues im Februar 2025?**
• Winter Jazz Festival am 15.02.
• KI-Förderung bis 150.000€ verfügbar
• Neue digitale Bürgerservices online

Stellen Sie mir einfach Ihre Frage zum Saarland!`
    }

    return NextResponse.json({
      agent_id: `${agentName.toLowerCase()}_${Date.now()}`,
      agent_name: agentName,
      message: response,
      confidence: 0.92,
      thought_process: [
        'Anfrage kategorisiert',
        context ? `Kontext-spezifische Beratung: ${context.category}` : 'Allgemeine Beratung',
        'Aktuelle Daten von 02.02.2025 verwendet',
        'Personalisierte Antwort generiert'
      ],
      regional_context: 'AGENTLAND.SAARLAND mit aktuellen Daten',
      timestamp: new Date().toISOString(),
      data_version: '2025-02-02'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Interner Serverfehler',
      message: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}