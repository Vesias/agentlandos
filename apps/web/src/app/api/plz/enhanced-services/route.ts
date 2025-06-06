import { NextRequest, NextResponse } from 'next/server'

// Enhanced PLZ-based service discovery with real-time availability
interface ServiceRequest {
  plz: string
  serviceType: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  userType: 'citizen' | 'business' | 'visitor'
  language?: 'de' | 'fr' | 'en'
}

interface EnhancedService {
  id: string
  name: string
  type: string
  authority: string
  address: string
  plz: string
  municipality: string
  contact: {
    phone: string
    email: string
    website: string
    fax?: string
  }
  availability: {
    status: 'available' | 'busy' | 'closed' | 'appointment-only'
    nextAvailable: string
    averageWaitTime: number
    onlineServices: boolean
  }
  services: Array<{
    name: string
    processingTime: string
    cost: string
    requirements: string[]
    digitalOption: boolean
  }>
  location: {
    lat: number
    lng: number
    accessibility: boolean
    parking: boolean
    publicTransport: string[]
  }
  specialization: string[]
  rating: number
  lastUpdated: string
}

// Enhanced Saarland authorities database with real-time capabilities
const ENHANCED_SAARLAND_SERVICES = {
  // Major cities
  '66111': { // Saarbrücken
    authorities: [
      {
        id: 'sb-rathaus',
        name: 'Rathaus Saarbrücken',
        type: 'municipal',
        authority: 'Landeshauptstadt Saarbrücken',
        address: 'Rathausplatz 1, 66111 Saarbrücken',
        plz: '66111',
        municipality: 'Saarbrücken',
        contact: {
          phone: '0681 905-0',
          email: 'info@saarbruecken.de',
          website: 'https://www.saarbruecken.de'
        },
        services: [
          {
            name: 'Personalausweis beantragen',
            processingTime: '2-3 Wochen',
            cost: '28,80 EUR',
            requirements: ['Geburtsurkunde', 'Passfoto', 'Alter Ausweis'],
            digitalOption: true
          },
          {
            name: 'Gewerbeanmeldung',
            processingTime: '1-2 Tage',
            cost: '20,00 EUR',
            requirements: ['Identitätsnachweis', 'Mietvertrag', 'Handelsregisterauszug'],
            digitalOption: true
          },
          {
            name: 'Führungszeugnis',
            processingTime: '1-2 Wochen',
            cost: '13,00 EUR',
            requirements: ['Personalausweis'],
            digitalOption: true
          }
        ],
        location: {
          lat: 49.2385,
          lng: 6.9969,
          accessibility: true,
          parking: true,
          publicTransport: ['Bus 101', 'Bus 102', 'S-Bahn S1']
        },
        specialization: ['Bürgerdienste', 'Gewerbewesen', 'Meldewesen'],
        rating: 4.2
      }
    ]
  },
  '66424': { // Homburg
    authorities: [
      {
        id: 'hom-rathaus',
        name: 'Rathaus Homburg',
        type: 'municipal',
        authority: 'Kreisstadt Homburg',
        address: 'Am Forum 5, 66424 Homburg',
        plz: '66424',
        municipality: 'Homburg',
        contact: {
          phone: '06841 101-0',
          email: 'info@homburg.de',
          website: 'https://www.homburg.de'
        },
        services: [
          {
            name: 'Kfz-Zulassung',
            processingTime: '1 Tag',
            cost: '26,30 EUR',
            requirements: ['Fahrzeugschein', 'TÜV-Bericht', 'Versicherungsbestätigung'],
            digitalOption: false
          },
          {
            name: 'Bauantrag',
            processingTime: '6-8 Wochen',
            cost: 'Je nach Bauvorhaben',
            requirements: ['Bauzeichnungen', 'Grundstücksnachweis', 'Statik'],
            digitalOption: false
          }
        ],
        location: {
          lat: 49.3267,
          lng: 7.3403,
          accessibility: true,
          parking: true,
          publicTransport: ['Bus 201', 'Bus 202', 'R1']
        },
        specialization: ['Kfz-Wesen', 'Bauwesen'],
        rating: 4.0
      }
    ]
  },
  '66740': { // Saarlouis
    authorities: [
      {
        id: 'sls-rathaus',
        name: 'Rathaus Saarlouis',
        type: 'municipal',
        authority: 'Kreisstadt Saarlouis',
        address: 'Großer Markt 1, 66740 Saarlouis',
        plz: '66740',
        municipality: 'Saarlouis',
        contact: {
          phone: '06831 443-0',
          email: 'info@saarlouis.de',
          website: 'https://www.saarlouis.de'
        },
        services: [
          {
            name: 'Reisepass beantragen',
            processingTime: '3-4 Wochen',
            cost: '60,00 EUR',
            requirements: ['Geburtsurkunde', 'Passfoto', 'Personalausweis'],
            digitalOption: true
          },
          {
            name: 'Eheschließung anmelden',
            processingTime: '2-3 Wochen',
            cost: '40,00 EUR',
            requirements: ['Geburtsurkunden', 'Ledigkeitsbescheinigung', 'Meldebescheinigung'],
            digitalOption: false
          }
        ],
        location: {
          lat: 49.3136,
          lng: 6.7517,
          accessibility: true,
          parking: true,
          publicTransport: ['Bus 301', 'Bus 302']
        },
        specialization: ['Standesamt', 'Passangelegenheiten'],
        rating: 4.1
      }
    ]
  }
}

