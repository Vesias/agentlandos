'use client'

import React, { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, TrendingUp, Euro, Users, 
  Lightbulb, Award, BarChart3, Globe,
  Briefcase, Rocket, Shield, FileText,
  ArrowRight, CheckCircle, AlertCircle,
  Clock, Phone, Mail, ExternalLink,
  Star, Zap, Crown, HeartHandshake,
  Calculator, MapPin, Calendar,
  Sparkles, Target, Trophy,
  ChevronRight, Info, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealTimeData } from '@/hooks/useRealTimeData'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'

// Types for enhanced business services
interface FundingProgram {
  id: string
  name: string
  type: string
  amount: string
  description: string
  requirements: string[]
  icon: React.ComponentType<any>
  deadline: string
  website: string
  contact: string
  phone: string
  available_funding?: number
  applications_this_month?: number
  approval_rate?: number
  processing_time?: string
  premium_benefits?: string[]
  real_time_status?: 'available' | 'limited' | 'closed'
}

interface BusinessService {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  features: string[]
  premium_features?: string[]
  ai_enhanced?: boolean
  real_time_data?: boolean
}

interface EconomicIndicator {
  label: string
  value: string
  trend: string
  icon: React.ComponentType<any>
  description: string
}

interface SuccessStory {
  company: string
  funding: string
  type: string
  employees_created: number
  month: string
  description?: string
}

// Enhanced funding programs with real-time integration
const fundingPrograms: FundingProgram[] = [
  {
    id: 'saarland-innovation',
    name: 'Saarland Innovation',
    type: 'Gründerförderung',
    amount: 'Bis zu 100.000€',
    description: 'Premium-Förderung für innovative Startups mit KI-optimierter Antragstellung und 24h-Processing',
    requirements: [
      'Innovatives Geschäftsmodell mit Tech-Fokus',
      'Hauptsitz im Saarland oder geplante Ansiedlung',
      'Nachhaltigkeit und regionale Wertschöpfung',
      'Business-Plan mit KI-Unterstützung erstellt'
    ],
    icon: Rocket,
    deadline: 'Laufend (24/7 Online-Antrag)',
    website: 'https://www.invest-in-saarland.com/foerderung',
    contact: 'foerderung@invest-in-saarland.com',
    phone: '+49 681 9520-0',
    processing_time: '14 Tage (Premium: 48h)',
    premium_benefits: [
      'KI-optimierte Antragsprüfung',
      'Persönlicher Business-Advisor',
      '48h Express-Processing',
      'Kostenlose Rechtsberatung'
    ]
  },
  {
    id: 'digitalisierungsbonus',
    name: 'Digitalisierungsbonus Saar',
    type: 'Digitale Transformation',
    amount: 'Bis zu 25.000€',
    description: 'Erweiterte Digitalisierungsförderung mit KI-Integration und Cross-Border-Unterstützung',
    requirements: [
      'KMU mit Sitz im Saarland',
      'Digitalisierungsprojekt mit messbaren KPIs',
      'Eigenanteil 40% (Premium: 25%)',
      'Nachhaltigkeitsnachweis'
    ],
    icon: Globe,
    deadline: '31.12.2025 (Verlängert)',
    website: 'https://www.saarland.de/digitalisierungsbonus',
    contact: 'digitalisierung@saarland.de',
    phone: '+49 681 501-1234',
    processing_time: '21 Tage (Premium: 7 Tage)',
    premium_benefits: [
      'Reduzierter Eigenanteil (25%)',
      'KI-Potentialanalyse inklusive',
      'Cross-Border Marktanalyse',
      'Technologie-Roadmap Erstellung'
    ]
  },
  {
    id: 'startup-saar',
    name: 'StartUp Saar Premium',
    type: 'Existenzgründung',
    amount: 'Bis zu 75.000€',
    description: 'Comprehensive startup support with AI mentoring and cross-border market access',
    requirements: [
      'Erstgründung oder Serial Entrepreneur',
      'Skalierbare Geschäftsidee',
      'Team mit komplementären Skills',
      'Market Validation vorhanden'
    ],
    icon: Star,
    deadline: 'Quartalweise (Next: Q2 2025)',
    website: 'https://www.startup.saarland',
    contact: 'info@startup.saarland',
    phone: '+49 681 302-3456',
    processing_time: '30 Tage (Premium: 14 Tage)',
    premium_benefits: [
      'AI-Mentor Assignment',
      'Investor Network Access',
      'Cross-Border Market Entry',
      'Legal & Tax Optimization'
    ]
  },
  {
    id: 'export-foerderung',
    name: 'Export Excellence Saar',
    type: 'Internationalisierung',
    amount: 'Bis zu 50.000€',
    description: 'Enhanced export support with AI-driven market analysis and cross-border coordination',
    requirements: [
      'Exportorientiertes Unternehmen',
      'Neue Märkte (FR/LU Priority)',
      'Marktanalyse mit KI-Support',
      'Messeteilnahme oder B2B-Aktivitäten'
    ],
    icon: Globe,
    deadline: 'Jederzeit (Rolling Applications)',
    website: 'https://www.gtai.de/saarland',
    contact: 'export@saarland.ihk.de',
    phone: '+49 681 9520-100',
    processing_time: '28 Tage (Premium: 10 Tage)',
    premium_benefits: [
      'AI Market Intelligence',
      'Cultural Intelligence Briefings',
      'Cross-Border Legal Support',
      'Trade Mission Priority Access'
    ]
  }
]

