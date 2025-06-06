import type { NextApiRequest, NextApiResponse } from 'next'
import { Anthropic } from '@anthropic-ai/sdk'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { messages, system } = req.body || {}

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
    const completion = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: system || 'You are a helpful assistant for the Saarland region.',
      messages,
    })

    const content = completion.content?.[0]?.text ?? ''

    return res.status(200).json({ role: 'assistant', content })
  } catch (err: any) {
    console.error('Claude API error', err)
    return res.status(500).json({ error: 'Claude API error' })
  }
}
