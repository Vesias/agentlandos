'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot } from 'lucide-react'

export default function SimpleNavigation() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#003399] rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#003399]">AGENTLAND</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-gray-700 hover:text-[#003399] transition-colors ${
                pathname === '/' ? 'text-[#003399] font-semibold' : ''
              }`}
            >
              Home
            </Link>
            
            <Link 
              href="/chat" 
              className={`text-gray-700 hover:text-[#003399] transition-colors ${
                pathname === '/chat' ? 'text-[#003399] font-semibold' : ''
              }`}
            >
              Chat
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}