import { supabase } from '@/lib/supabase'

// Cross-border API integration for DE/FR/LU services
interface CrossBorderService {
  id: string
  name: string
  description: string
  country: 'DE' | 'FR' | 'LU'
  category: 'business' | 'residence' | 'tax' | 'social' | 'transport' | 'healthcare'
  digitalAvailable: boolean
  processingTime: string
  cost: string
  requiredDocuments: string[]
  apiEndpoint?: string
  contactInfo: {
    phone: string
    email: string
    website: string
    address: string
  }
}

interface CrossBorderRequest {
  serviceId: string
  sourceCountry: 'DE' | 'FR' | 'LU'
  targetCountry: 'DE' | 'FR' | 'LU'
  userData: {
    name: string
    residence: string
    nationality: string
    purpose: string
  }
  documents?: Record<string, any>
}

interface TaxComplianceData {
  sourceCountry: 'DE' | 'FR' | 'LU'
  targetCountry: 'DE' | 'FR' | 'LU'
  residenceStatus: 'resident' | 'non-resident' | 'cross-border-worker'
  taxRates: {
    income: number
    social: number
    vat: number
  }
  treaties: string[]
  exemptions: string[]
}

// Comprehensive service directory for all three countries
export const crossBorderServices: CrossBorderService[] = [
  // German services
  {
    id: 'de_residence_permit',
    name: 'Aufenthaltserlaubnis für EU-Bürger',
    description: 'Anmeldung des Wohnsitzes in Deutschland für EU-Bürger aus Frankreich/Luxemburg',
    country: 'DE',
    category: 'residence',
    digitalAvailable: true,
    processingTime: '2-4 Wochen',
    cost: '28,80 EUR',
    requiredDocuments: [
      'Gültiger EU-Personalausweis',
      'Nachweis der Krankenversicherung',
      'Meldebescheinigung',
      'Arbeitsvertrag oder Nachweis finanzieller Mittel'
    ],
    contactInfo: {
      phone: '+49 681 905-1234',
      email: 'auslaenderbehoerde@saarbruecken.de',
      website: 'https://service.saarland.de',
      address: 'Ausländerbehörde Saarbrücken, Dudweilerstraße 41, 66111 Saarbrücken'
    }
  },
  {
    id: 'de_business_license',
    name: 'Gewerbeanmeldung für EU-Ausländer',
    description: 'Anmeldung eines Gewerbes in Deutschland für französische/luxemburgische Staatsbürger',
    country: 'DE',
    category: 'business',
    digitalAvailable: true,
    processingTime: '1-2 Wochen',
    cost: '20,00 - 65,00 EUR',
    requiredDocuments: [
      'EU-Personalausweis oder Reisepass',
      'Aufenthaltstitel (falls erforderlich)',
      'Qualifikationsnachweise',
      'Gesellschaftsvertrag (bei Personengesellschaften)'
    ],
    contactInfo: {
      phone: '+49 681 905-5678',
      email: 'gewerbeamt@saarbruecken.de',
      website: 'https://unternehmensportal.saarland.de',
      address: 'Gewerbeamt Saarbrücken, Rathausplatz 1, 66111 Saarbrücken'
    }
  },
  {
    id: 'de_tax_number',
    name: 'Deutsche Steuernummer für Grenzpendler',
    description: 'Beantragung einer deutschen Steuernummer für Arbeitnehmer aus FR/LU',
    country: 'DE',
    category: 'tax',
    digitalAvailable: false,
    processingTime: '3-6 Wochen',
    cost: 'Kostenlos',
    requiredDocuments: [
      'Personalausweis',
      'Arbeitsvertrag',
      'Meldebescheinigung',
      'Bescheinigung des ausländischen Wohnsitzes'
    ],
    contactInfo: {
      phone: '+49 681 3000-0',
      email: 'info@finanzamt-saarbruecken.de',
      website: 'https://finanzamt.saarland.de',
      address: 'Finanzamt Saarbrücken, Am Stadtgraben 2, 66111 Saarbrücken'
    }
  },

  // French services
  {
    id: 'fr_carte_sejour',
    name: 'Carte de séjour pour citoyens allemands',
    description: 'Demande de carte de séjour en France pour les citoyens allemands',
    country: 'FR',
    category: 'residence',
    digitalAvailable: true,
    processingTime: '3-6 mois',
    cost: '225 EUR',
    requiredDocuments: [
      'Passeport ou carte d\'identité allemande',
      'Justificatif de domicile',
      'Contrat de travail ou ressources financières',
      'Assurance maladie'
    ],
    contactInfo: {
      phone: '+33 3 87 56 30 00',
      email: 'prefecture@moselle.gouv.fr',
      website: 'https://www.moselle.gouv.fr',
      address: 'Préfecture de la Moselle, Place de la Préfecture, 57034 Metz'
    }
  },
  {
    id: 'fr_auto_entrepreneur',
    name: 'Statut d\'auto-entrepreneur',
    description: 'Création d\'une micro-entreprise en France pour résidents allemands',
    country: 'FR',
    category: 'business',
    digitalAvailable: true,
    processingTime: '1-2 semaines',
    cost: 'Gratuit',
    requiredDocuments: [
      'Pièce d\'identité',
      'Justificatif de domicile français',
      'Déclaration sur l\'honneur',
      'Diplômes ou qualifications (selon activité)'
    ],
    contactInfo: {
      phone: '+33 820 033 033',
      email: 'contact@autoentrepreneur.urssaf.fr',
      website: 'https://www.autoentrepreneur.urssaf.fr',
      address: 'URSSAF Alsace-Moselle, 3 rue du Jeu des Enfants, 67967 Strasbourg'
    }
  },
  {
    id: 'fr_numero_fiscal',
    name: 'Numéro fiscal français',
    description: 'Obtention d\'un numéro fiscal français pour travailleurs frontaliers',
    country: 'FR',
    category: 'tax',
    digitalAvailable: false,
    processingTime: '4-8 semaines',
    cost: 'Gratuit',
    requiredDocuments: [
      'Pièce d\'identité',
      'Contrat de travail français',
      'Justificatif de résidence',
      'Déclaration de revenus précédente'
    ],
    contactInfo: {
      phone: '+33 3 83 56 23 23',
      email: 'accueil@dgfip.finances.gouv.fr',
      website: 'https://www.impots.gouv.fr',
      address: 'Centre des finances publiques, 3 Avenue de la Gare, 57200 Sarreguemines'
    }
  },

  // Luxembourg services
  {
    id: 'lu_autorisation_sejour',
    name: 'Autorisation de séjour Luxembourg',
    description: 'Demande d\'autorisation de séjour au Luxembourg pour citoyens UE',
    country: 'LU',
    category: 'residence',
    digitalAvailable: true,
    processingTime: '2-3 mois',
    cost: '80 EUR',
    requiredDocuments: [
      'Passeport ou carte d\'identité UE',
      'Certificat de résidence',
      'Contrat de travail ou preuve de ressources',
      'Assurance maladie'
    ],
    contactInfo: {
      phone: '+352 247-84500',
      email: 'info@mae.etat.lu',
      website: 'https://mae.gouvernement.lu',
      address: 'Ministère des Affaires étrangères, 5 rue Notre-Dame, L-2240 Luxembourg'
    }
  },
  {
    id: 'lu_autorisation_etablissement',
    name: 'Autorisation d\'établissement commercial',
    description: 'Création d\'entreprise au Luxembourg pour résidents DE/FR',
    country: 'LU',
    category: 'business',
    digitalAvailable: true,
    processingTime: '2-4 semaines',
    cost: '24 EUR',
    requiredDocuments: [
      'Formulaire de demande',
      'Extrait du casier judiciaire',
      'Diplômes ou certificats professionnels',
      'Preuve de qualification professionnelle'
    ],
    contactInfo: {
      phone: '+352 247-74700',
      email: 'rcs@mj.etat.lu',
      website: 'https://guichet.public.lu',
      address: 'Registre de commerce, 12 côte d\'Eich, L-1450 Luxembourg'
    }
  },
  {
    id: 'lu_numero_identification',
    name: 'Numéro d\'identification fiscale Luxembourg',
    description: 'Obtention du numéro fiscal luxembourgeois pour travailleurs frontaliers',
    country: 'LU',
    category: 'tax',
    digitalAvailable: false,
    processingTime: '2-4 semaines',
    cost: 'Gratuit',
    requiredDocuments: [
      'Pièce d\'identité',
      'Certificat de résidence',
      'Contrat de travail luxembourgeois',
      'Formulaire de demande'
    ],
    contactInfo: {
      phone: '+352 40 800-2000',
      email: 'info@acd.lu',
      website: 'https://acd.public.lu',
      address: 'Administration des contributions directes, 33 rue de Gasperich, L-5826 Hesperange'
    }
  }
]

