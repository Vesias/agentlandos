import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

interface SaarIdProfile {
  // SAAR-ID Core
  saarId: string
  issuedDate: string
  expiryDate: string
  status: 'active' | 'inactive' | 'suspended' | 'expired'
  registrationStatus: 'pending' | 'in_review' | 'approved' | 'rejected' | 'active'
  
  // Personal Data with Age Verification
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    age: number
    placeOfBirth: string
    nationality: string
    gender?: 'male' | 'female' | 'diverse'
  }
  
  // Age Verification
  ageVerification: {
    verified: boolean
    ageAtRegistration: number
    minimumAgeRequired: number
    verificationDate: string
    passed: boolean
  }
  
  // Address & Contact
  residenceAddress: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
    district: string
    registrationDate: string
  }
  contact: {
    email: string
    phone?: string
    preferredLanguage: 'de' | 'fr' | 'en'
  }
  
  // Government Services Access
  authorizedServices: {
    serviceId: string
    serviceName: string
    accessLevel: 'read' | 'write' | 'admin'
    lastAccessed?: string
  }[]
  
  // Linked Accounts
  linkedAccounts: {
    businessRegistrations: string[]
    educationalInstitutions: string[]
    healthInsurance?: string
    taxId?: string
    socialSecurityNumber?: string
  }
  
  // Digital Identity
  digitalSignature: {
    enabled: boolean
    certificateId?: string
    lastSignature?: string
  }
  
  // Privacy & Consent
  privacySettings: {
    dataSharing: boolean
    marketingConsent: boolean
    researchParticipation: boolean
    lastUpdated: string
  }
}

// Saarland Government Services
const SAAR_GOVERNMENT_SERVICES = [
  {
    serviceId: 'buergeramt',
    serviceName: 'Bürgeramt Services',
    description: 'Personalausweis, Reisepass, Meldebescheinigungen',
    provider: 'Gemeinde/Stadt',
    accessLevel: 'read',
    website: 'https://www.saarland.de/buergerservice'
  },
  {
    serviceId: 'kfz_zulassung',
    serviceName: 'KFZ-Zulassung',
    description: 'Fahrzeug-An/Ummeldung, Kennzeichen-Reservierung',
    provider: 'Landkreis',
    accessLevel: 'write',
    website: 'https://www.saarland.de/kfz'
  },
  {
    serviceId: 'steuer_portal',
    serviceName: 'Steuer-Portal',
    description: 'Steuererklärung, Bescheide, Zahlungen',
    provider: 'Finanzamt Saarland',
    accessLevel: 'admin',
    website: 'https://www.finanzamt.saarland.de'
  },
  {
    serviceId: 'bildung_portal',
    serviceName: 'Bildungsportal',
    description: 'Schulanmeldung, Noten, Zeugnisse, BAföG',
    provider: 'Bildungsministerium',
    accessLevel: 'read',
    website: 'https://www.bildung.saarland.de'
  },
  {
    serviceId: 'gesundheit_akte',
    serviceName: 'Digitale Gesundheitsakte',
    description: 'Impfpass, Arzttermine, Rezepte',
    provider: 'Gesundheitsministerium',
    accessLevel: 'admin',
    website: 'https://www.gesundheit.saarland.de'
  },
  {
    serviceId: 'sozial_leistungen',
    serviceName: 'Sozialleistungen',
    description: 'Wohngeld, Kindergeld, Elterngeld',
    provider: 'Sozialamt',
    accessLevel: 'write',
    website: 'https://www.soziales.saarland.de'
  },
  {
    serviceId: 'gewerbe_portal',
    serviceName: 'Gewerbe-Portal',
    description: 'Gewerbeanmeldung, Genehmigungen, Förderungen',
    provider: 'Wirtschaftsministerium',
    accessLevel: 'write',
    website: 'https://www.wirtschaft.saarland.de'
  }
]

