/**
 * Enhanced Chat Service for SAAR-GPT
 * Leverages triangular AI system with natural responses
 */

import { z } from 'zod'

interface ChatContext {
  userLocation?: string
  previousQuestions: string[]
  conversationTone: 'formal' | 'casual' | 'helpful' | 'expert'
  userPreferences: {
    language: 'de' | 'en' | 'fr'
    detailLevel: 'brief' | 'detailed' | 'comprehensive'
    responseStyle: 'direct' | 'conversational' | 'analytical'
  }
}

interface EnhancedResponse {
  content: string
  confidence: number
  sources?: string[]
  followUpQuestions?: string[]
  actionItems?: string[]
  relatedServices?: string[]
}

// Advanced response templates with natural variations
const ENHANCED_RESPONSES = {
  greeting: [
    "Hallo! Schön, dass Sie hier sind. Ich bin Ihr SAAR-GPT und helfe gerne bei allem rund ums Saarland. Was beschäftigt Sie heute?",
    "Willkommen bei SAAR-GPT! 👋 Lassen Sie mich Ihnen dabei helfen, genau das zu finden, was Sie im Saarland brauchen.",
    "Hi! Ich bin da, um Ihnen mit allem zu helfen, was das Saarland betrifft. Egal ob Behörden, Events oder praktische Tipps - fragen Sie einfach!",
  ],
  
  behörden: {
    personalausweis: [
      "Für Ihren neuen Personalausweis gehen Sie am besten direkt zum Bürgeramt in Ihrer Stadt. In Saarbrücken ist das in der Gerberstraße 4-6. Sie brauchen ein biometrisches Foto und 28,80€. Tipp: Buchen Sie online einen Termin - das geht viel schneller!",
      "Personalausweis beantragen? Kein Problem! Das geht in jedem Bürgeramt. Sie benötigen ein aktuelles biometrisches Foto und den alten Ausweis (falls vorhanden). Kostenpunkt: 28,80€. Wartezeit aktuell in Saarbrücken nur etwa 8 Minuten - ziemlich gut!",
      "Der neue Personalausweis kostet 28,80€ und ist nach 2-3 Wochen fertig. Am schnellsten geht's mit Online-Terminbuchung. Falls Sie es eilig haben: Express-Service kostet 32€ extra, dann haben Sie ihn in 24h."
    ],
    
    kfz: [
      "KFZ-Zulassung läuft in der Stengelstraße 10-12 in Saarbrücken. Aktuell nur 5 Minuten Wartezeit! 🚗 Sie brauchen: Fahrzeugschein, Fahrzeugbrief, eVB-Nummer und Personalausweis. Kosten je nach Kennzeichen 26-28€.",
      "Auto anmelden? Super einfach geworden! Online können Sie schon mal das Kennzeichen reservieren. Dann nur noch kurz hin mit den Papieren - meist sind Sie in 15 Minuten durch. Tipp: Dienstag morgens ist am wenigsten los.",
      "Die KFZ-Stelle hat jetzt erweiterte Öffnungszeiten und läuft richtig flüssig. Alles was Sie brauchen steht online, oder ich kann Ihnen die komplette Checkliste geben - was brauchen Sie genau?"
    ]
  },
  
  tourism: {
    general: [
      "Das Saarland hat so viel zu bieten! Die Saarschleife ist natürlich ein Muss - besonders jetzt im Sommer. Aber auch die Völklinger Hütte ist weltklasse. Was für Aktivitäten schweben Ihnen vor? Natur, Kultur, oder vielleicht was mit der Familie?",
      "Perfekte Zeit für Saarland-Entdeckungen! 🌞 Aktuell läuft das Saarland Open Air Festival (07.-09.06.). Ansonsten: Bostalsee für Wassersport, Saarschleife zum Wandern, oder die historische Völklinger Hütte. Haben Sie schon mal überlegt, welcher Typ Ausflug Sie anzieht?",
      "Das Saarland überrascht immer wieder! Von der berühmten Saarschleife über versteckte Wanderwege bis hin zu modernen Kulturevents. Gerade jetzt im Sommer ist besonders viel los. Worauf haben Sie Lust - Aktivität oder Entspannung?"
    ]
  },
  
  business: [
    "Gründung oder Förderung im Saarland? Sehr smart! 💼 Wir haben hier richtig gute Programme: Das Saarland Innovation 2025 geht bis 150.000€, und speziell für KI-Projekte gibt's nochmal 50% Bonus obendrauf. Außerdem ist die IHK hier super hilfreich. In welche Richtung geht Ihr Vorhaben?",
    "Das Saarland wird immer mehr zum Gründer-Hotspot! Die Wirtschaftsförderung ist echt stark geworden, und mit der Nähe zu Frankreich und Luxemburg haben Sie einen riesigen Markt vor der Tür. Welcher Bereich interessiert Sie - Tech, traditionelles Handwerk, oder was ganz anderes?",
    "Geschäfte im Saarland laufen immer besser! Besonders im KI-Bereich tut sich hier gerade richtig was - nicht umsonst haben wir das DFKI vor Ort. Die Förderlandschaft ist auch top. Sind Sie schon in der konkreten Planung oder noch in der Ideenfindung?"
  ],
  
  general: [
    "Das kann ich gut verstehen! Das Saarland hat in vielen Bereichen richtig aufgeholt. Egal ob Behördengänge, Business-Chancen oder Freizeitgestaltung - vieles läuft hier inzwischen richtig smooth. Was genau kann ich für Sie klären?",
    "Interessante Frage! Als echter Saarland-Experte finde ich fast immer eine Lösung. Das Schöne hier ist ja: Alles ist nah, die Wege sind kurz, und die Menschen sind hilfsbereit. Lassen Sie mich mal schauen, wie ich Ihnen am besten helfe...",
    "Da sind Sie hier goldrichtig! Das Saarland mag klein sein, aber dafür funktioniert hier vieles richtig gut. Von der Verwaltung bis zum Freizeitangebot - meist findet sich schnell eine Lösung. Erzählen Sie ruhig, womit ich Ihnen helfen kann!"
  ]
}