// Real-time availability simulation (would connect to actual systems)
async function checkRealTimeAvailability(service: any): Promise<any> {
  const currentHour = new Date().getHours()
  const isWeekend = [0, 6].includes(new Date().getDay())
  
  let status: 'available' | 'busy' | 'closed' | 'appointment-only' = 'available'
  let nextAvailable = new Date().toISOString()
  let averageWaitTime = 15 // minutes
  
  // Business hours logic
  if (isWeekend || currentHour < 8 || currentHour > 16) {
    status = 'closed'
    // Next business day at 8 AM
    const nextDay = new Date()
    nextDay.setDate(nextDay.getDate() + (isWeekend ? (8 - nextDay.getDay()) : 1))
    nextDay.setHours(8, 0, 0, 0)
    nextAvailable = nextDay.toISOString()
  } else if (currentHour >= 12 && currentHour <= 13) {
    status = 'busy'
    averageWaitTime = 45
  } else {
    // Real availability checking needed - no random status
    status = 'available'
    averageWaitTime = 15 // Default wait time
  }
  
  return {
    ...service,
    availability: {
      status,
      nextAvailable,
      averageWaitTime,
      onlineServices: service.services.some((s: any) => s.digitalOption),
      lastChecked: new Date().toISOString()
    },
    lastUpdated: new Date().toISOString()
  }
}

async function findNearbyAlternatives(plz: string, serviceType: string): Promise<EnhancedService[]> {
  // Logic to find alternative services in neighboring PLZ areas
  const alternatives: EnhancedService[] = []
  
  // Simple geographic logic for Saarland
  const plzMappings: { [key: string]: string[] } = {
    '66111': ['66113', '66115', '66117', '66119'], // Saarbrücken area
    '66424': ['66426', '66428', '66440'], // Homburg area  
    '66740': ['66742', '66763'] // Saarlouis area
  }
  
  const nearbyPlz = plzMappings[plz] || []
  
  for (const nearPlz of nearbyPlz) {
    const nearbyServices = ENHANCED_SAARLAND_SERVICES[nearPlz as keyof typeof ENHANCED_SAARLAND_SERVICES]
    if (nearbyServices) {
      for (const authority of nearbyServices.authorities) {
        const withAvailability = await checkRealTimeAvailability(authority)
        alternatives.push(withAvailability)
      }
    }
  }
  
  return alternatives
}

