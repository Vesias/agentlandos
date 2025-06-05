import { NextRequest, NextResponse } from 'next/server'

// Mock data for SAARBRETT posts - in production this would come from a database
const SAARBRETT_POSTS = [
  {
    id: 'saar-post-1',
    title: 'Erfahrener Webentwickler sucht neue Herausforderung',
    description: 'Frontend-Entwickler mit 5 Jahren Erfahrung in React/Next.js sucht spannende Position im Saarland oder grenzüberschreitend. Spezialisiert auf moderne UI/UX und Performance-Optimierung.',
    category: 'jobs',
    type: 'suche',
    author: {
      name: 'Max Saarländer',
      type: 'user',
      verified: true,
      location: 'Saarbrücken'
    },
    location: 'Saarbrücken / Remote',
    tags: ['React', 'JavaScript', 'UI/UX', 'Frontend', 'Remote'],
    created: 'vor 2 Stunden',
    expires: '2025-03-06',
    views: 45,
    likes: 8,
    responses: 3,
    featured: false,
    urgent: false,
    contact: {
      email: 'max@example.com',
      phone: '+49 681 123456'
    }
  },
  {
    id: 'saar-post-2',
    title: 'KI-Startup bietet Werkstudentenstellen',
    description: 'Agentland.saarland sucht motivierte Studierende für Werkstudentenjobs im Bereich KI-Entwicklung. Flexible Arbeitszeiten, spannende Projekte und Einblicke in cutting-edge Technologie.',
    category: 'jobs',
    type: 'angebot',
    author: {
      name: 'AGENTLAND.SAARLAND',
      type: 'business',
      verified: true,
      location: 'Saarbrücken'
    },
    price: 15,
    location: 'Saarbrücken Innenstadt',
    tags: ['KI', 'Werkstudent', 'Python', 'Machine Learning', 'Startup'],
    created: 'vor 4 Stunden',
    expires: '2025-02-28',
    views: 123,
    likes: 19,
    responses: 12,
    featured: true,
    urgent: false,
    contact: {
      email: 'jobs@agentland.saarland',
      website: 'https://agentland.saarland/careers'
    }
  },
  {
    id: 'saar-post-3',
    title: '3-Zimmer Wohnung mit Balkon in Saarbrücken St. Johann',
    description: 'Schöne 3-Zimmer Wohnung (75qm) in zentraler Lage von St. Johann. Balkon, moderne Küche, Badewanne. Nähe zu öffentlichen Verkehrsmitteln und Einkaufsmöglichkeiten.',
    category: 'wohnen',
    type: 'angebot',
    author: {
      name: 'Saarland Immobilien GmbH',
      type: 'business',
      verified: true,
      location: 'Saarbrücken'
    },
    price: 850,
    location: 'Saarbrücken St. Johann',
    tags: ['3-Zimmer', 'Balkon', 'zentral', 'ÖPNV', 'St. Johann'],
    created: 'vor 1 Tag',
    expires: '2025-03-15',
    views: 89,
    likes: 14,
    responses: 7,
    featured: false,
    urgent: false,
    contact: {
      email: 'vermietung@saarland-immobilien.de',
      phone: '+49 681 987654'
    }
  },
  {
    id: 'saar-post-4',
    title: 'MacBook Pro M3 zu verkaufen - neuwertig',
    description: 'MacBook Pro 14" M3 Chip, 16GB RAM, 512GB SSD. Nur 3 Monate alt, noch Garantie. Verkauf wegen Firmen-Laptop. Originalverpackung und Zubehör dabei.',
    category: 'verkauf',
    type: 'verkauf',
    author: {
      name: 'TechSaar User',
      type: 'user',
      verified: false,
      location: 'Völklingen'
    },
    price: 2200,
    location: 'Völklingen',
    tags: ['MacBook', 'Apple', 'M3', 'neuwertig', 'Garantie'],
    created: 'vor 6 Stunden',
    expires: '2025-02-20',
    views: 67,
    likes: 11,
    responses: 5,
    featured: false,
    urgent: true,
    contact: {
      email: 'tech@example.com'
    }
  },
  {
    id: 'saar-post-5',
    title: 'IT-Support für kleine Unternehmen',
    description: 'Biete professionellen IT-Support für kleine und mittlere Unternehmen im Saarland. Netzwerk-Setup, Cloud-Migration, Datensicherheit. Faire Preise, schnelle Reaktionszeiten.',
    category: 'services',
    type: 'angebot',
    author: {
      name: 'SaarTech Solutions',
      type: 'business',
      verified: true,
      location: 'Neunkirchen'
    },
    location: 'Saarland-weit',
    tags: ['IT-Support', 'Netzwerk', 'Cloud', 'Sicherheit', 'KMU'],
    created: 'vor 3 Tage',
    expires: '2025-04-01',
    views: 156,
    likes: 23,
    responses: 9,
    featured: true,
    urgent: false,
    contact: {
      email: 'info@saartech.de',
      website: 'https://saartech-solutions.de',
      phone: '+49 6821 123789'
    }
  },
  {
    id: 'saar-post-6',
    title: 'Deutsch-Französischer Filmabend im Kino achteinhalb',
    description: 'Monatlicher Filmabend mit französischen Filmen (deutsche Untertitel). Nächster Termin: "Le Fabelmans" - Diskussion danach bei Wein und Brezeln.',
    category: 'events',
    type: 'event',
    author: {
      name: 'Kino achteinhalb',
      type: 'business',
      verified: true,
      location: 'Saarbrücken'
    },
    price: 8,
    location: 'Saarbrücken Nauwieser Viertel',
    tags: ['Film', 'Deutsch-Französisch', 'Kultur', 'Diskussion', 'Wein'],
    created: 'vor 1 Tag',
    expires: '2025-02-15',
    views: 78,
    likes: 16,
    responses: 11,
    featured: false,
    urgent: false,
    contact: {
      email: 'events@kino-achteinhalb.de',
      website: 'https://www.kino-achteinhalb.de'
    }
  },
  {
    id: 'saar-post-7',
    title: 'Mitfahrgelegenheit nach Frankfurt täglich',
    description: 'Biete täglich Mitfahrgelegenheit von Saarbrücken nach Frankfurt am Main. Abfahrt 6:30 Uhr, Rückfahrt 18:00 Uhr. Zuverlässig, Nichtraucher, moderne Ausstattung.',
    category: 'transport',
    type: 'angebot',
    author: {
      name: 'Pendler67',
      type: 'user',
      verified: true,
      location: 'Saarbrücken'
    },
    price: 25,
    location: 'Saarbrücken → Frankfurt',
    tags: ['Mitfahrgelegenheit', 'Frankfurt', 'täglich', 'Pendler', 'zuverlässig'],
    created: 'vor 5 Tage',
    expires: '2025-06-01',
    views: 234,
    likes: 31,
    responses: 18,
    featured: false,
    urgent: false,
    contact: {
      phone: '+49 681 555123'
    }
  },
  {
    id: 'saar-post-8',
    title: 'Python Programmierkurs - Anfänger willkommen',
    description: 'Wöchentlicher Python-Kurs für Einsteiger. Samstags 10-13 Uhr, max. 8 Teilnehmer. Laptop wird gestellt. Von den Grundlagen bis zu ersten Projekten.',
    category: 'bildung',
    type: 'angebot',
    author: {
      name: 'Code Academy Saar',
      type: 'business',
      verified: true,
      location: 'Saarbrücken'
    },
    price: 120,
    location: 'Saarbrücken Universität',
    tags: ['Python', 'Programmierung', 'Anfänger', 'Kurs', 'Laptop'],
    created: 'vor 2 Tage',
    expires: '2025-03-01',
    views: 145,
    likes: 27,
    responses: 15,
    featured: true,
    urgent: false,
    contact: {
      email: 'kurse@code-academy-saar.de',
      website: 'https://code-academy-saar.de'
    }
  },
  {
    id: 'saar-post-9',
    title: 'Saarländische Kochgruppe sucht Mitstreiter',
    description: 'Monatliches Kochen traditioneller saarländischer Gerichte. Dibbelabbes, Hoorische, Schales - lernen Sie die echte Saarländische Küche kennen!',
    category: 'community',
    type: 'suche',
    author: {
      name: 'Saarländische Tradition e.V.',
      type: 'business',
      verified: true,
      location: 'Merzig'
    },
    location: 'wechselnde Orte im Saarland',
    tags: ['Kochen', 'Tradition', 'Dibbelabbes', 'Gemeinschaft', 'Kultur'],
    created: 'vor 1 Woche',
    expires: '2025-12-31',
    views: 89,
    likes: 22,
    responses: 8,
    featured: false,
    urgent: false,
    contact: {
      email: 'tradition@saarlaendische-kultur.de'
    }
  },
  {
    id: 'saar-post-10',
    title: 'Suche Babysitter für 2-jährigen Sohn',
    description: 'Liebevolle Familie in Saarbrücken sucht zuverlässigen Babysitter für unseren 2-jährigen Sohn. Gelegentlich abends und Wochenenden. Erfahrung erwünscht.',
    category: 'services',
    type: 'suche',
    author: {
      name: 'Familie Müller',
      type: 'user',
      verified: true,
      location: 'Saarbrücken'
    },
    price: 12,
    location: 'Saarbrücken Dudweiler',
    tags: ['Babysitter', 'Kinderbetreuung', '2 Jahre', 'abends', 'Erfahrung'],
    created: 'vor 3 Stunden',
    expires: '2025-02-28',
    views: 34,
    likes: 6,
    responses: 2,
    featured: false,
    urgent: true,
    contact: {
      email: 'familie.mueller@example.com',
      phone: '+49 681 444777'
    }
  }
]