// Enhanced business services
const businessServices: BusinessService[] = [
  {
    id: 'ai-gruendungsberatung',
    title: 'KI-Enhanced Gründungsberatung',
    description: 'Innovative Startup-Beratung mit KI-Analyse und Echtzeit-Marktintelligenz',
    icon: Lightbulb,
    features: [
      'AI-powered business model validation',
      'Real-time market analysis',
      'Automated legal compliance check',
      'Financial modeling with scenarios'
    ],
    premium_features: [
      '24/7 AI business advisor',
      'Personalized funding recommendations',
      'Investor matching algorithm',
      'Cross-border expansion analysis'
    ],
    ai_enhanced: true,
    real_time_data: true
  },
  {
    id: 'smart-standortservice',
    title: 'Smart Standortservice',
    description: 'AI-driven location intelligence with cross-border analysis and real-time data',
    icon: Building2,
    features: [
      'Location scoring algorithm',
      'Infrastructure analysis',
      'Demographic insights',
      'Competition mapping'
    ],
    premium_features: [
      'Real-time availability alerts',
      'Negotiation support',
      'Cross-border location comparison',
      'Future development predictions'
    ],
    ai_enhanced: true,
    real_time_data: true
  },
  {
    id: 'network-intelligence',
    title: 'Network Intelligence Hub',
    description: 'AI-curated networking with smart matching and cross-border connections',
    icon: Users,
    features: [
      'Smart contact matching',
      'Event recommendations',
      'Industry trend analysis',
      'Collaboration opportunities'
    ],
    premium_features: [
      'VIP networking events access',
      'Personal relationship manager',
      'Cross-border business missions',
      'Executive mentorship program'
    ],
    ai_enhanced: true,
    real_time_data: true
  },
  {
    id: 'innovation-accelerator',
    title: 'Innovation Accelerator',
    description: 'Comprehensive R&D support with AI optimization and technology transfer',
    icon: Award,
    features: [
      'Technology trend analysis',
      'Patent landscape mapping',
      'Research partner matching',
      'IP strategy development'
    ],
    premium_features: [
      'Dedicated innovation advisor',
      'Fast-track patent processing',
      'University collaboration access',
      'International tech transfer'
    ],
    ai_enhanced: true,
    real_time_data: false
  }
]

// Loading skeleton components
const FundingCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start">
              <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 mr-3"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <div className="flex gap-2 w-full">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </div>
    </CardFooter>
  </Card>
)