async function calculateETA(services: EnhancedService[], urgency: string): Promise<string> {
  if (urgency === 'emergency') return 'Sofort'
  if (urgency === 'high') return '1-2 Stunden'
  if (urgency === 'medium') return '1-2 Tage'
  return '1-2 Wochen'
}

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { plz, serviceType, urgency = 'medium', userType = 'citizen', language = 'de' }: ServiceRequest = await request.json()
    
    if (!plz || !serviceType) {
      return NextResponse.json({
        success: false,
        error: 'PLZ und Service-Type sind erforderlich'
      }, { status: 400 })
    }
    
    // Find services for the given PLZ
    const plzServices = ENHANCED_SAARLAND_SERVICES[plz as keyof typeof ENHANCED_SAARLAND_SERVICES]
    
    if (!plzServices) {
      return NextResponse.json({
        success: false,
        error: `Keine Services für PLZ ${plz} gefunden`,
        suggestion: 'Versuchen Sie eine benachbarte PLZ oder kontaktieren Sie uns für weitere Unterstützung'
      }, { status: 404 })
    }
    
    // Filter services by type and add real-time availability
    const relevantServices: EnhancedService[] = []
    
    for (const authority of plzServices.authorities) {
      const matchingServices = authority.services.filter((service: any) =>
        service.name.toLowerCase().includes(serviceType.toLowerCase()) ||
        serviceType === 'all'
      )
      
      if (matchingServices.length > 0 || serviceType === 'all') {
        const withAvailability = await checkRealTimeAvailability(authority)
        relevantServices.push(withAvailability)
      }
    }
    
    // Find alternatives in nearby areas
    const alternatives = await findNearbyAlternatives(plz, serviceType)
    
    // Calculate estimated processing time
    const estimatedETA = await calculateETA(relevantServices, urgency)
    
    // Sort by availability and rating
    const sortedServices = relevantServices.sort((a, b) => {
      // Prioritize available services
      if (a.availability.status === 'available' && b.availability.status !== 'available') return -1
      if (b.availability.status === 'available' && a.availability.status !== 'available') return 1
      
      // Then by rating
      return b.rating - a.rating
    })
    
    return NextResponse.json({
      success: true,
      data: {
        services: sortedServices,
        alternatives: alternatives.slice(0, 3), // Top 3 alternatives
        meta: {
          plz,
          municipality: sortedServices[0]?.municipality || 'Unbekannt',
          serviceType,
          urgency,
          userType,
          estimatedProcessingTime: estimatedETA,
          totalServicesFound: sortedServices.length,
          alternativesFound: alternatives.length
        },
        recommendations: {
          bestOption: sortedServices[0],
          fastestOption: sortedServices.find(s => s.availability.status === 'available'),
          digitalOptions: sortedServices.filter(s => s.availability.onlineServices),
          appointmentRequired: sortedServices.filter(s => s.availability.status === 'appointment-only')
        }
      },
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'X-Service-Engine': 'ENHANCED-PLZ-SAARLAND'
      }
    })
    
  } catch (error) {
    console.error('Enhanced PLZ Service error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Service temporarily unavailable',
      fallback: {
        message: 'Bitte versuchen Sie es später erneut oder kontaktieren Sie die Behörde direkt.',
        generalContact: '115 - Einheitliche Behördenrufnummer'
      },
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const plz = searchParams.get('plz')
  const serviceType = searchParams.get('service') || 'all'
  const urgency = searchParams.get('urgency') || 'medium'
  const userType = searchParams.get('userType') || 'citizen'
  
  if (!plz) {
    return NextResponse.json({
      success: false,
      error: 'PLZ parameter required'
    }, { status: 400 })
  }
  
  // Convert GET to POST request format
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plz, serviceType, urgency, userType })
  })
  
  return POST(postRequest)
}