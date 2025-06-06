'use client'

import React, { useState, useEffect } from 'react'

interface CrossBorderService {
  id: string
  name: string
  description: string
  country: 'DE' | 'FR' | 'LU'
  category: string
  digitalAvailable: boolean
  processingTime: string
  cost: string
  requiredDocuments: string[]
  contactInfo: {
    phone: string
    email: string
    website: string
    address: string
  }
}

interface TaxCalculation {
  sourceCountryTax: number
  socialContributions: number
  totalTaxBurden: number
  savingsFromTreaties: number
  applicableTreaties: string[]
  exemptions: string[]
}

const countryFlags = {
  DE: '🇩🇪',
  FR: '🇫🇷', 
  LU: '🇱🇺'
}

const countryNames = {
  DE: 'Deutschland',
  FR: 'Frankreich',
  LU: 'Luxemburg'
}

export default function CrossBorderServices() {
  const [sourceCountry, setSourceCountry] = useState<'DE' | 'FR' | 'LU'>('DE')
  const [targetCountry, setTargetCountry] = useState<'DE' | 'FR' | 'LU'>('FR')
  const [purpose, setPurpose] = useState<'work' | 'business' | 'residence' | 'study'>('work')
  const [services, setServices] = useState<CrossBorderService[]>([])
  const [recommendations, setRecommendations] = useState<CrossBorderService[]>([])
  const [taxInfo, setTaxInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'tax' | 'calculator'>('overview')
  const [income, setIncome] = useState<number>(45000)
  const [workDays, setWorkDays] = useState<number>(220)

  useEffect(() => {
    if (sourceCountry !== targetCountry) {
      fetchCrossBorderData()
    }
  }, [sourceCountry, targetCountry, purpose])

  const fetchCrossBorderData = async () => {
    setLoading(true)
    try {
      // Fetch recommendations
      const recResponse = await fetch(`/api/cross-border?action=recommendations&sourceCountry=${sourceCountry}&targetCountry=${targetCountry}&purpose=${purpose}`)
      const recData = await recResponse.json()
      
      if (recData.success) {
        setRecommendations(recData.data.recommendations)
      }

      // Fetch all services for target country
      const servicesResponse = await fetch(`/api/cross-border?action=services&targetCountry=${targetCountry}`)
      const servicesData = await servicesResponse.json()
      
      if (servicesData.success) {
        setServices(servicesData.data)
      }

      // Fetch tax information
      const taxResponse = await fetch(`/api/cross-border?action=tax-info&sourceCountry=${sourceCountry}&targetCountry=${targetCountry}&income=${income}&workDays=${workDays}`)
      const taxData = await taxResponse.json()
      
      if (taxData.success) {
        setTaxInfo(taxData.data)
      }
    } catch (error) {
      console.error('Failed to fetch cross-border data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount)
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Country Selection */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-semibold mb-6">Grenzüberschreitende Services konfigurieren</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Herkunftsland (Ihr Wohnsitz)
            </label>
            <select
              value={sourceCountry}
              onChange={(e) => setSourceCountry(e.target.value as 'DE' | 'FR' | 'LU')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DE">{countryFlags.DE} Deutschland</option>
              <option value="FR">{countryFlags.FR} Frankreich</option>
              <option value="LU">{countryFlags.LU} Luxemburg</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zielland (Arbeits-/Geschäftsland)
            </label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value as 'DE' | 'FR' | 'LU')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DE">{countryFlags.DE} Deutschland</option>
              <option value="FR">{countryFlags.FR} Frankreich</option>
              <option value="LU">{countryFlags.LU} Luxemburg</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zweck der grenzüberschreitenden Tätigkeit
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'work', label: 'Arbeitnehmer', icon: '💼' },
              { key: 'business', label: 'Unternehmer', icon: '🏢' },
              { key: 'residence', label: 'Umzug', icon: '🏠' },
              { key: 'study', label: 'Studium', icon: '🎓' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setPurpose(option.key as any)}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  purpose === option.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {sourceCountry === targetCountry && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ Bitte wählen Sie unterschiedliche Länder für grenzüberschreitende Services.
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {sourceCountry !== targetCountry && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-blue-800 font-medium">Empfohlene Services</div>
            <div className="text-sm text-blue-600 mt-1">Für Ihren Anwendungsfall</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600">
              {services.filter(s => s.digitalAvailable).length}
            </div>
            <div className="text-green-800 font-medium">Digital verfügbar</div>
            <div className="text-sm text-green-600 mt-1">Online beantragbar</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-600">
              {taxInfo?.calculation ? formatCurrency(taxInfo.calculation.savingsFromTreaties) : '—'}
            </div>
            <div className="text-purple-800 font-medium">Steuerersparnis</div>
            <div className="text-sm text-purple-600 mt-1">Durch Abkommen</div>
          </div>
        </div>
      )}
    </div>
  )

  const renderServices = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-6">
        Services für {countryFlags[sourceCountry]} → {countryFlags[targetCountry]} ({countryNames[targetCountry]})
      </h3>

      {recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">
            🎯 Empfohlen für: {purpose === 'work' ? 'Arbeitnehmer' : purpose === 'business' ? 'Unternehmer' : purpose === 'residence' ? 'Umzug' : 'Studium'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(service => (
              <div key={service.id} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{service.name}</h5>
                  {service.digitalAvailable && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Digital
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">⏱️ {service.processingTime}</span>
                  <span className="font-medium text-blue-600">{service.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    service.category === 'business' ? 'bg-green-100 text-green-800' :
                    service.category === 'residence' ? 'bg-blue-100 text-blue-800' :
                    service.category === 'tax' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {service.category}
                  </span>
                  {service.digitalAvailable && (
                    <span className="bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded-full">
                      ✓ Digital
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{service.cost}</div>
                <div className="text-sm text-gray-500">{service.processingTime}</div>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{service.description}</p>

            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Erforderliche Dokumente:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {service.requiredDocuments.slice(0, 3).map((doc, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {doc}
                  </li>
                ))}
                {service.requiredDocuments.length > 3 && (
                  <li className="text-blue-600">+{service.requiredDocuments.length - 3} weitere...</li>
                )}
              </ul>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">📞 </span>
                  <span className="text-gray-900">{service.contactInfo.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">🌐 </span>
                  <a href={service.contactInfo.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTaxInfo = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold mb-6">
        Steuerliche Informationen: {countryFlags[sourceCountry]} → {countryFlags[targetCountry]}
      </h3>

      {taxInfo && (
        <>
          {/* Tax Calculation Summary */}
          {taxInfo.calculation && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h4 className="text-xl font-semibold mb-6">Steuerberechnung</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(taxInfo.calculation.sourceCountryTax)}
                  </div>
                  <div className="text-blue-800 font-medium">Quellensteuer</div>
                  <div className="text-sm text-blue-600">{countryNames[sourceCountry]}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(taxInfo.calculation.socialContributions)}
                  </div>
                  <div className="text-green-800 font-medium">Sozialabgaben</div>
                  <div className="text-sm text-green-600">Jährlich</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(taxInfo.calculation.totalTaxBurden)}
                  </div>
                  <div className="text-purple-800 font-medium">Gesamtbelastung</div>
                  <div className="text-sm text-purple-600">Pro Jahr</div>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(taxInfo.calculation.savingsFromTreaties)}
                  </div>
                  <div className="text-emerald-800 font-medium">Ersparnis</div>
                  <div className="text-sm text-emerald-600">Durch Abkommen</div>
                </div>
              </div>

              {/* Treaties and Exemptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Anwendbare Abkommen:</h5>
                  <ul className="space-y-2">
                    {taxInfo.calculation.applicableTreaties.map((treaty: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        {treaty}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Steuerbefreiungen:</h5>
                  <ul className="space-y-2">
                    {taxInfo.calculation.exemptions.map((exemption: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {exemption}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tax Recommendations */}
          {taxInfo.recommendations && (
            <div className="bg-amber-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-amber-900 mb-4">💡 Steuerliche Empfehlungen</h4>
              <ul className="space-y-2">
                {taxInfo.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start text-amber-800">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )

  const renderCalculator = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold mb-6">Steuerrechner</h3>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bruttojahreseinkommen (EUR)
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="45000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arbeitstage im Zielland
            </label>
            <input
              type="number"
              value={workDays}
              onChange={(e) => setWorkDays(parseInt(e.target.value))}
              max="365"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="220"
            />
          </div>
        </div>
        
        <button
          onClick={fetchCrossBorderData}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Berechne...' : 'Steuerbelastung berechnen'}
        </button>
      </div>
      
      {taxInfo?.calculation && renderTaxInfo()}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌍 Grenzüberschreitende Services
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Deutschland • Frankreich • Luxemburg - Alle Services für Grenzpendler und internationale Geschäfte
        </p>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-1 bg-gray-100 rounded-lg p-1 max-w-2xl mx-auto">
          {[
            { key: 'overview', label: '📋 Übersicht', icon: '📋' },
            { key: 'services', label: '🏢 Services', icon: '🏢' },
            { key: 'tax', label: '💰 Steuern', icon: '💰' },
            { key: 'calculator', label: '🧮 Rechner', icon: '🧮' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Lade grenzüberschreitende Services...</p>
        </div>
      )}

      {!loading && (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'tax' && renderTaxInfo()}
          {activeTab === 'calculator' && renderCalculator()}
        </>
      )}

      {/* Footer */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Warum grenzüberschreitende Services?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Einfach & Digital</h3>
            <p className="text-gray-600 text-sm">
              Alle Services digital verfügbar - keine Behördengänge in drei Ländern
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Steueroptimiert</h3>
            <p className="text-gray-600 text-sm">
              Profitieren Sie von Doppelbesteuerungsabkommen und Grenzpendlerregelungen
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Expertenwissen</h3>
            <p className="text-gray-600 text-sm">
              KI-gestützte Beratung basierend auf aktuellen Gesetzen und Abkommen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}