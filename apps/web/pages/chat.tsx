import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuid } from 'uuid'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const sessionIdRef = useRef('')

  // Ensure session id in browser storage
  useEffect(() => {
    let id = sessionStorage.getItem('agent-session')
    if (!id) {
      id = uuid()
      sessionStorage.setItem('agent-session', id)
    }
    sessionIdRef.current = id

    // Subscribe to history table for real-time updates
    const channel = supabase
      .channel('agent-history')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_history', filter: `session_id=eq.${id}` },
        payload => {
          setMessages(m => [...m, { role: payload.new.role, content: payload.new.content }])
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userText = input
    setMessages(m => [...m, { role: 'user', content: userText }])
    setInput('')

    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, sessionId: sessionIdRef.current })
    })

    if (!res.ok) return
    const reader = res.body!.getReader()
    let assistantText = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = new TextDecoder().decode(value)
      assistantText += chunk
      setMessages(m => {
        const last = m[m.length - 1]
        if (last && last.role === 'assistant') {
          return [...m.slice(0, -1), { ...last, content: assistantText }]
        }
        return [...m, { role: 'assistant', content: assistantText }]
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-saarland-blue">AgentNet Chat</h1>
        <div className="space-y-2 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <span className={m.role === 'user' ? 'bg-saarland-blue text-white px-2 py-1 rounded-lg' : 'bg-gray-200 px-2 py-1 rounded-lg'}>{m.content}</span>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Frag etwas..."
          />
          <button
            onClick={sendMessage}
            className="bg-saarland-blue text-white px-4 py-2 rounded"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  )
}
