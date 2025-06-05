'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Calendar, Users, MapPin, Clock, TrendingUp, Star } from 'lucide-react'

interface FootballMatch {
  id: string
  home: string
  away: string
  home_score?: number
  away_score?: number
  date: string
  time?: string
  league: string
  venue?: string
  status: string
}

interface FootballClub {
  id: string
  name: string
  league: string
  position: number
  points: number
  games: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  form: string
  stadium: string
  founded: number
  colors: string
  coach: string
  website: string
}

export default function SaarFootballPage() {
  const [matches, setMatches] = useState<FootballMatch[]>([])
  const [clubs, setClubs] = useState<FootballClub[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'matches' | 'clubs' | 'leagues'>('matches')

  useEffect(() => {
    fetchFootballData()
  }, [])

  const fetchFootballData = async () => {
    try {
      const response = await fetch('/api/saar-football?type=scores')
      const data = await response.json()
      
      if (data.success) {
        setMatches(data.scores || [])
      }
    } catch (error) {
      console.error('Error fetching football data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Lade SAARFUSSBALL-Daten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-quantum">
            SAARFUSSBALL
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Alles über Fußball im Saarland - von Profi bis Amateur
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'matches'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Spiele & Ergebnisse
            </button>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'clubs'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Vereine
            </button>
            <button
              onClick={() => setActiveTab('leagues')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'leagues'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Ligen
            </button>
          </div>
        </div>

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-8">
            {/* Featured Clubs Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">1. FC Saarbrücken</h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">3. Liga</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-semibold">8. Platz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punkte:</span>
                    <span className="font-semibold">32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form:</span>
                    <span className="font-mono text-sm">L-D-W-D-W</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">SV 07 Elversberg</h3>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">2. Bundesliga</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-semibold">12. Platz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punkte:</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form:</span>
                    <span className="font-mono text-sm">L-L-W-D-D</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">FC 08 Homburg</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Regionalliga</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-semibold">3. Platz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punkte:</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form:</span>
                    <span className="font-mono text-sm">W-D-W-W-L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent & Upcoming Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Matches */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-green-600" />
                  Letzte Ergebnisse
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">04.01.2025 • 3. Liga</span>
                      <span className="text-sm text-gray-600">8.547 Zuschauer</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        1. FC Saarbrücken <span className="text-green-600 mx-3">2:1</span> VfB Stuttgart II
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">03.01.2025 • Regionalliga</span>
                      <span className="text-sm text-gray-600">4.231 Zuschauer</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        FC 08 Homburg <span className="text-green-600 mx-3">1:0</span> FSV Frankfurt
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">02.01.2025 • 2. Bundesliga</span>
                      <span className="text-sm text-gray-600">29.374 Zuschauer</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        Karlsruher SC <span className="text-gray-600 mx-3">2:2</span> SV 07 Elversberg
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Matches */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Nächste Spiele
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">11.01.2025 • 14:00</span>
                      <span className="text-sm text-blue-600">3. Liga</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        Arminia Bielefeld <span className="text-gray-400 mx-3">vs</span> 1. FC Saarbrücken
                      </div>
                      <div className="text-sm text-gray-600 mt-1">SchücoArena</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">12.01.2025 • 13:30</span>
                      <span className="text-sm text-blue-600">2. Bundesliga</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        SV 07 Elversberg <span className="text-gray-400 mx-3">vs</span> SC Paderborn
                      </div>
                      <div className="text-sm text-gray-600 mt-1">URSAPHARM-Arena</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">13.01.2025 • 14:00</span>
                      <span className="text-sm text-blue-600">Regionalliga</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        FC 08 Homburg <span className="text-gray-400 mx-3">vs</span> TSV Steinbach
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Waldstadion Homburg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clubs Tab */}
        {activeTab === 'clubs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample clubs data */}
            {[
              {
                name: '1. FC Saarbrücken',
                stadium: 'Hermann-Neuberger-Stadion',
                founded: 1903,
                league: '3. Liga',
                website: 'https://www.fcsaarbruecken.de'
              },
              {
                name: 'SV 07 Elversberg',
                stadium: 'URSAPHARM-Arena',
                founded: 1911,
                league: '2. Bundesliga',
                website: 'https://www.sv-elversberg.de'
              },
              {
                name: 'FC 08 Homburg',
                stadium: 'Waldstadion Homburg',
                founded: 1900,
                league: 'Regionalliga Südwest',
                website: 'https://www.fc-homburg.de'
              }
            ].map((club, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">{club.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{club.stadium}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Gegründet {club.founded}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>{club.league}</span>
                  </div>
                </div>
                <a 
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Website besuchen
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Saarländische Fußball-Ligen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-lg">2. Bundesliga</h4>
                    <p className="text-gray-600">SV 07 Elversberg</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-lg">3. Liga</h4>
                    <p className="text-gray-600">1. FC Saarbrücken</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-lg">Regionalliga Südwest</h4>
                    <p className="text-gray-600">FC 08 Homburg</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-lg">Verbandsliga Saarland</h4>
                    <p className="text-gray-600">16 Vereine • Höchste Amateurliga</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-lg">Landesliga Nord/Süd</h4>
                    <p className="text-gray-600">Je 14 Vereine • Bezirksebene</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-lg">Bezirksligen</h4>
                    <p className="text-gray-600">Mehrere Staffeln • Lokale Vereine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-400 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Folgen Sie SAARFUSSBALL</h3>
          <p className="text-lg mb-6 opacity-90">
            Bleiben Sie auf dem Laufenden mit Live-Ergebnissen, Transfernews und Vereinsinfos.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105">
              Newsletter abonnieren
            </button>
            <button className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105">
              Live-Ticker aktivieren
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}