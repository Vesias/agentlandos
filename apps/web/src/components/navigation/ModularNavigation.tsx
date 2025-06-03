'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, MapPin, Building2, Briefcase, GraduationCap, Music2,
  Home, Menu, X, ChevronRight, Settings,
  MessageSquare, Calendar, FileText, Shield
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  color: string
  description: string
  subItems?: NavItem[]
}

const navigation: NavItem[] = [
  {
    id: 'home',
    label: 'Startseite',
    icon: Home,
    href: '/',
    color: '#003399',
    description: 'Zurück zur Übersicht'
  },
  {
    id: 'chat',
    label: 'KI-Chat',
    icon: MessageSquare,
    href: '/chat',
    color: '#003399',
    description: 'Mit den Agenten chatten'
  },
  {
    id: 'tourism',
    label: 'Tourismus',
    icon: MapPin,
    href: '/tourism',
    color: '#009FE3',
    description: 'Sehenswürdigkeiten & Events',
    subItems: [
      { id: 'attractions', label: 'Sehenswürdigkeiten', icon: MapPin, href: '/tourism/attractions', color: '#009FE3', description: '' },
      { id: 'events', label: 'Veranstaltungen', icon: Calendar, href: '/tourism/events', color: '#009FE3', description: '' },
      { id: 'restaurants', label: 'Gastronomie', icon: FileText, href: '/tourism/restaurants', color: '#009FE3', description: '' }
    ]
  },
  {
    id: 'administration',
    label: 'Verwaltung',
    icon: Building2,
    href: '/administration',
    color: '#43B049',
    description: 'Behörden & Services',
    subItems: [
      { id: 'services', label: 'Online-Services', icon: FileText, href: '/administration/services', color: '#43B049', description: '' },
      { id: 'offices', label: 'Ämter', icon: Building2, href: '/administration/offices', color: '#43B049', description: '' }
    ]
  },
  {
    id: 'business',
    label: 'Wirtschaft',
    icon: Briefcase,
    href: '/business',
    color: '#FDB913',
    description: 'Förderungen & Gründung'
  },
  {
    id: 'education',
    label: 'Bildung',
    icon: GraduationCap,
    href: '/education',
    color: '#E31E2D',
    description: 'Schulen & Unis'
  },
  {
    id: 'culture',
    label: 'Kultur',
    icon: Music2,
    href: '/culture',
    color: '#929497',
    description: 'Kunst & Tradition'
  }
]

export function ModularNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActiveItem = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.nav
          initial={false}
          animate={{
            x: isOpen ? 0 : -320,
            opacity: isOpen ? 1 : 0.9
          }}
          className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-40 overflow-y-auto
            md:relative md:translate-x-0 md:opacity-100 md:shadow-none md:border-r md:border-gray-200`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">AGENTLAND</h1>
                <p className="text-sm text-gray-500">SAARLAND</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.id}>
                <div className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                      ${isActiveItem(item.href)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    style={isActiveItem(item.href) ? { borderLeftColor: item.color } : {}}
                  >
                    <item.icon 
                      size={20} 
                      style={{ color: isActiveItem(item.href) ? item.color : undefined }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {item.subItems && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleExpanded(item.id)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <ChevronRight 
                          size={16} 
                          className={`transition-transform ${
                            expandedItems.includes(item.id) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    )}
                  </Link>
                </div>

                {/* Sub Items */}
                {item.subItems && expandedItems.includes(item.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-2 space-y-1"
                  >
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 p-2 rounded-lg text-sm transition-all duration-200
                          ${isActiveItem(subItem.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <subItem.icon size={16} />
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-green-600" />
                <span className="text-xs text-gray-600">DSGVO-konform</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Settings size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </motion.nav>
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}
    </>
  )
}

export default ModularNavigation