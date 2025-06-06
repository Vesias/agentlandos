/**
 * Aktuelle Daten für AGENTLAND.SAARLAND - Stand: 02.02.2025
 */

export const CURRENT_DATE = '2025-02-02'
export const CURRENT_YEAR = 2025

// Aktuelle Events und Termine
export const CURRENT_EVENTS = {
  culture: [
    {
      title: 'Romeo und Julia',
      venue: 'Staatstheater Saarbrücken',
      date: '2025-02-08',
      time: '19:30',
      category: 'Theater',
      price: '22-78€',
      status: 'Tickets verfügbar'
    },
    {
      title: 'Winter Jazz Festival',
      venue: 'Congresshalle Saarbrücken', 
      date: '2025-02-15',
      time: '20:00',
      category: 'Konzert',
      price: '38-75€',
      status: 'Begrenzte Plätze'
    },
    {
      title: 'KI und Kunst - Digitale Zukunft',
      venue: 'Moderne Galerie Saarbrücken',
      date: '2025-01-15 bis 2025-04-20',
      time: 'Di-So 10:00-18:00',
      category: 'Ausstellung',
      price: '8-15€',
      status: 'Täglich geöffnet'
    },
    {
      title: 'Karneval in Saarbrücken 2025',
      venue: 'Innenstadt Saarbrücken',
      date: '2025-02-28 bis 2025-03-04',
      time: 'Ganztägig',
      category: 'Festival',
      price: 'Kostenlos',
      status: 'Öffentlich'
    }
  ],
  tourism: [
    {
      name: 'Winter-Wanderung Saarschleife',
      date: '2025-02-09',
      description: 'Geführte Winterwanderung mit Glühwein',
      price: '15€'
    },
    {
      name: 'Völklinger Hütte bei Nacht',
      date: '2025-02-14',
      description: 'Romantische Abendführung zum Valentinstag',
      price: '20€'
    }
  ]
}

// Aktuelle Förderprogramme
export const CURRENT_FUNDING = {
  business: [
    {
      name: 'Saarland Innovation 2025',
      amount: 'Bis zu 150.000€',
      deadline: '2025-03-31',
      focus: 'KI, Digitalisierung, Nachhaltigkeit',
      status: 'Anträge laufend'
    },
    {
      name: 'Digitalisierungsbonus Plus',
      amount: 'Bis zu 25.000€',
      deadline: '2025-12-31',
      focus: 'KI-Integration, Cloud-Migration',
      status: 'Erweiterte Förderung'
    },
    {
      name: 'Green Tech Saarland',
      amount: 'Bis zu 200.000€',
      deadline: '2025-06-30',
      focus: 'Umwelttechnologie, Erneuerbare Energien',
      status: 'Neue Förderung'
    }
  ]
}

// Aktuelle Bildungsangebote
export const CURRENT_EDUCATION = {
  programs: [
    {
      name: 'KI-Masterstudiengang',
      university: 'Universität des Saarlandes',
      start: 'Wintersemester 2025/26',
      deadline: '2025-07-15',
      language: 'Deutsch/Englisch'
    },
    {
      name: 'Digitaler Wandel (Weiterbildung)',
      provider: 'IHK Saarland',
      start: '2025-03-01',
      duration: '6 Monate',
      format: 'Hybrid'
    }
  ],
  scholarships: [
    {
      name: 'Saarland Digital Stipendium',
      amount: '800€/Monat',
      deadline: '2025-04-30',
      focus: 'MINT, Digitalisierung, KI'
    }
  ]
}

// Administrative Services - aktuelle Öffnungszeiten
export const CURRENT_ADMIN = {
  offices: {
    'Bürgeramt Saarbrücken Mitte': {
      hours: 'Mo-Fr 8:00-18:00, Sa 9:00-13:00',
      waitTime: '12 Minuten (aktuell)',
      services: ['Personalausweis', 'Reisepass', 'Meldebescheinigung']
    },
    'KFZ-Zulassungsstelle': {
      hours: 'Mo-Fr 7:30-15:30',
      waitTime: '8 Minuten (aktuell)',
      services: ['Zulassung', 'Ummeldung', 'Abmeldung']
    }
  },
  onlineServices: {
    availability: '99.2%',
    maintenanceWindow: 'So 2:00-4:00',
    newFeatures: ['KI-Chatbot', 'Digitale Unterschrift', 'Termin-App']
  }
}

// Aktuelle Wetterdaten (simuliert)
export const CURRENT_WEATHER = {
  temperature: '3°C',
  condition: 'Bewölkt mit Schneeschauern',
  recommendation: 'Warme Kleidung empfohlen für Outdoor-Aktivitäten'
}

// Aktuelle Nachrichten
export const CURRENT_NEWS = [
  {
    title: 'Saarland führt KI-Chatbot für Bürgerservices ein',
    date: '2025-02-01',
    category: 'Digital'
  },
  {
    title: 'Neue Fördergelder für grüne Technologien',
    date: '2025-01-28',
    category: 'Wirtschaft'
  },
  {
    title: 'Winterferien-Programm in saarländischen Museen',
    date: '2025-01-25',
    category: 'Kultur'
  }
]

// API-Integration für DeepSeek
export const DEEPSEEK_CONFIG = {
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: `Du bist ein KI-Assistent für das Saarland. Heute ist der ${CURRENT_DATE}. 
    Du hilfst bei Fragen zu Tourismus, Wirtschaft, Bildung, Verwaltung und Kultur im Saarland.
    Verwende immer aktuelle Daten und Termine. Antworte freundlich und informativ auf Deutsch.`
}