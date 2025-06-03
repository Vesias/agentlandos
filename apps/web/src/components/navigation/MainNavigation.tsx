'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Home, MessageSquare, Sparkles, 
  Building2, GraduationCap, Shield, Music, 
  Globe, ChevronDown, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import LiveUserCounter from '@/components/ui/live-user-counter'

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Services', href: '/services', icon: MapPin },
  {
    name: 'Kategorien',
    icon: ChevronDown,
    submenu: [
      { 
        name: 'Tourismus', 
        href: '/services/tourism', 
        icon: Sparkles, 
        color: '#00A54A',
        chatLinks: [
          { name: 'Reiseplanung', href: '/chat?context=tourism-planning' },
          { name: 'Sommer Events', href: '/chat?context=tourism-events' }
        ]
      },
      { 
        name: 'Wirtschaft', 
        href: '/services/business', 
        icon: Building2, 
        color: '#003399',
        chatLinks: [
          { name: 'Förderprogramme', href: '/chat?context=business-funding' },
          { name: 'Gründungsberatung', href: '/chat?context=business-startup' }
        ]
      },
      { 
        name: 'Bildung', 
        href: '/services/education', 
        icon: GraduationCap, 
        color: '#FFB300',
        chatLinks: [
          { name: 'Studium', href: '/chat?context=education-studies' },
          { name: 'Stipendien', href: '/chat?context=education-scholarships' }
        ]
      },
      { 
        name: 'Verwaltung', 
        href: '/services/admin', 
        icon: Shield, 
        color: '#E30613',
        chatLinks: [
          { name: 'Ausweise & Dokumente', href: '/chat?context=admin-documents' },
          { name: 'Gewerbeanmeldung', href: '/chat?context=admin-business-registration' }
        ]
      },
      { 
        name: 'Kultur', 
        href: '/services/culture', 
        icon: Music, 
        color: '#8B008B',
        chatLinks: [
          { name: 'Theater & Konzerte', href: '/chat?context=culture-events' },
          { name: 'Sommer Festivals', href: '/chat?context=culture-summer' }
        ]
      }
    ]
  }
]

export default function MainNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-saarland-blue to-innovation-cyan rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AGENTLAND.SAARLAND</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-8">
              <LiveUserCounter />
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.submenu ? (
                    <div 
                      className="relative"
                      onMouseEnter={() => setServicesOpen(true)}
                      onMouseLeave={() => setServicesOpen(false)}
                    >
                      <button className="flex items-center space-x-2 text-gray-700 hover:text-saarland-blue transition-colors">
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {servicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                          >
                            {item.submenu.map((subitem) => (
                              <div key={subitem.name} className="border-b border-gray-100 last:border-b-0">
                                <Link
                                  href={subitem.href}
                                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                >
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${subitem.color}20` }}
                                  >
                                    <subitem.icon 
                                      className="w-4 h-4" 
                                      style={{ color: subitem.color }}
                                    />
                                  </div>
                                  <span className="text-gray-700 font-medium">{subitem.name}</span>
                                </Link>
                                {subitem.chatLinks && (
                                  <div className="px-4 pb-2">
                                    <p className="text-xs text-gray-500 mb-2">💬 Direkte Beratung:</p>
                                    {subitem.chatLinks.map((chatLink) => (
                                      <Link
                                        key={chatLink.name}
                                        href={chatLink.href}
                                        className="block px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                                      >
                                        → {chatLink.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 transition-colors ${
                        pathname === item.href
                          ? 'text-saarland-blue font-semibold'
                          : 'text-gray-700 hover:text-saarland-blue'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-saarland-blue to-innovation-cyan rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">AGENTLAND</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative z-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-16 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl z-40 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <span>{item.name}</span>
                        </h3>
                        <div className="space-y-2 pl-4">
                          {item.submenu.map((subitem) => (
                            <div key={subitem.name} className="space-y-2">
                              <Link
                                href={subitem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                              >
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${subitem.color}20` }}
                                >
                                  <subitem.icon 
                                    className="w-4 h-4" 
                                    style={{ color: subitem.color }}
                                  />
                                </div>
                                <span className="text-gray-700 font-medium">{subitem.name}</span>
                              </Link>
                              {subitem.chatLinks && (
                                <div className="ml-11 space-y-1">
                                  <p className="text-xs text-gray-500">💬 Direkte Beratung:</p>
                                  {subitem.chatLinks.map((chatLink) => (
                                    <Link
                                      key={chatLink.name}
                                      href={chatLink.href}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block px-2 py-1 text-xs text-gray-600 hover:text-gray-900 rounded"
                                    >
                                      → {chatLink.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          pathname === item.href
                            ? 'bg-saarland-blue/10 text-saarland-blue font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to push content below fixed nav */}
      <div className="h-16" />
    </>
  )
}