// Tax compliance data for cross-border scenarios
export const taxComplianceMatrix: Record<string, TaxComplianceData> = {
  'DE-FR': {
    sourceCountry: 'DE',
    targetCountry: 'FR',
    residenceStatus: 'cross-border-worker',
    taxRates: {
      income: 14, // German tax rate for cross-border workers
      social: 9.3,
      vat: 19
    },
    treaties: ['DBA Deutschland-Frankreich 1959/2015'],
    exemptions: ['183-Tage-Regel', 'Grenzpendlerregelung']
  },
  'DE-LU': {
    sourceCountry: 'DE',
    targetCountry: 'LU',
    residenceStatus: 'cross-border-worker',
    taxRates: {
      income: 8, // Lower rate for Luxembourg workers
      social: 11.05,
      vat: 19
    },
    treaties: ['DBA Deutschland-Luxemburg 2012'],
    exemptions: ['Grenzpendlerregelung', 'Homeoffice-Regelung 2021']
  },
  'FR-DE': {
    sourceCountry: 'FR',
    targetCountry: 'DE',
    residenceStatus: 'cross-border-worker',
    taxRates: {
      income: 11,
      social: 22,
      vat: 20
    },
    treaties: ['Convention fiscale France-Allemagne 2015'],
    exemptions: ['Règle des 183 jours', 'Statut frontalier']
  },
  'FR-LU': {
    sourceCountry: 'FR',
    targetCountry: 'LU',
    residenceStatus: 'cross-border-worker',
    taxRates: {
      income: 0, // Luxembourg taxes at source
      social: 22,
      vat: 20
    },
    treaties: ['Convention France-Luxembourg 2018'],
    exemptions: ['Imposition à la source Luxembourg']
  },
  'LU-DE': {
    sourceCountry: 'LU',
    targetCountry: 'DE',
    residenceStatus: 'cross-border-worker',
    taxRates: {
      income: 42, // Luxembourg progressive tax
      social: 11.05,
      vat: 17
    },
    treaties: ['DBA Luxemburg-Deutschland 2012'],
    exemptions: ['Grenzgängerregelung', 'Homeoffice bis 25%']
  },
  'LU-FR': {
    sourceCountry: 'LU',
    targetCountry: 'FR',
    residenceStatus: 'cross-border-worker',
    taxRates: {
      income: 42,
      social: 11.05,
      vat: 17
    },
    treaties: ['Convention Luxembourg-France 2018'],
    exemptions: ['Statut résident fiscal Luxembourg']
  }
}

