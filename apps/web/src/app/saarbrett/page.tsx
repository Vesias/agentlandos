'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusCircle, Search, Filter, Users, Building2, 
  MapPin, Calendar, Euro, Heart, Share2, 
  MessageCircle, TrendingUp, Sparkles, Briefcase,
  GraduationCap, Home, Car, ShoppingBag, Clock,
  ChevronDown, Eye, Star, Flag, AlertCircle
} from 'lucide-react'

interface SaarBrettPost {
  id: string
  title: string
  description: string
  category: string
  type: 'angebot' | 'suche' | 'job' | 'event' | 'verkauf' | 'wohnung'
  author: {
    name: string
    type: 'user' | 'business'
    verified: boolean
    location: string
  }
  price?: number
  location: string
  tags: string[]
  created: string
  expires?: string
  views: number
  likes: number
  responses: number
  featured: boolean
  urgent: boolean
  images?: string[]
  contact: {
    email?: string
    phone?: string
    website?: string
  }
}

export default function SaarBrettPage() {
  const [posts, setPosts] = useState<SaarBrettPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('alle')
  const [selectedType, setSelectedType] = useState('alle')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = {
    alle: { label: 'Alle Kategorien', icon: '📋', color: '#6B7280' },
    jobs: { label: 'Jobs & Karriere', icon: '💼', color: '#EF4444' },
    wohnen: { label: 'Wohnen & Immobilien', icon: '🏠', color: '#10B981' },
    verkauf: { label: 'Verkaufen & Kaufen', icon: '🛒', color: '#F59E0B' },
    services: { label: 'Dienstleistungen', icon: '🔧', color: '#8B5CF6' },
    events: { label: 'Events & Termine', icon: '📅', color: '#EC4899' },
    bildung: { label: 'Bildung & Kurse', icon: '🎓', color: '#14B8A6' },
    transport: { label: 'Fahrzeuge & Transport', icon: '🚗', color: '#6B7280' },
    community: { label: 'Community & Soziales', icon: '👥', color: '#3B82F6' }
  }

  const typeFilters = {
    alle: 'Alle Arten',
    angebot: 'Angebote',
    suche: 'Gesuche',
    job: 'Stellenanzeigen',
    event: 'Veranstaltungen',
    verkauf: 'Verkäufe',
    wohnung: 'Wohnungen'
  }

  useEffect(() => {
    loadSaarBrettPosts()
  }, [])

  const loadSaarBrettPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/saarbrett')
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error loading SaarBrett posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'alle' || post.category === selectedCategory
    const matchesType = selectedType === 'alle' || post.type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  const getTypeIcon = (type: string) => {
    const icons = {
      angebot: '🎯',
      suche: '🔍',
      job: '💼',
      event: '📅',
      verkauf: '💰',
      wohnung: '🏠'
    }
    return icons[type] || '📋'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      angebot: 'from-green-500 to-emerald-600',
      suche: 'from-blue-500 to-cyan-600', 
      job: 'from-red-500 to-rose-600',
      event: 'from-purple-500 to-violet-600',
      verkauf: 'from-yellow-500 to-amber-600',
      wohnung: 'from-indigo-500 to-blue-600'
    }
    return colors[type] || 'from-gray-500 to-slate-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F0F7FF] to-[#E8F4FD]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003399] via-[#0066CC] to-[#009FE3] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">📋</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-quantum">
              🗞️ SAARBRETT
            </h1>
            <p className="text-xl md:text-2xl mb-2 opacity-90">
              Das digitale Schwarze Brett für das Saarland
            </p>
            <p className="text-lg opacity-75 max-w-3xl mx-auto">
              KI-gestützte Plattform für SAARUSER und SAARFIRMEN • Angebote • Gesuche • Jobs • Events
            </p>
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
              <span className="text-sm font-medium">🔗 Live: https://agentland.saarland/saarbrett</span>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-3"
              >
                <PlusCircle className="w-6 h-6" />
                Eintrag erstellen
              </button>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">{posts.length} aktive Einträge</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suchen Sie nach Angeboten, Jobs, Events..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E3F2FD] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent text-lg shadow-lg"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 bg-white border-2 border-[#E3F2FD] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003399] text-lg shadow-lg min-w-[200px]"
            >
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-6 py-4 bg-white border-2 border-[#E3F2FD] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003399] text-lg shadow-lg min-w-[180px]"
            >
              {Object.entries(typeFilters).map(([key, label]) => (
                <option key={key} value={key}>
                  {getTypeIcon(key)} {label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-[#003399] text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all ${
                  viewMode === 'list' 
                    ? 'bg-[#003399] text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Aktive Einträge', value: filteredPosts.length, icon: '📋', color: 'from-blue-500 to-cyan-500' },
            { label: 'Neue heute', value: '12', icon: '⭐', color: 'from-green-500 to-emerald-500' },
            { label: 'Jobs verfügbar', value: '8', icon: '💼', color: 'from-red-500 to-rose-500' },
            { label: 'Events bald', value: '5', icon: '📅', color: 'from-purple-500 to-violet-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} p-4 rounded-2xl text-white shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Posts Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003399] mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Lade SAARBRETT Einträge...</p>
              <p className="text-sm text-gray-500 mt-2">KI-gestützte Personalisierung wird angewendet</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Keine Einträge gefunden</h3>
            <p className="text-gray-500 mb-6">
              Versuchen Sie andere Suchbegriffe oder erstellen Sie den ersten Eintrag!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#003399] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#002266] transition-all duration-300 hover:scale-105 shadow-xl"
            >
              Ersten Eintrag erstellen
            </button>
          </div>
        ) : (
          <motion.div
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-[#003399] transition-all duration-300 hover:shadow-2xl ${
                  post.featured ? 'ring-2 ring-[#FDB913] ring-offset-2' : ''
                } ${viewMode === 'list' ? 'flex items-center p-4' : 'p-6'}`}
              >
                {/* Post Content */}
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(post.type)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                        {getTypeIcon(post.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {post.author.type === 'business' ? <Building2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                            {post.author.name}
                          </span>
                          {post.author.verified && <span className="text-[#003399]">✓</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {post.featured && (
                        <span className="bg-[#FDB913] text-[#003399] px-2 py-1 rounded-full text-xs font-bold">
                          Premium
                        </span>
                      )}
                      {post.urgent && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          Eilig
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="bg-[#E3F2FD] text-[#003399] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {post.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.created}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.responses}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  {post.price && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#003399]">
                        {post.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                      <button className="bg-[#003399] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#002266] transition-colors">
                        Kontakt
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-50"
      >
        <PlusCircle className="w-8 h-8" />
      </button>

      {/* KI Assistance Badge */}
      <div className="fixed bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#003399]">KI-Unterstützung</p>
            <p className="text-sm text-gray-600">Personalisierte Empfehlungen</p>
          </div>
        </div>
      </div>
    </div>
  )
}