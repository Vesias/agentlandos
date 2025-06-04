'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MapPin, Calendar, Camera, Compass, Star, 
  Clock, Euro, Info, Navigation, Heart,
  Mountain, Trees, Building, Wine
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const attractions = [
  {
    id: 1,
    name: 'Saarschleife',
    category: 'Natur',
    description: 'Das Wahrzeichen des Saarlandes - spektakuläre Flussschleife bei Mettlach',
    rating: 4.8,
    visitors: '500k+/Jahr',
    icon: Mountain,
    image: '/api/placeholder/400/300',
    highlights: ['Baumwipfelpfad', 'Aussichtspunkt Cloef', 'Wanderwege'],
    openingHours: 'Täglich 24h geöffnet',
    price: 'Kostenlos (Baumwipfelpfad: 9,50€)',
    website: 'https://www.urlaub.saarland/saarschleife',
    phone: '+49 6864 7909055',
    address: 'Cloef-Atrium, 66693 Mettlach',
    email: 'info@tourismus-mettlach.de'
  },
  {
    id: 2,
    name: 'Völklinger Hütte',
    category: 'UNESCO Welterbe',
    description: 'Einzigartiges Industriedenkmal und UNESCO-Weltkulturerbe',
    rating: 4.7,
    visitors: '300k+/Jahr',
    icon: Building,
    image: '/api/placeholder/400/300',
    highlights: ['Industriekultur', 'Ausstellungen', 'Lichtinstallationen'],
    openingHours: 'Di-So 10:00-19:00',
    price: 'Erwachsene: 17€, Ermäßigt: 15€',
    website: 'https://www.voelklinger-huette.org',
    phone: '+49 6898 9100100',
    address: 'Rathausstraße 75-79, 66333 Völklingen',
    email: 'besucherdienst@voelklinger-huette.org'
  },
  {
    id: 3,
    name: 'Bostalsee',
    category: 'Freizeit',
    description: 'Größter Freizeitsee im Südwesten - perfekt für Wassersport und Erholung',
    rating: 4.5,
    visitors: '1M+/Jahr',
    icon: Trees,
    image: '/api/placeholder/400/300',
    highlights: ['Wassersport', 'Strandbad', 'Radwege', 'Gastronomie'],
    openingHours: 'Immer zugänglich (Strandbad: 9:00-19:00)',
    price: 'Eintritt frei (Strandbad kostenpflichtig)',
    website: 'https://www.bostalsee.de',
    phone: '+49 6852 8888',
    address: 'Am Bostalsee, 66625 Nohfelden',
    email: 'info@bostalsee.de'
  },
  {
    id: 4,
    name: 'Saarbrücker Schloss',
    category: 'Kultur',
    description: 'Barockes Schloss im Herzen der Landeshauptstadt',
    rating: 4.4,
    visitors: '200k+/Jahr',
    icon: Building,
    image: '/api/placeholder/400/300',
    highlights: ['Historisches Museum', 'Schlossplatz', 'Veranstaltungen'],
    openingHours: 'Di-So 10:00-18:00',
    price: 'Erwachsene: 6€, Ermäßigt: 4€',
    website: 'https://www.saarbruecken.de/schloss',
    phone: '+49 681 506-1402',
    address: 'Schlossplatz 16, 66119 Saarbrücken',
    email: 'info.museum@saarbruecken.de'
  }
]

const activities = [
  { name: 'Wandern', icon: Compass, count: '500+ Routen' },
  { name: 'Radfahren', icon: Navigation, count: '1000+ km Radwege' },
  { name: 'Weinproben', icon: Wine, count: '20+ Weingüter' },
  { name: 'Kulturevents', icon: Calendar, count: '100+ Events/Jahr' }
]

export default function TourismPage() {
  const router = useRouter()
  const [selectedAttraction, setSelectedAttraction] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Entdecke das Saarland
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Von der spektakulären Saarschleife bis zur industriellen Welterbestätte - 
            erleben Sie die Vielfalt unserer Region
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {activities.map((activity) => (
              <Card key={activity.name} className="p-6 text-center hover:shadow-lg transition-shadow">
                <activity.icon className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{activity.count}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Attractions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Sehenswürdigkeiten</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {attractions.map((attraction, index) => (
              <motion.div
                key={attraction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedAttraction(attraction.id)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                    <img 
                      src={attraction.image} 
                      alt={attraction.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(attraction.id)
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Heart 
                          className={`w-5 h-5 ${
                            favorites.includes(attraction.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        {attraction.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{attraction.name}</h3>
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-medium">{attraction.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{attraction.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {attraction.openingHours}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Euro className="w-4 h-4 mr-2" />
                        {attraction.price}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Camera className="w-4 h-4 mr-2" />
                        {attraction.visitors} Besucher
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {attraction.highlights.map((highlight) => (
                        <span 
                          key={highlight}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 mt-4 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {attraction.address}
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">📞</span>
                        <a href={`tel:${attraction.phone}`} className="hover:text-green-600">
                          {attraction.phone}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">✉️</span>
                        <a href={`mailto:${attraction.email}`} className="hover:text-green-600">
                          {attraction.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(attraction.website, '_blank')}
                      >
                        Website besuchen
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(`tel:${attraction.phone}`, '_blank')}
                      >
                        Anrufen
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Interaktive Karte</h2>
          <Card className="p-8 bg-gray-100">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  Interaktive Karte wird geladen...
                </p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  Karte öffnen
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Planen Sie Ihren Besuch
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Lassen Sie sich von unserem KI-Assistenten bei der Planung Ihrer 
            perfekten Saarland-Reise unterstützen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push('/chat')}
            >
              <Compass className="w-5 h-5 mr-2" />
              Reise planen
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/chat')}
            >
              <Info className="w-5 h-5 mr-2" />
              Mehr erfahren
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}