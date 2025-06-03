'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Music, Palette, Theater, Camera,
  Calendar, Clock, MapPin, Ticket,
  Star, Heart, Users, Trophy,
  Mic, Guitar, Film, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const venues = [
  {
    id: 1,
    name: 'Staatstheater Saarbrücken',
    type: 'Theater & Oper',
    description: 'Traditionsreiches Theater mit vielfältigem Programm',
    capacity: '734 Plätze',
    highlights: ['Oper', 'Schauspiel', 'Tanztheater'],
    nextEvents: [
      { title: 'Die Zauberflöte', date: '15.01.2024', time: '19:30' },
      { title: 'Hamlet', date: '18.01.2024', time: '20:00' }
    ],
    icon: Theater
  },
  {
    id: 2,
    name: 'Saarländisches Staatstheater',
    type: 'Konzerthalle',
    description: 'Moderne Konzerthalle für klassische und zeitgenössische Musik',
    capacity: '1.200 Plätze',
    highlights: ['Sinfoniekonzerte', 'Kammermusik', 'Jazz'],
    nextEvents: [
      { title: 'Beethovens 9. Sinfonie', date: '20.01.2024', time: '19:00' },
      { title: 'Jazz Night', date: '25.01.2024', time: '20:30' }
    ],
    icon: Music
  },
  {
    id: 3,
    name: 'Moderne Galerie Saarbrücken',
    type: 'Museum & Galerie',
    description: 'Führende Sammlung zeitgenössischer Kunst',
    capacity: '2.000 m² Ausstellungsfläche',
    highlights: ['Zeitgenössische Kunst', 'Wechselausstellungen', 'Skulpturen'],
    nextEvents: [
      { title: 'Picasso Retrospektive', date: 'Bis 31.03.2024', time: 'Täglich' },
      { title: 'Digitale Kunst', date: 'Ab 01.02.2024', time: 'Täglich' }
    ],
    icon: Palette
  },
  {
    id: 4,
    name: 'Filmhaus Saarbrücken',
    type: 'Kino & Film',
    description: 'Programmkino für anspruchsvolle Filmkultur',
    capacity: '450 Plätze (3 Säle)',
    highlights: ['Arthouse-Filme', 'Dokumentationen', 'Retrospektiven'],
    nextEvents: [
      { title: 'Französische Filmwoche', date: '22.01-28.01.2024', time: 'Diverse' },
      { title: 'Stummfilm mit Live-Musik', date: '30.01.2024', time: '20:00' }
    ],
    icon: Film
  }
]

const festivals = [
  {
    name: 'Saarland Festival',
    period: 'Juni - August',
    type: 'Musik & Kultur',
    description: 'Das größte Kulturfestival der Region mit internationalen Künstlern',
    attendees: '50.000+',
    locations: '20+ Spielstätten'
  },
  {
    name: 'Jazz am Staden',
    period: 'September',
    type: 'Jazz Festival',
    description: 'Renommiertes Jazz-Festival mit weltbekannten Musikern',
    attendees: '15.000+',
    locations: 'Stadtpark Saarbrücken'
  },
  {
    name: 'Saarbrücker Filmfestival',
    period: 'Oktober',
    type: 'Film Festival',
    description: 'Internationales Filmfestival für junge Talente',
    attendees: '8.000+',
    locations: 'Diverse Kinos'
  },
  {
    name: 'Weihnachtsmarkt',
    period: 'November - Dezember',
    type: 'Traditioneller Markt',
    description: 'Einer der schönsten Weihnachtsmärkte Deutschlands',
    attendees: '200.000+',
    locations: 'Altstadt Saarbrücken'
  }
]

const culturalInstitutions = [
  {
    name: 'Saarlandmuseum',
    focus: 'Geschichte & Kultur',
    collections: ['Archäologie', 'Stadtgeschichte', 'Industriekultur'],
    visitors: '120.000/Jahr'
  },
  {
    name: 'Weltkulturerbe Völklinger Hütte',
    focus: 'Industriekultur',
    collections: ['Industriegeschichte', 'Moderne Kunst', 'ScienceCenter'],
    visitors: '300.000/Jahr'
  },
  {
    name: 'Historisches Museum Saar',
    focus: 'Regionalgeschichte',
    collections: ['Saarland-Geschichte', 'Bergbau', 'Grenzregion'],
    visitors: '80.000/Jahr'
  },
  {
    name: 'Stadtgalerie Saarbrücken',
    focus: 'Zeitgenössische Kunst',
    collections: ['Moderne Malerei', 'Skulptur', 'Installation'],
    visitors: '60.000/Jahr'
  }
]

