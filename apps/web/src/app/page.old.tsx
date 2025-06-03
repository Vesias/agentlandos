'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Bot, Shield, Users, Sparkles, Globe, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 network-pattern" />
        
        {/* Animated Gradient */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 saarland-gradient animate-pulse-soft" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo/Brand */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-saarland-blue text-white mb-4">
                <Bot className="w-12 h-12" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-quantum text-saarland-blue">
                AGENTLAND<span className="text-innovation-cyan">.SAARLAND</span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-neutral-gray mb-8 font-nova"
            >
              Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-saarland-blue hover:bg-saarland-blue/90">
                KI-Agenten erkunden
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-saarland-blue text-saarland-blue hover:bg-saarland-blue/10">
                Über das Projekt
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-saarland-blue rounded-full flex justify-center">
            <div className="w-1 h-3 bg-saarland-blue rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-technical-silver/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-quantum text-saarland-blue mb-4">
              KI mit saarländischem Herz und globalem Verstand
            </h2>
            <p className="text-lg text-neutral-gray max-w-2xl mx-auto font-nova">
              Unsere Plattform verbindet modernste KI-Technologie mit regionaler Expertise 
              und demokratischen Werten.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-saarland-blue/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-saarland-blue" />
                  </div>
                  <h3 className="text-xl font-semibold font-quantum mb-2">{feature.title}</h3>
                  <p className="text-neutral-gray font-nova">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-quantum text-saarland-blue mb-6">
                Intelligente Agenten für jeden Bedarf
              </h2>
              <p className="text-lg text-neutral-gray mb-6 font-nova">
                Unsere spezialisierten KI-Agenten unterstützen Sie in verschiedenen Bereichen – 
                von Tourismus über Verwaltung bis hin zu Bildung und Wirtschaft.
              </p>
              <ul className="space-y-3 mb-8">
                {agentTypes.map((agent) => (
                  <li key={agent} className="flex items-center">
                    <Sparkles className="w-5 h-5 text-warm-gold mr-3" />
                    <span className="font-nova">{agent}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-innovation-cyan hover:bg-innovation-cyan/90">
                Agenten-Demo starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Agent Interface Preview */}
              <div className="bg-white rounded-lg shadow-xl p-6 border border-border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-saarland-blue flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="ml-3 font-semibold">NavigatorAgent</span>
                  <span className="ml-auto text-sm text-success-green">Aktiv</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-technical-silver/50 rounded-lg p-3">
                    <p className="text-sm font-nova">
                      Guten Tag! Ich bin Ihr persönlicher KI-Assistent für das Saarland. 
                      Wie kann ich Ihnen heute helfen?
                    </p>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-saarland-blue rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-saarland-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-saarland-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-saarland-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-quantum mb-4">
              Bereit für die KI-Zukunft des Saarlandes?
            </h2>
            <p className="text-xl mb-8 font-nova opacity-90 max-w-2xl mx-auto">
              Werden Sie Teil der regionalen KI-Revolution und gestalten Sie mit uns 
              die digitale Zukunft des Saarlandes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-saarland-blue hover:bg-white/90">
                Jetzt loslegen
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Kontakt aufnehmen
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Technische Souveränität',
    description: 'Ihre Daten bleiben in der Region. Volle Kontrolle über KI-Prozesse und Datenhaltung.',
    icon: Shield,
  },
  {
    title: 'Regionale Intelligenz',
    description: 'KI-Agenten mit tiefem Verständnis für saarländische Besonderheiten und Bedürfnisse.',
    icon: Globe,
  },
  {
    title: 'Demokratische Governance',
    description: 'Transparente Entscheidungsprozesse und Community-getriebene Entwicklung.',
    icon: Users,
  },
  {
    title: 'Multi-Agenten-System',
    description: 'Spezialisierte Agenten arbeiten nahtlos zusammen für optimale Ergebnisse.',
    icon: Bot,
  },
  {
    title: 'Datenschutz First',
    description: 'DSGVO-konforme Verarbeitung mit Privacy-by-Design Prinzipien.',
    icon: Database,
  },
  {
    title: 'Innovation Hub',
    description: 'Verbindung zu DFKI und regionalen Forschungseinrichtungen.',
    icon: Sparkles,
  },
]

const agentTypes = [
  'TourismusAgent - Entdecken Sie das Saarland',
  'VerwaltungsAgent - Effiziente Behördengänge',
  'BildungsAgent - Personalisiertes Lernen',
  'WirtschaftsAgent - Business Intelligence',
  'KulturAgent - Regionale Veranstaltungen',
]