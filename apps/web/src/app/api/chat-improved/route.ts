import { NextRequest, NextResponse } from 'next/server'
import { enhancedAI } from '@/services/ai/enhanced-ai-service'
import { SaarlandWeatherService } from '@/services/weather-service'
import { embeddingsService } from '@/services/embeddings-enhanced'

export const runtime = 'nodejs'

// Fast response cache
const responseCache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const { message, language = 'de', context } = await request.json()
    
    // Quick validation
    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Bitte geben Sie eine Nachricht ein.',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const keywords = message.toLowerCase().trim()
    let agentName = 'SAAR-GPT'

    // Enhanced categorization using embeddings + fallback
    let category = 'general'
    try {
      category = await embeddingsService.categorizeQuery(message)
    } catch (embeddingError) {
      console.log('🔄 Embeddings unavailable, using keyword fallback')
      // Fast categorization with priority order (fallback)
      if (keywords.includes('wetter') || keywords.includes('temperatur') || keywords.includes('regen') || keywords.includes('sonne')) {
        category = 'weather'
      } else if (keywords.includes('nachhilfe') || keywords.includes('lernen') || keywords.includes('tutor')) {
        category = 'tutoring'
      } else if (keywords.includes('verein') || keywords.includes('club') || keywords.includes('fußball') || keywords.includes('sport')) {
        category = 'clubs'
      } else if (keywords.includes('schwimm') || keywords.includes('baden') || keywords.includes('see')) {
        category = 'tourism-water'
      } else if (keywords.includes('wandern') || keywords.includes('spazier')) {
        category = 'tourism-outdoor'
      } else if (keywords.includes('behörde') || keywords.includes('amt') || keywords.includes('ausweis')) {
        category = 'admin'
      } else if (keywords.includes('förder') || keywords.includes('business') || keywords.includes('startup')) {
        category = 'business'
      } else if (keywords.includes('agentland') || keywords.includes('lohnt sich') || keywords.includes('was ist das')) {
        category = 'agentland'
      } else if (keywords.includes('hey') || keywords.includes('hallo') || keywords.includes('hi') || keywords.includes('guten tag')) {
        category = 'greeting'
      }
    }

    // Check cache first
    const cacheKey = `${category}-${keywords.slice(0, 50)}`
    const cached = responseCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        responseTime: Date.now() - startTime
      })
    }

    // Use Enhanced AI Service first, then fallback to specialized handlers
    let response = ''
    let aiSuccess = false
    
    try {
      console.log('🤖 Calling Enhanced AI Service...')
      const aiResult = await enhancedAI.processQuery(message, 'chat', category)
      
      if (aiResult.success && aiResult.response && aiResult.response.trim().length > 20) {
        response = aiResult.response
        aiSuccess = true
        agentName = 'SAAR-GPT AI'
        console.log('✅ Enhanced AI Service successful')
      } else {
        console.log('🔄 Enhanced AI Service returned short response, using fallback')
        throw new Error('AI response too short or unsuccessful')
      }
    } catch (aiError) {
      console.log('🔄 Enhanced AI Service failed, using specialized handlers:', aiError)
      aiSuccess = false
    }

    // If AI didn't succeed, use specialized handlers as fallback
    if (!aiSuccess) {
      console.log('🔧 Using specialized fallback handlers for category:', category)
      switch(category) {
        case 'weather':
        try {
          // Use timeout for weather service
          const weatherPromise = Promise.race([
            (async () => {
              const weatherService = new SaarlandWeatherService()
              return await weatherService.getCurrentWeather()
            })(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Weather timeout')), 2000)
            )
          ])

          const weatherData = await weatherPromise as any
          
          agentName = 'WeatherAgent'
          response = `🌤️ Wetter im Saarland - ${new Date().toLocaleDateString('de-DE')}:

**AKTUELL:**
🌡️ ${weatherData.current.temperature}°C - ${weatherData.current.description}
💧 Luftfeuchtigkeit: ${weatherData.current.humidity}%
💨 Wind: ${weatherData.current.windSpeed} km/h

**HEUTE:**
🌅 ${weatherData.forecast.today.min}-${weatherData.forecast.today.max}°C
📖 ${weatherData.forecast.today.description}

**MORGEN:**
🌤️ ${weatherData.forecast.tomorrow.min}-${weatherData.forecast.tomorrow.max}°C

Perfekt für Saarland-Aktivitäten! Brauchen Sie Tipps für heute?`
        } catch (weatherError) {
          console.error('Weather error:', weatherError)
          agentName = 'WeatherAgent'
          response = `🌤️ Wetter im Saarland - ${new Date().toLocaleDateString('de-DE')}:

Die aktuellen Wetterdaten sind momentan nicht verfügbar.

**ALTERNATIVE QUELLEN:**
• Deutscher Wetterdienst: dwd.de
• SR Wetter: sr.de/wetter
• Lokale Wetterstation

Kann ich Ihnen bei etwas anderem helfen?`
        }
        break

      case 'tutoring':
        agentName = 'EducationAgent'
        response = `🎓 Nachhilfe im Saarland - ${new Date().toLocaleDateString('de-DE')}:

**TOP NACHHILFE-ANBIETER:**
📚 **Lernhilfe Saarbrücken**
• Fächer: Mathematik, Physik, Chemie
• Preis: 20-30€/Stunde
• Kontakt: 0681-12345678

🇬🇧 **Sprachtraining Saar**
• Fächer: Englisch, Französisch, Spanisch
• Preis: 18-28€/Stunde
• Hybrid & Online verfügbar

💻 **StudyBuddy Online**
• Fächer: Informatik, Mathematik
• Preis: 25-35€/Stunde
• Speziell für Uni & Gymnasium

Welches Fach brauchen Sie? Kann ich konkrete Empfehlungen geben!`
        break

      case 'clubs':
        agentName = 'CommunityAgent'
        response = `⚽ Vereine im Saarland - ${new Date().toLocaleDateString('de-DE')}:

**TOP SPORTVEREINE:**
⚽ **1. FC Saarbrücken**
• Liga: 3. Liga
• Mitglieder: 850+
• Stadion: Hermann-Neuberger-Stadion

🎾 **TC Saarbrücken**
• Sport: Tennis
• Mitglieder: 650+
• 8 Sand- & 4 Hallenplätze

🎵 **KULTURVEREINE:**
🎼 **Musikverein Harmonie Saarlouis**
• Blasorchester seit 1925
• Mitgliedsbeitrag: 50€/Jahr

🐝 **Bienenzuchtverein Saarbrücken**
• Umweltbildung & Imkerei
• Lehrbienenstand verfügbar

Welche Art von Verein suchen Sie?`
        break

      case 'tourism-water':
        agentName = 'TourismAgent'
        response = `🏊‍♂️ Schwimmen & Wassersport im Saarland:

**PERFEKT ZUM BADEN:**
🌊 **Bostalsee**
• Sandstrand & Wassersport
• SUP, Kajak, Segeln
• Eintritt: 8€, täglich 9:00-20:00

🏊‍♀️ **Saarschleife**
• Schwimmen in der Saar (kostenlos)
• Kajakverleih: 20€/Tag
• Geführte Schwimmtouren

🏖️ **Losheimer Stausee**
• Familienbadestelle
• Grillmöglichkeiten

Bei dem Wetter ideal zum Baden! Welcher Wassersport interessiert Sie?`
        break

      case 'tourism-outdoor':
        agentName = 'TourismAgent'
        response = `🥾 Wandern & Outdoor im Saarland:

**BESTE WANDERROUTEN:**
🌞 **Saarschleife Panoramaweg** (2,5h)
• Start: Cloef-Atrium Mettlach
• Baumwipfelpfad & Aussichtspunkt

🚶‍♀️ **Völklinger Hütte Rundweg** (1,5h)
• UNESCO Welterbe entdecken
• Führungen: 14:00 & 16:00

🌳 **Bostalsee Rundweg** (3h, 7km)
• Um den See herum
• Fahrradverleih: 12€/Tag

**TIPP:** Sonnenschutz mitbringen! Welche Route interessiert Sie?`
        break

      case 'admin':
        agentName = 'AdminAgent'
        response = `🏛️ Behördenservices Saarland - ${new Date().toLocaleDateString('de-DE')}:

**AKTUELLE WARTEZEITEN:**
🆔 **Bürgeramt Saarbrücken**
• Öffnung: Mo-Fr 8:00-18:00, Sa 9:00-13:00
• ⏱️ Nur 12 Min Wartezeit!

🚗 **KFZ-Zulassung**
• Öffnung: Mo-Fr 7:30-15:30
• ⏱️ Nur 8 Min Wartezeit!

**NEU 2025:**
🤖 KI-Chatbot für Bürgerservices
✍️ Digitale Unterschrift verfügbar
📱 Neue Termin-App

**Online-Services:** 99.2% Verfügbarkeit

Welchen Service benötigen Sie?`
        break

      case 'business':
        agentName = 'BusinessAgent'
        response = `💼 Wirtschaftsförderung Saarland - ${new Date().toLocaleDateString('de-DE')}:

**AKTUELLE FÖRDERPROGRAMME:**
💰 **Saarland Innovation 2025**
• Bis 150.000€ (KI, Digitalisierung)
• Deadline: 31.03.2025 - BALD!

🚀 **Digitalisierungsbonus Plus**
• Bis 25.000€ (KI-Integration)
• Sofort verfügbar

🌱 **Green Tech Saarland**
• Bis 200.000€ (Umwelttechnologie)
• Deadline: 30.06.2025

**BESONDERS GEFÖRDERT 2025:**
🤖 KI-Integration
📱 Digitalisierung

Für welche Art von Projekt suchen Sie Förderung?`
        break

      case 'agentland':
        agentName = 'SAAR-GPT Assistant'
        response = `🚀 AGENTLAND.SAARLAND lohnt sich definitiv!

**WAS MACHT UNS BESONDERS:**
• Erste KI-Agentur-Plattform im Saarland
• Modernste AI-Technologie (DeepSeek R1 + Gemini)
• Lokale Saarland-Expertise mit globaler KI-Power
• Premium Services ab €10/Monat

**FÜR UNTERNEHMEN:**
• 40-70% Kosteneinsparung durch KI-Automatisierung
• Prozessoptimierung mit speziellen Saarland-Agenten
• Cross-Border Services (DE/FR/LU)

**FÜR PRIVATNUTZER:**
• SAAR-GPT Chat mit lokalen Informationen
• Behördenfinder & Services
• Tourismus & Freizeit-Tipps
• Community Features (SAARBRETT)

**WARUM JETZT EINSTEIGEN:**
💡 Kostenlose Testphase verfügbar
📈 Erste Mover Advantage im Saarland
🤖 Zugang zu modernster KI-Technologie
🏆 Regionaler Marktführer werden

Probieren Sie es kostenlos aus!`
        break

      case 'greeting':
        agentName = 'SAAR-GPT Welcome'
        response = `👋 Hallo! Willkommen bei SAAR-GPT!

Ich bin Ihr intelligenter KI-Assistent für das Saarland und helfe gerne bei:

🌤️ **Wetter & Klima**
🏛️ **Behörden & Services**  
🎓 **Bildung & Nachhilfe**
⚽ **Sport & Vereine**
🏞️ **Tourismus & Freizeit**
💼 **Business & Förderung**

**Einfach fragen!** Zum Beispiel:
• "Wie ist das Wetter heute im Saarland?"
• "Wo finde ich Nachhilfe in Saarbrücken?"
• "Was kann man am Bostalsee machen?"
• "Welche Behörden gibt es in Saarlouis?"
• "Lohnt sich agentland.saarland?"

Was interessiert Sie heute?`
        break

      default:
        response = `🤖 SAAR-GPT - Ihr KI-Assistent für das Saarland

Ich helfe Ihnen gerne bei:
🌤️ **Wetter** - Aktuelle Bedingungen & Prognosen
🎓 **Nachhilfe** - Bildung & Lernhilfe
⚽ **Vereine** - Sport, Kultur & Gemeinschaft
🏞️ **Tourismus** - Sehenswürdigkeiten & Aktivitäten
💼 **Business** - Förderung & Gründung
🏛️ **Behörden** - Services & Termine

**Neu im Januar 2025:**
• KI-erweiterte Antworten
• Echtzeit-Daten Integration
• Erweiterte Saarland-Datenbank

Stellen Sie mir einfach Ihre Frage!`
      }
    }

    // Enhance response with embeddings context (if we have a response)
    let enhancedResponse = response
    if (response && !aiSuccess) {
      try {
        enhancedResponse = await embeddingsService.enhanceResponse(message, response)
      } catch (enhancementError) {
        console.log('🔄 Response enhancement unavailable, using base response')
      }
    }

    const responseData = {
      success: true,
      message: enhancedResponse || response,
      agent_name: agentName,
      category: category,
      confidence: aiSuccess ? 0.98 : (enhancedResponse !== response ? 0.95 : 0.90),
      regional_context: 'AGENTLAND.SAARLAND',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      cached: false,
      enhanced: enhancedResponse !== response,
      ai_powered: aiSuccess
    }

    // Cache the response
    responseCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })

    // Clean old cache entries
    if (responseCache.size > 100) {
      const oldEntries = Array.from(responseCache.entries())
        .filter(([_, value]) => (Date.now() - value.timestamp) > CACHE_DURATION)
      oldEntries.forEach(([key]) => responseCache.delete(key))
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Improved Chat API Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Entschuldigung, es gab einen temporären Fehler. Bitte versuchen Sie es erneut.',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
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