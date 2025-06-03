import type { VercelRequest, VercelResponse } from '@vercel/node'

interface BusinessRequest {
  action: 'funding' | 'consulting' | 'networking' | 'apply'
  category?: string
  company_size?: string
  industry?: string
}

const fundingPrograms = [
  {
    id: 1,
    name: 'Saarland Innovation',
    type: 'Gründerförderung',
    amount: 'Bis zu 100.000€',
    description: 'Unterstützung für innovative Startups und Gründer',
    requirements: ['Innovatives Geschäftsmodell', 'Hauptsitz im Saarland', 'Nachhaltigkeit'],
    deadline: 'Laufend',
    applicationUrl: '/apply/innovation',
    eligibleIndustries: ['Tech', 'Biotech', 'Cleantech', 'Medtech']
  },
  {
    id: 2,
    name: 'Digitalisierungsbonus',
    type: 'Digitalisierung',
    amount: 'Bis zu 15.000€',
    description: 'Förderung digitaler Transformation für KMUs',
    requirements: ['KMU mit Sitz im Saarland', 'Digitalisierungsprojekt', 'Eigenanteil 50%'],
    deadline: '31.12.2024',
    applicationUrl: '/apply/digital',
    eligibleIndustries: ['Alle Branchen']
  },
  {
    id: 3,
    name: 'Exportförderung',
    type: 'International',
    amount: 'Bis zu 30.000€',
    description: 'Unterstützung beim Markteintritt in neue Länder',
    requirements: ['Exportorientierung', 'Marktanalyse', 'Messeteilnahme'],
    deadline: 'Jederzeit',
    applicationUrl: '/apply/export',
    eligibleIndustries: ['Industrie', 'Handel', 'Dienstleistung']
  }
]

const consultingServices = [
  {
    id: 1,
    name: 'Gründungsberatung',
    description: 'Kostenlose Erstberatung für Gründer',
    duration: '2 Stunden',
    cost: 'Kostenlos',
    provider: 'IHK Saarland',
    topics: ['Businessplan', 'Finanzierung', 'Rechtsform']
  },
  {
    id: 2,
    name: 'Digitalisierungsberatung',
    description: 'Analyse und Strategie für digitale Transformation',
    duration: '1 Tag',
    cost: '500€ (gefördert)',
    provider: 'Digital Hub Saarland',
    topics: ['Digitale Strategie', 'Technologie-Audit', 'Umsetzungsplan']
  },
  {
    id: 3,
    name: 'Exportberatung',
    description: 'Unterstützung bei Internationalisierung',
    duration: '4 Stunden',
    cost: '200€',
    provider: 'IHK International',
    topics: ['Marktanalyse', 'Exportstrategie', 'Rechtliches']
  }
]

const networkingEvents = [
  {
    id: 1,
    title: 'Startup Meetup Saarbrücken',
    date: '2024-02-15',
    time: '18:00',
    location: 'Digital Hub Saarland',
    type: 'Networking',
    attendees: '50-80',
    cost: 'Kostenlos'
  },
  {
    id: 2,
    title: 'Business Breakfast',
    date: '2024-02-20',
    time: '08:00',
    location: 'IHK Saarland',
    type: 'B2B Networking',
    attendees: '30-50',
    cost: '25€'
  },
  {
    id: 3,
    title: 'Digital Innovation Day',
    date: '2024-03-10',
    time: '09:00',
    location: 'Universität des Saarlandes',
    type: 'Konferenz',
    attendees: '200+',
    cost: '150€'
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
    const { action, category, company_size, industry } = req.query as any

    switch (action) {
      case 'funding':
        let filteredFunding = fundingPrograms
        
        if (category) {
          filteredFunding = fundingPrograms.filter(p => 
            p.type.toLowerCase().includes(category.toLowerCase())
          )
        }
        
        if (industry) {
          filteredFunding = filteredFunding.filter(p =>
            p.eligibleIndustries.some(ind => 
              ind.toLowerCase().includes(industry.toLowerCase()) || 
              ind === 'Alle Branchen'
            )
          )
        }
        
        return res.status(200).json({
          success: true,
          data: filteredFunding,
          total: filteredFunding.length,
          filters: { category, industry }
        })

      case 'consulting':
        return res.status(200).json({
          success: true,
          data: consultingServices,
          total: consultingServices.length
        })

      case 'networking':
        return res.status(200).json({
          success: true,
          data: networkingEvents,
          total: networkingEvents.length
        })

      case 'apply':
        // Simulate application process
        return res.status(200).json({
          success: true,
          message: 'Förderantrag eingegangen',
          applicationId: `BIZ${Date.now()}`,
          status: 'submitted',
          nextSteps: [
            'Prüfung der Unterlagen (1-2 Wochen)',
            'Rückfragen bei Bedarf',
            'Entscheidung (4-6 Wochen)',
            'Auszahlung bei Bewilligung'
          ]
        })

      default:
        return res.status(200).json({
          success: true,
          service: 'Business Service Saarland',
          availableActions: ['funding', 'consulting', 'networking', 'apply'],
          statistics: {
            funded_companies: 500,
            total_funding: '250M€',
            new_jobs: 3500,
            success_rate: '87%'
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Business API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}