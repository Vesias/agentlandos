import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { supabaseServer } from '@/lib/supabase'

const llm = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const { message } = await request.json()
  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  const token = request.cookies.get('sb:token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: { user } } = await supabaseServer.auth.getUser(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: historyData } = await supabaseServer
    .from('chat_history')
    .select('messages')
    .eq('user_id', user.id)
    .single()

  const history = historyData?.messages || []
  history.push({ role: 'user', content: message })

  const result = await llm.call(history)
  history.push({ role: 'assistant', content: result.content ?? '' })

  await supabaseServer
    .from('chat_history')
    .upsert({ user_id: user.id, messages: history })

  return NextResponse.json({ answer: result.content })
}
