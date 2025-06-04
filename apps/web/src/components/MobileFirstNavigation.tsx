'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Home, MessageSquare, Sparkles, 
  Building2, GraduationCap, Shield, Music, 
  Globe, MapPin, Users
} from 'lucide-react'

const services = [
  { 
    name: 'Tourismus', 
    href: '/services/tourism', 
    icon: Sparkles, 
    color: '#00A54A',
    emoji: '🏰'
  },
  { 
    name: 'Wirtschaft', 
    href: '/services/business', 
    icon: Building2, 
    color: '#003399',
    emoji: '💼'
  },
  { 
    name: 'Bildung', 
    href: '/services/education', 
    icon: GraduationCap, 
    color: '#FFB300',
    emoji: '🎓'
  },
  { 
    name: 'Verwaltung', 
    href: '/services/admin', 
    icon: Shield, 
    color: '#E30613',
    emoji: '🏛️'
  },
  { 
    name: 'Kultur', 
    href: '/services/culture', 
    icon: Music, 
    color: '#8B008B',
    emoji: '🎭'
  }
]

export default function MobileFirstNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <>
      {/* Mobile-First Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Optimized for Mobile */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-2">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">AGENTLAND</span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">AL</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                href="/" 
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  pathname === '/' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              
              <Link 
                href="/chat" 
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  pathname === '/chat' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                KI Chat
              </Link>

              <Link 
                href="/services" 
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  pathname.startsWith('/services') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Services
              </Link>
            </nav>

            {/* User Counter - Hidden on small mobile */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="font-medium">Live</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="/"
                    onClick={toggleMobileMenu}
                    className={`flex items-center p-4 rounded-xl transition-all ${
                      pathname === '/' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    <span className="font-medium">Home</span>
                  </Link>

                  <Link
                    href="/chat"
                    onClick={toggleMobileMenu}
                    className={`flex items-center p-4 rounded-xl transition-all ${
                      pathname === '/chat' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span className="font-medium">KI Chat</span>
                  </Link>

                  {/* Services Header */}
                  <div className="pt-4 pb-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Saarland Services
                    </h3>
                  </div>

                  {/* Service Categories */}
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center p-4 rounded-xl transition-all ${
                        pathname === service.href 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-lg"
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        {service.emoji}
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-gray-500">
                          {service.name === 'Tourismus' && 'Ausflüge & Events'}
                          {service.name === 'Wirtschaft' && 'Unternehmen & Förderung'}
                          {service.name === 'Bildung' && 'Studium & Weiterbildung'}
                          {service.name === 'Verwaltung' && 'Behörden & Anträge'}
                          {service.name === 'Kultur' && 'Events & Veranstaltungen'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </nav>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      🎯 Saarland KI Platform
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
        <div className="grid grid-cols-3 h-16 pb-safe">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname === '/' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link 
            href="/chat" 
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname === '/chat' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-medium">Chat</span>
          </Link>
          
          <Link 
            href="/services" 
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname.startsWith('/services') ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-medium">Services</span>
          </Link>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  )
}