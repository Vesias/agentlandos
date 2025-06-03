import { Suspense } from 'react'
import SimpleChat from './simple-chat'

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SimpleChat />
    </Suspense>
  )
}