export class CrossBorderServiceManager {
  /**
   * Find services by country and category
   */
  static findServices(country?: 'DE' | 'FR' | 'LU', category?: string): CrossBorderService[] {
    return crossBorderServices.filter(service => {
      const matchesCountry = !country || service.country === country
      const matchesCategory = !category || service.category === category
      return matchesCountry && matchesCategory
    })
  }

  /**
   * Get service by ID
   */
  static getService(id: string): CrossBorderService | undefined {
    return crossBorderServices.find(service => service.id === id)
  }

  /**
   * Get tax compliance information for cross-border scenario
   */
  static getTaxCompliance(sourceCountry: 'DE' | 'FR' | 'LU', targetCountry: 'DE' | 'FR' | 'LU'): TaxComplianceData | null {
    const key = `${sourceCountry}-${targetCountry}`
    return taxComplianceMatrix[key] || null
  }

  /**
   * Calculate tax obligations for cross-border worker
   */
  static calculateTaxObligation(
    sourceCountry: 'DE' | 'FR' | 'LU',
    targetCountry: 'DE' | 'FR' | 'LU',
    annualIncome: number,
    workDaysInTarget: number
  ) {
    const compliance = this.getTaxCompliance(sourceCountry, targetCountry)
    if (!compliance) return null

    const workPercentage = workDaysInTarget / 220 // Assuming 220 work days per year
    const taxableIncome = annualIncome * workPercentage

    return {
      sourceCountryTax: annualIncome * (compliance.taxRates.income / 100),
      targetCountryTax: 0, // Usually exempted due to treaties
      socialContributions: annualIncome * (compliance.taxRates.social / 100),
      vatRate: compliance.taxRates.vat,
      applicableTreaties: compliance.treaties,
      exemptions: compliance.exemptions,
      totalTaxBurden: annualIncome * ((compliance.taxRates.income + compliance.taxRates.social) / 100),
      savingsFromTreaties: this.calculateTreatySavings(annualIncome, sourceCountry, targetCountry)
    }
  }

