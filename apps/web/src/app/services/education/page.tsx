'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  GraduationCap, BookOpen, Users, Award,
  Calendar, Clock, MapPin, Euro,
  Laptop, Brain, Target, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const universities = [
  {
    id: 1,
    name: 'Universität des Saarlandes',
    type: 'Universität',
    students: '17.000+',
    programs: '120+',
    specialties: ['Informatik', 'Materialwissenschaften', 'Europastudien'],
    campus: 'Saarbrücken & Homburg',
    international: true
  },
  {
    id: 2,
    name: 'htw saar',
    type: 'Hochschule für Technik und Wirtschaft',
    students: '6.000+',
    programs: '50+',
    specialties: ['Ingenieurwesen', 'Wirtschaft', 'Sozialwissenschaften'],
    campus: 'Saarbrücken',
    international: true
  },
  {
    id: 3,
    name: 'HfM Saar',
    type: 'Hochschule für Musik',
    students: '500+',
    programs: '20+',
    specialties: ['Klassische Musik', 'Jazz', 'Musikpädagogik'],
    campus: 'Saarbrücken',
    international: true
  },
  {
    id: 4,
    name: 'HBKsaar',
    type: 'Hochschule der Bildenden Künste',
    students: '400+',
    programs: '15+',
    specialties: ['Freie Kunst', 'Design', 'Medienkunst'],
    campus: 'Saarbrücken',
    international: true
  }
]

const trainingPrograms = [
  {
    title: 'Digitale Kompetenzen',
    provider: 'IHK Saarland',
    duration: '3-6 Monate',
    format: 'Hybrid',
    level: 'Alle Level',
    topics: ['Programmierung', 'Data Science', 'Digital Marketing']
  },
  {
    title: 'Führungskräfte-Training',
    provider: 'Saar-Lor-Lux Academy',
    duration: '12 Monate',
    format: 'Präsenz',
    level: 'Fortgeschritten',
    topics: ['Leadership', 'Change Management', 'Strategie']
  },
  {
    title: 'Sprachkurse',
    provider: 'VHS Regionalverband',
    duration: 'Flexibel',
    format: 'Präsenz/Online',
    level: 'A1-C2',
    topics: ['Deutsch', 'Englisch', 'Französisch', 'Business-Sprachen']
  },
  {
    title: 'Handwerk 4.0',
    provider: 'HWK Saarland',
    duration: '6-24 Monate',
    format: 'Dual',
    level: 'Ausbildung',
    topics: ['Smart Home', 'E-Mobilität', 'Digitales Handwerk']
  }
]

const scholarships = [
  {
    name: 'Deutschlandstipendium',
    amount: '300€/Monat',
    duration: 'Mind. 2 Semester',
    requirements: ['Gute Noten', 'Soziales Engagement']
  },
  {
    name: 'Saarland-Stipendium',
    amount: '500€/Monat',
    duration: '12 Monate',
    requirements: ['Exzellente Leistungen', 'Saarland-Bezug']
  },
  {
    name: 'Aufstiegs-BAföG',
    amount: 'Bis 892€/Monat',
    duration: 'Gesamte Weiterbildung',
    requirements: ['Berufliche Weiterbildung', 'Meister/Techniker']
  }
]

export default function EducationPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<'university' | 'training' | 'scholarship'>('university')
  const [selectedItem, setSelectedItem] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Bildung im Saarland
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Von der Hochschule bis zur Weiterbildung - entdecken Sie Ihre 
            Bildungsmöglichkeiten in unserer Region
          </p>
          
          {/* Category Selector */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <Button
              size="lg"
              variant={selectedCategory === 'university' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('university')}
              className={selectedCategory === 'university' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Hochschulen
            </Button>
            <Button
              size="lg"
              variant={selectedCategory === 'training' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('training')}
              className={selectedCategory === 'training' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Brain className="w-5 h-5 mr-2" />
              Weiterbildung
            </Button>
            <Button
              size="lg"
              variant={selectedCategory === 'scholarship' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('scholarship')}
              className={selectedCategory === 'scholarship' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Award className="w-5 h-5 mr-2" />
              Förderungen
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Universities Section */}
      {selectedCategory === 'university' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Hochschulen im Saarland
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {universities.map((uni, index) => (
                <motion.div
                  key={uni.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{uni.name}</h3>
                        <p className="text-sm text-gray-500">{uni.type}</p>
                      </div>
                      {uni.international && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          International
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Studierende</p>
                        <p className="font-semibold text-orange-600">{uni.students}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Studiengänge</p>
                        <p className="font-semibold text-orange-600">{uni.programs}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Schwerpunkte:</p>
                      <div className="flex flex-wrap gap-2">
                        {uni.specialties.map((specialty) => (
                          <span 
                            key={specialty}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {uni.campus}
                    </div>
                    
                    <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                      Mehr erfahren
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Training Programs Section */}
      {selectedCategory === 'training' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Weiterbildungsangebote
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {trainingPrograms.map((program, index) => (
                <motion.div
                  key={program.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {program.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{program.provider}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {program.duration}
                      </div>
                      <div className="flex items-center text-sm">
                        <Laptop className="w-4 h-4 text-gray-400 mr-2" />
                        {program.format}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Themen:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {program.topics.map((topic) => (
                          <li key={topic} className="flex items-start">
                            <Target className="w-4 h-4 text-orange-600 mr-2 mt-0.5" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Level: <span className="font-medium">{program.level}</span>
                      </span>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        Anmelden
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scholarships Section */}
      {selectedCategory === 'scholarship' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Stipendien & Förderungen
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {scholarships.map((scholarship, index) => (
                <motion.div
                  key={scholarship.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all">
                    <Award className="w-12 h-12 text-orange-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {scholarship.name}
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Förderung</p>
                        <p className="font-semibold text-green-600">{scholarship.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Laufzeit</p>
                        <p className="font-medium">{scholarship.duration}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Voraussetzungen:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {scholarship.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Jetzt bewerben
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Success Stories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Erfolgsgeschichten aus dem Saarland
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-gray-600 italic mb-4">
                "Die Universität des Saarlandes hat mir die perfekte Grundlage 
                für meine internationale Karriere in der KI-Forschung gegeben."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold">Dr. Anna Schmidt</p>
                  <p className="text-sm text-gray-500">AI Research Lead, Google</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <p className="text-gray-600 italic mb-4">
                "Die Weiterbildung bei der IHK hat mir geholfen, mein eigenes 
                Tech-Startup erfolgreich zu gründen."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold">Michael Weber</p>
                  <p className="text-sm text-gray-500">CEO, TechSaar GmbH</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <p className="text-gray-600 italic mb-4">
                "Dank des Deutschlandstipendiums konnte ich mich voll auf 
                mein Studium konzentrieren und Bestleistungen erzielen."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold">Sarah Müller</p>
                  <p className="text-sm text-gray-500">Medizinstudentin, UdS</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Finden Sie Ihren Bildungsweg
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Lassen Sie sich von unserem KI-Assistenten bei der Suche nach 
            dem perfekten Bildungsangebot unterstützen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => router.push('/chat')}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Beratung starten
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/chat')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Info-Veranstaltungen
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}