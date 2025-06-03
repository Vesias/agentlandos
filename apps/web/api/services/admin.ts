import type { VercelRequest, VercelResponse } from '@vercel/node'

interface AdminRequest {
  action: 'services' | 'forms' | 'appointments' | 'status'
  category?: string
  service_id?: string
  citizen_id?: string
}

const administrativeServices = [
  {
    id: 'passport',
    name: 'Reisepass',
    category: 'Persönliche Dokumente',
    description: 'Neu- und Folgeantrag für Reisepässe',
    onlineAvailable: true,
    processingTime: '3-4 Wochen',
    cost: '60€',
    requirements: ['Personalausweis', 'Biometrisches Foto', 'Geburtsurkunde'],
    forms: ['Reisepass-Antrag', 'Einverständniserklärung (bei Minderjährigen)'],
    appointmentRequired: false
  },
  {
    id: 'id_card',
    name: 'Personalausweis',
    category: 'Persönliche Dokumente',
    description: 'Beantragung und Verlängerung von Personalausweisen',
    onlineAvailable: true,
    processingTime: '2-3 Wochen',
    cost: '37€',
    requirements: ['Alten Personalausweis', 'Biometrisches Foto'],
    forms: ['Personalausweis-Antrag'],
    appointmentRequired: false
  },
  {
    id: 'vehicle_registration',
    name: 'KFZ-Zulassung',
    category: 'Fahrzeug & Verkehr',
    description: 'Neu-, Um- und Abmeldung von Kraftfahrzeugen',
    onlineAvailable: true,
    processingTime: 'Sofort',
    cost: 'Ab 26€',
    requirements: ['Fahrzeugschein', 'Fahrzeugbrief', 'Versicherungsbestätigung', 'TÜV-Bericht'],
    forms: ['Zulassungsantrag', 'SEPA-Lastschriftmandat'],
    appointmentRequired: false
  },
  {
    id: 'business_registration',
    name: 'Gewerbeanmeldung',
    category: 'Gewerbe & Arbeit',
    description: 'An-, Um- und Abmeldung von Gewerbebetrieben',
    onlineAvailable: true,
    processingTime: 'Sofort',
    cost: '26-60€',
    requirements: ['Personalausweis', 'Fachkundenachweis (je nach Gewerbe)'],
    forms: ['Gewerbeanmeldung', 'Steuerliche Erfassung'],
    appointmentRequired: false
  },
  {
    id: 'marriage_registration',
    name: 'Eheschließung',
    category: 'Familie & Soziales',
    description: 'Anmeldung zur Eheschließung',
    onlineAvailable: false,
    processingTime: '2-4 Wochen',
    cost: 'Ab 100€',
    requirements: ['Geburtsurkunde', 'Personalausweis', 'Ledigkeitsbescheinigung'],
    forms: ['Eheschließungsanmeldung'],
    appointmentRequired: true
  }
]

const serviceStatus = {
  'online_services': {
    status: 'operational',
    availability: '99.8%',
    last_update: '2024-01-15T10:30:00Z'
  },
  'citizen_offices': {
    status: 'operational',
    opening_hours: 'Mo-Fr 8:00-18:00, Sa 9:00-13:00',
    current_wait_time: '15 minutes'
  },
  'digital_signature': {
    status: 'operational',
    users: '45.000+',
    usage_rate: '78%'
  }
}

const appointments = [
  {
    id: 1,
    service: 'Eheschließung',
    date: '2024-02-20',
    time: '10:00',
    location: 'Standesamt Saarbrücken',
    status: 'available'
  },
  {
    id: 2,
    service: 'Beratungsgespräch',
    date: '2024-02-21',
    time: '14:30',
    location: 'Bürgeramt Mitte',
    status: 'available'
  },
  {
    id: 3,
    service: 'Passfotos',
    date: '2024-02-22',
    time: '09:15',
    location: 'Bürgeramt Dudweiler',
    status: 'available'
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
    const { action, category, service_id, citizen_id } = req.query as any

    switch (action) {
      case 'services':
        let filteredServices = administrativeServices
        
        if (category) {
          filteredServices = administrativeServices.filter(s => 
            s.category.toLowerCase().includes(category.toLowerCase())
          )
        }
        
        if (service_id) {
          filteredServices = administrativeServices.filter(s => s.id === service_id)
        }
        
        return res.status(200).json({
          success: true,
          data: filteredServices,
          total: filteredServices.length,
          categories: [
            'Persönliche Dokumente',
            'Fahrzeug & Verkehr',
            'Familie & Soziales',
            'Gewerbe & Arbeit'
          ]
        })

      case 'forms':
        if (!service_id) {
          return res.status(400).json({
            success: false,
            error: 'service_id required for forms action'
          })
        }
        
        const service = administrativeServices.find(s => s.id === service_id)
        if (!service) {
          return res.status(404).json({
            success: false,
            error: 'Service not found'
          })
        }
        
        return res.status(200).json({
          success: true,
          service: service.name,
          forms: service.forms,
          requirements: service.requirements,
          online_available: service.onlineAvailable,
          download_links: service.forms.map(form => ({
            name: form,
            url: `/forms/${service.id}/${form.toLowerCase().replace(/\s+/g, '-')}.pdf`,
            format: 'PDF'
          }))
        })

      case 'appointments':
        return res.status(200).json({
          success: true,
          data: appointments,
          total: appointments.length,
          next_available: appointments[0]?.date,
          booking_url: '/book-appointment'
        })

      case 'status':
        if (citizen_id) {
          // Simulate application status check
          return res.status(200).json({
            success: true,
            citizen_id,
            applications: [
              {
                id: `APP${Date.now()}`,
                service: 'Personalausweis',
                status: 'in_progress',
                submitted: '2024-01-10',
                expected_completion: '2024-01-24',
                current_step: 'Dokument wird produziert'
              }
            ]
          })
        }
        
        return res.status(200).json({
          success: true,
          system_status: serviceStatus,
          timestamp: new Date().toISOString()
        })

      default:
        return res.status(200).json({
          success: true,
          service: 'Administrative Service Saarland',
          availableActions: ['services', 'forms', 'appointments', 'status'],
          statistics: {
            online_services: 45,
            digital_applications: '75%',
            average_processing_time: '2.5 weeks',
            citizen_satisfaction: '4.2/5'
          },
          contact: {
            phone: '0681 / 501-0000',
            email: 'buergerservice@saarland.de',
            hours: 'Mo-Fr 8:00-18:00'
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Admin API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}