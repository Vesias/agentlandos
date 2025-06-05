import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Deployment test successful',
    timestamp: new Date().toISOString(),
    version: '2025-01-06-v2',
    features: [
      'SAARBRETT Community Platform',
      'Enhanced AI with DeepSeek R1',
      'Interactive Map with 40+ POIs',
      'Real-time Analytics'
    ]
  })
}