import type { VercelRequest, VercelResponse } from '@vercel/node'

interface CultureRequest {
  action: 'events' | 'venues' | 'tickets' | 'calendar'
  category?: string
  date?: string
  location?: string
}

const culturalEvents = [
  {
    id: 1,
    title: 'Die Zauberflöte',
    venue: 'Staatstheater Saarbrücken',
    category: 'Oper',
    date: '2024-01-15',
    time: '19:30',
    duration: '180 minutes',
    price: { min: 25, max: 85, currency: 'EUR' },
    description: 'Mozarts zeitlose Oper in neuer Inszenierung',
    director: 'Klaus Müller',
    cast: ['Maria Schmidt (Pamina)', 'Hans Weber (Tamino)'],
    language: 'Deutsch',
    subtitles: 'Deutsch/Englisch',
    ageRating: 'ab 6 Jahren',
    availability: 'Verfügbar'
  },
  {
    id: 2,
    title: 'Jazz Night feat. Sarah Connor',
    venue: 'Saarländisches Staatstheater',
    category: 'Konzert',
    date: '2024-01-20',
    time: '20:30',
    duration: '120 minutes',
    price: { min: 35, max: 65, currency: 'EUR' },
    description: 'Eine Nacht voller Jazz-Klassiker und moderne Interpretationen',
    artist: 'Sarah Connor & Band',
    genre: 'Jazz/Soul',
    language: 'Deutsch/Englisch',
    ageRating: 'ab 16 Jahren',
    availability: 'Wenige Plätze'
  },
  {
    id: 3,
    title: 'Picasso Retrospektive',
    venue: 'Moderne Galerie Saarbrücken',
    category: 'Ausstellung',
    date: '2024-01-01',
    endDate: '2024-03-31',
    time: 'Täglich 10:00-18:00',
    price: { min: 12, max: 18, currency: 'EUR' },
    description: 'Umfassende Werkschau des spanischen Meisters',
    curator: 'Dr. Anna Kunstmann',
    artworks: 120,
    periods: ['Blaue Periode', 'Rosa Periode', 'Kubismus'],
    audioGuide: 'Verfügbar (DE/EN/FR)',
    accessibility: 'Barrierefrei',
    availability: 'Täglich geöffnet'
  }
]

const culturalVenues = [
  {
    id: 1,
    name: 'Staatstheater Saarbrücken',
    type: 'Theater & Oper',
    address: 'Schillerplatz 1, 66111 Saarbrücken',
    capacity: 734,
    description: 'Traditionsreiches Theater mit vielfältigem Programm',
    facilities: ['Restaurant', 'Garderobe', 'Barrierefreier Zugang'],
    parking: 'Parkhaus Schillerplatz',
    publicTransport: ['Bus Linie 1, 2, 3', 'Saarbahn'],
    website: 'https://staatstheater.saarland.de',
    contact: {
      phone: '0681 / 3092-0',
      email: 'info@staatstheater.saarland.de',
      box_office: '0681 / 3092-486'
    }
  },
  {
    id: 2,
    name: 'Moderne Galerie Saarbrücken',
    type: 'Museum & Galerie',
    address: 'Bismarckstraße 11-15, 66111 Saarbrücken',
    capacity: 2000,
    description: 'Führende Sammlung zeitgenössischer Kunst',
    facilities: ['Museumscafé', 'Museumsshop', 'Audioguides'],
    parking: 'Parkhaus Karstadt',
    publicTransport: ['Bus alle Linien Innenstadt'],
    website: 'https://kulturbesitz.saarland.de',
    contact: {
      phone: '0681 / 99681-0',
      email: 'moderne.galerie@kulturbesitz.saarland.de'
    }
  }
]

const festivals = [
  {
    id: 1,
    name: 'Saarland Festival',
    period: '2024-06-15 - 2024-08-31',
    type: 'Musik & Kultur',
    locations: ['Verschiedene Spielstätten'],
    description: 'Das größte Kulturfestival der Region',
    artists: 50,
    events: 120,
    expected_visitors: 50000,
    ticket_sales_start: '2024-03-01'
  },
  {
    id: 2,
    name: 'Saarbrücker Filmfestival',
    period: '2024-10-15 - 2024-10-22',
    type: 'Film Festival',
    locations: ['Filmhaus Saarbrücken', 'Cinéma 8½'],
    description: 'Internationales Festival für junge Filmemacher',
    films: 80,
    premieres: 15,
    countries: 25,
    competition_categories: ['Spielfilm', 'Dokumentarfilm', 'Kurzfilm']
  }
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { action, category, date, location } = req.query as any

    switch (action) {
      case 'events':
        let filteredEvents = culturalEvents
        
        if (category) {
          filteredEvents = filteredEvents.filter(e => 
            e.category.toLowerCase().includes(category.toLowerCase())
          )
        }
        
        if (date) {
          filteredEvents = filteredEvents.filter(e => 
            e.date === date || (e.endDate && e.date <= date && date <= e.endDate)
          )
        }
        
        if (location) {
          filteredEvents = filteredEvents.filter(e => 
            e.venue.toLowerCase().includes(location.toLowerCase())
          )
        }
        
        return res.status(200).json({
          success: true,
          data: filteredEvents,
          total: filteredEvents.length,
          categories: ['Oper', 'Konzert', 'Theater', 'Ausstellung', 'Festival'],
          filters: { category, date, location }
        })

      case 'venues':
        let filteredVenues = culturalVenues
        
        if (category) {
          filteredVenues = filteredVenues.filter(v => 
            v.type.toLowerCase().includes(category.toLowerCase())
          )
        }
        
        return res.status(200).json({
          success: true,
          data: filteredVenues,
          total: filteredVenues.length,
          total_capacity: filteredVenues.reduce((sum, v) => sum + v.capacity, 0)
        })

      case 'tickets':
        // Simulate ticket booking
        return res.status(200).json({
          success: true,
          message: 'Ticket-Reservierung eingegangen',
          booking_id: `TIX${Date.now()}`,
          status: 'reserved',
          payment_deadline: new Date(Date.now() + 24*60*60*1000).toISOString(), // 24h
          pickup_options: [
            'Online-Ticket (PDF)',
            'Abholung an der Abendkasse',
            'Postversand (+3€)'
          ]
        })

      case 'calendar':
        const today = new Date()
        const nextWeek = new Date(today.getTime() + 7*24*60*60*1000)
        
        const upcomingEvents = culturalEvents.filter(e => {
          const eventDate = new Date(e.date)
          return eventDate >= today && eventDate <= nextWeek
        })
        
        return res.status(200).json({
          success: true,
          period: {
            start: today.toISOString().split('T')[0],
            end: nextWeek.toISOString().split('T')[0]
          },
          events: upcomingEvents,
          festivals: festivals.filter(f => {
            const startDate = new Date(f.period.split(' - ')[0])
            const endDate = new Date(f.period.split(' - ')[1])
            return (startDate <= nextWeek && endDate >= today)
          }),
          total_events: upcomingEvents.length
        })

      default:
        return res.status(200).json({
          success: true,
          service: 'Culture Service Saarland',
          availableActions: ['events', 'venues', 'tickets', 'calendar'],
          statistics: {
            annual_events: 500,
            venues: 25,
            annual_visitors: 800000,
            festivals: 12,
            cultural_institutions: 15
          },
          highlights: {
            current_exhibitions: 8,
            upcoming_premieres: 5,
            this_month_events: 45
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Culture API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}