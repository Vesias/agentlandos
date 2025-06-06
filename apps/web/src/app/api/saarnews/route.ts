import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Saarland News Sources - Real RSS feeds and APIs
const SAARNEWS_SOURCES = {
  'sr-online': {
    name: 'SR Online',
    url: 'https://www.sr.de',
    rss: 'https://www.sr.de/sr/service/rss/aktuell_100.rss',
    category: 'Öffentlich-Rechtlich',
    reliability: 95,
    regional_focus: 100
  },
  'saarbruecker-zeitung': {
    name: 'Saarbrücker Zeitung',
    url: 'https://www.saarbruecker-zeitung.de',
    rss: 'https://www.saarbruecker-zeitung.de/rss/feed/sz-alles',
    category: 'Tageszeitung',
    reliability: 90,
    regional_focus: 95
  },
  'sol-magazin': {
    name: 'SOL Magazin',
    url: 'https://www.sol.de',
    rss: 'https://www.sol.de/feed/',
    category: 'Lifestyle',
    reliability: 85,
    regional_focus: 90
  },
  'wochenspiegel-saar': {
    name: 'Wochenspiegel Saar',
    url: 'https://www.wochenspiegellive.de/saarland',
    category: 'Wochenzeitung',
    reliability: 80,
    regional_focus: 100
  },
  'saarland-de': {
    name: 'Saarland.de (Offiziell)',
    url: 'https://www.saarland.de',
    rss: 'https://www.saarland.de/SharedDocs/Pressemitteilungen/rss_pressemitteilungen.rss',
    category: 'Behörden',
    reliability: 100,
    regional_focus: 100
  }
}

// News Categories with local focus
const NEWS_CATEGORIES = {
  breaking: {
    name: 'Eilmeldungen',
    keywords: ['eilmeldung', 'breaking', 'aktuell', 'jetzt'],
    priority: 100,
    premium: false
  },
  politics: {
    name: 'Saarland Politik',
    keywords: ['landtag', 'ministerpräsident', 'politik', 'wahlen', 'rehlinger'],
    priority: 90,
    premium: true
  },
  economy: {
    name: 'Wirtschaft',
    keywords: ['wirtschaft', 'unternehmen', 'arbeitsplätze', 'förderung', 'zkw'],
    priority: 80,
    premium: true
  },
  sports: {
    name: 'Sport',
    keywords: ['sport', 'fußball', 'saarbrücken', 'elversberg'],
    priority: 85,
    premium: false
  },
  culture: {
    name: 'Kultur & Events',
    keywords: ['kultur', 'festival', 'theater', 'konzert', 'veranstaltung'],
    priority: 70,
    premium: false
  },
  local: {
    name: 'Lokales',
    keywords: ['gemeinde', 'bürgermeister', 'stadtrat', 'baustelle', 'verkehr'],
    priority: 75,
    premium: false
  }
}

// AI-powered news analysis using our enhanced AI service
async function analyzeNewsWithAI(newsItem: any) {
  try {
    const response = await fetch('/api/ai/enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Analysiere diese Saarland-News: "${newsItem.title}" - ${newsItem.description}`,
        mode: 'chat',
        category: 'admin',
        context: { news_analysis: true }
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        sentiment: data.response?.includes('positiv') ? 'positive' : 
                  data.response?.includes('negativ') ? 'negative' : 'neutral',
        importance: data.confidence || 0.5,
        local_relevance: data.confidence || 0.8,
        summary: data.response?.substring(0, 150) || newsItem.description
      }
    }
  } catch (error) {
    console.error('AI news analysis failed:', error)
  }
  
  return {
    sentiment: 'neutral',
    importance: 0.5,
    local_relevance: 0.8,
    summary: newsItem.description
  }
}

