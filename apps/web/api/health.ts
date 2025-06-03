import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return res.status(200).json({
    status: 'healthy',
    service: 'AGENTLAND.SAARLAND Frontend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}