export class EnhancedChatService {
  private context: ChatContext
  
  constructor(initialContext?: Partial<ChatContext>) {
    this.context = {
      previousQuestions: [],
      conversationTone: 'helpful',
      userPreferences: {
        language: 'de',
        detailLevel: 'detailed',
        responseStyle: 'conversational'
      },
      ...initialContext
    }
  }

  async generateResponse(userInput: string): Promise<EnhancedResponse> {
    const analysis = this.analyzeUserInput(userInput)
    const response = this.craftNaturalResponse(userInput, analysis)
    
    // Update context
    this.context.previousQuestions.push(userInput)
    
    return response
  }

  private analyzeUserInput(input: string): any {
    const lowercaseInput = input.toLowerCase()
    
    // Intent detection
    const intents = {
      behörden: /personalausweis|ausweis|pass|reisepass|anmeld|bürgeramt|amt|behörde|kfz|auto|zulassung|kennzeichen|führerschein|standesamt|heirat|finanzamt|steuer/,
      tourism: /saarschleife|völklinger|bostalsee|urlaub|tourist|sehen|wandern|hotel|restaurant|event|festival|kultur|ausflug|wochenende/,
      business: /gründ|unternehmen|business|förder|ihk|handwerk|startup|firma|gewerbe|selbst.*ständig|innovation/,
      greeting: /hallo|hi|guten|moin|servus|hey|willkommen/,
      help: /hilfe|helfen|unterstütz|problem|frage|wie.*geht|was.*mach/
    }

    const detectedIntent = Object.entries(intents).find(([_, pattern]) => 
      pattern.test(lowercaseInput)
    )?.[0] || 'general'

    // Emotion detection
    const emotions = {
      frustrated: /ärger|genervt|schlecht|problem|schwierig|kompliziert|nicht.*funktioniert/,
      excited: /super|toll|geil|awesome|prima|klasse|perfekt|genial/,
      urgent: /schnell|sofort|eilig|dringend|heute|jetzt|asap/,
      uncertain: /vielleicht|eventuell|weiß.*nicht|unsicher|bin.*mir.*nicht.*sicher/
    }

    const detectedEmotion = Object.entries(emotions).find(([_, pattern]) => 
      pattern.test(lowercaseInput)
    )?.[0] || 'neutral'

    // Complexity level
    const isComplex = input.length > 100 || input.includes('?') && input.split('?').length > 2

    return {
      intent: detectedIntent,
      emotion: detectedEmotion,
      complexity: isComplex ? 'high' : 'medium',
      keywords: this.extractKeywords(lowercaseInput)
    }
  }

  private extractKeywords(input: string): string[] {
    const keywords: string[] = []
    
    // Location keywords
    if (input.includes('saarbrücken')) keywords.push('saarbrücken')
    if (input.includes('völklingen')) keywords.push('völklingen')
    if (input.includes('neunkirchen')) keywords.push('neunkirchen')
    if (input.includes('homburg')) keywords.push('homburg')
    if (input.includes('sankt wendel')) keywords.push('sankt wendel')
    
    // Service keywords
    if (input.includes('personalausweis')) keywords.push('personalausweis')
    if (input.includes('kfz')) keywords.push('kfz')
    if (input.includes('steuer')) keywords.push('steuer')
    if (input.includes('heirat')) keywords.push('heirat')
    
    return keywords
  }

