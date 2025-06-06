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
  // Community startet mit keinen Posts - echte Community-Inhalte werden von Nutzern erstellt
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
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Diskussion',
    tags: ''
  })
  const [showCreatePost, setShowCreatePost] = useState(false)

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

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    const post: CommunityPost = {
      id: `user_${Date.now()}`,
      type: 'discussion',
      title: newPost.title,
      content: newPost.content,
      author: 'Anonymer Nutzer', // Would get from auth context
      timestamp: new Date(),
      category: newPost.category,
      engagement: { views: 0, likes: 0, comments: 0, shares: 0 },
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    const updatedPosts = [post, ...filteredPosts]
    setFilteredPosts(updatedPosts)
    setNewPost({ title: '', content: '', category: 'Diskussion', tags: '' })
    setShowCreatePost(false)
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
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts heute:</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktive Diskussionen:</span>
                    <span className="font-semibold">0</span>
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
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 text-left p-4 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Was beschäftigt Sie? Teilen Sie es mit der Community...
                </button>
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
                >
                  Posten
                </button>
              </div>
            </div>

            {/* Create Post Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Neuen Post erstellen</h2>
                      <button 
                        onClick={() => setShowCreatePost(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Geben Sie einen aussagekräftigen Titel ein..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {CATEGORIES.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inhalt</label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Teilen Sie Ihre Gedanken, Erfahrungen oder Fragen mit der Community..."
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    
                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags (kommagetrennt)</label>
                      <input
                        type="text"
                        value={newPost.tags}
                        onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="z.B. startup, saarbrücken, meetup"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                      onClick={() => setShowCreatePost(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={!newPost.title.trim() || !newPost.content.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post veröffentlichen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Community startet hier!</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Seien Sie der erste, der etwas postet. Teilen Sie Ihre Erfahrungen, Fragen oder Neuigkeiten mit der Saarland-Community.
                  </p>
                  <div className="bg-blue-50 rounded-2xl p-6 max-w-lg mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-3">Was können Sie posten?</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Business-Erfahrungen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Lokale Events</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Diskussionen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        <span>Regionale News</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                  
                  {/* Load More */}
                  <div className="text-center mt-12">
                    <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all">
                      Weitere Posts laden
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}