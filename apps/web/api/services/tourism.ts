import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TourismRequest {
  action: 'attractions' | 'events' | 'routes' | 'booking'
  location?: string
  category?: string
  date?: string
}

const attractions = [
  {
    id: 1,
    name: 'Saarschleife',
    category: 'Natur',
    description: 'Das Wahrzeichen des Saarlandes',
    rating: 4.8,
    visitors: '500k+/Jahr',
    coordinates: { lat: 49.5090, lng: 6.5957 },
    openingHours: 'Täglich geöffnet',
    price: 'Kostenlos',
    image: '/images/saarschleife.jpg'
  },
  {
    id: 2,
    name: 'Völklinger Hütte',
    category: 'UNESCO',
    description: 'Industriedenkmal und UNESCO-Weltkulturerbe',
    rating: 4.7,
    visitors: '300k+/Jahr',
    coordinates: { lat: 49.2508, lng: 6.8444 },
    openingHours: 'Di-So 10:00-18:00',
    price: 'Erwachsene: 15€',
    image: '/images/voelklinger-huette.jpg'
  },
  {
    id: 3,
    name: 'Bostalsee',
    category: 'Freizeit',
    description: 'Größter Freizeitsee im Südwesten',
    rating: 4.5,
    visitors: '1M+/Jahr',
    coordinates: { lat: 49.5833, lng: 7.1167 },
    openingHours: 'Immer zugänglich',
    price: 'Eintritt frei',
    image: '/images/bostalsee.jpg'
  }
]

const events = [
  {
    id: 1,
    title: 'Saarland Festival',
    date: '2024-06-15',
    endDate: '2024-08-31',
    location: 'Verschiedene Orte',
    category: 'Musik',
    description: 'Das größte Kulturfestival der Region',
    price: 'Ab 25€'
  },
  {
    id: 2,
    title: 'Wandertag Saarschleife',
    date: '2024-05-12',
    location: 'Mettlach',
    category: 'Sport',
    description: 'Geführte Wanderung zur Saarschleife',
    price: '12€'
  }
]

const routes = [
  {
    id: 1,
    name: 'Saar-Radweg',
    type: 'Radweg',
    distance: '105 km',
    difficulty: 'Leicht',
    duration: '1-2 Tage',
    highlights: ['Saarschleife', 'Völklinger Hütte', 'Saarbrücken']
  },
  {
    id: 2,
    name: 'Premiumwanderweg Saarschleife',
    type: 'Wanderweg',
    distance: '15 km',
    difficulty: 'Mittel',
    duration: '4-5 Stunden',
    highlights: ['Cloef-Aussichtspunkt', 'Baumwipfelpfad', 'Mettlach']
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
    const { action, location, category, date } = req.query as any

    switch (action) {
      case 'attractions':
        const filteredAttractions = category 
          ? attractions.filter(a => a.category.toLowerCase() === category.toLowerCase())
          : attractions
        
        return res.status(200).json({
          success: true,
          data: filteredAttractions,
          total: filteredAttractions.length
        })

      case 'events':
        const filteredEvents = category
          ? events.filter(e => e.category.toLowerCase() === category.toLowerCase())
          : events
          
        return res.status(200).json({
          success: true,
          data: filteredEvents,
          total: filteredEvents.length
        })

      case 'routes':
        return res.status(200).json({
          success: true,
          data: routes,
          total: routes.length
        })

      case 'booking':
        // Simulate booking process
        return res.status(200).json({
          success: true,
          message: 'Buchungsanfrage erhalten',
          bookingId: `TOUR${Date.now()}`,
          status: 'pending'
        })

      default:
        return res.status(200).json({
          success: true,
          service: 'Tourism Service Saarland',
          availableActions: ['attractions', 'events', 'routes', 'booking'],
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Tourism API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}