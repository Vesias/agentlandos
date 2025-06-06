/**
 * Vordefinierte Chat-Kontexte für direkte Beratungsweiterleitung
 * Stand: 03.06.2025
 */

export interface ChatContext {
  id: string
  title: string
  category: string
  initialMessage: string
  suggestedQuestions: string[]
  agentType: string
  color: string
  icon: string
}

export const CHAT_CONTEXTS: ChatContext[] = [
  // TOURISMUS
  {
    id: 'tourism-planning',
    title: 'Reiseplanung Saarland',
    category: 'tourism',
    initialMessage: 'Hallo! Ich helfe Ihnen bei der Planung Ihres Saarland-Besuchs. Perfektes Sommerwetter heute! Was interessiert Sie besonders?',
    suggestedQuestions: [
      'Was kann ich heute bei dem schönen Wetter unternehmen?',
      'Welche Sommer-Aktivitäten gibt es?',
      'Gibt es Open Air Events diese Woche?',
      'Wo kann ich schwimmen und baden gehen?'
    ],
    agentType: 'TourismAgent',
    color: '#00A54A',
    icon: 'Sparkles'
  },
  {
    id: 'tourism-events',
    title: 'Aktuelle Veranstaltungen',
    category: 'tourism',
    initialMessage: 'Hier sind die aktuellen Events im Saarland für Juni 2025! Diese Woche startet das große Open Air Festival! Was interessiert Sie?',
    suggestedQuestions: [
      'Was läuft diese Woche?',
      'Gibt es Open Air Festivals?',
      'Welche Sommer-Events sind für Familien geeignet?',
      'Was kostet das Open Air Festival?'
    ],
    agentType: 'TourismAgent',
    color: '#00A54A',
    icon: 'Calendar'
  },

  // WIRTSCHAFT
  {
    id: 'business-funding',
    title: 'Förderprogramme 2025',
    category: 'business',
    initialMessage: 'Ich berate Sie zu den erweiterten Förderprogrammen im Saarland. NEU: KI-Projekte erhalten 50% Bonus! Für welchen Bereich suchen Sie Unterstützung?',
    suggestedQuestions: [
      'Welche KI-Förderungen gibt es mit Bonus?',
      'Wie beantrage ich den erweiterten Digitalisierungsbonus?',
      'Gibt es neue Green Tech & KI Hybrid Förderung?',
      'Wann ist die nächste Deadline: 31.08.2025?'
    ],
    agentType: 'BusinessAgent',
    color: '#003399',
    icon: 'Euro'
  },
  {
    id: 'business-startup',
    title: 'Gründungsberatung',
    category: 'business',
    initialMessage: 'Herzlich willkommen zur Gründungsberatung! Ich unterstütze Sie bei allen Fragen zur Unternehmensgründung im Saarland.',
    suggestedQuestions: [
      'Wie gründe ich ein Startup im Saarland?',
      'Welche Rechtsform ist die richtige?',
      'Wo bekomme ich einen Businessplan-Check?',
      'Gibt es kostenlose Erstberatung?'
    ],
    agentType: 'BusinessAgent',
    color: '#003399',
    icon: 'Rocket'
  },

  // BILDUNG
  {
    id: 'education-studies',
    title: 'Studium im Saarland',
    category: 'education',
    initialMessage: 'Ich berate Sie zu Studienmöglichkeiten im Saarland. Welcher Studienbereich interessiert Sie?',
    suggestedQuestions: [
      'Kann ich mich noch für den KI-Master bewerben?',
      'Bis wann läuft die Bewerbungsfrist: 15.07.2025?',
      'Wie hoch ist das neue Digital Stipendium: 950€?',
      'Gibt es das neue KI-Excellence Stipendium?'
    ],
    agentType: 'EducationAgent',
    color: '#FFB300',
    icon: 'GraduationCap'
  },
  {
    id: 'education-scholarships',
    title: 'Stipendien & Förderung',
    category: 'education',
    initialMessage: 'Hier erfahren Sie alles über Stipendien und Bildungsförderung im Saarland. Für welchen Bereich suchen Sie Unterstützung?',
    suggestedQuestions: [
      'Welche Stipendien gibt es für Sommer 2025?',
      'Wie hoch ist das erhöhte Digital Stipendium: 950€?',
      'Was ist das neue KI-Excellence Stipendium: 1.200€?',
      'Wer kann sich für die DFKI-Forschungsstipendien bewerben?'
    ],
    agentType: 'EducationAgent',
    color: '#FFB300',
    icon: 'Award'
  },

  // VERWALTUNG
  {
    id: 'admin-documents',
    title: 'Ausweise & Dokumente',
    category: 'admin',
    initialMessage: 'Ich helfe Ihnen bei der Beantragung von Ausweisen und Dokumenten. Was benötigen Sie?',
    suggestedQuestions: [
      'Wie beantrage ich einen neuen Personalausweis?',
      'Was kostet ein Reisepass?',
      'Kann ich das online erledigen?',
      'Wie lange dauert die Bearbeitung?'
    ],
    agentType: 'AdminAgent',
    color: '#E30613',
    icon: 'FileText'
  },
  {
    id: 'admin-business-registration',
    title: 'Gewerbeanmeldung',
    category: 'admin',
    initialMessage: 'Ich unterstütze Sie bei der Gewerbeanmeldung und anderen geschäftlichen Behördengängen.',
    suggestedQuestions: [
      'Wie melde ich ein Gewerbe an?',
      'Was kostet die Gewerbeanmeldung?',
      'Welche Unterlagen brauche ich?',
      'Kann ich das online machen?'
    ],
    agentType: 'AdminAgent',
    color: '#E30613',
    icon: 'Building2'
  },

  // KULTUR
  {
    id: 'culture-events',
    title: 'Theater & Konzerte',
    category: 'culture',
    initialMessage: 'Entdecken Sie das kulturelle Leben im Saarland! Welche Art von Veranstaltung interessiert Sie?',
    suggestedQuestions: [
      'Was läuft diese Woche im Theater?',
      'Gibt es Jazz unter Sternen im Juni?',
      'Wie buche ich Tickets für das Open Air Festival?',
      'Was ist die Kunst & KI Biennale?'
    ],
    agentType: 'CultureAgent',
    color: '#8B008B',
    icon: 'Theater'
  },
  {
    id: 'culture-summer',
    title: 'Sommer Festivals 2025',
    category: 'culture',
    initialMessage: 'Die besten Sommer-Festivals im Saarland! Diese Woche startet das große Open Air Festival. Wie kann ich Ihnen helfen?',
    suggestedQuestions: [
      'Wann ist das Saarland Open Air Festival?',
      'Was kostet das Digital Art Festival?',
      'Gibt es Open Air Kino im Stadtpark?',
      'Wann ist die KI-Symphonie Weltpremiere?'
    ],
    agentType: 'CultureAgent',
    color: '#8B008B',
    icon: 'PartyPopper'
  }
]

export const getChatContextById = (id: string): ChatContext | undefined => {
  return CHAT_CONTEXTS.find(context => context.id === id)
}

export const getChatContextsByCategory = (category: string): ChatContext[] => {
  return CHAT_CONTEXTS.filter(context => context.category === category)
}

// URL Generator für direkte Chat-Links
export const generateChatUrl = (contextId: string, customMessage?: string): string => {
  const baseUrl = '/chat'
  const params = new URLSearchParams()
  
  if (contextId) {
    params.append('context', contextId)
  }
  
  if (customMessage) {
    params.append('message', customMessage)
  }
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
}