import { NextRequest, NextResponse } from 'next/server'
import CrossBorderServiceManager from '@/lib/api/cross-border-services'

export const runtime = 'edge'

interface CrossBorderQuery {
  action: 'services' | 'tax-info' | 'recommendations' | 'submit'
  sourceCountry?: 'DE' | 'FR' | 'LU'
  targetCountry?: 'DE' | 'FR' | 'LU'
  category?: string
  purpose?: 'work' | 'business' | 'residence' | 'study'
  income?: number
  workDays?: number
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action') as CrossBorderQuery['action']
    const sourceCountry = url.searchParams.get('sourceCountry') as 'DE' | 'FR' | 'LU'
    const targetCountry = url.searchParams.get('targetCountry') as 'DE' | 'FR' | 'LU'
    const category = url.searchParams.get('category')
    const purpose = url.searchParams.get('purpose') as 'work' | 'business' | 'residence' | 'study'
    const income = url.searchParams.get('income') ? parseInt(url.searchParams.get('income')!) : undefined
    const workDays = url.searchParams.get('workDays') ? parseInt(url.searchParams.get('workDays')!) : undefined

    switch (action) {
      case 'services':
        const services = CrossBorderServiceManager.findServices(targetCountry, category)
        return NextResponse.json({
          success: true,
          data: services,
          meta: {
            totalServices: services.length,
            targetCountry,
            category,
            digitalServicesAvailable: services.filter(s => s.digitalAvailable).length
          },
          timestamp: new Date().toISOString()
        })

      case 'recommendations':
        if (!sourceCountry || !targetCountry || !purpose) {
          return NextResponse.json(
            { error: 'sourceCountry, targetCountry, and purpose parameters required' },
            { status: 400 }
          )
        }

        const recommendations = CrossBorderServiceManager.getRecommendedServices(
          sourceCountry,
          targetCountry,
          purpose
        )

        return NextResponse.json({
          success: true,
          data: {
            recommendations,
            crossBorderInfo: {
              sourceCountry,
              targetCountry,
              purpose,
              totalRecommendations: recommendations.length,
              estimatedTimeframe: getEstimatedTimeframe(recommendations),
              estimatedCosts: getEstimatedCosts(recommendations)
            }
          },
          timestamp: new Date().toISOString()
        })

      case 'tax-info':
        if (!sourceCountry || !targetCountry) {
          return NextResponse.json(
            { error: 'sourceCountry and targetCountry parameters required' },
            { status: 400 }
          )
        }

        const taxCompliance = CrossBorderServiceManager.getTaxCompliance(sourceCountry, targetCountry)
        
        if (!taxCompliance) {
          return NextResponse.json(
            { error: 'Tax information not available for this country combination' },
            { status: 404 }
          )
        }

        let taxCalculation = null
        if (income && workDays) {
          taxCalculation = CrossBorderServiceManager.calculateTaxObligation(
            sourceCountry,
            targetCountry,
            income,
            workDays
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            taxCompliance,
            calculation: taxCalculation,
            recommendations: getTaxRecommendations(sourceCountry, targetCountry, income)
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          service: 'Cross-Border Services API',
          version: '2.0.0',
          availableActions: ['services', 'recommendations', 'tax-info', 'submit'],
          supportedCountries: ['DE', 'FR', 'LU'],
          categories: ['business', 'residence', 'tax', 'social', 'transport', 'healthcare'],
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Cross-border API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cross-border service temporarily unavailable',
        fallback: 'Please contact relevant authorities directly'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, serviceId, userData, documents } = body

    if (action === 'submit') {
      if (!serviceId || !userData) {
        return NextResponse.json(
          { error: 'serviceId and userData are required' },
          { status: 400 }
        )
      }

      const result = await CrossBorderServiceManager.submitRequest({
        serviceId,
        sourceCountry: userData.sourceCountry,
        targetCountry: userData.targetCountry,
        userData,
        documents
      })

      return NextResponse.json({
        success: result.success,
        data: result.success ? result : undefined,
        error: result.success ? undefined : result.error,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Cross-border POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process cross-border request'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getEstimatedTimeframe(services: any[]): string {
  if (services.length === 0) return 'Unknown'
  
  // Extract weeks from processing times and find maximum
  const weeks = services.map(service => {
    const match = service.processingTime.match(/(\d+)-?(\d+)?\s*(semaine|Woche|week)/i)
    if (match) {
      return parseInt(match[2] || match[1])
    }
    return 4 // Default to 4 weeks
  })
  
  const maxWeeks = Math.max(...weeks)
  return `${maxWeeks} Wochen`
}

function getEstimatedCosts(services: any[]): string {
  const costs = services.map(service => {
    if (service.cost.includes('Gratuit') || service.cost.includes('Kostenlos')) {
      return 0
    }
    
    const match = service.cost.match(/(\d+(?:,\d+)?)/g)
    if (match) {
      return parseFloat(match[0].replace(',', '.'))
    }
    return 50 // Default estimate
  })
  
  const totalCost = costs.reduce((sum, cost) => sum + cost, 0)
  return `€${totalCost.toFixed(2)}`
}

function getTaxRecommendations(
  sourceCountry: 'DE' | 'FR' | 'LU',
  targetCountry: 'DE' | 'FR' | 'LU',
  income?: number
): string[] {
  const recommendations = [
    'Konsultieren Sie einen Steuerberater für grenzüberschreitende Beratung',
    'Prüfen Sie die Anwendbarkeit von Doppelbesteuerungsabkommen',
    'Dokumentieren Sie Ihre Arbeitstage im Zielland genau'
  ]

  // Add specific recommendations based on countries
  const countryKey = `${sourceCountry}-${targetCountry}`
  const specificRecommendations = {
    'DE-FR': [
      'Beachten Sie die 183-Tage-Regel für deutsche Steuerpflicht',
      'Nutzen Sie die Grenzpendlerregelung bei täglichem Pendelverkehr'
    ],
    'DE-LU': [
      'Luxemburg besteuert an der Quelle - deutsche Freistellung beantragen',
      'Homeoffice-Regelung: Max. 25% der Arbeitszeit in Deutschland'
    ],
    'FR-DE': [
      'Deutsche Lohnsteuer bei Beschäftigung in Deutschland',
      'Französische Sozialversicherung bleibt bestehen'
    ],
    'FR-LU': [
      'Steuerliche Ansässigkeit in Luxemburg kann vorteilhaft sein',
      'Prüfen Sie Familienleistungen in beiden Ländern'
    ],
    'LU-DE': [
      'Hohe luxemburgische Steuersätze beachten',
      'Deutsche Steuerfreistellung für Luxemburg-Einkommen'
    ],
    'LU-FR': [
      'Komplexe Regelungen - professionelle Beratung empfohlen',
      'Sozialversicherungsabkommen beachten'
    ]
  }

  const specific = specificRecommendations[countryKey as keyof typeof specificRecommendations] || []
  
  // Add income-based recommendations
  if (income) {
    if (income > 100000) {
      recommendations.push('Bei hohen Einkommen: Steueroptimierung durch Ansässigkeitswechsel prüfen')
    }
    if (income < 30000) {
      recommendations.push('Prüfen Sie Anspruch auf grenzüberschreitende Sozialleistungen')
    }
  }

  return [...recommendations, ...specific]
}