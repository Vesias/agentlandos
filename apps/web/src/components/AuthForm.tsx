'use client'

import React, { useState } from 'react'
import { AuthService } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'

interface AuthFormProps {
  mode?: 'login' | 'register' | 'reset'
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  redirectPath?: string
}

export default function AuthForm({ 
  mode = 'login', 
  onSuccess, 
  onError,
  redirectPath = '/chat'
}: AuthFormProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'reset'>(mode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Validation
      if (!validateEmail(formData.email)) {
        throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      }

      if (currentMode === 'reset') {
        const result = await AuthService.resetPassword(formData.email)
        if (result.error) {
          throw new Error(result.error)
        }
        setMessage({
          type: 'success',
          text: 'Password-Reset-Link wurde an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach.'
        })
        return
      }

      if ((currentMode === 'login' || currentMode === 'register') && !validatePassword(formData.password)) {
        throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein.')
      }

      if (currentMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Die Passwörter stimmen nicht überein.')
        }
        if (!formData.name.trim()) {
          throw new Error('Bitte geben Sie Ihren Namen ein.')
        }

        // Register user
        const result = await AuthService.signUp(formData.email, formData.password, {
          name: formData.name
        })

        if (result.error) {
          throw new Error(result.error)
        }

        setMessage({
          type: 'info',
          text: 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.'
        })

        // Switch to login mode after successful registration
        setTimeout(() => {
          setCurrentMode('login')
          setMessage(null)
        }, 3000)

      } else if (currentMode === 'login') {
        // Login user
        const result = await AuthService.signIn(formData.email, formData.password)

        if (result.error) {
          throw new Error(result.error)
        }

        setMessage({
          type: 'success',
          text: 'Anmeldung erfolgreich!'
        })

        if (onSuccess) {
          onSuccess(result.user)
        }

        // Redirect after successful login
        if (redirectPath) {
          setTimeout(() => {
            window.location.href = redirectPath
          }, 1000)
        }
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Ein unerwarteter Fehler ist aufgetreten.'
      setMessage({
        type: 'error',
        text: errorMessage
      })
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear message when user starts typing
    if (message) {
      setMessage(null)
    }
  }

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setCurrentMode(newMode)
    setMessage(null)
    setFormData({
      email: formData.email, // Keep email
      password: '',
      confirmPassword: '',
      name: ''
    })
  }

  const getTitle = () => {
    switch (currentMode) {
      case 'register': return 'Konto erstellen'
      case 'reset': return 'Passwort zurücksetzen'
      default: return 'Anmelden'
    }
  }

  const getSubmitText = () => {
    if (isLoading) return 'Wird verarbeitet...'
    switch (currentMode) {
      case 'register': return 'Registrieren'
      case 'reset': return 'Reset-Link senden'
      default: return 'Anmelden'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#003399' }}>
          {getTitle()}
        </h2>
        <p className="text-gray-600 text-center text-sm">
          {currentMode === 'register' && 'Erstellen Sie Ihr agentland.saarland Konto'}
          {currentMode === 'login' && 'Willkommen zurück bei agentland.saarland'}
          {currentMode === 'reset' && 'Geben Sie Ihre E-Mail-Adresse ein'}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {message.type === 'info' && <Mail className="w-4 h-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field (Register only) */}
        {currentMode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ihr vollständiger Name"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail-Adresse
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ihre@email.de"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field (not for reset) */}
        {currentMode !== 'reset' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mindestens 6 Zeichen"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Confirm Password Field (Register only) */}
        {currentMode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Passwort wiederholen"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
          style={{ backgroundColor: '#003399' }}
        >
          {getSubmitText()}
        </Button>

        {/* Mode Switching */}
        <div className="text-center space-y-2">
          {currentMode === 'login' && (
            <>
              <p className="text-sm text-gray-600">
                Noch kein Konto?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  disabled={isLoading}
                >
                  Jetzt registrieren
                </button>
              </p>
              <p className="text-sm text-gray-600">
                Passwort vergessen?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  disabled={isLoading}
                >
                  Zurücksetzen
                </button>
              </p>
            </>
          )}

          {currentMode === 'register' && (
            <p className="text-sm text-gray-600">
              Bereits ein Konto?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
                disabled={isLoading}
              >
                Jetzt anmelden
              </button>
            </p>
          )}

          {currentMode === 'reset' && (
            <p className="text-sm text-gray-600">
              Zurück zur{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
                disabled={isLoading}
              >
                Anmeldung
              </button>
            </p>
          )}
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Mit der Registrierung stimmen Sie unseren{' '}
          <a href="/datenschutz" className="text-blue-600 hover:text-blue-800">
            Datenschutzbestimmungen
          </a>{' '}
          zu.
        </p>
      </div>
    </Card>
  )
}