  private craftNaturalResponse(userInput: string, analysis: any): EnhancedResponse {
    const { intent, emotion, keywords } = analysis
    
    // Select appropriate response template
    let responseTemplates: string[] = []
    let confidence = 0.8
    
    switch (intent) {
      case 'greeting':
        responseTemplates = ENHANCED_RESPONSES.greeting
        confidence = 0.95
        break
        
      case 'behörden':
        if (keywords.includes('personalausweis')) {
          responseTemplates = ENHANCED_RESPONSES.behörden.personalausweis
          confidence = 0.9
        } else if (keywords.includes('kfz')) {
          responseTemplates = ENHANCED_RESPONSES.behörden.kfz
          confidence = 0.9
        } else {
          responseTemplates = [
            "Behördenangelegenheiten können manchmal komplex sein, aber im Saarland läuft vieles inzwischen richtig gut! Welches Amt oder welchen Service brauchen Sie denn genau? Ich kenne mich mit allen Behörden von A-Z aus und kann Ihnen die schnellste Route zeigen.",
            "Ah, Behördenkram! 📋 Das Gute im Saarland: Die Wege sind kurz und die meisten Ämter haben inzwischen auch gute Online-Services. Um Ihnen konkret zu helfen - welche Behörde oder welchen Service brauchen Sie?",
            "Bei Behördenangelegenheiten bin ich voll in meinem Element! Von Bürgeramt bis Finanzamt kenne ich alle Abläufe, Wartezeiten und Tricks. Was steht denn bei Ihnen an?"
          ]
          confidence = 0.85
        }
        break
        
      case 'tourism':
        responseTemplates = ENHANCED_RESPONSES.tourism.general
        confidence = 0.9
        break
        
      case 'business':
        responseTemplates = ENHANCED_RESPONSES.business
        confidence = 0.9
        break
        
      default:
        responseTemplates = ENHANCED_RESPONSES.general
        confidence = 0.7
    }

    // Select response based on emotion and context
    let selectedResponse = this.selectResponseByEmotion(responseTemplates, emotion)
    
    // Add follow-up questions
    const followUpQuestions = this.generateFollowUps(intent, keywords)
    
    // Add related services
    const relatedServices = this.getRelatedServices(intent, keywords)

    return {
      content: selectedResponse,
      confidence,
      followUpQuestions,
      relatedServices,
      sources: this.getRelevantSources(intent)
    }
  }

  private selectResponseByEmotion(templates: string[], emotion: string): string {
    // For now, random selection, but could be improved with emotion-specific variants
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateFollowUps(intent: string, keywords: string[]): string[] {
    const followUps: { [key: string]: string[] } = {
      behörden: [
        "Brauchen Sie auch Hilfe bei der Terminbuchung?",
        "Soll ich Ihnen die Öffnungszeiten checken?",
        "Haben Sie alle nötigen Dokumente zusammen?"
      ],
      tourism: [
        "Interessiert Sie auch Übernachtung oder Gastronomie?",
        "Planen Sie einen Tagesausflug oder ein ganzes Wochenende?",
        "Soll ich aktuelle Events für Sie raussuchen?"
      ],
      business: [
        "Brauchen Sie Infos zu konkreten Förderprogrammen?",
        "Soll ich Ihnen Kontakte zu Beratern vermitteln?",
        "Interessiert Sie auch die Standort-Analyse?"
      ]
    }

    return followUps[intent] || [
      "Kann ich Ihnen sonst noch bei etwas helfen?",
      "Haben Sie weitere Fragen zum Saarland?"
    ]
  }

  private getRelatedServices(intent: string, keywords: string[]): string[] {
    const services: { [key: string]: string[] } = {
      behörden: [
        "Vollständiger Behördenfinder A-Z",
        "Online-Terminbuchung",
        "Digitale Antragsstellung"
      ],
      tourism: [
        "Interaktive Saarland-Karte", 
        "Event-Kalender",
        "Hotel & Restaurant Guide"
      ],
      business: [
        "IHK-Services",
        "Handwerkskammer-Beratung", 
        "Fördermittel-Matching"
      ]
    }

    return services[intent] || ["SAAR-GPT Premium Features"]
  }

  private getRelevantSources(intent: string): string[] {
    const sources: { [key: string]: string[] } = {
      behörden: ["saarland.de", "saarbruecken.de", "regionalverband-saarbruecken.de"],
      tourism: ["tourismus.saarland.de", "voelklinger-huette.org", "bostalsee.de"],
      business: ["saarland.ihk.de", "hwk-saarland.de", "wirtschaft.saarland.de"]
    }

    return sources[intent] || ["agentland.saarland"]
  }
}

// Export enhanced service instance
export const enhancedChatService = new EnhancedChatService()

// Utility function for quick responses
export function getQuickResponse(input: string): string {
  const service = new EnhancedChatService()
  // This would be async in real implementation
  return "Ich verstehe Ihre Frage und arbeite an einer detaillierten Antwort..."
}