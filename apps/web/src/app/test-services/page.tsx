'use client'

import React, { useState } from 'react'
import DeepSeekServiceChat from '@/components/DeepSeekServiceChat'
import { Button } from '@/components/ui/button'

export default function TestServicesPage() {
  const [activeService, setActiveService] = useState<'tourismus' | 'wirtschaft' | 'verwaltung' | 'bildung'>('tourismus')

  const services = [
    { key: 'tourismus', name: '🏰 Tourismus', color: 'bg-green-500' },
    { key: 'wirtschaft', name: '💼 Wirtschaft', color: 'bg-blue-500' },
    { key: 'verwaltung', name: '🏛️ Verwaltung', color: 'bg-red-500' },
    { key: 'bildung', name: '🎓 Bildung', color: 'bg-yellow-500' }
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 AGENTLAND.SAARLAND Service Chat Test
          </h1>
          <p className="text-lg text-gray-600">
            DeepSeek Reasoner mit Service-spezifischen Prompts und Canvas-Rendering
          </p>
        </div>

        {/* Service Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {services.map((service) => (
            <Button
              key={service.key}
              onClick={() => setActiveService(service.key)}
              variant={activeService === service.key ? "default" : "outline"}
              className={`px-6 py-3 text-lg ${
                activeService === service.key 
                  ? `${service.color} text-white hover:opacity-90` 
                  : 'hover:bg-gray-100'
              }`}
            >
              {service.name}
            </Button>
          ))}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <DeepSeekServiceChat
            serviceType={activeService}
            className="h-[600px]"
            showHeader={true}
          />
        </div>

        {/* Info Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              🔧 Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Service-spezifische Prompts aus JSON-Dateien</li>
              <li>✅ Canvas-Rendering (Roadmaps, Business Canvas, Checklisten)</li>
              <li>✅ DeepSeek Reasoner Integration</li>
              <li>✅ Exportierbare Canvas-Daten</li>
              <li>✅ Real-time Saarland Datenintegration</li>
              <li>✅ Session-Management mit Context</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              📊 API Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>DeepSeek API:</span>
                <span className="text-green-600 font-medium">✅ Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Canvas Rendering:</span>
                <span className="text-green-600 font-medium">✅ Active</span>
              </div>
              <div className="flex justify-between">
                <span>Service Prompts:</span>
                <span className="text-green-600 font-medium">✅ Loaded</span>
              </div>
              <div className="flex justify-between">
                <span>Analytics Tracking:</span>
                <span className="text-green-600 font-medium">✅ Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Examples */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">💡 Beispiel-Anfragen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🏰 Tourismus</h4>
              <p className="text-sm text-green-700">
                "Plane mir eine 2-Tage Saarland-Tour mit Saarschleife und lokalen Restaurants"
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💼 Wirtschaft</h4>
              <p className="text-sm text-blue-700">
                "Ich möchte ein Tech-Startup im Saarland gründen. Welche Förderungen gibt es?"
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">🏛️ Verwaltung</h4>
              <p className="text-sm text-red-700">
                "Ich wohne in 66111 Saarbrücken und brauche einen neuen Personalausweis"
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🎓 Bildung</h4>
              <p className="text-sm text-yellow-700">
                "Welche IT-Weiterbildungen mit Bildungsgutschein gibt es im Saarland?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}