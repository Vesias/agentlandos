'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, Clock, Phone, Mail, Globe, CheckCircle, AlertCircle, 
  FileText, Search, Filter, Zap, Brain, TrendingUp, Users 
} from 'lucide-react'

interface ServiceRequest {
  plz: string
  serviceType: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
}

interface RealTimeData {
  weather: Array<{
    municipality: string
    temperature: number
    condition: string
  }>
  transport: {
    departures: Array<{
      line: string
      destination: string
      departure: string
      delay: number
    }>
    disruptions: Array<{
      line: string
      description: string
    }>
  }
  events: {
    events: Array<{
      title: string
      date: string
      location: string
      category: string
    }>
  }
}

export default function EnhancedSaarlandServices() {
  const [activeTab, setActiveTab] = useState<'services' | 'realtime' | 'documents'>('services')
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest>({
    plz: '66111',
    serviceType: 'personalausweis',
    urgency: 'medium'
  })
  const [services, setServices] = useState<any>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [documentAnalysis, setDocumentAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load real-time data on component mount
  useEffect(() => {
    loadRealTimeData()
    const interval = setInterval(loadRealTimeData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const loadRealTimeData = async () => {
    try {
      const response = await fetch('/api/realtime/saarland-hub?services=weather,transport,events')
      const data = await response.json()
      if (data.success) {
        setRealTimeData(data.data)
      }
    } catch (error) {
      console.error('Failed to load real-time data:', error)
    }
  }

  const searchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/plz/enhanced-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceRequest)
      })
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Failed to search services:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeDocument = async (documentType: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/document-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          userContext: {
            municipality: 'Saarbrücken',
            plz: serviceRequest.plz,
            userType: 'citizen'
          },
          analysisMode: 'analyze'
        })
      })
      const data = await response.json()
      setDocumentAnalysis(data)
    } catch (error) {
      console.error('Failed to analyze document:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100'
      case 'busy': return 'text-orange-600 bg-orange-100'
      case 'closed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      case 'partly-cloudy': return '⛅'
      default: return '🌤️'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#003399] mb-4">
          🚀 Saarland Services
        </h1>
        <p className="text-xl text-gray-600">
          Real-time services, AI-powered assistance, and intelligent PLZ-search
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-xl p-1 flex space-x-1">
          {[
            { key: 'services', label: '🏛️ Services', icon: Search },
            { key: 'realtime', label: '📊 Real-time', icon: TrendingUp },
            { key: 'documents', label: '📄 AI Assistant', icon: Brain }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === key
                  ? 'bg-[#003399] text-white shadow-md'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-[#003399] mb-6 flex items-center gap-2">
              <Search className="w-6 h-6" />
              Intelligente PLZ Service Suche
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PLZ</label>
                <input
                  type="text"
                  value={serviceRequest.plz}
                  onChange={(e) => setServiceRequest({...serviceRequest, plz: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003399] focus:border-transparent"
                  placeholder="66111"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <select
                  value={serviceRequest.serviceType}
                  onChange={(e) => setServiceRequest({...serviceRequest, serviceType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003399] focus:border-transparent"
                >
                  <option value="personalausweis">Personalausweis</option>
                  <option value="gewerbeanmeldung">Gewerbeanmeldung</option>
                  <option value="bauantrag">Bauantrag</option>
                  <option value="führungszeugnis">Führungszeugnis</option>
                  <option value="all">Alle Services</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dringlichkeit</label>
                <select
                  value={serviceRequest.urgency}
                  onChange={(e) => setServiceRequest({...serviceRequest, urgency: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003399] focus:border-transparent"
                >
                  <option value="low">Normal</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="emergency">Notfall</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={searchServices}
                  disabled={loading}
                  className="w-full bg-[#003399] hover:bg-[#002266] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Suchen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Service Results */}
          {services && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#003399] mb-6">
                📍 Services für PLZ {serviceRequest.plz}
              </h3>
              
              {services.success ? (
                <div className="space-y-6">
                  {services.data.services.map((service: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{service.name}</h4>
                          <p className="text-gray-600">{service.authority}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.availability?.status || 'unknown')}`}>
                          {service.availability?.status === 'available' ? 'Verfügbar' :
                           service.availability?.status === 'busy' ? 'Beschäftigt' :
                           service.availability?.status === 'closed' ? 'Geschlossen' : 'Unbekannt'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {service.address}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {service.contact.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {service.contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {service.availability?.averageWaitTime || 'N/A'} Min. Wartezeit
                        </div>
                      </div>
                      
                      {service.services && service.services.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h5 className="font-medium text-gray-900 mb-2">Verfügbare Services:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {service.services.slice(0, 4).map((svc: any, svcIndex: number) => (
                              <div key={svcIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {svc.name} ({svc.cost})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {services.data.meta && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h5 className="font-medium text-blue-900 mb-2">📊 Suchergebnisse:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Services gefunden:</span>
                          <div className="text-blue-900">{services.data.meta.totalServicesFound}</div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Alternativen:</span>
                          <div className="text-blue-900">{services.data.meta.alternativesFound}</div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Bearbeitungszeit:</span>
                          <div className="text-blue-900">{services.data.meta.estimatedProcessingTime}</div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Gemeinde:</span>
                          <div className="text-blue-900">{services.data.meta.municipality}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">{services.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {realTimeData ? (
            <>
              {/* Weather Data */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-[#003399] mb-6 flex items-center gap-2">
                  🌤️ Live Wetter Saarland
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {realTimeData.weather?.slice(0, 10).map((weather, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                      <div className="text-3xl mb-2">{getWeatherIcon(weather.condition)}</div>
                      <div className="font-bold text-gray-900">{weather.municipality}</div>
                      <div className="text-2xl font-bold text-blue-600">{weather.temperature}°C</div>
                      <div className="text-sm text-gray-600 capitalize">{weather.condition}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transport Data */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-[#003399] mb-6 flex items-center gap-2">
                  🚌 Live ÖPNV Saarland
                </h2>
                <div className="space-y-3">
                  {realTimeData.transport?.departures?.slice(0, 8).map((departure, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#003399] text-white px-3 py-1 rounded-lg font-bold">
                          {departure.line}
                        </div>
                        <div className="text-gray-900 font-medium">{departure.destination}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-gray-600">
                          {new Date(departure.departure).toLocaleTimeString('de-DE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {departure.delay > 0 && (
                          <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                            +{departure.delay} Min
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {realTimeData.transport?.disruptions?.length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-bold text-red-800 mb-2">⚠️ Störungen:</h4>
                    {realTimeData.transport.disruptions.map((disruption, index) => (
                      <div key={index} className="text-red-700">
                        {disruption.line}: {disruption.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Events Data */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-[#003399] mb-6 flex items-center gap-2">
                  📅 Live Events Saarland
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {realTimeData.events?.events?.map((event, index) => (
                    <div key={index} className="border border-gray-200 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        <span className="bg-[#FDB913] text-[#003399] px-2 py-1 rounded text-xs font-medium">
                          {event.category}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003399] mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Live-Daten...</p>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-[#003399] mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              AI Document Assistant
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { type: 'personalausweis', label: '🆔 Personalausweis', desc: 'Beantragung & Verlängerung' },
                { type: 'gewerbeanmeldung', label: '🏢 Gewerbeanmeldung', desc: 'Business-Registration' },
                { type: 'bauantrag', label: '🏗️ Bauantrag', desc: 'Baugenehmigung' },
                { type: 'eheschliessung', label: '💒 Eheschließung', desc: 'Heirat anmelden' }
              ].map((doc) => (
                <button
                  key={doc.type}
                  onClick={() => analyzeDocument(doc.type)}
                  disabled={loading}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-[#003399] hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50"
                >
                  <div className="text-2xl mb-2">{doc.label}</div>
                  <div className="text-sm text-gray-600 group-hover:text-[#003399]">{doc.desc}</div>
                </button>
              ))}
            </div>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003399] mx-auto mb-4"></div>
                <p className="text-gray-600">KI analysiert Dokument...</p>
              </div>
            )}
            
            {documentAnalysis && documentAnalysis.success && (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3">🤖 KI-Analyse:</h4>
                  <p className="text-blue-800 mb-4">{documentAnalysis.data.analyzedDocument.summary}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Schwierigkeit:</span>
                      <div className="text-blue-900 capitalize">{documentAnalysis.data.analyzedDocument.difficulty}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Bearbeitungszeit:</span>
                      <div className="text-blue-900">{documentAnalysis.data.analyzedDocument.estimatedTime}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Dokumente:</span>
                      <div className="text-blue-900">{documentAnalysis.data.analyzedDocument.requirements.length}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">KI-Optimiert:</span>
                      <div className="text-blue-900">{documentAnalysis.meta.aiEnhanced ? '✅ Ja' : '❌ Nein'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Next Steps */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h4 className="font-bold text-green-900 mb-4">📋 Nächste Schritte:</h4>
                  <div className="space-y-3">
                    {documentAnalysis.data.nextSteps.map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl">
                        <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{step.action}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {step.authority} • {step.estimated_time}
                            {step.digital_option && <span className="text-green-600 ml-2">💻 Online verfügbar</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Saarland Guidance */}
                {documentAnalysis.data.saarlandGuidance && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <h4 className="font-bold text-yellow-900 mb-4">🎯 Saarland-spezifische Tipps:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">✅ Empfehlungen:</h5>
                        <ul className="space-y-1 text-sm text-yellow-700">
                          {documentAnalysis.data.saarlandGuidance.tips.map((tip: string, index: number) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">⚠️ Häufige Fehler:</h5>
                        <ul className="space-y-1 text-sm text-yellow-700">
                          {documentAnalysis.data.saarlandGuidance.commonMistakes.map((mistake: string, index: number) => (
                            <li key={index}>• {mistake}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}