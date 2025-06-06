'use client'

import React, { useState, useEffect } from 'react'
import { Users, MapPin, Calendar, Phone, Mail, Globe, Search, Filter, Trophy, Music, Heart, Zap } from 'lucide-react'

interface Club {
  id: string
  name: string
  club_type: string
  category: string
  description: string
  founded_year?: number
  membership_count?: number
  contact_email?: string
  contact_phone?: string
  website?: string
  address?: string
  city: string
  postal_code?: string
  age_groups: string[]
  facilities: string[]
  membership_fee?: string
  is_active: boolean
  verified: boolean
}

export const ClubsDirectory: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [statistics, setStatistics] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    club_type: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClubs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [clubs, filters, searchTerm])

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs')
      const data = await response.json()
      
      if (data.success) {
        setClubs(data.data)
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = clubs

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(club => club.category === filters.category)
    }

    if (filters.city) {
      filtered = filtered.filter(club => club.city === filters.city)
    }

    if (filters.club_type) {
      filtered = filtered.filter(club => club.club_type === filters.club_type)
    }

    setFilteredClubs(filtered)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fußball':
      case 'sport':
        return <Trophy className="w-5 h-5" />
      case 'musik':
        return <Music className="w-5 h-5" />
      case 'kultur':
        return <Heart className="w-5 h-5" />
      case 'natur':
        return <Zap className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fußball':
      case 'sport':
        return 'bg-green-100 text-green-700'
      case 'musik':
        return 'bg-purple-100 text-purple-700'
      case 'kultur':
        return 'bg-pink-100 text-pink-700'
      case 'natur':
        return 'bg-blue-100 text-blue-700'
      case 'tennis':
        return 'bg-yellow-100 text-yellow-700'
      case 'turnen':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Vereine...</p>
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
            <Users className="w-12 h-12 text-[#003399]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-quantum">
            Vereine im Saarland
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Entdecken Sie die vielfältige Vereinslandschaft des Saarlandes
          </p>
        </div>
      </div>

      {/* Statistics */}
      {statistics.total_clubs && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-[#003399] mb-2">
                {statistics.total_clubs}
              </div>
              <div className="text-gray-600">Vereine</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-[#0277bd] mb-2">
                {statistics.total_members?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Mitglieder</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-[#FDB913] mb-2">
                {statistics.categories?.length || 0}
              </div>
              <div className="text-gray-600">Kategorien</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {statistics.cities?.length || 0}
              </div>
              <div className="text-gray-600">Städte</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Suchen Sie nach Vereinsnamen, Kategorien oder Beschreibung..."
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Kategorien</option>
              {statistics.categories?.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Städte</option>
              {statistics.cities?.map((city: string) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filters.club_type}
              onChange={(e) => setFilters({...filters, club_type: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003399]"
            >
              <option value="">Alle Vereinstypen</option>
              {statistics.club_types?.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredClubs.length} Verein{filteredClubs.length !== 1 ? 'e' : ''} gefunden
          </p>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div 
              key={club.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Club Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex-1 pr-2">
                    {club.name}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {club.verified && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Verifiziert
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(club.category)}`}>
                      {getCategoryIcon(club.category)}
                      {club.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  {club.description}
                </p>

                {/* Club Info */}
                <div className="space-y-2 mb-4">
                  {club.founded_year && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Gegründet {club.founded_year}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{club.city}</span>
                  </div>

                  {club.membership_count && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{club.membership_count} Mitglieder</span>
                    </div>
                  )}

                  {club.membership_fee && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2 text-center">💰</span>
                      <span>{club.membership_fee}</span>
                    </div>
                  )}
                </div>

                {/* Age Groups */}
                {club.age_groups && club.age_groups.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Altersgruppen:</p>
                    <div className="flex flex-wrap gap-1">
                      {club.age_groups.map((group, index) => (
                        <span 
                          key={index}
                          className="bg-[#003399] text-white px-2 py-1 rounded-full text-xs"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {club.facilities && club.facilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Anlagen:</p>
                    <div className="flex flex-wrap gap-1">
                      {club.facilities.slice(0, 3).map((facility, index) => (
                        <span 
                          key={index}
                          className="bg-[#0277bd] text-white px-2 py-1 rounded-full text-xs"
                        >
                          {facility}
                        </span>
                      ))}
                      {club.facilities.length > 3 && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{club.facilities.length - 3} weitere
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-2">
                  {club.contact_phone && (
                    <a 
                      href={`tel:${club.contact_phone}`}
                      className="flex-1 bg-[#0277bd] hover:bg-[#007AB8] text-white text-center py-2 px-3 rounded-lg transition-colors duration-300 flex items-center justify-center text-sm"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Anrufen
                    </a>
                  )}
                  {club.contact_email && (
                    <a 
                      href={`mailto:${club.contact_email}`}
                      className="flex-1 bg-[#003399] hover:bg-[#002266] text-white text-center py-2 px-3 rounded-lg transition-colors duration-300 flex items-center justify-center text-sm"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      E-Mail
                    </a>
                  )}
                  {club.website && (
                    <a 
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] text-center py-2 px-3 rounded-lg transition-colors duration-300 flex items-center justify-center text-sm"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Keine Vereine gefunden
            </h3>
            <p className="text-gray-500">
              Versuchen Sie andere Suchkriterien oder entfernen Sie einige Filter.
            </p>
          </div>
        )}

        {/* SAARFUSSBALL Highlight */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-400 rounded-xl p-8 text-center text-white">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚽</span>
          </div>
          <h3 className="text-2xl font-bold mb-4">SAARFUSSBALL</h3>
          <p className="text-lg mb-6 opacity-90">
            Entdecken Sie die komplette Saarland Fußball-Szene mit Live-Ergebnissen, Tabellen und Vereinsnews.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105">
            Zu SAARFUSSBALL
          </button>
        </div>

        {/* Add Club CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#003399] to-[#0277bd] rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ist Ihr Verein noch nicht dabei?</h3>
          <p className="text-lg mb-6 opacity-90">
            Tragen Sie Ihren Verein kostenlos ein und erreichen Sie neue Mitglieder im Saarland.
          </p>
          <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105">
            Verein eintragen
          </button>
        </div>
      </div>
    </div>
  )
}