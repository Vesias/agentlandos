import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_URL = process.env.BACKEND_API_URL || 'https://api.agentland.saarland/api/v1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${API_URL}/saartasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      return res.status(response.status).json({ 
        error: 'API request failed',
        details: errorText 
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    
    // Return a mock response for now if backend is not available
    const mockResponses = [
      {
        agent_id: "tourism_001",
        agent_name: "TourismAgent",
        message: "Willkommen im Saarland! Ich bin der Tourismus-Agent und helfe Ihnen gerne bei allen Fragen zu Sehenswürdigkeiten, Aktivitäten und Reiseplanung in unserer schönen Region. Was möchten Sie über das Saarland erfahren?",
        confidence: 0.95,
        thought_process: ["Anfrage erkannt", "Tourismus-Kontext identifiziert", "Antwort generiert"],
        regional_context: "Saarland - Großes entsteht immer im Kleinen"
      },
      {
        agent_id: "business_001",
        agent_name: "BusinessAgent",
        message: "Guten Tag! Als Wirtschafts-Agent des Saarlandes unterstütze ich Sie bei Fragen zu Unternehmensgründung, Förderprogrammen und Wirtschaftsstandort. Wie kann ich Ihnen helfen?",
        confidence: 0.92,
        thought_process: ["Wirtschaftsanfrage erkannt", "Relevante Informationen gesammelt"],
        regional_context: "Innovationsstandort Saarland"
      },
      {
        agent_id: "admin_001",
        agent_name: "AdminAgent",
        message: "Hallo! Ich bin der Verwaltungs-Agent und helfe Ihnen bei allen behördlichen Angelegenheiten im Saarland - von Personalausweis bis Gewerbeanmeldung. Womit kann ich Ihnen behilflich sein?",
        confidence: 0.90,
        thought_process: ["Verwaltungsanfrage identifiziert", "Zuständigkeiten geklärt"],
        regional_context: "Digitale Verwaltung Saarland"
      }
    ]
    
    // Return a random mock response
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    return res.status(200).json({
      ...mockResponse,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    })
  }
}