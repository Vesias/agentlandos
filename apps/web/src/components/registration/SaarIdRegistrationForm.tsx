'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, CheckCircle, AlertCircle, User, MapPin, Mail, Shield } from 'lucide-react'

interface SaarIdFormData {
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    placeOfBirth: string
    nationality: string
    gender?: 'male' | 'female' | 'diverse'
  }
  residenceAddress: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
  }
  contact: {
    email: string
    phone?: string
    preferredLanguage: 'de' | 'fr' | 'en'
  }
  privacySettings: {
    dataSharing: boolean
    marketingConsent: boolean
    researchParticipation: boolean
  }
}

export default function SaarIdRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<SaarIdFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      placeOfBirth: '',
      nationality: 'deutsch'
    },
    residenceAddress: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: ''
    },
    contact: {
      email: '',
      preferredLanguage: 'de'
    },
    privacySettings: {
      dataSharing: false,
      marketingConsent: false,
      researchParticipation: false
    }
  })

  const updateFormData = (section: keyof SaarIdFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.personalInfo.firstName && 
                 formData.personalInfo.lastName && 
                 formData.personalInfo.dateOfBirth)
      case 2:
        return !!(formData.residenceAddress.street && 
                 formData.residenceAddress.houseNumber && 
                 formData.residenceAddress.postalCode && 
                 formData.residenceAddress.city)
      case 3:
        return !!(formData.contact.email)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      setError(null)
    } else {
      setError('Bitte füllen Sie alle Pflichtfelder aus')
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/registration/saar-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setRegistrationResult(result.data)
        setCurrentStep(5) // Success step
      } else {
        setError(result.error || 'Registrierung fehlgeschlagen')
      }
    } catch (err) {
      setError('Netzwerkfehler bei der Registrierung')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" style={{ color: '#003399' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#003399' }}>Persönliche Daten</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vorname *</label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => updateFormData('personalInfo', 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nachname *</label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => updateFormData('personalInfo', 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Geburtsdatum *</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Geburtsort</label>
                <input
                  type="text"
                  value={formData.personalInfo.placeOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'placeOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Staatsangehörigkeit</label>
                <select
                  value={formData.personalInfo.nationality}
                  onChange={(e) => updateFormData('personalInfo', 'nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="deutsch">Deutsch</option>
                  <option value="französisch">Französisch</option>
                  <option value="andere">Andere</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#003399' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#003399' }}>Wohnadresse im Saarland</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Straße *</label>
                <input
                  type="text"
                  value={formData.residenceAddress.street}
                  onChange={(e) => updateFormData('residenceAddress', 'street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hausnummer *</label>
                <input
                  type="text"
                  value={formData.residenceAddress.houseNumber}
                  onChange={(e) => updateFormData('residenceAddress', 'houseNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">PLZ *</label>
                <input
                  type="text"
                  value={formData.residenceAddress.postalCode}
                  onChange={(e) => updateFormData('residenceAddress', 'postalCode', e.target.value)}
                  placeholder="66xxx"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nur Saarländische PLZ (66xxx)</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Stadt *</label>
                <input
                  type="text"
                  value={formData.residenceAddress.city}
                  onChange={(e) => updateFormData('residenceAddress', 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" style={{ color: '#003399' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#003399' }}>Kontaktdaten</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">E-Mail-Adresse *</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => updateFormData('contact', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefonnummer (optional)</label>
                <input
                  type="tel"
                  value={formData.contact.phone || ''}
                  onChange={(e) => updateFormData('contact', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bevorzugte Sprache</label>
                <select
                  value={formData.contact.preferredLanguage}
                  onChange={(e) => updateFormData('contact', 'preferredLanguage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: '#003399' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#003399' }}>Datenschutz & Einverständnis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">DSGVO-konforme Datenverarbeitung</h4>
                <p className="text-sm text-gray-600">
                  Ihre Daten werden ausschließlich für die SAAR-ID Verwaltung und 
                  autorisierte Behördendienste verwendet.
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.privacySettings.dataSharing}
                    onChange={(e) => updateFormData('privacySettings', 'dataSharing', e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    Ich stimme der Datenverarbeitung für SAAR-ID Services zu (erforderlich)
                  </span>
                </label>
                
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.privacySettings.marketingConsent}
                    onChange={(e) => updateFormData('privacySettings', 'marketingConsent', e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    Informationen über neue Services erhalten (optional)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 mx-auto" style={{ color: '#009FE3' }} />
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#003399' }}>
                SAAR-ID erfolgreich beantragt!
              </h3>
              <p className="text-gray-600">
                Ihre SAAR-ID: <span className="font-mono text-blue-600">
                  {registrationResult?.saarIdProfile?.saarId}
                </span>
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Nächste Schritte:</h4>
              <ol className="text-sm text-left space-y-1">
                <li>1. Bestätigungs-E-Mail prüfen</li>
                <li>2. Identitätsprüfung beim Bürgeramt innerhalb 14 Tagen</li>
                <li>3. SAAR-ID wird nach Verifizierung aktiviert</li>
              </ol>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/'}
              className="text-white"
              style={{ backgroundColor: '#003399' }}
            >
              Zur Startseite
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const steps = [
    'Persönliche Daten',
    'Wohnadresse',
    'Kontaktdaten',
    'Datenschutz',
    'Bestätigung'
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#003399' }}>
            SAAR-ID Registrierung
          </h2>
          <p className="text-gray-600">
            Ihre digitale Identität für alle Saarland-Services
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= currentStep
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  style={{
                    backgroundColor: index + 1 <= currentStep ? '#003399' : undefined
                  }}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index + 1 < currentStep ? '' : 'bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: index + 1 < currentStep ? '#003399' : undefined
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            {steps.map((step, index) => (
              <span key={index} className="text-center">
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
            >
              Zurück
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="text-white"
                style={{ backgroundColor: '#003399' }}
              >
                Weiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="text-white"
                style={{ backgroundColor: '#009FE3' }}
              >
                {isLoading ? 'Wird verarbeitet...' : 'SAAR-ID beantragen'}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}