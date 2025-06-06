'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      setError('Bitte füllen Sie alle Felder aus')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/registration/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(result.error || 'Registrierung fehlgeschlagen')
      }
    } catch (err) {
      setError('Netzwerkfehler bei der Registrierung')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#0277bd' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#003399' }}>
            Erfolgreich registriert!
          </h1>
          <p className="text-gray-600 mb-6">
            Willkommen bei AGENTLAND.SAARLAND, {name}!
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/chat'}
              className="w-full text-white"
              style={{ backgroundColor: '#0277bd' }}
            >
              Zum KI-Chat
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/services'}
              className="w-full"
            >
              Services entdecken
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#003399' }}>
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#003399' }}>
            Bei AGENTLAND registrieren
          </h1>
          <p className="text-gray-600">
            Einfache Registrierung für alle KI-Services
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ihr vollständiger Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="ihre@email.de"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full text-white"
            style={{ backgroundColor: '#003399' }}
          >
            {isLoading ? 'Wird registriert...' : 'Registrieren'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Mit der Registrierung stimmen Sie unseren{' '}
            <a href="/datenschutz" className="underline" style={{ color: '#0277bd' }}>
              Datenschutzbestimmungen
            </a>{' '}
            zu.
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Bereits registriert?{' '}
            <a href="/login" className="font-medium underline" style={{ color: '#003399' }}>
              Hier anmelden
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}