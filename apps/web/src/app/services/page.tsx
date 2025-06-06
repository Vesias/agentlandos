'use client'

import React, { useState } from 'react';
import { MapPin, Building2, Calendar, Navigation, Crown, Star, Zap, Users, GraduationCap, Palette } from 'lucide-react';
import PLZServiceFinder from '@/components/PLZServiceFinder';
import InteractiveSaarlandMap from '@/components/InteractiveSaarlandMapWrapper';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'behoerden' | 'map'>('overview');
  const { data: eventsData, isLoading: eventsLoading } = useRealTimeData('events', 300000);

  const services = [
    {
      title: "Wirtschaft & Business",
      description: "IHK Services, Handwerkskammer, Gründungsberatung, Fördermittel-Matching",
      icon: Building2,
      color: "from-[#003399] to-[#0052CC]",
      href: "/services/business",
      features: ["Unternehmensregistrierung", "Fördermittel-Finder", "IHK-Services", "Gründungsberatung"]
    },
    {
      title: "Tourismus & Kultur",
      description: "Sehenswürdigkeiten, Events, Hotels, Restaurants, kulturelle Highlights",
      icon: MapPin,
      color: "from-[#009FE3] to-[#007BB8]",
      href: "/services/tourism",
      features: ["Event-Kalender", "Hotel-Buchungen", "Attraktionen", "Restaurant-Guide"]
    },
    {
      title: "Bildung & Forschung",
      description: "Universitäten, Weiterbildung, DFKI-Kooperationen, Stipendien",
      icon: GraduationCap,
      color: "from-[#FDB913] to-[#E5A50A]",
      href: "/services/education",
      features: ["Studienberatung", "Weiterbildung", "Stipendien", "DFKI-Programme"]
    },
    {
      title: "Nachhilfe & Lernhilfe",
      description: "Qualifizierte Nachhilfe für alle Fächer und Klassenstufen im Saarland",
      icon: Crown,
      color: "from-purple-600 to-purple-400",
      href: "/services/tutoring",
      features: ["Mathematik & Physik", "Sprachen", "Online & Vor Ort", "Alle Klassenstufen"],
      isNew: true
    },
    {
      title: "Vereine & Gemeinschaft",
      description: "Entdecken Sie die vielfältige Vereinslandschaft des Saarlandes",
      icon: Users,
      color: "from-teal-600 to-teal-400",
      href: "/services/clubs",
      features: ["Sportvereine", "Kulturvereine", "Freizeitgruppen", "Community-Events"],
      isNew: true
    },
    {
      title: "SAARFUSSBALL",
      description: "Alles über Fußball im Saarland - von Profi bis Amateur",
      icon: Zap,
      color: "from-green-600 to-green-400",
      href: "/services/football",
      features: ["Live-Ergebnisse", "1. FC Saarbrücken", "SV Elversberg", "Verbandsliga"],
      isNew: true,
      isHighlight: true
    },
    {
      title: "Behörden & Verwaltung",
      description: "Alle Ämter von A-Z, Express-Termine, Online-Services, Behördenfinder",
      icon: Building2,
      color: "from-[#003399] to-[#0052CC]",
      href: "/behoerden",
      features: ["Behördenfinder A-Z", "Express-Termine", "Online-Anträge", "Alle Kontaktdaten"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#003399] via-[#0052CC] to-[#009FE3] overflow-hidden">
        <div className="absolute inset-0 network-pattern opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-quantum">
              Saarland Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 font-nova">
              Umfassende KI-gestützte Dienstleistungen für alle Bereiche des Saarlands
            </p>
            
            {/* Premium Banner */}
            <div className="inline-flex items-center gap-3 bg-[#FDB913] text-[#003399] px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl">
              <Star className="w-6 h-6" />
              <span>Premium Services für nur €9,99/Monat</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex border border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-[#003399] text-white shadow-lg'
                    : 'text-gray-600 hover:text-[#003399] hover:bg-gray-50'
                }`}
              >
                <Palette className="w-5 h-5 inline mr-2" />
                Übersicht
              </button>
              <button
                onClick={() => setActiveTab('behoerden')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'behoerden'
                    ? 'bg-[#003399] text-white shadow-lg'
                    : 'text-gray-600 hover:text-[#003399] hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-5 h-5 inline mr-2" />
                Behördenfinder
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'map'
                    ? 'bg-[#003399] text-white shadow-lg'
                    : 'text-gray-600 hover:text-[#003399] hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-5 h-5 inline mr-2" />
                Karte
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-16"
            >
              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={service.href} className="group block">
                      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100 overflow-hidden">
                        <div className="p-8">
                          <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <service.icon className="w-8 h-8 text-white" />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-[#003399] mb-4 group-hover:text-[#002266]">
                            {service.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {service.description}
                          </p>
                          
                          <div className="space-y-2 mb-6">
                            {service.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-500">
                                <div className="w-2 h-2 bg-[#009FE3] rounded-full mr-3"></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center text-[#009FE3] font-semibold group-hover:translate-x-2 transition-transform">
                            <span>Service erkunden</span>
                            <Zap className="w-4 h-4 ml-2" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Premium CTA */}
              <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-3xl p-12 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 network-pattern opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-10 h-10 text-[#003399]" />
                  </div>
                  <h3 className="text-4xl font-bold mb-4 font-quantum">
                    Premium Saarland Services
                  </h3>
                  <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                    Alle Services mit Premium-Features für nur €9,99/Monat
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                      <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
                        Premium aktivieren
                      </button>
                    </Link>
                    <button className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
                      Mehr erfahren
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'behoerden' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#003399] mb-4 font-quantum">
                  Behördenfinder A-Z
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto font-nova">
                  Alle Behörden im Saarland mit vollständigen Kontaktdaten und Services
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#003399] to-[#009FE3] rounded-3xl p-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 network-pattern opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-[#FDB913] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-12 h-12 text-[#003399]" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 font-quantum">
                    Vollständiger Behördenfinder
                  </h3>
                  <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                    156 Behörden von A-Z • Kontaktdaten • Öffnungszeiten • Online-Services
                  </p>
                  <Link href="/behoerden">
                    <button className="bg-[#FDB913] hover:bg-[#E5A50A] text-[#003399] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
                      Zum Behördenfinder
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-[#003399]" />
                  </div>
                  <h4 className="text-lg font-bold text-[#003399] mb-3">Alle Ämter</h4>
                  <p className="text-gray-600 mb-4">Bürgeramt, Standesamt, Finanzamt, KFZ-Zulassung und alle weiteren Behörden</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• 156 Behörden erfasst</li>
                    <li>• Vollständige Kontaktdaten</li>
                    <li>• Aktuelle Öffnungszeiten</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-[#003399] mb-3">Smart Search</h4>
                  <p className="text-gray-600 mb-4">Intelligente Suche nach Service, PLZ, Kategorie oder Stichwort</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Service-basierte Suche</li>
                    <li>• PLZ-Zuordnung</li>
                    <li>• Kategorien & Filter</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-bold text-[#003399] mb-3">Express Services</h4>
                  <p className="text-gray-600 mb-4">Direkte Links zu Online-Services und Terminbuchung</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Online-Terminbuchung</li>
                    <li>• Direkte Service-Links</li>
                    <li>• Mobile Optimierung</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#003399] mb-4 font-quantum">
                  Interaktive Saarland-Karte
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto font-nova">
                  Erkunden Sie alle wichtigen Standorte im Saarland
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <InteractiveSaarlandMap height="600px" />
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}