'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Building2, TrendingUp, Euro, Users, 
  Lightbulb, Award, BarChart3, Globe,
  Briefcase, Rocket, Shield, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const fundingPrograms = [
  {
    id: 1,
    name: 'Saarland Innovation',
    type: 'Gründerförderung',
    amount: 'Bis zu 100.000€',
    description: 'Unterstützung für innovative Startups und Gründer im Saarland',
    requirements: ['Innovatives Geschäftsmodell', 'Hauptsitz im Saarland', 'Nachhaltigkeit'],
    icon: Rocket,
    deadline: 'Laufend',
    website: 'https://www.invest-in-saarland.com/foerderung',
    contact: 'foerderung@invest-in-saarland.com',
    phone: '+49 681 9520-0'
  },
  {
    id: 2,
    name: 'Digitalisierungsbonus',
    type: 'Digitalisierung',
    amount: 'Bis zu 15.000€',
    description: 'Förderung digitaler Transformation für KMUs',
    requirements: ['KMU mit Sitz im Saarland', 'Digitalisierungsprojekt', 'Eigenanteil 50%'],
    icon: Globe,
    deadline: '31.12.2024',
    website: 'https://www.saarland.de/digitalisierungsbonus',
    contact: 'digitalisierung@saarland.de',
    phone: '+49 681 501-1234'
  },
  {
    id: 3,
    name: 'Fachkräfteförderung',
    type: 'Personal',
    amount: 'Bis zu 50.000€',
    description: 'Unterstützung bei der Einstellung qualifizierter Fachkräfte',
    requirements: ['Neue Arbeitsplätze', 'Langfristige Beschäftigung', 'Qualifizierung'],
    icon: Users,
    deadline: 'Quartalsweise',
    website: 'https://www.arbeitsagentur.de/unternehmen/finanziell/foerderung-arbeitnehmer',
    contact: 'service@arbeitsagentur.de',
    phone: '+49 681 944-0'
  },
  {
    id: 4,
    name: 'Exportförderung',
    type: 'International',
    amount: 'Bis zu 30.000€',
    description: 'Unterstützung beim Markteintritt in neue Länder',
    requirements: ['Exportorientierung', 'Marktanalyse', 'Messeteilnahme'],
    icon: Globe,
    deadline: 'Jederzeit',
    website: 'https://www.gtai.de/gtai-de/invest/service/foerdermittel',
    contact: 'info@gtai.de',
    phone: '+49 681 9520-100'
  }
]

const businessServices = [
  {
    title: 'Gründungsberatung',
    description: 'Kostenlose Erstberatung für Gründer',
    icon: Lightbulb,
    features: ['Businessplan-Check', 'Finanzierungsberatung', 'Rechtsformwahl']
  },
  {
    title: 'Standortservice',
    description: 'Unterstützung bei der Standortsuche',
    icon: Building2,
    features: ['Immobilienvermittlung', 'Infrastrukturanalyse', 'Behördenkontakte']
  },
  {
    title: 'Netzwerk & Events',
    description: 'Zugang zu Business-Netzwerken',
    icon: Users,
    features: ['Networking-Events', 'Branchentreffen', 'Mentoring-Programme']
  },
  {
    title: 'Innovationsförderung',
    description: 'Support für F&E-Projekte',
    icon: Award,
    features: ['Forschungskooperationen', 'Patentberatung', 'Technologietransfer']
  }
]

const statistics = [
  { label: 'Geförderte Unternehmen', value: '500+', trend: '+12%' },
  { label: 'Investitionsvolumen', value: '250M€', trend: '+18%' },
  { label: 'Neue Arbeitsplätze', value: '3.500', trend: '+8%' },
  { label: 'Erfolgsquote', value: '87%', trend: '+3%' }
]

export default function BusinessPage() {
  const router = useRouter()
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null)
  const [applicationStep, setApplicationStep] = useState(0)

  const applicationSteps = [
    'Programm auswählen',
    'Voraussetzungen prüfen',
    'Unterlagen vorbereiten',
    'Antrag einreichen',
    'Feedback erhalten'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Wirtschaftsstandort Saarland
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Förderungen, Beratung und Netzwerke für Ihren unternehmerischen Erfolg
          </p>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {statistics.map((stat) => (
              <Card key={stat.label} className="p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-3xl font-bold text-blue-600">{stat.value}</h3>
                <p className="text-gray-600 mt-1">{stat.label}</p>
                <span className="text-green-600 text-sm font-medium">{stat.trend}</span>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Funding Programs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Förderprogramme</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {fundingPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 hover:shadow-xl transition-all cursor-pointer ${
                    selectedProgram === program.id ? 'ring-2 ring-blue-600' : ''
                  }`}
                  onClick={() => setSelectedProgram(program.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <program.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{program.name}</h3>
                        <p className="text-sm text-gray-500">{program.type}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">{program.amount}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900">Voraussetzungen:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {program.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📞</span>
                      <a href={`tel:${program.phone}`} className="hover:text-blue-600">
                        {program.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">✉️</span>
                      <a href={`mailto:${program.contact}`} className="hover:text-blue-600">
                        {program.contact}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📅</span>
                      <span>Deadline: {program.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(program.website, '_blank')}
                    >
                      Jetzt beantragen
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`mailto:${program.contact}`, '_blank')}
                    >
                      Kontakt
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Unsere Services</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <service.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-500 flex items-start">
                        <Shield className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Ihr Weg zur Förderung
          </h2>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-between">
              {applicationSteps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => setApplicationStep(index)}
                  className={`flex flex-col items-center ${
                    index <= applicationStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index <= applicationStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium hidden sm:block">
                    {step}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <Card className="mt-8 p-6">
            <h3 className="text-xl font-semibold mb-4">
              {applicationSteps[applicationStep]}
            </h3>
            <p className="text-gray-600">
              Detaillierte Informationen zum aktuellen Schritt werden hier angezeigt...
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Starten Sie durch im Saarland
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Lassen Sie sich von unserem KI-Assistenten zu den passenden 
            Förderprogrammen und Services beraten
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-900 hover:bg-gray-100"
              onClick={() => router.push('/chat')}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Beratung starten
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-900"
            >
              <FileText className="w-5 h-5 mr-2" />
              Infomaterial anfordern
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}