// KI-enhanced recommendations based on user behavior and trends
const AI_RECOMMENDATIONS = {
  trending_topics: ['KI-Jobs', 'Remote Work', 'Wohnungsmarkt', 'Cross-Border'],
  suggested_searches: [
    'IT Jobs Saarland',
    'Wohnung Saarbrücken',
    'Französisch lernen',
    'Startups Saarland'
  ],
  hot_categories: ['jobs', 'wohnen', 'services'],
  growth_areas: ['KI & Tech', 'Grenzüberschreitend', 'Nachhaltigkeit']
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category') || 'alle'
    const type = url.searchParams.get('type') || 'alle'
    const search = url.searchParams.get('search') || ''
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Filter posts based on parameters
    let filteredPosts = SAARBRETT_POSTS

    if (category !== 'alle') {
      filteredPosts = filteredPosts.filter(post => post.category === category)
    }

    if (type !== 'alle') {
      filteredPosts = filteredPosts.filter(post => post.type === type)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.description.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.location.toLowerCase().includes(searchLower)
      )
    }

    // Sort by featured first, then by creation date
    filteredPosts.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      if (a.urgent && !b.urgent) return -1
      if (!a.urgent && b.urgent) return 1
      return new Date(b.created).getTime() - new Date(a.created).getTime()
    })

    // Apply pagination
    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

    // Generate AI-powered insights
    const insights = {
      total_posts: filteredPosts.length,
      categories_breakdown: getCategoriesBreakdown(filteredPosts),
      trending_keywords: getTrendingKeywords(filteredPosts),
      location_distribution: getLocationDistribution(filteredPosts),
      activity_metrics: {
        new_today: filteredPosts.filter(p => p.created.includes('Stunden')).length,
        featured_count: filteredPosts.filter(p => p.featured).length,
        urgent_count: filteredPosts.filter(p => p.urgent).length,
        business_posts: filteredPosts.filter(p => p.author.type === 'business').length,
        user_posts: filteredPosts.filter(p => p.author.type === 'user').length
      }
    }

    return NextResponse.json({
      success: true,
      posts: paginatedPosts,
      insights,
      ai_recommendations: AI_RECOMMENDATIONS,
      pagination: {
        total: filteredPosts.length,
        limit,
        offset,
        has_more: offset + limit < filteredPosts.length
      },
      filters_applied: {
        category,
        type,
        search,
        timestamp: new Date().toISOString()
      },
      metadata: {
        region: 'Saarland',
        service: 'SAARBRETT',
        ai_enhanced: true,
        last_updated: new Date().toISOString(),
        version: 'v1.0.0'
      }
    })

  } catch (error) {
    console.error('SAARBRETT API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Laden der SAARBRETT Einträge',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      type,
      author,
      location,
      tags = [],
      price,
      expires,
      contact,
      urgent = false
    } = body

    // Validate required fields
    if (!title || !description || !category || !type || !author || !location) {
      return NextResponse.json({
        success: false,
        error: 'Pflichtfelder fehlen',
        required_fields: ['title', 'description', 'category', 'type', 'author', 'location']
      }, { status: 400 })
    }

    // Create new post
    const newPost = {
      id: `saar-post-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      author: {
        name: author.name,
        type: author.type || 'user',
        verified: false, // New posts need manual verification
        location: author.location || location
      },
      price: price ? parseFloat(price) : undefined,
      location: location.trim(),
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
      created: 'gerade eben',
      expires: expires || calculateDefaultExpiry(type),
      views: 0,
      likes: 0,
      responses: 0,
      featured: false, // New posts are not featured by default
      urgent: urgent === true,
      contact: contact || {},
      images: [], // Would be populated from file uploads
      ai_enhanced: true,
      status: 'pending_review' // All new posts need review
    }

    // In production, this would be saved to database
    // For now, we simulate success
    
    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'Ihr SAARBRETT Eintrag wurde erfolgreich erstellt und wartet auf Freischaltung.',
      review_info: {
        estimated_review_time: '2-6 Stunden',
        review_guidelines: 'Einträge werden auf Vollständigkeit und Richtlinien-Konformität geprüft',
        notification_method: 'E-Mail'
      },
      metadata: {
        created_at: new Date().toISOString(),
        ai_content_analysis: analyzeContentQuality(title, description),
        estimated_reach: calculateEstimatedReach(category, location, tags)
      }
    })

  } catch (error) {
    console.error('SAARBRETT POST Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Erstellen des Eintrags',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 })
  }
}

// Helper functions for analytics and AI insights

function getCategoriesBreakdown(posts: any[]) {
  const breakdown = {}
  posts.forEach(post => {
    breakdown[post.category] = (breakdown[post.category] || 0) + 1
  })
  return breakdown
}

function getTrendingKeywords(posts: any[]) {
  const keywordCount = {}
  posts.forEach(post => {
    post.tags.forEach(tag => {
      keywordCount[tag] = (keywordCount[tag] || 0) + 1
    })
  })
  
  return Object.entries(keywordCount)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }))
}

function getLocationDistribution(posts: any[]) {
  const locationCount = {}
  posts.forEach(post => {
    const location = post.location.split(' ')[0] // Get first word (city)
    locationCount[location] = (locationCount[location] || 0) + 1
  })
  return locationCount
}

function calculateDefaultExpiry(type: string): string {
  const now = new Date()
  const expiryDays = {
    'job': 30,
    'angebot': 14,
    'suche': 21,
    'event': 7,
    'verkauf': 30,
    'wohnung': 60
  }
  
  const days = expiryDays[type] || 30
  now.setDate(now.getDate() + days)
  return now.toISOString().split('T')[0] // YYYY-MM-DD format
}

function analyzeContentQuality(title: string, description: string) {
  const score = Math.min(100, 
    (title.length > 10 ? 25 : 0) +
    (description.length > 50 ? 35 : 0) +
    (description.length > 200 ? 25 : 0) +
    (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(title) ? 15 : 0) // No special chars in title
  )
  
  return {
    score,
    quality: score > 75 ? 'hoch' : score > 50 ? 'mittel' : 'niedrig',
    suggestions: score < 75 ? [
      'Titel sollte aussagekräftig und mindestens 10 Zeichen lang sein',
      'Beschreibung sollte mindestens 200 Zeichen haben',
      'Vermeiden Sie Sonderzeichen im Titel'
    ].filter(Boolean) : []
  }
}

function calculateEstimatedReach(category: string, location: string, tags: string[]) {
  const baseReach = {
    'jobs': 2500,
    'wohnen': 3000,
    'verkauf': 1800,
    'services': 2200,
    'events': 1500,
    'bildung': 1200,
    'transport': 1000,
    'community': 800
  }
  
  let reach = baseReach[category] || 1000
  
  // Location multiplier
  if (location.includes('Saarbrücken')) reach *= 1.5
  else if (location.includes('Saarland')) reach *= 1.2
  
  // Tags multiplier
  const popularTags = ['KI', 'Remote', 'zentral', 'modern', 'neu']
  const hasPopularTags = tags.some(tag => 
    popularTags.some(popular => tag.toLowerCase().includes(popular.toLowerCase()))
  )
  if (hasPopularTags) reach *= 1.3
  
  return Math.round(reach)
}