import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Anthropic } from '@anthropic-ai/sdk'

// Initialize Supabase client using service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * API route providing streaming Claude responses with session-based memory.
 * Expected body: { message: string, sessionId?: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, sessionId } = req.body as { message?: string; sessionId?: string }
  if (!message) return res.status(400).json({ error: 'Message required' })

  // Fetch existing conversation memory for the session
  let history: { role: 'user' | 'assistant'; content: string }[] = []
  if (sessionId) {
    const { data } = await supabase
      .from('agent_history')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('id', { ascending: true })
    history = (data as any[]) || []
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const systemPrompt = 'AgentNet ist unsere Antwort auf das tote Internet – Wissen lebt hier.'

  // Build conversation for Claude
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message }
  ] as any

  const stream = await anthropic.messages.create({
    model: 'claude-3.5-sonnet-20240620',
    max_tokens: 1024,
    stream: true,
    messages
  })

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })

  let assistantText = ''
  for await (const chunk of stream) {
    const text = chunk.delta?.text || ''
    assistantText += text
    res.write(text)
  }
  res.end()

  // Persist conversation to Supabase for future memory
  if (sessionId) {
    await supabase.from('agent_history').insert([
      { session_id: sessionId, role: 'user', content: message },
      { session_id: sessionId, role: 'assistant', content: assistantText }
    ])
  }
}
