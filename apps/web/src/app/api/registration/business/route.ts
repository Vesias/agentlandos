import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface BusinessRegistration {
  // Grunddaten
  companyName: string
  legalForm: 'GmbH' | 'UG' | 'AG' | 'GbR' | 'OHG' | 'KG' | 'eK' | 'Freiberufler'
  industry: string
  description: string
  
  // Adresse & Kontakt
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  
  // Gründer/Geschäftsführer
  founder: {
    firstName: string
    lastName: string
    email: string
    phone: string
    saarId?: string // Verknüpfung mit SAAR-ID
  }
  
  // Business Details
  expectedEmployees: number
  expectedRevenue: number
  businessPlan?: string
  fundingNeeded: boolean
  fundingAmount?: number
  
  // Timestamps
  registrationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
}

interface FundingProgram {
  id: string
  name: string
  provider: string
  maxAmount: number
  minAmount: number
  eligibleFor: string[]
  description: string
  applicationUrl: string
  deadline?: string
}

// Saarland-spezifische Förderprogramme
const SAARLAND_FUNDING_PROGRAMS: FundingProgram[] = [
  {
    id: 'saar_startup',
    name: 'EXIST-Gründerstipendium Saarland',
    provider: 'Universität des Saarlandes',
    maxAmount: 50000,
    minAmount: 5000,
    eligibleFor: ['tech', 'innovation', 'research'],
    description: 'Förderung für innovative Technologie-Startups',
    applicationUrl: 'https://www.uni-saarland.de/exist',
    deadline: '2025-12-31'
  },
  {
    id: 'ihk_saar_micro',
    name: 'IHK Saarland Mikrogründung',
    provider: 'IHK Saarland',
    maxAmount: 25000,
    minAmount: 1000,
    eligibleFor: ['retail', 'service', 'craft'],
    description: 'Unterstützung für Kleinstunternehmen und Einzelgründer',
    applicationUrl: 'https://www.saarland.ihk.de/foerderung',
    deadline: '2025-06-30'
  },
  {
    id: 'saar_digital',
    name: 'Digitalisierungsförderung Saarland',
    provider: 'Wirtschaftsministerium Saarland',
    maxAmount: 100000,
    minAmount: 10000,
    eligibleFor: ['tech', 'digitalization', 'e-commerce'],
    description: 'Förderung der digitalen Transformation',
    applicationUrl: 'https://www.saarland.de/digitalisierung',
    deadline: '2025-09-15'
  },
  {
    id: 'green_saar',
    name: 'Green Tech Saarland Initiative',
    provider: 'Umweltministerium Saarland',
    maxAmount: 75000,
    minAmount: 5000,
    eligibleFor: ['environmental', 'sustainability', 'energy'],
    description: 'Förderung nachhaltiger und umweltfreundlicher Technologien',
    applicationUrl: 'https://www.saarland.de/umwelt/foerderung',
    deadline: '2025-11-30'
  }
]

// PLZ zu Zuständigkeit Mapping
const PLZ_TO_AUTHORITY = {
  '66111': { name: 'Gewerbeamt Saarbrücken', website: 'https://www.saarbruecken.de/gewerbe' },
  '66112': { name: 'Gewerbeamt Saarbrücken', website: 'https://www.saarbruecken.de/gewerbe' },
  '66113': { name: 'Gewerbeamt Saarbrücken', website: 'https://www.saarbruecken.de/gewerbe' },
  '66121': { name: 'Gewerbeamt Völklingen', website: 'https://www.voelklingen.de/gewerbe' },
  '66131': { name: 'Gewerbeamt Saarlouis', website: 'https://www.saarlouis.de/gewerbe' },
  '66424': { name: 'Gewerbeamt Homburg', website: 'https://www.homburg.de/gewerbe' },
  '66484': { name: 'Gewerbeamt Blieskastel', website: 'https://www.blieskastel.de/gewerbe' },
  '66578': { name: 'Gewerbeamt Schiffweiler', website: 'https://www.schiffweiler.de/gewerbe' }
}

