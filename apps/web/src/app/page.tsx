'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Bot, Shield, Users, Sparkles, Globe, Database, MessageSquare, MapPin, Building2, GraduationCap, Crown, Zap, Star, User } from 'lucide-react'
import RealTimeUserCounter from '@/components/RealTimeUserCounter'

/**
 * AGENTLAND.SAARLAND - Homepage
 * 
 * Features:
 * - €10 Premium Services
 * - Real-time analytics
 * - Mobile-first design
 * - Brand-compliant design
 */

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-blue-100 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-cyan-100 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Platform Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 ring-1 bg-white border border-gray-200 shadow-lg transition-all">
                <span className="font-bold" style={{ color: '#003399' }}>🤖 KI-Plattform Saarland</span>
                <span className="ml-2 text-gray-600">Premium Services</span>
                <span className="ml-2 font-semibold" style={{ color: '#009FE3' }}>€10/Monat</span>
              </div>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mb-6"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white rounded-3xl p-1 shadow-lg border border-gray-200">
                <div className="w-full h-full rounded-3xl flex items-center justify-center" style={{ backgroundColor: '#003399' }}>
                  <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span style={{ color: '#003399' }}>
                AGENTLAND
              </span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-5xl" style={{ color: '#009FE3' }}>.SAARLAND</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Die KI-Plattform für Saarländer und Grenzpendler. 
              <br className="hidden sm:block" />
              <span style={{ color: '#003399' }} className="font-semibold">€10 Premium Services</span> · 
              <span style={{ color: '#009FE3' }} className="font-semibold"> Real-time Analytics</span> · 
              <span className="text-gray-700 font-semibold"> GDPR-konform</span>
            </p>

            {/* Live Stats */}
            <div className="flex items-center justify-center mb-8">
              <RealTimeUserCounter />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  style={{ backgroundColor: '#009FE3' }}
                >
                  <User className="w-5 h-5 mr-2" />
                  <span>Jetzt registrieren</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              
              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  style={{ backgroundColor: '#003399' }}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  KI-Chat starten
                </motion.button>
              </Link>
            </div>

            {/* Premium Services Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 mx-auto max-w-4xl"
            >
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="font-bold text-lg" style={{ color: '#009FE3' }}>€10/Monat</span>
                  </div>
                  <div className="text-gray-400 hidden sm:block">|</div>
                  <div className="font-semibold" style={{ color: '#003399' }}>Premium SAAR-ID + Business-ID</div>
                  <div className="text-gray-400 hidden sm:block">|</div>
                  <div className="font-semibold" style={{ color: '#009FE3' }}>Ziel: €25k+ MRR</div>
                  <div className="text-gray-400 hidden sm:block">|</div>
                  <div className="text-gray-600 text-sm">Real-time Analytics</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#003399' }}>
              🚀 Premium Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              KI-optimierte Services für das Saarland
            </p>
          </motion.div>

          {/* Service Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                name: 'Community',
                icon: Shield,
                href: '/saar-community',
                emoji: '🏠',
                premium: false,
                featured: true,
                description: 'News & Fußball'
              },
              {
                name: 'Tourismus',
                icon: Sparkles,
                href: '/services/tourism',
                emoji: '🏰',
                premium: false
              },
              {
                name: 'Wirtschaft',
                icon: Building2,
                href: '/test-business-registration',
                emoji: '💼',
                premium: true,
                price: '€10'
              },
              {
                name: 'Verwaltung',
                icon: Shield,
                href: '/services/admin',
                emoji: '🏛️',
                premium: false
              },
              {
                name: 'Bildung',
                icon: GraduationCap,
                href: '/services/education',
                emoji: '🎓',
                premium: false
              }
            ].map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <Link href={service.href}>
                  <div className={`rounded-xl p-4 sm:p-6 border shadow-lg hover:shadow-xl transition-all group relative overflow-hidden ${
                    service.featured 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300 text-white' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}>
                    {service.premium && (
                      <div className="absolute top-2 right-2 text-black text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FDB913' }}>
                        {service.price}
                      </div>
                    )}
                    {service.featured && (
                      <div className="absolute top-2 right-2 text-blue-800 text-xs font-bold px-2 py-1 rounded-full bg-white">
                        NEU!
                      </div>
                    )}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto text-2xl sm:text-3xl shadow-lg ${
                      service.featured ? 'bg-white/20' : ''
                    }`} style={service.featured ? {} : { backgroundColor: '#003399' }}>
                      {service.emoji}
                    </div>
                    <h3 className={`font-semibold text-sm sm:text-base text-center transition-colors ${
                      service.featured ? 'text-white' : ''
                    }`} style={service.featured ? {} : { color: '#003399' }}>
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className={`text-xs text-center mt-1 ${
                        service.featured ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {service.description}
                      </p>
                    )}
                    {service.premium && (
                      <div className="text-center mt-2">
                        <span className="text-xs font-semibold" style={{ color: '#009FE3' }}>PREMIUM</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Metrics Section */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#003399' }}>
              📊 Real-time Analytics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Transparente Echtzeit-Metriken - von 0 auf €25k+ MRR
            </p>
            <div className="text-sm text-gray-600 mt-2 font-semibold">
              NO FAKE DATA • REAL ANALYTICS • GDPR COMPLIANT
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'Monthly Revenue',
                value: '€0',
                target: '€25,000+ MRR',
                icon: '💰',
                color: 'from-emerald-500 to-green-600',
                progress: 0
              },
              {
                title: 'Active Users',
                value: '0',
                target: '50,000+ Users',
                icon: '👥',
                color: 'from-blue-500 to-purple-600',
                progress: 0
              },
              {
                title: 'Premium Subscriptions',
                value: '0',
                target: '3,500 Subs',
                icon: '⭐',
                color: 'from-purple-500 to-pink-600',
                progress: 0
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto text-2xl shadow-lg" style={{ backgroundColor: '#003399' }}>
                    {metric.icon}
                  </div>
                  <div className="text-3xl font-bold mb-1" style={{ color: '#003399' }}>{metric.value}</div>
                  <div className="text-sm text-gray-600 mb-2">{metric.title}</div>
                  <div className="text-xs text-gray-500">{metric.target}</div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${metric.progress}%`, backgroundColor: '#009FE3' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Overall Progress to €25k MRR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-12 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#003399' }}>Fortschritt zum €25k MRR Ziel</h3>
              <div className="text-gray-600 text-sm">Revenue Optimization Engine</div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div className="h-4 rounded-full transition-all duration-2000 relative" style={{ width: '0%', backgroundColor: '#009FE3' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-600">€0</span>
                <span className="font-bold" style={{ color: '#009FE3' }}>0%</span>
                <span className="text-gray-600">€25,000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-center">
              <div>
                <div className="font-semibold" style={{ color: '#009FE3' }}>SAAR-ID Target</div>
                <div className="text-sm text-gray-600">2,500 × €10 = €25k</div>
              </div>
              <div>
                <div className="font-semibold" style={{ color: '#003399' }}>Business-ID Target</div>
                <div className="text-sm text-gray-600">1,000 × €10 = €10k</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#003399' }}>
              Warum Agentland.Saarland?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              KI für echte Saarländer – revenue-optimiert, präzise, vertrauenswürdig
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Database,
                title: 'Real-time Saarland Data',
                description: 'Alle Behörden, Services und Informationen aus erster Hand - automatisch gecrawlt',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Shield,
                title: 'GDPR + Enterprise Security',
                description: 'Deine Daten bleiben sicher, 44 Vulnerabilities gefixed, Audit-Logging',
                color: 'from-red-500 to-pink-500'
              },
              {
                icon: Zap,
                title: '€10 Premium Services',
                description: 'SAAR-ID und Business-ID Premium für nur €10/Monat - KI-optimiert',
                color: 'from-emerald-500 to-green-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#003399' }}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-lg" style={{ color: '#003399' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 text-white" style={{ backgroundColor: '#003399' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Bereit für Premium Services?
            </h2>
            <p className="text-blue-100 mb-8 text-xl">
              Starte jetzt mit deinen €10 Premium Services und hilf uns €25k+ MRR zu erreichen
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/test-business-registration">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-xl transition-all inline-flex items-center"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Business-ID Premium
                  <Crown className="w-5 h-5 ml-2 text-yellow-500" />
                </motion.button>
              </Link>

              <Link href="/services">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-xl transition-all inline-flex items-center border-2 border-white/20"
                >
                  <Star className="w-5 h-5 mr-2" />
                  SAAR-ID Premium
                  <span className="ml-2 text-xs bg-yellow-400 text-emerald-900 px-2 py-1 rounded-full font-bold">€10</span>
                </motion.button>
              </Link>
            </div>

            <div className="mt-8 text-blue-100 text-sm">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div>🤖 KI-Plattform Saarland</div>
                <div>•</div>
                <div>Premium Services</div>
                <div>•</div>
                <div>€25k+ MRR Target</div>
                <div>•</div>
                <div>Real Analytics Only</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}