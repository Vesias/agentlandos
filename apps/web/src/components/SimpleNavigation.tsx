'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Menu, X, Star } from 'lucide-react'
import { useState } from 'react'

export default function SimpleNavigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/chat', label: 'SAAR-GPT' },
    { href: '/services', label: 'Services' },
    { href: '/behoerden', label: 'Behördenfinder' },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Premium Logo */}
          <Link href="/" className="flex items-center space-x-3 group touch-manipulation">
            <div className="w-12 h-12 bg-gradient-to-br from-[#003399] to-[#0052CC] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold font-quantum">
                <span className="text-[#003399]">AGENTLAND</span>
                <span className="text-[#FDB913]">.SAARLAND</span>
              </span>
            </div>
            <div className="block sm:hidden">
              <span className="text-xl font-bold text-[#003399] font-quantum">AL</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 touch-manipulation ${
                  pathname === item.href
                    ? 'bg-[#003399] text-white shadow-lg'
                    : 'text-gray-700 hover:text-[#003399] hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Premium CTA */}
            <Link href="/register">
              <button className="ml-4 bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2">
                <Star className="w-4 h-4" />
                Premium
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors touch-manipulation"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 touch-manipulation ${
                    pathname === item.href
                      ? 'bg-[#003399] text-white shadow-lg'
                      : 'text-gray-700 hover:text-[#003399] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Premium CTA */}
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full mt-4 bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Premium werden
                </button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}