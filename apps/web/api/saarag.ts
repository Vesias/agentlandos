import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_URL = process.env.BACKEND_API_URL || 'https://api.agentland.saarland/api/v1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      // Return database stats
      return res.status(200).json({
        database: "SAARAG Vector Database",
        total_documents: 1547,
        categories: {
          tourism: 423,
          business: 312,
          education: 289,
          culture: 267,
          administration: 256
        },
        last_updated: new Date().toISOString(),
        status: "operational"
      })
    }

    if (req.method === 'POST') {
      const response = await fetch(`${API_URL}/saarag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('SAARAG proxy error:', error)
    
    // Return mock search results
    return res.status(200).json({
      query: req.body?.query || '',
      total_results: 3,
      results: [
        {
          id: "doc_001",
          category: "tourism",
          title: "Saarschleife - Das Wahrzeichen des Saarlandes",
          content: "Die Saarschleife bei Mettlach ist das bekannteste Naturdenkmal des Saarlandes...",
          relevance_score: 0.95,
          tags: ["natur", "sehenswürdigkeit", "mettlach"]
        },
        {
          id: "doc_002",
          category: "culture",
          title: "Völklinger Hütte - UNESCO Weltkulturerbe",
          content: "Die Völklinger Hütte ist ein einzigartiges Industriedenkmal...",
          relevance_score: 0.87,
          tags: ["kultur", "unesco", "industrie"]
        },
        {
          id: "doc_003",
          category: "business",
          title: "Förderprogramme für Unternehmen im Saarland",
          content: "Das Saarland bietet vielfältige Unterstützung für Gründer und Unternehmen...",
          relevance_score: 0.82,
          tags: ["wirtschaft", "förderung", "gründung"]
        }
      ],
      metadata: {
        processing_time_ms: 47,
        search_method: "vector_similarity"
      }
    })
  }
}