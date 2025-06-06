'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, Loader2, Sparkles, Clock, TrendingUp,
  Bot, Database, Target, Zap, ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Solution {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  urgency: 'low' | 'medium' | 'high'
  estimatedTime: string
  nextSteps?: string[]
  contacts?: any[]
  relatedLinks?: any[]
  confidence: number
  source: 'knowledge_base' | 'ai_generated' | 'hybrid'
}

interface SearchMetadata {
  query: string
  category: string
  total_solutions: number
  processing_time_ms: number
  has_ai_generated: boolean
  average_confidence: number
  timestamp: string
}

interface InstantHelpSearchProps {
  initialQuery?: string
  category?: string
  onSolutionSelect?: (solution: Solution) => void
  compact?: boolean
}

export default function InstantHelpSearch({ 
  initialQuery = '', 
  category = 'all',
  onSolutionSelect,
  compact = false 
}: InstantHelpSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null)

  useEffect(() => {
    if (query.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 500) // Debounce search
      
      return () => clearTimeout(timeoutId)
    } else if (query.trim().length === 0) {
      setSolutions([])
      setHasSearched(false)
      setMetadata(null)
    }
  }, [query, category])

  const performSearch = async () => {
    if (isLoading || query.trim().length < 3) return
    
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch('/api/instant-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          category: category !== 'all' ? category : undefined,
          urgent: false
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSolutions(data.solutions)
        setMetadata(data.metadata)
      } else {
        console.error('Search failed:', data.error)
        setSolutions([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSolutions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim().length >= 3) {
      performSearch()
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'knowledge_base': return Database
      case 'ai_generated': return Bot
      case 'hybrid': return Sparkles
      default: return Target
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'knowledge_base': return 'text-blue-600 bg-blue-100'
      case 'ai_generated': return 'text-purple-600 bg-purple-100'
      case 'hybrid': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleSolutionClick = (solution: Solution) => {
    setSelectedSolution(selectedSolution?.id === solution.id ? null : solution)
    if (onSolutionSelect) {
      onSolutionSelect(solution)
    }
  }

  if (compact) {
    return (
      <div className="w-full max-w-2xl">
        {/* Compact Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Frage stellen... (min. 3 Zeichen)"
            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500 animate-spin" />
          )}
        </div>

        {/* Compact Results */}
        {solutions.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {solutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSolutionClick(solution)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {solution.question}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${getSourceColor(solution.source)}`}>
                        {React.createElement(getSourceIcon(solution.source), { className: 'w-3 h-3 inline mr-1' })}
                        {solution.source === 'knowledge_base' ? 'KB' : 
                         solution.source === 'ai_generated' ? 'KI' : 'Hybrid'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(solution.confidence * 100)}% Genauigkeit
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(solution.urgency)}`}>
                    {solution.urgency === 'high' ? 'Dringend' : 
                     solution.urgency === 'medium' ? 'Normal' : 'Niedrig'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {hasSearched && solutions.length === 0 && !isLoading && (
          <div className="mt-4 p-4 text-center border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Keine Lösungen gefunden</p>
            <button 
              onClick={() => window.open('/chat', '_blank')}
              className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sofort-Hilfe</h3>
            <p className="text-gray-600 text-sm">KI-powered instant help system</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stellen Sie Ihre Frage... (mindestens 3 Zeichen)"
            className="w-full pl-14 pr-16 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-yellow-500 animate-spin" />
          )}
        </div>

        {/* Search Metadata */}
        {metadata && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {solutions.length} Lösungen in {metadata.processing_time_ms}ms
                </p>
                <p className="text-xs text-gray-600">
                  Durchschnittliche Genauigkeit: {Math.round(metadata.average_confidence * 100)}%
                </p>
              </div>
              {metadata.has_ai_generated && (
                <div className="flex items-center gap-1 text-purple-600 text-sm">
                  <Sparkles className="w-4 h-4" />
                  KI-Enhanced
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Ihre Lösung wird generiert...</p>
            </div>
          </div>
        )}

        {/* Solutions */}
        <div className="space-y-4">
          <AnimatePresence>
            {solutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleSolutionClick(solution)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex-1">
                        {solution.question}
                      </h4>
                      <div className="ml-4 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(solution.source)}`}>
                          {React.createElement(getSourceIcon(solution.source), { className: 'w-3 h-3 inline mr-1' })}
                          {solution.source === 'knowledge_base' ? 'Wissensbasis' : 
                           solution.source === 'ai_generated' ? 'KI-generiert' : 'Hybrid'}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {Math.round(solution.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {solution.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(solution.urgency)}`}>
                        {solution.urgency === 'high' ? 'Dringend' : 
                         solution.urgency === 'medium' ? 'Normal' : 'Niedrig'}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {solution.estimatedTime}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {solution.tags.slice(0, 5).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {selectedSolution?.id === solution.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100 pt-6 mt-6"
                      >
                        <div className="prose prose-sm max-w-none mb-6">
                          <div className="whitespace-pre-wrap text-gray-700">
                            {solution.answer}
                          </div>
                        </div>

                        {solution.nextSteps && solution.nextSteps.length > 0 && (
                          <div className="mb-6">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              Nächste Schritte
                            </h5>
                            <div className="space-y-2">
                              {solution.nextSteps.map((step, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm text-gray-700">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {solution.contacts && solution.contacts.length > 0 && (
                          <div className="mb-6">
                            <h5 className="font-semibold text-gray-900 mb-3">Kontakte</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {solution.contacts.map((contact, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{contact.label}</div>
                                    <div className="text-sm text-blue-600">{contact.value}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {solution.relatedLinks && solution.relatedLinks.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Weiterführende Links</h5>
                            <div className="flex flex-wrap gap-2">
                              {solution.relatedLinks.map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {hasSearched && solutions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Lösungen gefunden
            </h4>
            <p className="text-gray-600 mb-6">
              Versuchen Sie andere Suchbegriffe oder starten Sie einen KI-Chat
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.open('/chat', '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Bot className="w-5 h-5" />
                KI-Chat starten
              </button>
              <button 
                onClick={() => setQuery('')}
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
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Stellen Sie Ihre Frage
            </h4>
            <p className="text-gray-600 mb-6">
              Mindestens 3 Zeichen eingeben für KI-gestützte Sofort-Hilfe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}