  /**
   * Calculate potential savings from tax treaties
   */
  private static calculateTreatySavings(
    income: number,
    sourceCountry: 'DE' | 'FR' | 'LU',
    targetCountry: 'DE' | 'FR' | 'LU'
  ): number {
    // Simplified calculation - in reality, this would be much more complex
    const standardTaxRates = { DE: 42, FR: 45, LU: 42 }
    const treatyRate = this.getTaxCompliance(sourceCountry, targetCountry)?.taxRates.income || 0
    const standardRate = standardTaxRates[targetCountry]
    
    return income * ((standardRate - treatyRate) / 100)
  }

  /**
   * Submit cross-border service request
   */
  static async submitRequest(request: CrossBorderRequest): Promise<any> {
    try {
      // Log the request to Supabase
      const { data, error } = await supabase
        .from('cross_border_requests')
        .insert({
          service_id: request.serviceId,
          source_country: request.sourceCountry,
          target_country: request.targetCountry,
          user_data: request.userData,
          documents: request.documents,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Get the service information
      const service = this.getService(request.serviceId)
      
      return {
        success: true,
        requestId: data.id,
        service,
        estimatedProcessingTime: service?.processingTime,
        nextSteps: this.getNextSteps(request.serviceId),
        contactInfo: service?.contactInfo
      }
    } catch (error) {
      console.error('Cross-border request submission failed:', error)
      return {
        success: false,
        error: 'Failed to submit request',
        fallback: 'Please contact the relevant authority directly'
      }
    }
  }

  /**
   * Get next steps for a specific service
   */
  private static getNextSteps(serviceId: string): string[] {
    const service = this.getService(serviceId)
    if (!service) return []

    const baseSteps = [
      'Dokumente zusammenstellen und überprüfen',
      service.digitalAvailable ? 'Online-Antrag stellen oder Termin vereinbaren' : 'Termin bei der Behörde vereinbaren',
      'Antrag einreichen und Bearbeitungsgebühr zahlen',
      'Bearbeitung abwarten',
      'Bescheid erhalten und bei Genehmigung abholen'
    ]

    // Add country-specific steps
    if (service.country === 'FR') {
      baseSteps.splice(1, 0, 'Dokumente ggf. ins Französische übersetzen lassen')
    }
    if (service.category === 'tax') {
      baseSteps.push('Steuerberater für grenzüberschreitende Beratung konsultieren')
    }

    return baseSteps
  }

  /**
   * Get recommended services for a cross-border scenario
   */
  static getRecommendedServices(
    sourceCountry: 'DE' | 'FR' | 'LU',
    targetCountry: 'DE' | 'FR' | 'LU',
    purpose: 'work' | 'business' | 'residence' | 'study'
  ): CrossBorderService[] {
    const targetServices = this.findServices(targetCountry)
    
    // Filter by purpose
    let relevantCategories: string[] = []
    
    switch (purpose) {
      case 'work':
        relevantCategories = ['residence', 'tax', 'social']
        break
      case 'business':
        relevantCategories = ['business', 'tax']
        break
      case 'residence':
        relevantCategories = ['residence', 'tax']
        break
      case 'study':
        relevantCategories = ['residence']
        break
    }

    return targetServices
      .filter(service => relevantCategories.includes(service.category))
      .sort((a, b) => {
        // Prioritize essential services
        const priority = { 'residence': 1, 'tax': 2, 'business': 3, 'social': 4 }
        return (priority[a.category as keyof typeof priority] || 5) - (priority[b.category as keyof typeof priority] || 5)
      })
  }
}

export default CrossBorderServiceManager