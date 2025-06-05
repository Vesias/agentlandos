import { NextRequest, NextResponse } from 'next/server'
import behoerdenData from '@/data/saarland/behoerden-complete.json'

export const runtime = 'edge'

interface Authority {
  id: string
  name: string
  category: string
  type: string
  description: string
  address: {
    street: string
    city: string
    zipCode: string
    phone: string
    email: string
    website: string
  }
  services: string[]
  openingHours: {
    [key: string]: string
  }
  onlineServices: string[]
  keywords: string[]
}

interface SearchFilters {
  category?: string
  type?: string
  zipCode?: string
  service?: string
  keyword?: string
  city?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const filters: SearchFilters = {
      category: searchParams.get('category') || undefined,
      type: searchParams.get('type') || undefined,
      zipCode: searchParams.get('zipCode') || undefined,
      service: searchParams.get('service') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      city: searchParams.get('city') || undefined,
    }

    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredAuthorities = behoerdenData.authorities as Authority[]

    // Apply filters
    if (filters.category) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.category === filters.category
      )
    }

    if (filters.type) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.type === filters.type
      )
    }

    if (filters.zipCode) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.address.zipCode === filters.zipCode
      )
    }

    if (filters.city) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }

    // Text search across multiple fields
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredAuthorities = filteredAuthorities.filter(auth => {
        return (
          auth.name.toLowerCase().includes(searchTerm) ||
          auth.description.toLowerCase().includes(searchTerm) ||
          auth.services.some(service => 
            service.toLowerCase().includes(searchTerm)
          ) ||
          auth.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm)
          ) ||
          auth.address.street.toLowerCase().includes(searchTerm) ||
          auth.address.city.toLowerCase().includes(searchTerm)
        )
      })
    }

    // Service-specific search
    if (filters.service) {
      const serviceSearch = filters.service.toLowerCase()
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.services.some(service => 
          service.toLowerCase().includes(serviceSearch)
        )
      )
    }

    // Keyword search
    if (filters.keyword) {
      const keywordSearch = filters.keyword.toLowerCase()
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.keywords.some(keyword => 
          keyword.toLowerCase().includes(keywordSearch)
        )
      )
    }

    // Sort alphabetically
    filteredAuthorities.sort((a, b) => a.name.localeCompare(b.name))

    // Apply pagination
    const total = filteredAuthorities.length
    const paginatedResults = filteredAuthorities.slice(offset, offset + limit)

    // Generate suggestions based on search
    const suggestions = generateSuggestions(query, filters)

    const response = {
      success: true,
      data: {
        authorities: paginatedResults,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        filters: {
          applied: filters,
          available: {
            categories: behoerdenData.categories,
            types: Array.from(new Set(behoerdenData.authorities.map(a => a.type))),
            cities: Array.from(new Set(behoerdenData.authorities.map(a => a.address.city))),
            zipCodes: Array.from(new Set(behoerdenData.authorities.map(a => a.address.zipCode)))
          }
        },
        suggestions,
        metadata: behoerdenData.metadata
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      }
    })

  } catch (error) {
    console.error('Behörden API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search authorities',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zipCode, services, emergencyContact } = body

    if (!zipCode) {
      return NextResponse.json(
        { success: false, error: 'PLZ ist erforderlich' },
        { status: 400 }
      )
    }

    // Find authorities by PLZ
    const authoritiesInPLZ = behoerdenData.plzMapping[zipCode] || []
    const relevantAuthorities = behoerdenData.authorities.filter(auth => 
      authoritiesInPLZ.includes(auth.id)
    ) as Authority[]

    // If specific services requested, filter by services
    let recommendedServices = relevantAuthorities
    if (services && services.length > 0) {
      recommendedServices = relevantAuthorities.filter(auth =>
        services.some((service: string) => 
          auth.services.some(authService => 
            authService.toLowerCase().includes(service.toLowerCase())
          )
        )
      )
    }

    // Find emergency contacts if needed
    let emergencyInfo: any = null
    if (emergencyContact) {
      emergencyInfo = {
        police: "110",
        fire: "112",
        medical: "112",
        poison: "0681 19240",
        localPolice: relevantAuthorities.find(auth => 
          auth.category === 'polizei'
        )?.address.phone
      }
    }

    const response = {
      success: true,
      data: {
        zipCode,
        authoritiesInArea: relevantAuthorities,
        recommendedServices,
        emergencyInfo,
        quickLinks: {
          buergeramt: relevantAuthorities.find(auth => 
            auth.name.toLowerCase().includes('bürgeramt')
          ),
          kfzZulassung: relevantAuthorities.find(auth => 
            auth.name.toLowerCase().includes('kfz')
          ),
          finanzamt: relevantAuthorities.find(auth => 
            auth.name.toLowerCase().includes('finanzamt')
          )
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Behörden POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process authority request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function generateSuggestions(query: string, filters: SearchFilters): string[] {
  const suggestions: string[] = []
  
  // Common service suggestions
  const commonServices = [
    "Personalausweis beantragen",
    "KFZ-Zulassung",
    "Heirat anmelden",
    "Steuererklärung",
    "Arbeitslosengeld",
    "Wohngeld beantragen",
    "Gewerbe anmelden",
    "Führerschein beantragen",
    "Gesundheitszeugnis",
    "Polizeiliches Führungszeugnis"
  ]

  // Add service suggestions based on query
  if (query) {
    const matchingServices = commonServices.filter(service =>
      service.toLowerCase().includes(query.toLowerCase())
    )
    suggestions.push(...matchingServices.slice(0, 3))
  }

  // Add category suggestions
  if (!filters.category) {
    suggestions.push("Alle Kommunalverwaltungen", "Alle Landesbehörden", "Alle Finanzämter")
  }

  return suggestions.slice(0, 5)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}