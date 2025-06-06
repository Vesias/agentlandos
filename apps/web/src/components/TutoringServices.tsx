'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, MapPin, Clock, Phone, Mail, Star, Filter, Search } from 'lucide-react'

interface TutoringService {
  id: string
  provider_name: string
  contact_person?: string
  email?: string
  phone?: string
  website?: string
  subjects: string[]
  levels: string[]
  location_type: 'online' | 'in_person' | 'hybrid'
  address?: string
  city: string
  price_range: string
  rating: number
  review_count: number
  verified: boolean
}

export const TutoringServices: React.FC = () => {
  const [services, setServices] = useState<TutoringService[]>([])
  const [filteredServices, setFilteredServices] = useState<TutoringService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    city: '',
    location_type: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [services, filters, searchTerm])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/tutoring')
      const data = await response.json()
      
      if (data.success) {
        setServices(data.data)
      }
    } catch (error) {
      console.error('Error fetching tutoring services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = services

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    if (filters.subject) {
      filtered = filtered.filter(service =>
        service.subjects.includes(filters.subject)
      )
    }

    if (filters.level) {
      filtered = filtered.filter(service =>
        service.levels.includes(filters.level)
      )
    }

    if (filters.city) {
      filtered = filtered.filter(service =>
        service.city === filters.city
      )
    }

    if (filters.location_type) {
      filtered = filtered.filter(service =>
        service.location_type === filters.location_type
      )
    }

    setFilteredServices(filtered)
  }

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return '💻'
      case 'in_person': return '🏠'
      case 'hybrid': return '🔄'
      default: return '📍'
    }
  }

  const getLocationTypeText = (type: string) => {
    switch (type) {
      case 'online': return 'Online'
      case 'in_person': return 'Vor Ort'
      case 'hybrid': return 'Hybrid'
      default: return 'Flexibel'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Nachhilfe-Services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003399] to-[#0277bd] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <div className="w-20 h-20 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-[#003399]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-quantum">
            Nachhilfe im Saarland
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Qualifizierte Nachhilfe-Services für alle Fächer und Klassenstufen
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Suchen Sie nach Anbieter oder Fach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filter:</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Fächer</option>
              <option value="Mathematik">Mathematik</option>
              <option value="Deutsch">Deutsch</option>
              <option value="Englisch">Englisch</option>
              <option value="Französisch">Französisch</option>
              <option value="Physik">Physik</option>
              <option value="Chemie">Chemie</option>
              <option value="Informatik">Informatik</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Stufen</option>
              <option value="Grundschule">Grundschule</option>
              <option value="Realschule">Realschule</option>
              <option value="Gymnasium">Gymnasium</option>
              <option value="Universität">Universität</option>
              <option value="Erwachsenenbildung">Erwachsenenbildung</option>
            </select>

            <select
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Städte</option>
              <option value="Saarbrücken">Saarbrücken</option>
              <option value="Neunkirchen">Neunkirchen</option>
              <option value="Saarlouis">Saarlouis</option>
              <option value="Völklingen">Völklingen</option>
              <option value="Homburg">Homburg</option>
            </select>

            <select
              value={filters.location_type}
              onChange={(e) => setFilters({...filters, location_type: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Arten</option>
              <option value="online">Online</option>
              <option value="in_person">Vor Ort</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredServices.length} Nachhilfe-Service{filteredServices.length !== 1 ? 's' : ''} gefunden
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Service Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 flex-1">
                    {service.provider_name}
                  </h3>
                  {service.verified && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Verifiziert
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(service.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {service.rating.toFixed(1)} ({service.review_count} Bewertungen)
                  </span>
                </div>

                {/* Contact Person */}
                {service.contact_person && (
                  <p className="text-gray-600 mb-3">
                    Kontakt: {service.contact_person}
                  </p>
                )}

                {/* Subjects */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Fächer:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.subjects.map((subject, index) => (
                      <span 
                        key={index}
                        className="bg-[#003399] text-white px-2 py-1 rounded-full text-xs"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Levels */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Klassenstufen:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.levels.map((level, index) => (
                      <span 
                        key={index}
                        className="bg-[#0277bd] text-white px-2 py-1 rounded-full text-xs"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location & Price */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{service.city}</span>
                    <span className="ml-2">
                      {getLocationTypeIcon(service.location_type)} {getLocationTypeText(service.location_type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-[#003399]">{service.price_range}</span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-2">
                  {service.phone && (
                    <a 
                      href={`tel:${service.phone}`}
                      className="flex-1 bg-[#0277bd] hover:bg-[#007AB8] text-white text-center py-2 px-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Anrufen
                    </a>
                  )}
                  {service.email && (
                    <a 
                      href={`mailto:${service.email}`}
                      className="flex-1 bg-[#003399] hover:bg-[#002266] text-white text-center py-2 px-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      E-Mail
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Keine Nachhilfe-Services gefunden
            </h3>
            <p className="text-gray-500">
              Versuchen Sie andere Suchkriterien oder entfernen Sie einige Filter.
            </p>
          </div>
        )}

        {/* Add Service CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#003399] to-[#0277bd] rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Sind Sie Nachhilfe-Anbieter?</h3>
          <p className="text-lg mb-6 opacity-90">
            Tragen Sie Ihren Service kostenlos ein und erreichen Sie neue Schüler im Saarland.
          </p>
          <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105">
            Service eintragen
          </button>
        </div>
      </div>
    </div>
  )
}