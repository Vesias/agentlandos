'use client'

import React, { useState } from 'react';
import { MapPin, Building2, Calendar, Navigation, Crown, Star, Zap } from 'lucide-react';
import PLZServiceFinder from '@/components/PLZServiceFinder';
import InteractiveSaarlandMap from '@/components/InteractiveSaarlandMapWrapper';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'plz' | 'map' | 'events'>('plz');
  const { data: eventsData, loading: eventsLoading } = useRealTimeData('events', 300000);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#003399' }}>
            SAAR-ID Premium Services
          </h1>
          <p className="text-xl text-gray-600">
            Professionelle Saarland-Services mit KI-Power • €10/Monat für alle Premium-Features
          </p>
          
          {/* Premium Service Banner */}
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-center gap-4 flex-wrap text-lg">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6" style={{ color: '#FDB913' }} />
                <span className="font-bold" style={{ color: '#009FE3' }}>SAAR-ID Premium</span>
              </div>
              <div className="text-gray-400 hidden sm:block">|</div>
              <div className="font-semibold" style={{ color: '#003399' }}>€10/Monat</div>
              <div className="text-gray-400 hidden sm:block">|</div>
              <div className="text-gray-600 font-semibold">KI-optimiert</div>
              <div className="text-gray-400 hidden sm:block">|</div>
              <Link href="/test-business-registration">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg font-bold text-sm text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#FDB913' }}
                >
                  Jetzt aktivieren
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-1 inline-flex border border-gray-200">
            <button
              onClick={() => setActiveTab('plz')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'plz'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: activeTab === 'plz' ? '#003399' : 'transparent' }}
            >
              <Building2 className="w-5 h-5 inline mr-2" />
              Behördenfinder
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'map'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: activeTab === 'map' ? '#003399' : 'transparent' }}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Interaktive Karte
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'events'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: activeTab === 'events' ? '#003399' : 'transparent' }}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Events & Tickets
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'plz' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <PLZServiceFinder />
              
              {/* Info Box */}
              <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 So funktioniert's
                </h3>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex">
                    <span className="font-bold mr-2">1.</span>
                    Geben Sie Ihre Postleitzahl ein (z.B. 66111 für Saarbrücken)
                  </li>
                  <li className="flex">
                    <span className="font-bold mr-2">2.</span>
                    Wählen Sie den gewünschten Service (Bürgeramt, KFZ-Zulassung, etc.)
                  </li>
                  <li className="flex">
                    <span className="font-bold mr-2">3.</span>
                    Erhalten Sie alle Kontaktdaten, Öffnungszeiten und Online-Services
                  </li>
                  <li className="flex">
                    <span className="font-bold mr-2">4.</span>
                    Nutzen Sie die direkten Links zu Online-Services oder planen Sie Ihre Route
                  </li>
                </ol>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    🚀 Neu: Alle Daten sind live und aktuell!
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Wartezeiten und Öffnungszeiten werden in Echtzeit aktualisiert.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🗺️ Interaktive Saarland-Karte
                </h2>
                <p className="text-gray-600 mb-6">
                  Erkunden Sie Sehenswürdigkeiten, Veranstaltungsorte und wichtige Locations im Saarland.
                  Klicken Sie auf die Marker für Details und direkte Links!
                </p>
                
                <InteractiveSaarlandMap height="600px" />
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                🎉 Aktuelle Events im Saarland
              </h2>
              
              {eventsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Lade Events...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsData?.events?.map((event: any) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {event.category}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>📅 {new Date(event.date).toLocaleDateString('de-DE', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p>📍 {event.location}</p>
                        <p>💶 {event.price_range || event.price}</p>
                      </div>
                      
                      <p className="mt-3 text-sm text-gray-700">{event.description}</p>
                      
                      <div className="mt-4 flex gap-2">
                        {event.ticket_url && (
                          <a
                            href={event.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium"
                          >
                            Tickets kaufen
                          </a>
                        )}
                        <button
                          onClick={() => {
                            // Navigate to location on map
                            setActiveTab('map');
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Keine Events gefunden. Überprüfen Sie später noch einmal!
                    </div>
                  )}
                </div>
              )}
              
              {/* Event Sources */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Event-Quellen:</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.ticket-regional.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ticket Regional
                  </a>
                  <a
                    href="https://www.saarbruecken.de/kultur/veranstaltungen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Stadt Saarbrücken
                  </a>
                  <a
                    href="https://www.urlaub.saarland"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tourismus Zentrale
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
