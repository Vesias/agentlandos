'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Phone, Mail, Globe, Clock, Filter,
  Building2, Users, FileText, Car, Heart, Briefcase,
  Shield, Scale, TreePine, Calculator, ChevronDown,
  ExternalLink, Navigation, Star, AlertCircle, CheckCircle,
  Flag, BookOpen
} from 'lucide-react'

interface Authority {
  id: string
  name: string
  category: string
  type: string
  description: string
  address: {
    street: string
    city: string
    zipCode: string
    phone: string
    email: string
    website: string
  }
  services: string[]
  openingHours: {
    [key: string]: string
  }
  onlineServices: string[]
  keywords: string[]
}

interface SearchFilters {
  category?: string
  type?: string
  zipCode?: string
  service?: string
  keyword?: string
  city?: string
}

export default function BehoerdenfinderAdvanced() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAuthority, setSelectedAuthority] = useState<Authority | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
  const [favoriteAuthorities, setFavoriteAuthorities] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showMap, setShowMap] = useState(false)
  const [quickActions, setQuickActions] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [availableFilters, setAvailableFilters] = useState<any>({})

  // Enhanced category icons with visual styling
  const categoryIcons = {
    kommunal: Building2,
    landesbehoerden: Users,
    bundesbehoerden: Flag,
    justiz: Scale,
    polizei: Shield,
    gesundheit: Heart,
    bildung: BookOpen,
    wirtschaft: Briefcase,
    umwelt: TreePine,
    finanzen: Calculator
  }

  const categoryColors = {
    kommunal: 'from-blue-500 to-cyan-500',
    landesbehoerden: 'from-green-500 to-emerald-500',
    bundesbehoerden: 'from-purple-500 to-indigo-500',
    justiz: 'from-gray-500 to-slate-500',
    polizei: 'from-red-500 to-rose-500',
    gesundheit: 'from-pink-500 to-red-500',
    bildung: 'from-orange-500 to-amber-500',
    wirtschaft: 'from-indigo-500 to-blue-500',
    umwelt: 'from-green-600 to-teal-500',
    finanzen: 'from-yellow-500 to-orange-500'
  }

  const searchAuthorities = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)
      if (filters.zipCode) params.append('zipCode', filters.zipCode)
      if (filters.city) params.append('city', filters.city)
      if (filters.service) params.append('service', filters.service)
      if (filters.keyword) params.append('keyword', filters.keyword)

      const response = await fetch(`/api/behoerden?${params}`)
      const data = await response.json()

      if (data.success) {
        setAuthorities(data.data.authorities)
        setSuggestions(data.data.suggestions)
        setAvailableFilters(data.data.filters.available)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  useEffect(() => {
    searchAuthorities()
  }, [searchAuthorities])

  const formatOpeningHours = (hours: { [key: string]: string }) => {
    const dayNames = {
      monday: 'Mo',
      tuesday: 'Di', 
      wednesday: 'Mi',
      thursday: 'Do',
      friday: 'Fr',
      saturday: 'Sa',
      sunday: 'So'
    }

    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="flex justify-between text-sm">
        <span className="font-medium">{dayNames[day as keyof typeof dayNames]}:</span>
        <span className="text-gray-600">{time || 'Geschlossen'}</span>
      </div>
    ))
  }

  const isCurrentlyOpen = (hours: { [key: string]: string }) => {
    const now = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = dayNames[now.getDay()]
    const currentTime = now.getHours() * 100 + now.getMinutes()
    
    const todayHours = hours[currentDay]
    if (!todayHours || todayHours === 'Geschlossen') return false

    // Parse opening hours (simplified)
    const timeRanges = todayHours.split(', ')
    return timeRanges.some(range => {
      const [start, end] = range.split('-')
      if (!start || !end) return false
      
      const startTime = parseInt(start.replace(':', ''))
      const endTime = parseInt(end.replace(':', ''))
      
      return currentTime >= startTime && currentTime <= endTime
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#003399] to-[#009FE3] rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#003399] mb-4 font-quantum">
            Behördenfinder Saarland
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-nova">
            Alle Behörden von A-Z • Schnell • Übersichtlich • Aktuell
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Behörde, Service oder PLZ suchen..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent text-lg"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-4 bg-[#003399] text-white rounded-2xl hover:bg-[#002266] transition-colors font-semibold"
            >
              <Filter className="w-5 h-5" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]"
                  >
                    <option value="">Alle Kategorien</option>
                    {availableFilters.categories && Object.entries(availableFilters.categories).map(([key, value]) => (
                      <option key={key} value={key}>{value as string}</option>
                    ))}
                  </select>

                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]"
                  >
                    <option value="">Alle Behördentypen</option>
                    {availableFilters.types?.map((type: string) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={filters.city || ''}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]"
                  >
                    <option value="">Alle Städte</option>
                    {availableFilters.cities?.map((city: string) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={filters.zipCode || ''}
                    onChange={(e) => setFilters({ ...filters, zipCode: e.target.value || undefined })}
                    placeholder="PLZ eingeben"
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Vorschläge:</span>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1 bg-blue-50 text-[#003399] rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003399]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#003399]">
                    {authorities.length} Behörden gefunden
                  </h2>
                </div>

                <AnimatePresence>
                  {authorities.map((authority, index) => {
                    const CategoryIcon = categoryIcons[authority.category as keyof typeof categoryIcons] || Building2
                    const isOpen = isCurrentlyOpen(authority.openingHours)
                    
                    return (
                      <motion.div
                        key={authority.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => setSelectedAuthority(authority)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[authority.category as keyof typeof categoryColors]} rounded-2xl flex items-center justify-center shadow-lg`}>
                              <CategoryIcon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-[#003399] mb-2">
                                {authority.name}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {authority.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {authority.address.city}, {authority.address.zipCode}
                                </div>
                                <div className={`flex items-center gap-1 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                  <Clock className="w-4 h-4" />
                                  {isOpen ? 'Geöffnet' : 'Geschlossen'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-[-90deg]" />
                        </div>

                        {/* Top Services */}
                        <div className="flex flex-wrap gap-2">
                          {authority.services.slice(0, 3).map((service, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-[#003399] rounded-full text-sm"
                            >
                              {service}
                            </span>
                          ))}
                          {authority.services.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              +{authority.services.length - 3} weitere
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Authority Details */}
          <div className="lg:col-span-1">
            {selectedAuthority ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[selectedAuthority.category as keyof typeof categoryColors]} rounded-xl flex items-center justify-center`}>
                    {React.createElement(categoryIcons[selectedAuthority.category as keyof typeof categoryIcons] || Building2, { className: "w-6 h-6 text-white" })}
                  </div>
                  <h3 className="text-xl font-bold text-[#003399]">
                    {selectedAuthority.name}
                  </h3>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedAuthority.address.street}</p>
                      <p className="text-gray-600">{selectedAuthority.address.zipCode} {selectedAuthority.address.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${selectedAuthority.address.phone}`} className="text-[#003399] hover:underline">
                      {selectedAuthority.address.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${selectedAuthority.address.email}`} className="text-[#003399] hover:underline break-all">
                      {selectedAuthority.address.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a href={selectedAuthority.address.website} target="_blank" rel="noopener noreferrer" className="text-[#003399] hover:underline flex items-center gap-1">
                      Website besuchen
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#003399] mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Öffnungszeiten
                  </h4>
                  <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                    {formatOpeningHours(selectedAuthority.openingHours)}
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#003399] mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Services
                  </h4>
                  <div className="space-y-2">
                    {selectedAuthority.services.map((service, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Online Services */}
                {selectedAuthority.onlineServices.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#003399] mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Online Services
                    </h4>
                    <div className="space-y-2">
                      {selectedAuthority.onlineServices.map((service, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Behörde auswählen
                </h3>
                <p className="text-gray-500">
                  Klicken Sie auf eine Behörde in der Liste, um detaillierte Informationen zu erhalten.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}