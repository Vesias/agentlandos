import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const query = searchParams.get('query')

    // Saarland Municipalities Data
    const municipalities = {
      total_count: 52,
      major_cities: [
        {
          name: "Saarbrücken",
          population: 180374,
          postal_codes: ["66001", "66111", "66113", "66115", "66117", "66119"],
          services: ["Bürgeramt", "Standesamt", "Gewerbeamt", "Sozialamt"],
          coordinates: { lat: 49.2401, lon: 6.9969 },
          specialties: ["Landeshauptstadt", "Universität", "Staatstheater"]
        },
        {
          name: "Neunkirchen", 
          population: 46869,
          postal_codes: ["66538", "66539"],
          services: ["Bürgerservice", "Gewerbeamt", "Bauamt"],
          coordinates: { lat: 49.3469, lon: 7.1778 },
          specialties: ["Industriegeschichte", "Eisenhüttenmuseum"]
        },
        {
          name: "Homburg",
          population: 42843,
          postal_codes: ["66424", "66482"],
          services: ["Bürgerbüro", "Universitätsverwaltung", "Klinikum"],
          coordinates: { lat: 49.3269, lon: 7.3386 },
          specialties: ["Universitätsklinikum", "Schlossberg-Höhlen"]
        }
      ]
    }

    // Business Services Data
    const businessServices = {
      ihk_saarland: {
        name: "IHK des Saarlandes",
        services: ["Existenzgründung", "Ausbildungsberatung", "Außenwirtschaft"],
        contact: { phone: "+49 681 9520-0", email: "info@saarland.ihk.de" }
      },
      hwk_saarland: {
        name: "Handwerkskammer des Saarlandes", 
        services: ["Meisterprüfungen", "Betriebsberatung", "Existenzgründung"],
        contact: { phone: "+49 681 5809-0", email: "info@hwk-saarland.de" }
      }
    }

    if (type === 'municipalities') {
      if (query) {
        const filtered = municipalities.major_cities.filter(
          city => 
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.postal_codes.some(code => code.includes(query))
        )
        
        return NextResponse.json({
          success: true,
          type: 'municipalities',
          query,
          results: filtered,
          total: filtered.length
        })
      }
      
      return NextResponse.json({
        success: true,
        type: 'municipalities',
        data: municipalities
      })
    }

    if (type === 'business') {
      return NextResponse.json({
        success: true,
        type: 'business',
        data: businessServices
      })
    }

    return NextResponse.json({
      success: true,
      message: 'AGENTLAND.SAARLAND Data API - Echte Saarland Daten',
      available_endpoints: {
        municipalities: '/api/saarland/data?type=municipalities',
        business: '/api/saarland/data?type=business',
        search: '/api/saarland/data?type=municipalities&query=Saarbrücken'
      },
      statistics: {
        total_municipalities: 52,
        total_population: 990758,
        major_business_orgs: 2
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'API Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}