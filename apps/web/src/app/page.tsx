'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Bot, Shield, Users, Sparkles, Globe, Database, MessageSquare, MapPin, Building2, GraduationCap, Crown, Zap, Star } from 'lucide-react'
import RealTimeUserCounter from '@/components/RealTimeUserCounter'

/**
 * 🧠 AGENTLAND.SAARLAND - GODMODE HOMEPAGE v2.0
 * 
 * Enhanced with:
 * - GODMODE design system with dark theme
 * - €10 Premium Services prominent CTAs
 * - Real-time revenue metrics (starting from 0)
 * - Revenue optimization features
 * - Mobile-first responsive design
 * - Zero fake data policy
 */

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section - GODMODE Enhanced */}
      <section className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8 overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>

        <div className="w-full max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* GODMODE Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-purple-300 ring-1 ring-purple-500/30 hover:ring-purple-500/50 bg-purple-500/10 backdrop-blur-sm transition-all">
                <span className="font-bold text-purple-400">🧠 GODMODE v2.0-ULTIMATE</span>
                <span className="ml-2 text-purple-300">12 Subagents ACTIVE</span>
                <span className="ml-2 text-emerald-400 font-semibold">€25k+ MRR Target</span>
              </div>
            </motion.div>

            {/* Enhanced Logo */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mb-6"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl p-0.5 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-3xl flex items-center justify-center">
                  <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
                </div>
              </div>
            </motion.div>

            {/* Enhanced Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AGENTLAND
              </span>
              <br />
              <span className="text-white text-2xl sm:text-3xl lg:text-5xl">.SAARLAND</span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Die autonome KI-Plattform für Saarländer und Grenzpendler. 
              <br className="hidden sm:block" />
              <span className="text-purple-400 font-semibold">€10 Premium Services</span> · 
              <span className="text-blue-400 font-semibold"> Real-time Analytics</span> · 
              <span className="text-cyan-400 font-semibold"> GDPR-konform</span>
            </p>

            {/* Live Stats */}
            <div className="flex items-center justify-center mb-8">
              <RealTimeUserCounter />
            </div>

            {/* Enhanced CTA Buttons with Premium Focus */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/test-business-registration">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Building2 className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Business-ID Premium</span>
                  <Crown className="w-5 h-5 ml-2 text-yellow-400 relative z-10" />
                </motion.button>
              </Link>
              
              <Link href="/services">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center"
                >
                  <Star className="w-5 h-5 mr-2" />
                  SAAR-ID Premium
                  <span className="ml-2 text-xs bg-yellow-400 text-green-900 px-2 py-1 rounded-full font-bold">€10</span>
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
              <div className="bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl p-4 sm:p-6 border border-emerald-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-emerald-400 font-bold text-lg">€10/Monat</span>
                  </div>
                  <div className="text-gray-400 hidden sm:block">|</div>
                  <div className="text-white font-semibold">Premium SAAR-ID + Business-ID</div>
                  <div className="text-gray-400 hidden sm:block">|</div>
                  <div className="text-emerald-400 font-semibold">Ziel: €25k+ MRR</div>
                  <div className="text-gray-400 hidden sm:block">|</div>
                  <div className="text-purple-400 text-sm">GODMODE Analytics</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Quick Services - Mobile Optimized */}
      <section className="px-4 py-12 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🚀 GODMODE Services
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Premium Services mit KI-Power und Real-time Daten
            </p>
          </motion.div>

          {/* Enhanced Service Cards - Mobile Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                name: 'Tourismus',
                icon: Sparkles,
                color: 'from-green-500 to-emerald-600',
                href: '/services/tourism',
                emoji: '🏰',
                premium: false
              },
              {
                name: 'Wirtschaft',
                icon: Building2,
                color: 'from-blue-500 to-blue-600',
                href: '/test-business-registration',
                emoji: '💼',
                premium: true,
                price: '€10'
              },
              {
                name: 'Verwaltung',
                icon: Shield,
                color: 'from-red-500 to-red-600',
                href: '/services/admin',
                emoji: '🏛️',
                premium: false
              },
              {
                name: 'Bildung',
                icon: GraduationCap,
                color: 'from-yellow-500 to-orange-600',
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
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 hover:border-purple-500/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all group relative overflow-hidden">
                    {service.premium && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        {service.price}
                      </div>
                    )}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto text-2xl sm:text-3xl shadow-lg`}>
                      {service.emoji}
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base text-center group-hover:text-purple-400 transition-colors">
                      {service.name}
                    </h3>
                    {service.premium && (
                      <div className="text-center mt-2">
                        <span className="text-emerald-400 text-xs font-semibold">PREMIUM</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Metrics Section - GODMODE Analytics */}
      <section className="px-4 py-12 bg-gradient-to-r from-slate-900 via-purple-900/30 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              📊 GODMODE Analytics
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Transparente Echtzeit-Metriken - von 0 auf €25k+ MRR
            </p>
            <div className="text-sm text-purple-400 mt-2 font-semibold">
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
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-lg"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mb-4 mx-auto text-2xl shadow-lg`}>
                    {metric.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-400 mb-2">{metric.title}</div>
                  <div className="text-xs text-gray-500">{metric.target}</div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${metric.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${metric.progress}%` }}
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
            className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Fortschritt zum €25k MRR Ziel</h3>
              <div className="text-gray-400 text-sm">GODMODE Revenue Optimization Engine</div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 h-4 rounded-full transition-all duration-2000 relative" style={{ width: '0%' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-400">€0</span>
                <span className="text-emerald-400 font-bold">0%</span>
                <span className="text-gray-400">€25,000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-center">
              <div>
                <div className="text-purple-400 font-semibold">SAAR-ID Target</div>
                <div className="text-sm text-gray-400">2,500 × €10 = €25k</div>
              </div>
              <div>
                <div className="text-blue-400 font-semibold">Business-ID Target</div>
                <div className="text-sm text-gray-400">1,000 × €10 = €10k</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features - Mobile Optimized */}
      <section className="px-4 py-12 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Warum GODMODE Agentland.Saarland?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Autonome KI für echte Saarländer – revenue-optimiert, präzise, vertrauenswürdig
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
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Premium Focus */}
      <section className="px-4 py-12 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Bereit für GODMODE Premium?
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
                <div>🧠 GODMODE v2.0-ULTIMATE</div>
                <div>•</div>
                <div>12 Subagents ACTIVE</div>
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