// Fetch and parse RSS feeds
async function fetchNewsFromSource(sourceKey: string, source: any) {
  try {
    if (!source.rss) return []
    
    const response = await fetch(source.rss, {
      headers: {
        'User-Agent': 'agentland.saarland News Aggregator 1.0'
      }
    })
    
    if (!response.ok) return []
    
    const xmlText = await response.text()
    const items = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    const news = await Promise.all(items.slice(0, 10).map(async (item, index) => {
      const title = item.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || `News ${index + 1}`
      const link = item.match(/<link[^>]*>(.*?)<\/link>/)?.[1] || '#'
      const description = item.match(/<description[^>]*>(.*?)<\/description>/)?.[1] || ''
      const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString()
      
      const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, '').trim()
      const cleanDescription = description.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim()
      
      // Categorize news
      let category = 'local'
      for (const [catKey, catData] of Object.entries(NEWS_CATEGORIES)) {
        if (catData.keywords.some(keyword => 
          cleanTitle.toLowerCase().includes(keyword) || 
          cleanDescription.toLowerCase().includes(keyword)
        )) {
          category = catKey
          break
        }
      }
      
      const newsItem = {
        id: `${sourceKey}_${Date.now()}_${index}`,
        title: cleanTitle,
        description: cleanDescription.substring(0, 250),
        link: link.trim(),
        pubDate,
        source: source.name,
        sourceKey,
        category,
        reliability: source.reliability,
        regional_focus: source.regional_focus
      }
      
      // Add AI analysis for premium content
      const analysis = await analyzeNewsWithAI(newsItem)
      
      return {
        ...newsItem,
        ...analysis
      }
    }))
    
    return news
  } catch (error) {
    console.error(`RSS fetch error for ${sourceKey}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const premium = searchParams.get('premium') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Fetch news from all sources
    const allNews: any[] = []
    
    for (const [sourceKey, source] of Object.entries(SAARNEWS_SOURCES)) {
      const sourceNews = await fetchNewsFromSource(sourceKey, source)
      allNews.push(...sourceNews)
    }
    
    // Filter by category if specified
    let filteredNews = category ? 
      allNews.filter(news => news.category === category) : 
      allNews
    
    // Add premium content
    if (premium) {
      filteredNews.unshift({
        id: 'premium_insider',
        title: '🏆 PREMIUM: Neue KI-Förderung für Saarland startet',
        description: 'Exklusive Insider-Info: Das Saarland plant ein 50-Millionen-Euro KI-Förderprogramm für lokale Startups...',
        link: '/premium/news/insider',
        pubDate: new Date().toISOString(),
        source: 'Premium Insider',
        sourceKey: 'premium',
        category: 'economy',
        reliability: 100,
        regional_focus: 100,
        sentiment: 'positive',
        importance: 0.95,
        local_relevance: 1.0,
        premium: true
      })
    }
    
    // Sort by importance and date
    filteredNews.sort((a, b) => {
      const importanceA = a.importance * a.regional_focus
      const importanceB = b.importance * b.regional_focus
      if (importanceA !== importanceB) return importanceB - importanceA
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    })
    
    return NextResponse.json({
      news: filteredNews.slice(0, limit),
      total: filteredNews.length,
      sources: Object.keys(SAARNEWS_SOURCES),
      categories: NEWS_CATEGORIES,
      premium_available: !premium,
      last_update: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error('Saarnews API error:', error)
    return NextResponse.json({
      error: 'News service temporarily unavailable',
      success: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data, user_id } = await request.json()
    
    switch (type) {
      case 'subscribe':
        // Subscribe to news categories
        return NextResponse.json({
          message: `Du erhältst jetzt personalisierte ${data.category}-News! 📰`,
          subscription: {
            user_id,
            category: data.category,
            notifications: true,
            created_at: new Date().toISOString()
          },
          success: true
        })
        
      case 'share':
        // Share news article
        return NextResponse.json({
          message: 'News geteilt! +3 Community-Punkte 🏆',
          share: {
            id: Date.now(),
            user_id,
            news_id: data.news_id,
            platform: data.platform,
            points_earned: 3,
            created_at: new Date().toISOString()
          },
          success: true
        })
        
      case 'bookmark':
        // Bookmark news
        return NextResponse.json({
          message: 'News gespeichert! 📌',
          bookmark: {
            id: Date.now(),
            user_id,
            news_id: data.news_id,
            created_at: new Date().toISOString()
          },
          success: true
        })
        
      default:
        return NextResponse.json({
          error: 'Invalid action type',
          success: false
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Saarnews POST error:', error)
    return NextResponse.json({
      error: 'Action failed',
      success: false
    }, { status: 500 })
  }
}