export async function POST(request: NextRequest) {
  try {
    const registrationData: Partial<BusinessRegistration> = await request.json()
    
    // Validation
    if (!registrationData.companyName || !registrationData.legalForm || !registrationData.founder) {
      return NextResponse.json({
        success: false,
        error: 'Pflichtfelder fehlen: Firmenname, Rechtsform und Gründerdaten erforderlich'
      }, { status: 400 })
    }
    
    // Generate unique Business ID
    const businessId = `SAAR-BIZ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Complete registration data
    const completeRegistration: BusinessRegistration = {
      ...registrationData as BusinessRegistration,
      registrationDate: new Date().toISOString(),
      status: 'pending'
    }
    
    // Determine responsible authority based on PLZ
    const authority = PLZ_TO_AUTHORITY[registrationData.address?.postalCode as keyof typeof PLZ_TO_AUTHORITY]
    
    // Find matching funding programs
    const eligibleFunding = SAARLAND_FUNDING_PROGRAMS.filter(program => {
      if (!registrationData.industry || !registrationData.fundingNeeded) return false
      
      return program.eligibleFor.some(eligible => 
        registrationData.industry?.toLowerCase().includes(eligible) ||
        registrationData.description?.toLowerCase().includes(eligible)
      ) && (registrationData.fundingAmount || 0) >= program.minAmount &&
           (registrationData.fundingAmount || 0) <= program.maxAmount
    })
    
    // Generate next steps checklist
    const nextSteps = [
      {
        step: 1,
        title: 'Gewerbeanmeldung',
        description: `Online-Anmeldung bei ${authority?.name || 'zuständigem Gewerbeamt'}`,
        url: authority?.website,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        required: true
      },
      {
        step: 2,
        title: 'Steuerliche Erfassung',
        description: 'Anmeldung beim Finanzamt für steuerliche Erfassung',
        url: 'https://www.saarland.de/finanzamt',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        required: true
      },
      {
        step: 3,
        title: 'IHK/HWK Mitgliedschaft',
        description: 'Automatische Mitgliedschaft bei IHK oder Handwerkskammer',
        url: 'https://www.saarland.ihk.de',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        required: true
      },
      ...((registrationData.expectedEmployees || 0) > 0 ? [{
        step: 4,
        title: 'Sozialversicherung',
        description: 'Anmeldung bei Kranken-, Renten- und Arbeitslosenversicherung',
        url: 'https://www.deutsche-rentenversicherung.de',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        required: true
      }] : []),
      ...(eligibleFunding.length > 0 ? [{
        step: 5,
        title: 'Fördermittel beantragen',
        description: `${eligibleFunding.length} passende Förderprogramme gefunden`,
        url: eligibleFunding[0].applicationUrl,
        deadline: eligibleFunding[0].deadline,
        required: false
      }] : [])
    ]
    
    // Simulate database save
    console.log('🏢 New Business Registration:', {
      businessId,
      company: completeRegistration.companyName,
      founder: completeRegistration.founder.firstName + ' ' + completeRegistration.founder.lastName,
      location: completeRegistration.address?.city,
      industry: completeRegistration.industry
    })
    
    return NextResponse.json({
      success: true,
      data: {
        businessId,
        registration: completeRegistration,
        authority,
        eligibleFunding,
        nextSteps,
        estimatedProcessingTime: '7-14 Werktage',
        totalCosts: eligibleFunding.length > 0 ? '0-500€ (mit Förderung)' : '200-800€',
        supportContact: {
          name: 'AGENTLAND.SAARLAND Business Support',
          email: 'business@agentland.saarland',
          phone: '+49 681 123456',
          availableHours: 'Mo-Fr 8:00-18:00'
        }
      }
    })
    
  } catch (error) {
    console.error('Business registration error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Fehler bei der Unternehmensregistrierung',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const businessId = url.searchParams.get('businessId')
    const plz = url.searchParams.get('plz')
    
    if (businessId) {
      // Return specific business registration status
      return NextResponse.json({
        success: true,
        data: {
          businessId,
          status: 'under_review',
          lastUpdate: new Date().toISOString(),
          progress: 65,
          currentStep: 'Prüfung der Unterlagen durch Gewerbeamt'
        }
      })
    }
    
    if (plz) {
      // Return authority info for PLZ
      const authority = PLZ_TO_AUTHORITY[plz as keyof typeof PLZ_TO_AUTHORITY]
      return NextResponse.json({
        success: true,
        data: {
          plz,
          authority: authority || { name: 'PLZ nicht gefunden', website: null },
          availableFunding: SAARLAND_FUNDING_PROGRAMS.length
        }
      })
    }
    
    // Return general info
    return NextResponse.json({
      success: true,
      data: {
        availableFunding: SAARLAND_FUNDING_PROGRAMS,
        supportedLegalForms: ['GmbH', 'UG', 'AG', 'GbR', 'OHG', 'KG', 'eK', 'Freiberufler'],
        averageProcessingTime: '7-14 Werktage',
        registrationsThisMonth: Math.floor(Math.random() * 50) + 20,
        successRate: '94.2%'
      }
    })
    
  } catch (error) {
    console.error('Business registration GET error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Abrufen der Registrierungsdaten'
    }, { status: 500 })
  }
}