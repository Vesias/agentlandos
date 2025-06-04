'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Bot, Shield, Users, Sparkles, Globe, Database, MessageSquare, MapPin, Building2, GraduationCap } from 'lucide-react'
import RealTimeUserCounter from '@/components/RealTimeUserCounter'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section - Mobile First */}
      <section className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-cyan-200/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mb-6"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-0.5 shadow-xl">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AGENTLAND
              </span>
              <br />
              <span className="text-gray-900 text-2xl sm:text-3xl lg:text-5xl">.SAARLAND</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Deine intelligente KI-Plattform für das Saarland. 
              <br className="hidden sm:block" />
              Behörden, Tourismus, Wirtschaft und mehr – alles an einem Ort.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center mb-8">
              <RealTimeUserCounter />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  KI Chat starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              
              <Link href="/services">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Services entdecken
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Services - Mobile Optimized */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Schnellzugriff
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Die wichtigsten Saarland-Services für dich optimiert
            </p>
          </motion.div>

          {/* Service Cards - Mobile Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                name: 'Tourismus',
                icon: Sparkles,
                color: 'from-green-500 to-emerald-600',
                href: '/services/tourism',
                emoji: '🏰'
              },
              {
                name: 'Wirtschaft',
                icon: Building2,
                color: 'from-blue-500 to-blue-600',
                href: '/services/business',
                emoji: '💼'
              },
              {
                name: 'Verwaltung',
                icon: Shield,
                color: 'from-red-500 to-red-600',
                href: '/services/admin',
                emoji: '🏛️'
              },
              {
                name: 'Bildung',
                icon: GraduationCap,
                color: 'from-yellow-500 to-orange-600',
                href: '/services/education',
                emoji: '🎓'
              }
            ].map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <Link href={service.href}>
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto text-2xl sm:text-3xl`}>
                      {service.emoji}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base text-center group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Mobile Optimized */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Warum Agentland.Saarland?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Echte KI für echte Saarländer – regional, präzise, vertrauenswürdig
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Database,
                title: 'Echte Saarland-Daten',
                description: 'Alle Behörden, Services und Informationen aus erster Hand'
              },
              {
                icon: Shield,
                title: 'DSGVO-konform',
                description: 'Deine Daten bleiben sicher und werden nicht an Dritte weitergegeben'
              },
              {
                icon: Users,
                title: 'Für Saarländer gemacht',
                description: 'Von lokalen Experten entwickelt, für lokale Bedürfnisse optimiert'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
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
      <section className="px-4 py-12 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Bereit für die Zukunft?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Starte jetzt mit deiner persönlichen Saarland-KI
            </p>
            
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Jetzt starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}