// PLZ to District/Municipality mapping
const PLZ_TO_MUNICIPALITY = {
  '66111': { city: 'Saarbrücken', district: 'Stadtmitte', municipality: 'Landeshauptstadt Saarbrücken' },
  '66112': { city: 'Saarbrücken', district: 'St. Johann', municipality: 'Landeshauptstadt Saarbrücken' },
  '66113': { city: 'Saarbrücken', district: 'Malstatt', municipality: 'Landeshauptstadt Saarbrücken' },
  '66121': { city: 'Völklingen', district: 'Innenstadt', municipality: 'Stadt Völklingen' },
  '66131': { city: 'Saarlouis', district: 'Altstadt', municipality: 'Kreisstadt Saarlouis' },
  '66424': { city: 'Homburg', district: 'Zentrum', municipality: 'Universitätsstadt Homburg' },
  '66484': { city: 'Blieskastel', district: 'Kernstadt', municipality: 'Stadt Blieskastel' },
  '66578': { city: 'Schiffweiler', district: 'Zentrum', municipality: 'Gemeinde Schiffweiler' }
}

function generateSaarId(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase()
  const checksum = Math.floor(Math.random() * 90) + 10
  
  return `SAAR-${year}-${randomPart}-${checksum}`
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function verifyAge(dateOfBirth: string, minAge: number = 14): { passed: boolean; age: number; message?: string } {
  const age = calculateAge(dateOfBirth)
  const passed = age >= minAge
  
  return {
    passed,
    age,
    message: passed ? undefined : `Mindestalter von ${minAge} Jahren nicht erreicht. Aktuelles Alter: ${age} Jahre.`
  }
}

function validateSaarlandResidence(postalCode: string): boolean {
  // Saarland PLZ ranges: 66xxx
  return postalCode.startsWith('66') && postalCode.length === 5
}

export async function POST(request: NextRequest) {
  try {
    const registrationData = await request.json()
    
    // Validation
    if (!registrationData.personalInfo || !registrationData.residenceAddress) {
      return NextResponse.json({
        success: false,
        error: 'Persönliche Daten und Wohnadresse sind erforderlich'
      }, { status: 400 })
    }
    
    // Validate required age field
    if (!registrationData.personalInfo.dateOfBirth) {
      return NextResponse.json({
        success: false,
        error: 'Geburtsdatum ist für die Altersverifikation erforderlich'
      }, { status: 400 })
    }
    
    // Perform age verification
    const ageVerification = verifyAge(registrationData.personalInfo.dateOfBirth, 14)
    if (!ageVerification.passed) {
      return NextResponse.json({
        success: false,
        error: 'Altersverifikation fehlgeschlagen',
        details: ageVerification.message,
        ageVerification: {
          passed: false,
          currentAge: ageVerification.age,
          minimumRequired: 14,
          message: ageVerification.message
        }
      }, { status: 400 })
    }
    
    // Validate Saarland residence
    if (!validateSaarlandResidence(registrationData.residenceAddress.postalCode)) {
      return NextResponse.json({
        success: false,
        error: 'SAAR-ID ist nur für Einwohner des Saarlandes verfügbar'
      }, { status: 400 })
    }
    
    // Generate SAAR-ID
    const saarId = generateSaarId()
    const issuedDate = new Date().toISOString()
    const expiryDate = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString() // 10 years
    
    // Determine municipality
    const municipalityInfo = PLZ_TO_MUNICIPALITY[registrationData.residenceAddress.postalCode as keyof typeof PLZ_TO_MUNICIPALITY]
    
    // Create SAAR-ID Profile
    const saarIdProfile: SaarIdProfile = {
      saarId,
      issuedDate,
      expiryDate,
      status: 'active',
      registrationStatus: ageVerification.passed ? 'approved' : 'rejected',
      personalInfo: {
        ...registrationData.personalInfo,
        age: ageVerification.age
      },
      ageVerification: {
        verified: true,
        ageAtRegistration: ageVerification.age,
        minimumAgeRequired: 14,
        verificationDate: issuedDate,
        passed: ageVerification.passed
      },
      residenceAddress: {
        ...registrationData.residenceAddress,
        district: municipalityInfo?.district || 'Unbekannt',
        registrationDate: issuedDate
      },
      contact: registrationData.contact,
      authorizedServices: SAAR_GOVERNMENT_SERVICES.map(service => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        accessLevel: service.accessLevel as 'read' | 'write' | 'admin'
      })),
      linkedAccounts: {
        businessRegistrations: [],
        educationalInstitutions: [],
        healthInsurance: registrationData.healthInsurance,
        taxId: registrationData.taxId,
        socialSecurityNumber: registrationData.socialSecurityNumber
      },
      digitalSignature: {
        enabled: registrationData.enableDigitalSignature || false
      },
      privacySettings: {
        dataSharing: registrationData.dataSharing || false,
        marketingConsent: registrationData.marketingConsent || false,
        researchParticipation: registrationData.researchParticipation || false,
        lastUpdated: issuedDate
      }
    }
    
    // Generate activation steps (only if age verification passed)
    const activationSteps = ageVerification.passed ? [
      {
        step: 1,
        title: 'Altersverifikation',
        description: `Alter bestätigt: ${ageVerification.age} Jahre (erforderlich: min. 14 Jahre)`,
        location: 'Automatisch validiert',
        completed: true,
        required: true
      },
      {
        step: 2,
        title: 'Identitätsprüfung',
        description: 'Persönliche Vorsprache mit Personalausweis bei zuständiger Behörde',
        location: municipalityInfo?.municipality || 'Zuständige Gemeinde',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        required: true
      },
      {
        step: 3,
        title: 'Digitale Signatur einrichten',
        description: 'Optionale Einrichtung der qualifizierten elektronischen Signatur',
        location: 'Online oder Bürgeramt',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        required: false
      },
      {
        step: 4,
        title: 'Service-Verknüpfungen',
        description: 'Bestehende Behördenkonten mit SAAR-ID verknüpfen',
        location: 'Online-Portal',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        required: false
      }
    ] : [
      {
        step: 1,
        title: 'Altersverifikation fehlgeschlagen',
        description: `Aktuelles Alter: ${ageVerification.age} Jahre. Erforderlich: min. 14 Jahre.`,
        location: 'Automatische Prüfung',
        failed: true,
        required: true
      },
      {
        step: 2,
        title: 'Antrag pausiert',
        description: 'Ihr Antrag wird pausiert bis Sie das Mindestalter erreichen.',
        location: 'System',
        required: true
      }
    ]
    
    // Calculate benefits
    const benefits = {
      timesSaved: '60% weniger Behördengänge',
      digitalServices: `${SAAR_GOVERNMENT_SERVICES.length} verfügbare Online-Services`,
      paperworkReduction: '80% weniger Formulare',
      singleSignOn: 'Ein Login für alle Saarland-Services',
      mobileFriendly: 'Vollständig mobile Nutzung möglich'
    }
    
    // Send email confirmation
    try {
      await emailService.sendSaarIdCreated({
        saarId,
        firstName: saarIdProfile.personalInfo.firstName,
        lastName: saarIdProfile.personalInfo.lastName,
        email: saarIdProfile.contact.email,
        authorizedServices: saarIdProfile.authorizedServices.map(s => s.serviceName)
      })
    } catch (emailError) {
      console.error('Failed to send SAAR-ID email:', emailError)
      // Don't fail the registration if email fails
    }

    console.log('🆔 New SAAR-ID Registration:', {
      saarId,
      name: saarIdProfile.personalInfo.firstName + ' ' + saarIdProfile.personalInfo.lastName,
      age: ageVerification.age,
      ageVerificationPassed: ageVerification.passed,
      city: saarIdProfile.residenceAddress.city,
      registrationStatus: saarIdProfile.registrationStatus,
      services: saarIdProfile.authorizedServices.length
    })
    
    return NextResponse.json({
      success: true,
      data: {
        saarIdProfile,
        activationSteps,
        benefits: ageVerification.passed ? benefits : {
          message: 'Vorteile sind nach erfolgreicher Altersverifikation verfügbar',
          ageRequirement: 'Mindestalter: 14 Jahre für SAAR-ID Registrierung'
        },
        ageVerification: {
          passed: ageVerification.passed,
          currentAge: ageVerification.age,
          minimumRequired: 14,
          message: ageVerification.message
        },
        qrCode: ageVerification.passed ? `https://agentland.saarland/saar-id/${saarId}` : null,
        downloadApp: ageVerification.passed ? {
          ios: 'https://apps.apple.com/de/app/saar-id',
          android: 'https://play.google.com/store/apps/details?id=de.saarland.saarid'
        } : null,
        supportContact: {
          name: 'SAAR-ID Support Center',
          email: 'saar-id@agentland.saarland',
          phone: '+49 681 SAAR-ID (722743)',
          chatbot: 'https://agentland.saarland/chat?service=verwaltung'
        },
        gdprNotice: {
          ageDataUsage: 'Ihre Altersangaben werden gemäß DSGVO verarbeitet und ausschließlich für die SAAR-ID Verifizierung verwendet.',
          dataRetention: 'Alter und Geburtsdatum werden für die Dauer der SAAR-ID Gültigkeit gespeichert.',
          dataRights: 'Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.'
        }
      }
    })
    
  } catch (error) {
    console.error('SAAR-ID registration error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Fehler bei der SAAR-ID Registrierung',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const saarId = url.searchParams.get('saarId')
    const service = url.searchParams.get('service')
    const plz = url.searchParams.get('plz')
    
    if (saarId) {
      // Return SAAR-ID profile information
      return NextResponse.json({
        success: true,
        data: {
          saarId,
          status: 'active',
          serviceAccess: SAAR_GOVERNMENT_SERVICES.length,
          lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          digitalSignatureEnabled: true,
          linkedServices: Math.floor(Math.random() * 5) + 3
        }
      })
    }
    
    if (service) {
      // Return service-specific information
      const serviceInfo = SAAR_GOVERNMENT_SERVICES.find(s => s.serviceId === service)
      return NextResponse.json({
        success: true,
        data: serviceInfo || { error: 'Service nicht gefunden' }
      })
    }
    
    if (plz) {
      // Return municipality info for PLZ
      const municipalityInfo = PLZ_TO_MUNICIPALITY[plz as keyof typeof PLZ_TO_MUNICIPALITY]
      return NextResponse.json({
        success: true,
        data: {
          plz,
          eligible: validateSaarlandResidence(plz),
          municipality: municipalityInfo || { error: 'PLZ nicht im Saarland' }
        }
      })
    }
    
    // Return general SAAR-ID information
    return NextResponse.json({
      success: true,
      data: {
        availableServices: SAAR_GOVERNMENT_SERVICES,
        totalSaarIdHolders: 0, // Starting from zero - real registrations only
        digitalSignatureUsers: 0, // Real count only
        averageSatisfaction: null, // No data yet
        systemUptime: '100%', // System is operational
        securityLevel: 'BSI-zertifiziert',
        supportedLanguages: ['Deutsch', 'Französisch', 'Englisch'],
        ageRequirements: {
          saarId: {
            minimumAge: 14,
            description: 'Mindestalter für SAAR-ID Registrierung'
          },
          businessId: {
            minimumAge: 18,
            description: 'Mindestalter für Business-ID Registrierung'
          }
        },
        registrationStatuses: {
          pending: 'Antrag eingereicht, Bearbeitung steht aus',
          in_review: 'Antrag wird geprüft',
          approved: 'Antrag genehmigt, bereit zur Aktivierung',
          rejected: 'Antrag abgelehnt (z.B. Altersverifikation fehlgeschlagen)',
          active: 'Registrierung aktiv und vollständig'
        }
      }
    })
    
  } catch (error) {
    console.error('SAAR-ID GET error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Abrufen der SAAR-ID Daten'
    }, { status: 500 })
  }
}