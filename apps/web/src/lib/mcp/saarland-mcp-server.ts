/**
 * Saarland MCP (Model Context Protocol) Server
 * Provides structured access to Saarland-specific data and services
 */

import { supabase } from '@/lib/supabase'

interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType?: string
}

interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

interface MCPPrompt {
  name: string
  description: string
  arguments?: any[]
}

export class SaarlandMCPServer {
  private resources: MCPResource[] = [
    {
      uri: 'saarland://data/municipalities',
      name: 'Saarland Municipalities',
      description: 'Complete list of all municipalities in Saarland with PLZ codes',
      mimeType: 'application/json'
    },
    {
      uri: 'saarland://data/authorities',
      name: 'Government Authorities',
      description: 'Directory of all government offices and authorities in Saarland',
      mimeType: 'application/json'
    },
    {
      uri: 'saarland://data/business-services',
      name: 'Business Services',
      description: 'Available business registration and support services',
      mimeType: 'application/json'
    },
    {
      uri: 'saarland://data/tourism-attractions',
      name: 'Tourism Attractions',
      description: 'Tourist attractions, events, and points of interest',
      mimeType: 'application/json'
    }
  ]

  private tools: MCPTool[] = [
    {
      name: 'lookup_plz',
      description: 'Look up postal code information for Saarland locations',
      inputSchema: {
        type: 'object',
        properties: {
          plz: { type: 'string', description: 'Postal code to lookup' },
          location: { type: 'string', description: 'City or location name' }
        },
        anyOf: [
          { required: ['plz'] },
          { required: ['location'] }
        ]
      }
    },
    {
      name: 'find_authority',
      description: 'Find the appropriate government authority for a service',
      inputSchema: {
        type: 'object',
        properties: {
          service: { type: 'string', description: 'Type of service needed' },
          location: { type: 'string', description: 'City or PLZ' }
        },
        required: ['service']
      }
    },
    {
      name: 'business_registration_info',
      description: 'Get business registration requirements and process information',
      inputSchema: {
        type: 'object',
        properties: {
          businessType: { type: 'string', description: 'Type of business to register' },
          location: { type: 'string', description: 'Intended business location' }
        },
        required: ['businessType']
      }
    },
    {
      name: 'tourism_events',
      description: 'Get current and upcoming tourism events in Saarland',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Event category (culture, sports, festivals, etc.)' },
          location: { type: 'string', description: 'Specific location or region' },
          dateRange: { type: 'string', description: 'Date range (e.g., "next month", "summer 2025")' }
        }
      }
    }
  ]

  private prompts: MCPPrompt[] = [
    {
      name: 'official_response_template',
      description: 'Template for official government responses',
      arguments: [
        { name: 'service', description: 'Government service being addressed' },
        { name: 'citizen_query', description: 'Original citizen inquiry' }
      ]
    },
    {
      name: 'business_guidance',
      description: 'Comprehensive business setup guidance for Saarland',
      arguments: [
        { name: 'business_type', description: 'Type of business being established' },
        { name: 'funding_needed', description: 'Whether funding information is needed' }
      ]
    },
    {
      name: 'tourism_recommendation',
      description: 'Personalized tourism recommendations for Saarland visitors',
      arguments: [
        { name: 'visitor_interests', description: 'Visitor interests and preferences' },
        { name: 'duration', description: 'Length of visit' },
        { name: 'season', description: 'Time of year for visit' }
      ]
    }
  ]

  async listResources(): Promise<MCPResource[]> {
    return this.resources
  }

  async getResource(uri: string): Promise<any> {
    switch (uri) {
      case 'saarland://data/municipalities':
        return await this.getMunicipalitiesData()
      
      case 'saarland://data/authorities':
        return await this.getAuthoritiesData()
      
      case 'saarland://data/business-services':
        return await this.getBusinessServicesData()
      
      case 'saarland://data/tourism-attractions':
        return await this.getTourismData()
      
      default:
        throw new Error(`Resource not found: ${uri}`)
    }
  }

  async listTools(): Promise<MCPTool[]> {
    return this.tools
  }

  async callTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'lookup_plz':
        return await this.lookupPLZ(args)
      
      case 'find_authority':
        return await this.findAuthority(args)
      
      case 'business_registration_info':
        return await this.getBusinessRegistrationInfo(args)
      
      case 'tourism_events':
        return await this.getTourismEvents(args)
      
      default:
        throw new Error(`Tool not found: ${name}`)
    }
  }

  async listPrompts(): Promise<MCPPrompt[]> {
    return this.prompts
  }

  async getPrompt(name: string, args: any): Promise<string> {
    switch (name) {
      case 'official_response_template':
        return this.generateOfficialResponseTemplate(args)
      
      case 'business_guidance':
        return this.generateBusinessGuidance(args)
      
      case 'tourism_recommendation':
        return this.generateTourismRecommendation(args)
      
      default:
        throw new Error(`Prompt not found: ${name}`)
    }
  }

  // Data retrieval methods
  private async getMunicipalitiesData(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('saarland_municipalities')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      return {
        error: 'Failed to fetch municipalities data',
        fallback: [
          { name: 'Saarbrücken', plz: '66111-66133', type: 'Landeshauptstadt' },
          { name: 'Neunkirchen', plz: '66538-66540', type: 'Kreisstadt' },
          { name: 'Homburg', plz: '66424', type: 'Universitätsstadt' },
          { name: 'St. Wendel', plz: '66606', type: 'Kreisstadt' }
        ]
      }
    }
  }

  private async getAuthoritiesData(): Promise<any> {
    return {
      landesebene: [
        {
          name: 'Ministerium für Inneres, Bauen und Sport',
          address: 'Franz-Josef-Röder-Str. 21, 66119 Saarbrücken',
          phone: '0681 501-00',
          services: ['Innere Sicherheit', 'Baurecht', 'Sport']
        },
        {
          name: 'Ministerium für Wirtschaft, Innovation, Digitales und Energie',
          address: 'Franz-Josef-Röder-Str. 17, 66119 Saarbrücken',
          phone: '0681 501-00',
          services: ['Wirtschaftsförderung', 'Digitalisierung', 'Energie']
        }
      ],
      kommunal: [
        {
          name: 'Bürgeramt Saarbrücken',
          address: 'Gerberstraße 4-6, 66111 Saarbrücken',
          phone: '0681 905-1234',
          services: ['Personalausweis', 'Meldewesen', 'Gewerbeanmeldung']
        }
      ]
    }
  }

  private async getBusinessServicesData(): Promise<any> {
    return {
      registration: {
        types: ['Einzelunternehmen', 'GmbH', 'UG', 'AG', 'Freiberufler'],
        requirements: ['Personalausweis', 'Geschäftskonzept', 'Nachweis Qualifikation'],
        costs: { gewerbeanmeldung: '26€', handelsregister: '150€' },
        duration: '1-4 Wochen'
      },
      funding: [
        {
          name: 'Saarland Innovation Fonds',
          amount: 'bis 250.000€',
          target: 'Innovative Startups',
          contact: 'innovation@saarland.de'
        },
        {
          name: 'EXIST-Gründerstipendium',
          amount: 'bis 75.000€',
          target: 'Hochschulgründungen',
          contact: 'exist@uni-saarland.de'
        }
      ]
    }
  }

  private async getTourismData(): Promise<any> {
    return {
      highlights: [
        {
          name: 'Saarschleife',
          type: 'Naturschauspiel',
          location: 'Mettlach',
          description: 'Deutschlands schönste Flussschleife'
        },
        {
          name: 'Völklinger Hütte',
          type: 'UNESCO Welterbe',
          location: 'Völklingen',
          description: 'Industriekultur und Welterbe'
        },
        {
          name: 'Bostalsee',
          type: 'Freizeitsee',
          location: 'Nohfelden',
          description: 'Wassersport und Erholung'
        }
      ],
      events: [
        {
          name: 'Altstadtfest Saarbrücken',
          date: 'Juni 2025',
          type: 'Stadtfest',
          location: 'Saarbrücken Altstadt'
        }
      ]
    }
  }

  // Tool implementations
  private async lookupPLZ(args: any): Promise<any> {
    const { plz, location } = args
    
    // Simplified PLZ lookup
    const plzData = {
      '66111': { city: 'Saarbrücken', district: 'Alt-Saarbrücken' },
      '66424': { city: 'Homburg', district: 'Innenstadt' },
      '66606': { city: 'St. Wendel', district: 'Innenstadt' }
    }

    if (plz && plzData[plz]) {
      return {
        plz,
        ...plzData[plz],
        services: ['Bürgeramt', 'Standesamt', 'Gewerbeamt']
      }
    }

    if (location) {
      const found = Object.entries(plzData).find(([_, data]) => 
        data.city.toLowerCase().includes(location.toLowerCase())
      )
      
      if (found) {
        const [foundPLZ, data] = found
        return {
          plz: foundPLZ,
          ...data,
          services: ['Bürgeramt', 'Standesamt', 'Gewerbeamt']
        }
      }
    }

    return { error: 'PLZ oder Ort nicht gefunden' }
  }

  private async findAuthority(args: any): Promise<any> {
    const { service, location } = args
    
    const serviceMap = {
      'personalausweis': {
        authority: 'Bürgeramt',
        phone: '0681 905-1234',
        address: 'Gerberstraße 4-6, 66111 Saarbrücken'
      },
      'gewerbeanmeldung': {
        authority: 'Gewerbeamt',
        phone: '0681 905-2345',
        address: 'Rathausplatz 1, 66111 Saarbrücken'
      },
      'bauen': {
        authority: 'Bauamt',
        phone: '0681 905-3456',
        address: 'Rathausplatz 1, 66111 Saarbrücken'
      }
    }

    const found = serviceMap[service.toLowerCase()]
    if (found) {
      return {
        service,
        location: location || 'Saarbrücken',
        ...found,
        openingHours: 'Mo-Fr 8-16 Uhr, Sa 9-13 Uhr'
      }
    }

    return { error: `Service ${service} nicht gefunden` }
  }

  private async getBusinessRegistrationInfo(args: any): Promise<any> {
    const { businessType, location } = args
    
    return {
      businessType,
      location: location || 'Saarland',
      requirements: [
        'Personalausweis oder Reisepass',
        'Geschäftskonzept',
        'Nachweis der fachlichen Eignung (je nach Branche)',
        'Gewerbeanmeldung (26€)'
      ],
      process: [
        '1. Gewerbeanmeldung beim Gewerbeamt',
        '2. Anmeldung bei der IHK/HWK',
        '3. Steuerliche Erfassung beim Finanzamt',
        '4. Anmeldung bei der Berufsgenossenschaft'
      ],
      duration: '1-4 Wochen',
      costs: {
        gewerbeanmeldung: '26€',
        handelsregister: '150€ (für GmbH/UG)',
        notar: '200-500€ (für GmbH/UG)'
      }
    }
  }

  private async getTourismEvents(args: any): Promise<any> {
    const { category, location, dateRange } = args
    
    return {
      events: [
        {
          name: 'Altstadtfest Saarbrücken',
          category: 'kultur',
          location: 'Saarbrücken',
          date: '2025-06-14 bis 2025-06-16',
          description: 'Traditionelles Fest in der Saarbrücker Altstadt'
        },
        {
          name: 'Saarschleife Wanderfestival',
          category: 'sport',
          location: 'Mettlach',
          date: '2025-05-10 bis 2025-05-12',
          description: 'Wanderungen rund um die berühmte Saarschleife'
        }
      ],
      filters: { category, location, dateRange }
    }
  }

  // Prompt generators
  private generateOfficialResponseTemplate(args: any): string {
    const { service, citizen_query } = args
    
    return `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Anfrage bezüglich ${service}.

${citizen_query ? `Zu Ihrer Frage: "${citizen_query}"` : ''}

Für diese Dienstleistung benötigen Sie folgende Unterlagen:
- [Spezifische Dokumente auflisten]

Die Bearbeitungszeit beträgt in der Regel [Zeitangabe].
Die Kosten belaufen sich auf [Kostenangabe].

Termine können Sie online unter saarbruecken.de/termine oder telefonisch unter 0681 905-1234 vereinbaren.

Mit freundlichen Grüßen
[Amt/Behörde]`
  }

  private generateBusinessGuidance(args: any): string {
    const { business_type, funding_needed } = args
    
    return `Gründungsberatung ${business_type} im Saarland

1. RECHTLICHE GRUNDLAGEN
${business_type === 'GmbH' ? '- Mindestkapital: 25.000€' : '- Keine Mindestkapitalanforderung'}
- Gewerbeanmeldung erforderlich
- Handelsregistereintrag ${business_type === 'GmbH' || business_type === 'UG' ? 'erforderlich' : 'optional'}

2. GRÜNDUNGSSCHRITTE
- Gewerbeanmeldung beim örtlichen Gewerbeamt (26€)
- Anmeldung bei IHK Saarland
- Steuerliche Erfassung beim Finanzamt
- Anmeldung bei Berufsgenossenschaft

${funding_needed === 'yes' ? `
3. FÖRDERMÖGLICHKEITEN
- Saarland Innovation Fonds (bis 250.000€)
- EXIST-Gründerstipendium (bis 75.000€)
- EU-Regionalförderung
- Mikrokreditfonds Deutschland
` : ''}

KONTAKT
IHK Saarland: 0681 9520-0
Wirtschaftsförderung: 0681 501-4200`
  }

  private generateTourismRecommendation(args: any): string {
    const { visitor_interests, duration, season } = args
    
    return `Saarland Tourismusempfehlung

EMPFOHLENE HIGHLIGHTS
${visitor_interests?.includes('natur') ? '🌊 Saarschleife - Deutschlands schönste Flussschleife' : ''}
${visitor_interests?.includes('kultur') ? '🏭 Völklinger Hütte - UNESCO Welterbe' : ''}
${visitor_interests?.includes('aktiv') ? '🏊 Bostalsee - Wassersport und Wandern' : ''}

DAUER: ${duration || '2-3 Tage'}
SAISON: ${season || 'Ganzjährig'}

${season === 'sommer' ? `
SOMMER-HIGHLIGHTS
- Baden am Bostalsee
- Wandern im Bliesgau
- Biergärten in Saarbrücken
` : ''}

PRAKTISCHE INFOS
- SaarVV Tageskarte: 10,40€
- Tourist-Info: +49 681 3877060
- Unterkünfte: saarland.de/hotels`
  }
}

export const saarlandMCPServer = new SaarlandMCPServer()