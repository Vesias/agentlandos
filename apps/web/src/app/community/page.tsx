'use client'

import React, { useState } from 'react'
import { 
  Users, MessageCircle, Newspaper, Calendar, MapPin, 
  TrendingUp, Heart, Share2, ExternalLink, Star,
  Clock, Eye, ThumbsUp, MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommunityPost {
  id: string
  type: 'news' | 'event' | 'discussion' | 'business'
  title: string
  content: string
  author: string
  location?: string
  timestamp: Date
  category: string
  engagement: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  tags: string[]
  urgent?: boolean
}

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: '1',
    type: 'news',
    title: 'Neue Startup-Förderung: 50.000€ für Saarländische Gründer',
    content: `Das Wirtschaftsministerium des Saarlandes startet ein neues Förderprogramm für innovative Startups. Bis zu 50.000€ sind für vielversprechende Geschäftsideen verfügbar.

**Voraussetzungen:**
• Sitz im Saarland
• Innovative Technologie oder Geschäftsmodell
• Mindestens 2 Gründer
• Detaillierter Businessplan

**Bewerbung:** Online bis 31. Juli 2025
**Info-Veranstaltung:** 15. Januar, IHK Saarbrücken

Eine großartige Chance für alle Unternehmer im Saarland!`,
    author: 'Wirtschaftsförderung Saarland',
    timestamp: new Date('2025-01-06T08:30:00'),
    category: 'Wirtschaft',
    engagement: { views: 1247, likes: 89, comments: 23, shares: 45 },
    tags: ['startup', 'förderung', 'wirtschaft', 'gründung'],
    urgent: true
  },
  {
    id: '2',
    type: 'event',
    title: 'Saarländische Digitalkonferenz 2025',
    content: `Die größte Tech-Konferenz des Saarlandes findet am 20. Februar in der Congresshalle Saarbrücken statt.

**Programm-Highlights:**
• KI und die Zukunft der Arbeit
• Blockchain im Mittelstand
• Startup-Pitch-Contest
• Networking mit 500+ Teilnehmern

**Speaker:** Experten aus Berlin, München und dem Saarland
**Preis:** 79€ Frühbucher (bis 31.01.), danach 129€

Tickets: www.digital-saarland.de`,
    author: 'Digital Hub Saarland',
    location: 'Congresshalle Saarbrücken',
    timestamp: new Date('2025-01-05T14:20:00'),
    category: 'Tech & Innovation',
    engagement: { views: 892, likes: 67, comments: 31, shares: 28 },
    tags: ['konferenz', 'digitalisierung', 'tech', 'networking']
  },
  {
    id: '3',
    type: 'discussion',
    title: 'Erfahrungsaustausch: Grenzgänger nach Luxemburg',
    content: `Suche andere Grenzgänger, die in Luxemburg arbeiten. Würde gerne Erfahrungen austauschen zu:

• Steuerliche Optimierung
• Beste Pendelrouten
• Arbeitgeber-Empfehlungen
• Wohnungssuche beiderseits der Grenze

Wer hat Lust auf regelmäßiges Meetup? Denke an monatliches Treffen in Saarbrücken.

Meldet euch gerne! 👋`,
    author: 'Michael K.',
    timestamp: new Date('2025-01-04T19:45:00'),
    category: 'Grenzgänger',
    engagement: { views: 634, likes: 42, comments: 18, shares: 12 },
    tags: ['grenzgänger', 'luxemburg', 'meetup', 'erfahrung']
  },
  {
    id: '4',
    type: 'business',
    title: 'Erfolgsgeschichte: Vom Saarländer zum 7-stelligen Online-Business',
    content: `Nach 3 Jahren harter Arbeit: Mein E-Commerce Business macht jetzt über 1 Million Umsatz im Jahr! 🚀

**Mein Weg:**
2022: Nebenbei gestartet mit 500€
2023: Ersten Mitarbeiter eingestellt
2024: Expansion nach Frankreich
2025: 1M+ Umsatz erreicht

**Erfolgsfaktoren:**
• Fokus auf Qualität statt Quantität
• Konsequente Kundenorientierung
• Automation aller wiederholbaren Prozesse
• Grenzüberschreitende Strategie DE/FR

Gerne beantworte ich Fragen von anderen Gründern!`,
    author: 'Sarah M.',
    timestamp: new Date('2025-01-03T11:15:00'),
    category: 'Erfolgsgeschichte',
    engagement: { views: 2104, likes: 156, comments: 47, shares: 89 },
    tags: ['erfolg', 'ecommerce', 'gründung', 'motivation']
  }
]

const CATEGORIES = [
  'Alle',
  'Wirtschaft',
  'Tech & Innovation', 
  'Grenzgänger',
  'Erfolgsgeschichte',
  'Events',
  'Diskussion'
]

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [filteredPosts, setFilteredPosts] = useState(COMMUNITY_POSTS)

  const filterPosts = (category: string) => {
    setSelectedCategory(category)
    if (category === 'Alle') {
      setFilteredPosts(COMMUNITY_POSTS)
    } else {
      setFilteredPosts(COMMUNITY_POSTS.filter(post => post.category === category))
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'news': return Newspaper
      case 'event': return Calendar
      case 'discussion': return MessageCircle
      case 'business': return TrendingUp
      default: return MessageCircle
    }
  }

  const getPostColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-100 text-blue-600'
      case 'event': return 'bg-green-100 text-green-600'
      case 'discussion': return 'bg-purple-100 text-purple-600'
      case 'business': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center">
                <Users className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Saarland Community</h1>
                <p className="text-gray-600">Vernetzt, informiert, erfolgreich</p>
              </div>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Der digitale Treffpunkt für Saarländer - Business, Events, Erfahrungsaustausch und regionale News
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-32">
              {/* Categories */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorien</h3>
              <div className="space-y-2 mb-6">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => filterPosts(category)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Community Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Community Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mitglieder:</span>
                    <span className="font-semibold">3,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts heute:</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktive Diskussionen:</span>
                    <span className="font-semibold">42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post Button */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <button className="flex-1 text-left p-4 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 transition-colors">
                  Was beschäftigt Sie? Teilen Sie es mit der Community...
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all">
                  Posten
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.map((post, index) => {
                const PostIcon = getPostIcon(post.type)
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getPostColor(post.type)}`}>
                            <PostIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{post.author}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {post.timestamp.toLocaleDateString('de-DE')} • {post.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              {post.location && (
                                <>
                                  <MapPin className="w-3 h-3 ml-2" />
                                  {post.location}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                          {post.urgent && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Eilmeldung
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Post Content */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <div className="whitespace-pre-wrap">{post.content}</div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Engagement */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.views)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.comments)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.shares)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all">
                Weitere Posts laden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}