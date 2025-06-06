import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const completion = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }]
    })

    const content = completion?.content?.[0]?.text ?? ''
    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('Claude API error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