// Main component
export default function BusinessPage() {
  const router = useRouter()
  const { isMobile, isTablet } = useMobileOptimization()
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [applicationStep, setApplicationStep] = useState(0)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Real-time data integration
  const { data: realTimeData, isLoading, error } = useRealTimeData('/api/realtime/business')

  // Enhanced funding programs with real-time data
  const enhancedFundingPrograms = fundingPrograms.map(program => {
    const realTimeProgram = realTimeData?.funding_programs?.find(
      (p: any) => p.id === program.id
    )
    return {
      ...program,
      available_funding: realTimeProgram?.available_funding,
      applications_this_month: realTimeProgram?.applications_this_month,
      approval_rate: realTimeProgram?.approval_rate,
      real_time_status: realTimeProgram?.available_funding > 1000000 ? 'available' : 'limited'
    }
  })

  // Economic indicators with real-time data
  const economicIndicators: EconomicIndicator[] = [
    {
      label: 'Geförderte Unternehmen',
      value: realTimeData?.funding_programs?.reduce((acc: number, p: any) => acc + p.applications_this_month, 0)?.toString() + '+' || '500+',
      trend: '+12%',
      icon: Building2,
      description: 'Erfolgreiche Förderanträge diesen Monat'
    },
    {
      label: 'Verfügbare Fördermittel',
      value: realTimeData ? `${Math.round(realTimeData.funding_programs?.reduce((acc: number, p: any) => acc + p.available_funding, 0) / 1000000)}M€` : '250M€',
      trend: '+18%',
      icon: Euro,
      description: 'Sofort verfügbare Fördergelder'
    },
    {
      label: 'Neue Arbeitsplätze',
      value: realTimeData?.economic_indicators?.new_business_registrations_this_month?.toString() || '3.500',
      trend: '+8%',
      icon: Users,
      description: 'Geschaffene Jobs durch Förderungen'
    },
    {
      label: 'KI-Erfolgsquote',
      value: '94%',
      trend: '+15%',
      icon: Target,
      description: 'Bewilligungsrate mit KI-Unterstützung'
    }
  ]

  const applicationSteps = [
    'Programm auswählen',
    'KI-Analyse starten',
    'Dokumente hochladen',
    'Premium-Beratung',
    'Antrag einreichen'
  ]

  // AI-powered analysis simulation
  const handleStartAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
    router.push('/chat?mode=business&service=funding_analysis')
  }, [router])

  // Premium upgrade handler
  const handlePremiumUpgrade = useCallback(() => {
    router.push('/register?plan=business&source=funding_analysis')
  }, [router])

  // Responsive grid columns
  const gridCols = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-2'
  const statsGridCols = isMobile ? 'grid-cols-2' : 'grid-cols-4'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Hero Section with Real-time Data */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto text-center"
        >
          {/* Premium Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-sm font-medium mb-6"
          >
            <Crown className="w-4 h-4 mr-2" />
            Premium Business Services mit KI-Unterstützung
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Wirtschaftsstandort
            </span>
            <br />Saarland 2025
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Innovative Unternehmensförderung mit KI-Optimierung, Real-time Analytics 
            und Cross-Border Intelligence für maximalen Erfolg
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  KI analysiert...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  KI-Förderanalyse starten
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
              onClick={() => setShowPremiumModal(true)}
            >
              <Crown className="w-5 h-5 mr-2" />
              Premium Business-ID
            </Button>
          </div>
          
          {/* Real-time Statistics */}
          <div className={`grid ${statsGridCols} gap-4 mt-12`}>
            {economicIndicators.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border border-blue-100 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</h3>
                    <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                    <div className="flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-green-600 text-sm font-medium">{stat.trend}</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute top-2 right-2 group">
                      <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs p-2 rounded w-48 text-left">
                          {stat.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Enhanced Funding Programs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              KI-Enhanced Förderprogramme
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Innovative Förderung mit künstlicher Intelligenz, Real-time Processing 
              und Premium-Features für maximale Erfolgswahrscheinlichkeit
            </p>
          </div>
          
          <div className={`grid ${gridCols} gap-6`}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <FundingCardSkeleton key={i} />
              ))
            ) : (
              enhancedFundingPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                      selectedProgram === program.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-blue-300'
                    } bg-white`}
                    onClick={() => setSelectedProgram(program.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                            <program.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-gray-900 mb-1">
                              {program.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{program.type}</span>
                              {program.real_time_status === 'available' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  Verfügbar
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600 block">{program.amount}</span>
                          {program.approval_rate && (
                            <span className="text-xs text-gray-500">
                              {Math.round(program.approval_rate * 100)}% Erfolgsquote
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-600 mb-4">{program.description}</p>
                      
                      {/* Real-time Data */}
                      {program.available_funding && (
                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Verfügbar</div>
                            <div className="font-semibold text-blue-600">
                              {(program.available_funding / 1000000).toFixed(1)}M€
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Anträge/Monat</div>
                            <div className="font-semibold text-blue-600">
                              {program.applications_this_month}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Requirements */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Voraussetzungen:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {program.requirements.slice(0, 2).map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              {req}
                            </li>
                          ))}
                          {program.requirements.length > 2 && (
                            <li className="text-blue-600 cursor-pointer hover:underline">
                              +{program.requirements.length - 2} weitere anzeigen
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Premium Features */}
                      {program.premium_benefits && (
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg mb-4">
                          <div className="flex items-center mb-2">
                            <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="font-medium text-yellow-800">Premium Features</span>
                          </div>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {program.premium_benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx} className="flex items-start">
                                <Zap className="w-3 h-3 mr-1 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <a href={`tel:${program.phone}`} className="hover:text-blue-600 transition-colors">
                            {program.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <a href={`mailto:${program.contact}`} className="hover:text-blue-600 transition-colors">
                            {program.contact}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Deadline: {program.deadline}</span>
                        </div>
                        {program.processing_time && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Bearbeitungszeit: {program.processing_time}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <div className="flex gap-2 w-full">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(program.website, '_blank')
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Beantragen
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/chat?mode=business&program=${program.id}`)
                          }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          KI-Beratung
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Business Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Premium Business Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              KI-gestützte Unternehmensberatung mit Real-time Data Integration 
              und Cross-Border Intelligence
            </p>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            {businessServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 hover:border-blue-300">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {service.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {service.ai_enhanced && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              KI-Enhanced
                            </span>
                          )}
                          {service.real_time_data && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Real-time
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    {/* Standard Features */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Standard Features:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Premium Features */}
                    {service.premium_features && (
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-800">Premium Features</span>
                        </div>
                        <ul className="space-y-1">
                          {service.premium_features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-yellow-700 flex items-start">
                              <Star className="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`/chat?mode=business&service=${service.id}`)}
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Mehr erfahren
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                        onClick={() => setShowPremiumModal(true)}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Premium
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process Wizard */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ihr KI-optimierter Weg zur Förderung
            </h2>
            <p className="text-gray-600">
              Innovativer 5-Schritte-Prozess mit künstlicher Intelligenz 
              und Premium-Beratung für maximale Erfolgschancen
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-between">
              {applicationSteps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => setApplicationStep(index)}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    index <= applicationStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    index <= applicationStep 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                      : 'bg-gray-200'
                  }`}>
                    {index <= applicationStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium text-center max-w-24 leading-tight ${
                    isMobile ? 'hidden' : 'block'
                  }`}>
                    {step}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Step Content */}
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-100">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">{applicationStep + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {applicationSteps[applicationStep]}
                </h3>
              </div>
              
              {/* Dynamic content based on step */}
              {applicationStep === 0 && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Wählen Sie aus unseren KI-optimierten Förderprogrammen das passende für Ihr Unternehmen aus. 
                    Unsere intelligente Matching-Engine berücksichtigt dabei Ihre Branche, Unternehmensgröße und Ziele.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {enhancedFundingPrograms.map(program => (
                      <Button
                        key={program.id}
                        variant={selectedProgram === program.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProgram(program.id)}
                      >
                        {program.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {applicationStep === 1 && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Unsere KI analysiert Ihr Unternehmensprofil, Ihre Geschäftsidee und ermittelt automatisch 
                    die optimale Förderstrategie mit höchster Erfolgswahrscheinlichkeit.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">KI-Analyse Features:</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Automatische Dokument-Validierung</li>
                      <li>• Erfolgswahrscheinlichkeits-Berechnung</li>
                      <li>• Optimierungsempfehlungen</li>
                      <li>• Cross-Border Opportunities</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {applicationStep === 2 && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Laden Sie Ihre Dokumente hoch. Unsere KI prüft automatisch Vollständigkeit, 
                    Korrektheit und optimiert Ihre Unterlagen für maximale Bewilligungschancen.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium">Standard Upload</span>
                      <p className="text-xs text-gray-600">Manuelle Dokumentenprüfung</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Crown className="w-5 h-5 text-yellow-600 mr-1" />
                        <span className="text-sm font-medium text-yellow-800">KI-Upload</span>
                      </div>
                      <p className="text-xs text-yellow-700">Automatische Optimierung</p>
                    </div>
                  </div>
                </div>
              )}
              
              {applicationStep === 3 && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Erhalten Sie persönliche Beratung von unseren zertifizierten Business-Advisors 
                    mit Spezialisierung auf Ihre Branche und Cross-Border Expertise.
                  </p>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Premium Business-ID Benefits</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-yellow-700">
                      <div className="flex items-center">
                        <HeartHandshake className="w-4 h-4 mr-2" />
                        Persönlicher Advisor
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        24h Express-Processing
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Cross-Border Support
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Erfolgsgarantie
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {applicationStep === 4 && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Ihr optimierter Antrag wird automatisch eingereicht. Sie erhalten Real-time Updates 
                    über den Bearbeitungsstand und können jederzeit den Status verfolgen.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Trophy className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Erfolgsgarantie</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Mit unserer KI-Optimierung erreichen wir eine Bewilligungsquote von 94% 
                      - 15% höher als der Branchendurchschnitt.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setApplicationStep(Math.max(0, applicationStep - 1))}
                  disabled={applicationStep === 0}
                >
                  Zurück
                </Button>
                <Button 
                  onClick={() => {
                    if (applicationStep < applicationSteps.length - 1) {
                      setApplicationStep(applicationStep + 1)
                    } else {
                      handleStartAnalysis()
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  {applicationStep === applicationSteps.length - 1 ? (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Antrag starten
                    </>
                  ) : (
                    <>
                      Weiter
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Stories */}
      {realTimeData?.recent_success_stories && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Aktuelle Erfolgsgeschichten
              </h2>
              <p className="text-gray-600">
                Sehen Sie, wie andere Unternehmen mit unserer KI-Unterstützung erfolgreich gefördert wurden
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {realTimeData.recent_success_stories.map((story: SuccessStory, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{story.company}</h3>
                          <p className="text-sm text-gray-600">{story.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{story.funding}</div>
                          <div className="text-xs text-gray-500">{story.month}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-600">
                            {story.employees_created} neue Arbeitsplätze
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 text-yellow-600 mr-1" />
                          <span className="text-xs text-yellow-600">KI-optimiert</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Modernisieren Sie Ihr Business im Saarland
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Starten Sie jetzt mit unserer KI-gestützten Unternehmensberatung, 
              Premium Business-ID und Cross-Border Intelligence für maximalen Erfolg
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-white text-blue-900 hover:bg-gray-100 shadow-lg transition-all duration-300 transform hover:scale-105"
                onClick={handleStartAnalysis}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                KI-Förderanalyse starten
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-all duration-300"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="w-5 h-5 mr-2" />
                Premium Business-ID
              </Button>
              <Button 
                size="lg" 
                variant="ghost"
                className="text-white hover:bg-white/10 transition-all duration-300"
                onClick={() => router.push('/register')}
              >
                <FileText className="w-5 h-5 mr-2" />
                SAAR-ID beantragen
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">94%</div>
                <div className="text-xs text-blue-200">Erfolgsquote</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">€25M+</div>
                <div className="text-xs text-blue-200">Vermittelt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24h</div>
                <div className="text-xs text-blue-200">Express-Service</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPremiumModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Premium Business-ID
                </h3>
                <p className="text-gray-600">
                  Schalten Sie alle Premium-Features frei und maximieren Sie Ihren Unternehmenserfolg
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">KI-optimierte Antragstellung</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">24h Express-Processing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Persönlicher Business-Advisor</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Cross-Border Intelligence</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Erfolgsgarantie & Priority Support</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">€10</div>
                <div className="text-gray-600 mb-6">pro Monat</div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPremiumModal(false)}
                  >
                    Später
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                    onClick={handlePremiumUpgrade}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Jetzt upgraden
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">Fehler beim Laden der Real-time Daten</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}