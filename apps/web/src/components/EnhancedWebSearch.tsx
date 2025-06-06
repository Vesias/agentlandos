'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, Loader2, Sparkles, Clock, TrendingUp, Globe,
  Bot, Database, Target, Zap, ExternalLink, Filter,
  MapPin, Star, ArrowRight, Lightbulb, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  title: string
  url: string
  snippet: string
  source: 'web' | 'local' | 'ai_enhanced'
  relevance_score: number
  saarland_relevance: number
  timestamp: string
  metadata?: {
    domain: string
    language: string
    content_type: string
    last_updated?: string
  }
}

interface SearchResponse {
  success: boolean
  query: string
  results: SearchResult[]
  ai_summary?: string
  search_metadata: {
    total_results: number
    search_time_ms: number
    sources_searched: string[]
    ai_enhanced: boolean
    saarland_optimized: boolean
  }
  suggestions?: string[]
}

interface EnhancedWebSearchProps {
  initialQuery?: string
  category?: 'general' | 'business' | 'tourism' | 'education' | 'administration'
  location?: 'saarland' | 'cross-border' | 'global'
  onResultClick?: (result: SearchResult) => void
  compact?: boolean
  showFilters?: boolean
}

export default function EnhancedWebSearch({ 
  initialQuery = '', 
  category = 'general',
  location = 'saarland',
  onResultClick,
  compact = false,
  showFilters = true
}: EnhancedWebSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchMetadata, setSearchMetadata] = useState<any>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  
  // Filter states
  const [searchType, setSearchType] = useState<'web' | 'local' | 'hybrid'>('hybrid')
  const [currentCategory, setCurrentCategory] = useState(category)
  const [currentLocation, setCurrentLocation] = useState(location)
  const [enhancedMode, setEnhancedMode] = useState(true)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 500) // Debounce search
      
      return () => clearTimeout(timeoutId)
    } else if (query.trim().length === 0) {
      resetSearch()
    }
  }, [query, searchType, currentCategory, currentLocation, enhancedMode])

  const resetSearch = () => {
    setResults([])
    setHasSearched(false)
    setSearchMetadata(null)
    setAiSummary('')
    setSuggestions([])
    setSelectedResult(null)
  }

  const performSearch = async () => {
    if (isLoading || query.trim().length < 2) return
    
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch('/api/search/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          type: searchType,
          category: currentCategory,
          location: currentLocation,
          limit: 20,
          enhanced: enhancedMode,
          real_time: true
        })
      })
      
      const data: SearchResponse = await response.json()
      
      if (data.success) {
        setResults(data.results)
        setSearchMetadata(data.search_metadata)
        setAiSummary(data.ai_summary || '')
        setSuggestions(data.suggestions || [])
      } else {
        console.error('Search failed:', data.error)
        setResults([])
        setSearchMetadata(null)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setSearchMetadata(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      performSearch()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    searchInputRef.current?.focus()
  }

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(selectedResult?.id === result.id ? null : result)
    if (onResultClick) {
      onResultClick(result)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'local': return Database
      case 'web': return Globe
      case 'ai_enhanced': return Bot
      default: return Target
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'local': return 'text-blue-600 bg-blue-100'
      case 'web': return 'text-green-600 bg-green-100'
      case 'ai_enhanced': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'local': return 'Lokal'
      case 'web': return 'Web'
      case 'ai_enhanced': return 'KI'
      default: return 'Unbekannt'
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (compact) {
    return (
      <div className="w-full max-w-3xl">
        {/* Compact Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Web-Suche... (min. 2 Zeichen)"
            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>

        {/* Compact Results */}
        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {results.slice(0, 5).map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {result.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getSourceColor(result.source)}`}>
                        {React.createElement(getSourceIcon(result.source), { className: 'w-3 h-3 inline mr-1' })}
                        {getSourceLabel(result.source)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(result.relevance_score * 100)}%
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {hasSearched && results.length === 0 && !isLoading && (
          <div className="mt-4 p-4 text-center border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Keine Suchergebnisse gefunden</p>
            <button 
              onClick={() => window.open('/chat', '_blank')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              KI-Chat starten →
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Full Search Interface */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Enhanced Web Search</h3>
            <p className="text-gray-600 text-sm">KI-powered search with Saarland optimization</p>
          </div>
        </div>

        {/* Search Bar with Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Geben Sie Ihre Suchanfrage ein... (mindestens 2 Zeichen)"
              className="w-full pl-14 pr-16 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500 animate-spin" />
            )}
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFiltersPanel && showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suchtyp</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hybrid">Hybrid (Web + Lokal)</option>
                    <option value="web">Nur Web</option>
                    <option value="local">Nur Lokal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Allgemein</option>
                    <option value="business">Business</option>
                    <option value="tourism">Tourismus</option>
                    <option value="education">Bildung</option>
                    <option value="administration">Verwaltung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="saarland">Saarland</option>
                    <option value="cross-border">Grenzregion</option>
                    <option value="global">Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KI-Enhancement</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={enhancedMode}
                      onChange={(e) => setEnhancedMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">KI-Zusammenfassung aktivieren</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && !isLoading && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Suchvorschläge:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Metadata */}
        {searchMetadata && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {searchMetadata.total_results} Ergebnisse in {searchMetadata.search_time_ms}ms
                </p>
                <p className="text-xs text-gray-600">
                  Quellen: {searchMetadata.sources_searched.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {searchMetadata.ai_enhanced && (
                  <div className="flex items-center gap-1 text-purple-600 text-sm">
                    <Sparkles className="w-4 h-4" />
                    KI-Enhanced
                  </div>
                )}
                {searchMetadata.saarland_optimized && (
                  <div className="flex items-center gap-1 text-blue-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    Saarland-optimiert
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {aiSummary && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-2">KI-Zusammenfassung</h4>
                <div className="prose prose-sm text-purple-800">
                  {aiSummary.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Suche läuft...</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          <AnimatePresence>
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {result.title}
                        </h4>
                        <p className="text-blue-600 text-sm mt-1 break-all">
                          {result.url}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(result.source)}`}>
                          {React.createElement(getSourceIcon(result.source), { className: 'w-3 h-3 inline mr-1' })}
                          {getSourceLabel(result.source)}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {result.snippet}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-medium ${getRelevanceColor(result.relevance_score)}`}>
                          {Math.round(result.relevance_score * 100)}% Relevanz
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-medium ${getRelevanceColor(result.saarland_relevance)}`}>
                          {Math.round(result.saarland_relevance * 100)}% Saarland
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(result.timestamp).toLocaleTimeString('de-DE')}
                        </span>
                      </div>

                      {result.metadata && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {result.metadata.domain}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  <AnimatePresence>
                    {selectedResult?.id === result.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100 pt-4 mt-4"
                      >
                        <div className="flex gap-3">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Website öffnen
                          </a>
                          
                          <button
                            onClick={() => window.open(`/chat?context=${encodeURIComponent(result.title + ': ' + result.snippet)}`, '_blank')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Bot className="w-4 h-4" />
                            Mit KI besprechen
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {hasSearched && results.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Suchergebnisse gefunden
            </h4>
            <p className="text-gray-600 mb-6">
              Versuchen Sie andere Suchbegriffe oder passen Sie die Filter an
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.open('/chat', '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Bot className="w-5 h-5" />
                KI-Chat starten
              </button>
              <button 
                onClick={() => {
                  setQuery('')
                  setShowFiltersPanel(false)
                  resetSearch()
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Neue Suche
              </button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && query.trim().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Erweiterte Web-Suche
            </h4>
            <p className="text-gray-600 mb-6">
              Geben Sie mindestens 2 Zeichen ein für KI-gestützte Suchergebnisse
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { icon: Database, label: 'Lokale Daten', desc: 'Saarland Knowledge Base' },
                { icon: Globe, label: 'Web-Suche', desc: 'Weltweite Ergebnisse' },
                { icon: Bot, label: 'KI-Enhancement', desc: 'Intelligente Zusammenfassung' },
                { icon: MapPin, label: 'Saarland-optimiert', desc: 'Regionale Relevanz' }
              ].map((feature, index) => (
                <div key={index} className="p-3 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <feature.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{feature.label}</p>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}