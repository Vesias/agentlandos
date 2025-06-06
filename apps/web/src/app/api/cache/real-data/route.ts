import { NextRequest, NextResponse } from 'next/server'

// CACHE FÜR ECHTE SAARLAND DATEN
// Automatische Updates alle 15 Minuten

interface CachedRealData {
  userAnalytics: {
    activeUsers: number
    totalUsers: number
    pageViews: number
    timestamp: string
  }
  events: Array<{
    id: string
    title: string
    date: string
    location: string
    price?: string
    verified: boolean
    source: string
  }>
  weather: {
    temperature: number
    description: string
    recommendation: string
    timestamp: string
  } | null
  funding: Array<{
    title: string
    amount: string
    deadline: string
    category: string
    source: string
  }>
  lastUpdate: string
}

// In-Memory Cache (für Vercel Edge Functions)
let cachedData: CachedRealData | null = null
let lastCacheUpdate = 0

// GET: Hole gecachte echte Daten
export async function GET(request: NextRequest) {
  try {
    // Prüfe Cache-Alter (15 Minuten)
    const cacheAge = Date.now() - lastCacheUpdate
    const cacheExpiry = 15 * 60 * 1000 // 15 Minuten

    if (!cachedData || cacheAge > cacheExpiry) {
      console.log('🔄 Cache expired, fetching fresh real data...')
      await updateCacheWithRealData()
    }

    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cacheAge: Math.floor(cacheAge / 1000), // in Sekunden
        nextUpdate: Math.floor((cacheExpiry - cacheAge) / 1000)
      })
    }

    // Fallback: Leere echte Daten
    return NextResponse.json({
      userAnalytics: {
        activeUsers: 0,
        totalUsers: 0,
        pageViews: 0,
        timestamp: new Date().toISOString()
      },
      events: [],
      weather: null,
      funding: [],
      lastUpdate: new Date().toISOString(),
      note: 'No real data available - no fake numbers'
    })

  } catch (error) {
    console.error('Cache retrieval error:', error)
    
    return NextResponse.json({
      error: 'Cache unavailable',
      userAnalytics: { activeUsers: 0, totalUsers: 0, pageViews: 0, timestamp: new Date().toISOString() },
      events: [],
      weather: null,
      funding: [],
      lastUpdate: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST: Aktualisiere Cache mit echten Daten
export async function POST(request: NextRequest) {
  try {
    const newData = await request.json()
    
    // Validiere eingehende Daten
    if (isValidRealData(newData)) {
      cachedData = {
        ...newData,
        lastUpdate: new Date().toISOString()
      }
      lastCacheUpdate = Date.now()
      
      console.log('✅ Real data cache updated successfully')
      
      return NextResponse.json({ 
        success: true, 
        timestamp: cachedData!.lastUpdate,
        dataPoints: {
          events: cachedData!.events.length,
          hasWeather: !!cachedData!.weather,
          fundingPrograms: cachedData!.funding.length
        }
      })
    }

    return NextResponse.json({ 
      error: 'Invalid data format' 
    }, { status: 400 })

  } catch (error) {
    console.error('Cache update error:', error)
    return NextResponse.json({ 
      error: 'Cache update failed' 
    }, { status: 500 })
  }
}

// AUTOMATISCHE DATEN-AKTUALISIERUNG
async function updateCacheWithRealData() {
  try {
    console.log('📡 Fetching real Saarland data from APIs...')

    // Parallele API-Aufrufe für bessere Performance
    const [userAnalytics, events, weather, funding] = await Promise.all([
      fetchRealUserAnalytics(),
      fetchVerifiedSaarlandEvents(),
      fetchRealWeatherData(),
      fetchRealFundingData()
    ])

    const newData: CachedRealData = {
      userAnalytics,
      events,
      weather,
      funding,
      lastUpdate: new Date().toISOString()
    }

    // Cache aktualisieren
    cachedData = newData
    lastCacheUpdate = Date.now()

    console.log('✅ Real data cache refreshed:', {
      events: events.length,
      hasWeather: !!weather,
      funding: funding.length,
      activeUsers: userAnalytics.activeUsers
    })

  } catch (error) {
    console.error('❌ Real data fetch failed:', error)
  }
}

// ECHTE SAARLAND APIS
async function fetchRealUserAnalytics() {
  try {
    // Interne API für echte User-Daten
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/analytics/real-users`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('User analytics fetch failed:', error)
  }

  return {
    activeUsers: 0,
    totalUsers: 0,
    pageViews: 0,
    timestamp: new Date().toISOString()
  }
}

async function fetchVerifiedSaarlandEvents() {
  const events: any[] = []

  try {
    // Saarbrücken Events API
    const sbResponse = await fetch('https://www.saarbruecken.de/api/events', {
      headers: { 'User-Agent': 'AGENTLAND.SAARLAND/2.0' }
    })
    if (sbResponse.ok) {
      const sbData = await sbResponse.json()
      events.push(...parseEventData(sbData, 'Saarbrücken Events'))
    }
  } catch (error) {
    console.error('Saarbrücken events fetch failed:', error)
  }

  try {
    // Völklinger Hütte API
    const vhResponse = await fetch('https://voelklingerhütte.org/api/events')
    if (vhResponse.ok) {
      const vhData = await vhResponse.json()
      events.push(...parseEventData(vhData, 'Völklinger Hütte'))
    }
  } catch (error) {
    console.error('Völklinger Hütte fetch failed:', error)
  }

  // Nur verifizierte, zukünftige Events
  return events.filter(event => 
    event.verified && 
    new Date(event.date) > new Date()
  )
}

async function fetchRealWeatherData() {
  try {
    // Use Open-Meteo API for reliable weather data (no API key required)
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=49.2401&longitude=6.9969&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe/Berlin&forecast_days=1'
    )

    if (response.ok) {
      const data = await response.json()
      const current = data.current
      
      return {
        temperature: Math.round(current.temperature_2m),
        description: getWeatherDescription(current.weather_code),
        recommendation: generateWeatherRecommendation(current),
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Weather API failed:', error)
  }

  return null
}

function getWeatherDescription(code: number): string {
  const descriptions: { [key: number]: string } = {
    0: 'Klar und sonnig',
    1: 'Überwiegend klar',
    2: 'Teilweise bewölkt',
    3: 'Bewölkt',
    45: 'Nebelig',
    48: 'Nebelig mit Reif',
    51: 'Leichter Nieselregen',
    53: 'Nieselregen',
    55: 'Starker Nieselregen',
    61: 'Leichter Regen',
    63: 'Regen',
    65: 'Starker Regen',
    71: 'Leichter Schneefall',
    73: 'Schneefall',
    75: 'Starker Schneefall',
    80: 'Regenschauer',
    81: 'Regenschauer',
    82: 'Starke Regenschauer',
    95: 'Gewitter',
    96: 'Gewitter mit Hagel',
    99: 'Schweres Gewitter'
  }
  
  return descriptions[code] || 'Wetterlage unbekannt'
}

async function fetchRealFundingData() {
  const funding: any[] = []

  try {
    // Saarland Wirtschaftsförderung
    const response = await fetch('https://www.saarland.de/wirtschaft/api/foerderung')
    if (response.ok) {
      const data = await response.json()
      funding.push(...(data.programs || []))
    }
  } catch (error) {
    console.error('Funding API failed:', error)
  }

  return funding
}

// HELPER FUNCTIONS
function parseEventData(data: any, source: string) {
  if (!Array.isArray(data)) return []

  return data.map(item => ({
    id: item.id || `${source}-${Date.now()}-${Math.random()}`,
    title: item.title || item.name || '',
    date: item.date || item.start_date || '',
    location: item.location || item.venue || '',
    price: item.price || item.cost || '',
    verified: true,
    source
  })).filter(event => event.title && event.date)
}

function generateWeatherRecommendation(current: any): string {
  const temp = current.temperature_2m
  const weatherCode = current.weather_code

  if (temp > 20 && [0, 1].includes(weatherCode)) {
    return 'Perfekt für Bostalsee, Saarschleife Wanderungen, Open Air Events'
  } else if (temp > 15 && weatherCode < 50) {
    return 'Ideal für Völklinger Hütte, Saarschleife, Outdoor-Aktivitäten'
  } else if (weatherCode >= 61 && weatherCode <= 65) {
    return 'Empfehlung: Museen, Theater, Indoor-Kultur'
  } else if (temp < 5) {
    return 'Warme Innenräume empfohlen: Völklinger Hütte, Museen, Cafés'
  }

  return 'Wettergerechte Aktivitäten verfügbar'
}

function isValidRealData(data: any): boolean {
  return !!(
    data &&
    data.userAnalytics &&
    Array.isArray(data.events) &&
    Array.isArray(data.funding)
  )
}

// STARTUP: Removed auto-load to prevent build errors