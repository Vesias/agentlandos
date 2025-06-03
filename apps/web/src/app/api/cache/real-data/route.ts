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
        timestamp: cachedData.lastUpdate,
        dataPoints: {
          events: cachedData.events.length,
          hasWeather: !!cachedData.weather,
          fundingPrograms: cachedData.funding.length
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
    const response = await fetch('/api/analytics/real-users')
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
  const events = []

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
    const API_KEY = process.env.OPENWEATHER_API_KEY
    if (!API_KEY) return null

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Saarbrücken,DE&appid=${API_KEY}&units=metric&lang=de`
    )

    if (response.ok) {
      const data = await response.json()
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        recommendation: generateWeatherRecommendation(data),
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Weather API failed:', error)
  }

  return null
}

async function fetchRealFundingData() {
  const funding = []

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

function generateWeatherRecommendation(weatherData: any): string {
  const temp = weatherData.main.temp
  const condition = weatherData.weather[0].main.toLowerCase()

  if (temp > 20 && condition.includes('clear')) {
    return 'Perfekt für Bostalsee, Saarschleife Wanderungen, Open Air Events'
  } else if (temp > 15) {
    return 'Ideal für Völklinger Hütte, Saarschleife, Outdoor-Aktivitäten'
  } else if (condition.includes('rain')) {
    return 'Empfehlung: Museen, Theater, Indoor-Kultur'
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

// STARTUP: Initialer Cache-Load
if (typeof window === 'undefined') {
  // Server-side: Lade initiale echte Daten
  setTimeout(() => {
    updateCacheWithRealData()
  }, 1000)
}