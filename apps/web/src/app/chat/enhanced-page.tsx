'use client'

import dynamic from 'next/dynamic'

// Import the enhanced chat component with no SSR to avoid hydration issues
const EnhancedChat = dynamic(
  () => import('@/components/ui/enhanced-chat'),
  { ssr: false }
)

export default function ChatPage() {
  return <EnhancedChat />
}