export default function CulturePage() {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState<any>(null)
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([])

  const toggleFavorite = (eventTitle: string) => {
    setFavoriteEvents(prev => 
      prev.includes(eventTitle)
        ? prev.filter(title => title !== eventTitle)
        : [...prev, eventTitle]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Kultur im Saarland
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Erleben Sie die vielfältige Kulturlandschaft unserer Region - 
            von klassischer Musik bis zeitgenössischer Kunst
          </p>
          
          {/* Culture Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Music className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Musik</h3>
              <p className="text-sm text-gray-600 mt-1">50+ Konzerte/Monat</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Theater className="w-8 h-8 mx-auto mb-3 text-red-600" />
              <h3 className="font-semibold text-gray-900">Theater</h3>
              <p className="text-sm text-gray-600 mt-1">30+ Aufführungen/Monat</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Palette className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Kunst</h3>
              <p className="text-sm text-gray-600 mt-1">15+ Ausstellungen</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Film className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-gray-900">Film</h3>
              <p className="text-sm text-gray-600 mt-1">200+ Filme/Monat</p>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Featured Venues */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Kulturelle Spielstätten</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedVenue(venue)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <venue.icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{venue.name}</h3>
                          <p className="text-sm text-gray-500">{venue.type}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{venue.capacity}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{venue.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Schwerpunkte:</h4>
                      <div className="flex flex-wrap gap-2">
                        {venue.highlights.map((highlight) => (
                          <span 
                            key={highlight}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Kommende Veranstaltungen:</h4>
                      {venue.nextEvents.map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(event.title)
                            }}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                favoriteEvents.includes(event.title)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Festivals & Events */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Festivals & Highlights</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {festivals.map((festival, index) => (
              <motion.div
                key={festival.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{festival.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{festival.period}</p>
                    <p className="text-xs text-gray-500">{festival.type}</p>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{festival.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {festival.attendees} Besucher
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {festival.locations}
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                    Programm ansehen
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Institutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Museen & Galerien</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {culturalInstitutions.map((institution, index) => (
              <motion.div
                key={institution.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{institution.name}</h3>
                      <p className="text-sm text-gray-500">{institution.focus}</p>
                    </div>
                    <span className="text-sm text-purple-600 font-medium">
                      {institution.visitors}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Sammlungen:</h4>
                    <ul className="space-y-1">
                      {institution.collections.map((collection, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <BookOpen className="w-4 h-4 text-purple-600 mr-2 mt-0.5" />
                          {collection}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Besuchen
                    </Button>
                    <Button size="sm" variant="outline">
                      Virtuelle Tour
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Calendar */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-900 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Diese Woche im Saarland</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/10 border-white/20">
              <Calendar className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-semibold mb-2">Heute</h3>
              <ul className="space-y-2 text-sm">
                <li>• "Die Zauberflöte" - Staatstheater (19:30)</li>
                <li>• Jazz Session - Blue Note Bar (21:00)</li>
                <li>• Kunstnacht - Moderne Galerie (18:00)</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-white/10 border-white/20">
              <Clock className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-semibold mb-2">Diese Woche</h3>
              <ul className="space-y-2 text-sm">
                <li>• Hamlet - Do 18.01 (20:00)</li>
                <li>• Beethoven Konzert - Fr 19.01 (19:00)</li>
                <li>• Filmfestival - Sa-So 20-21.01</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-white/10 border-white/20">
              <Star className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-semibold mb-2">Empfehlungen</h3>
              <ul className="space-y-2 text-sm">
                <li>• Picasso Retrospektive (verlängert)</li>
                <li>• Saarland Sinfoniker Konzert</li>
                <li>• Neue Künstler im Kulturzentrum</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Entdecken Sie Kultur
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Lassen Sie sich von unserem KI-Assistenten passende 
            Kulturveranstaltungen empfehlen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push('/chat')}
            >
              <Mic className="w-5 h-5 mr-2" />
              Kultur-Empfehlungen
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/chat')}
            >
              <Ticket className="w-5 h-5 mr-2" />
              Tickets buchen
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}