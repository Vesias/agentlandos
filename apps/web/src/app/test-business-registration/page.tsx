'use client'

import React from 'react'
import BusinessRegistrationForm from '@/components/registration/BusinessRegistrationForm'

export default function TestBusinessRegistrationPage() {
  const handleSuccess = (data: any) => {
    console.log('Registration successful:', data)
    alert(`Registrierung erfolgreich! Business-ID: ${data.businessId}`)
  }

  const handleError = (error: string) => {
    console.error('Registration error:', error)
    alert(`Fehler: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏢 Unternehmensregistrierung - AGENTLAND.SAARLAND
          </h1>
          <p className="text-lg text-gray-600">
            Registrieren Sie Ihr Unternehmen im Saarland mit unserem intelligenten Assistenten
          </p>
        </div>

        <BusinessRegistrationForm
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">🎯 Intelligente PLZ-Validierung</h3>
              <p className="text-gray-600">Automatische Erkennung zuständiger Behörden basierend auf Ihrer Postleitzahl</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">💰 Fördermittel-Matching</h3>
              <p className="text-gray-600">Automatische Suche nach passenden Förderprogrammen für Ihr Unternehmen</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">🔗 SAAR-ID Integration</h3>
              <p className="text-gray-600">Nahtlose Verknüpfung mit der digitalen Identität des Saarlandes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}